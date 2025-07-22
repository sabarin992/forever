from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from collections import defaultdict
from .serializer import ProductVariantSerializer,RegisterSerializer,CouponSerializer,ProductOfferSerializer,CategoryOfferSerializer,ReviewSerializer
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import viewsets
from rest_framework.decorators import api_view,permission_classes,action
from rest_framework.permissions import IsAuthenticated,IsAdminUser,AllowAny
from django.contrib.auth.hashers import check_password
from django.contrib.auth import authenticate
import random
import ssl
from django.core.mail import send_mail
from django.core.mail.backends.smtp import EmailBackend
import certifi
import redis
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.pagination import PageNumberPagination
import math
from .models import Category,CustomUser,Product,ProductVariant,ProductImage,Address,CartItem,Order,OrderItem,OrderItemReturn,Coupon,Wishlist,Wallet,CouponUsage,ProductOffer,CategoryOffer,Review
import requests as req
from django.core.files.base import ContentFile
from urllib.parse import urlparse
import os
from django.db.models import Sum
from django.db.models import OuterRef, Subquery
from .models import Product, ProductVariant
import razorpay
from django.conf import settings
from decimal import Decimal
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
import logging
from django.db.models.functions import Lower
from django.utils import timezone
from django.db.models import Sum, Count, F
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser,IsAuthenticated
from datetime import timedelta, datetime
import pandas as pd
import io
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from decouple import config
from rest_framework import generics





# Basic configuration
logging.basicConfig(
    level=logging.INFO,  # You can set DEBUG, INFO, WARNING, ERROR, CRITICAL
    format='%(levelname)s - %(message)s'
)

# redis server setup
r = redis.StrictRedis(host="localhost", port=6379, db=0, decode_responses=True)

# For convert Querydict to dictionary for add product 
def querydict_to_dict(querydict):
    data = {
        "category": querydict.get("category", [""]),
        "name": querydict.get("name", [""]),
        "description": querydict.get("description", [""]),
        "variants": defaultdict(lambda: {"size": [], "color": "", "price": "", "stock_quantity": "", "images": []})
    }

    for key, value in querydict.lists():
        if key.startswith("variants"):
            parts = key.split("[")
            index = int(parts[1][:-1])  # Extract variant index

            if "size" in key:
                data["variants"][index]["size"] = value[0]
            elif "color" in key:
                data["variants"][index]["color"] = value[0]
            elif "price" in key:
                data["variants"][index]["price"] = value[0]
            elif "stock_quantity" in key:
                data["variants"][index]["stock_quantity"] = value[0]
            elif "images" in key:
                data["variants"][index]["images"].append(value[0])

    # Convert defaultdict to a normal list
    data["variants"] = list(data["variants"].values())

    return data



def paginate_queryset(queryset,size,request):
        paginator = PageNumberPagination()
        paginator.page_size = size  # Optional: override default page size
        # Paginate the queryset
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        
        total_items = paginator.page.paginator.count
        per_page = paginator.page_size
        total_pages = math.ceil(total_items / per_page)

        return {
            'products': paginated_queryset,
            'total_items': total_items,
            'per_page': per_page,
            'total_pages': total_pages,
            'has_next': paginator.page.has_next(),
            'has_previous': paginator.page.has_previous(),
            'paginator': paginator
        }





def get_product_data(request,is_more_products,products=None,product=None):
    if is_more_products:
        return [
        {
            "id": product.id,
            "category": product.product.category.name,
            "name": product.product.name,
            "price": product.price,
            "discounted_percentage":product.product_discount,
            "discounted_amount": product.final_price,
            "sizes": [variant.size for variant in product.product.variants.filter(product=product.product)],
            "colors":[variant.color for variant in product.product.variants.filter(product=product.product)],
            "image": request.build_absolute_uri(
                product.product.product_image.filter(
                    product=product.product, variant=product, is_primary=True
                ).first().image.url
            ) if product.product.product_image.exists() else None,
            "images":[request.build_absolute_uri(image.image.url) for image in product.product.product_image.filter(product=product.product, variant=product)]
        }
        for product in products
    ]
    else:
        return {
            "id": product.id,
            "category": product.product.category.name,
            "name": product.product.name,
            "stock_quantity":product.stock_quantity,
            "price": product.price,
            "discounted_amount": product.final_price,
            "sizes": [{'variant_id':variant.id,'size':variant.size} for variant in product.product.variants.filter(product=product.product)],
            "colors":[{'variant_id':variant.id,'color':variant.color} for variant in product.product.variants.filter(product=product.product)],
            "image": request.build_absolute_uri(
                product.product.product_image.filter(
                    product=product.product, variant=product, is_primary=True
                ).first().image.url
            ) if product.product.product_image.exists() else None,
            "images":[request.build_absolute_uri(image.image.url) for image in product.product.product_image.filter(product=product.product, variant=product)]
        }


def get_users_data(request,users=None):
    return [
        {
            "id": user.id,
            "first_name": user.first_name,
            'last_name':user.last_name,
            "email": user.email,
            "is_active":user.is_active,
            "phone_number": user.phone_number
        }
        for user in users
    ]



def save_image_from_url(image_url):
    try:
        response = req.get(image_url)
        if response.status_code == 200:
            filename = os.path.basename(urlparse(image_url).path)
            return ContentFile(response.content, name=filename)
    except Exception as e:
        pass
    return None

# fn for generate order number

from datetime import datetime

def generate_order_number(order_id):
    today = datetime.today().strftime('%Y%m%d')  # Format: YYYYMMDD
    return f"ORD{today}-{str(order_id).zfill(6)}"




# index view

@api_view(['GET'])
def index(request):
    return Response('This is index page response')


# user login view

# api for login 
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    if request.method == "POST":
        email = request.data.get("email")
        password = request.data.get("password")
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'error':'Invalid Email'},status=status.HTTP_400_BAD_REQUEST)
        
        if not check_password(password,user.password):
            return Response({'error':'Invalid Password'},status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(email=email, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)



@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(email=email, password=password)

    if user is None:
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_staff:
        return Response({'error': 'You are not authorized to access the admin panel.'}, status=status.HTTP_403_FORBIDDEN)
    
    print(email,password)

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'email': user.email
    }, status=status.HTTP_200_OK)  


# google login
# ============

User = get_user_model()

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('token')  # Get token from request body
    if not token:
        return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            '302235449578-4lrgfd6518k3mn0hfc53nnjfod9einj5.apps.googleusercontent.com'
        )

        # Extract user info
        email = idinfo['email']
        name = idinfo.get('name', '')  # Default to empty string if name is missing
        google_id = idinfo['sub']

        # Split name into first_name and last_name if possible
        first_name = name.split()[0] if name else ''
        last_name = ' '.join(name.split()[1:]) if name and len(name.split()) > 1 else ''

        # Get or create user (remove 'username' from defaults)
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'phone_number': '0000000000'  # Placeholder since it's required
            }
        )



        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({'error': f'Invalid token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

# Register User

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# add product view

@api_view(['POST'])
@permission_classes([AllowAny])
def add_product(request):
    print(f'User = {request.user}')
    data = request.data
    result = querydict_to_dict(data)
    
    name = result.get("name")
    description = result.get("description")
    category_name = result.get("category")
    variants = result.get("variants")

    if not all([name, description, category_name, variants]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    # Parse variants if coming as JSON string
    if isinstance(variants, str):
        import json
        try:
            variants = json.loads(variants)
        except json.JSONDecodeError:
            return Response({'error': 'Invalid variant format'}, status=status.HTTP_400_BAD_REQUEST)

    # Get or create category
    category, _ = Category.objects.get_or_create(name=category_name)

    # Use request.user if authenticated
    created_by = request.user if request.user.is_authenticated else CustomUser.objects.get(pk=1)

    # Create Product
    product = Product.objects.create(
        category=category,
        name=name,
        description=description,
        created_by=created_by
    )

    # Create Variants and Images
    for variant in variants:
        product_variant = ProductVariant.objects.create(
            product=product,
            size=variant.get("size"),
            color=variant.get("color"),
            name=f'{variant.get("size")}-{variant.get("color")}',
            price=variant.get("price"),
            stock_quantity=variant.get("stock_quantity")
        )

        images = variant.get("images", [])
        for i, img in enumerate(images):
            ProductImage.objects.create(
                product=product,
                variant=product_variant,
                image=img,
                is_primary=(i == 0)
            )

    return Response({'message': 'Product Added Successfully'}, status=status.HTTP_201_CREATED)

    

# for edit product
@api_view(['PUT','GET'])
@permission_classes([AllowAny])
def edit_product(request,id):
    product_variant = ProductVariant.objects.get(pk = id)
    if request.method == 'GET':
        product_data ={
            "id": product_variant.id,
            "category": product_variant.product.category.name,
            "name": product_variant.product.name,
            "description": product_variant.product.description,
            "variants": [
                {
                    "size": product_variant.size,
                    "color": product_variant.color,
                    "price": product_variant.price,
                    "stock_quantity": product_variant.stock_quantity,
                    "images": [
                        request.build_absolute_uri(image.image.url) for image in product_variant.product.product_image.filter(product=product_variant.product, variant=product_variant)
                    ]

        }
                for product_variant in product_variant.product.variants.all()
            ],
        }
    
        return Response(product_data,status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        data = request.data
        result = querydict_to_dict(data)
        name = result.get("name")
        description = result.get("description")
        category_name = result.get("category")
        variants = result.get("variants")
        if not all([name, description, category_name, variants]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse variants if it's a JSON string
        if isinstance(variants, str):
            import json
            try:
                variants = json.loads(variants)
            except json.JSONDecodeError:
                return Response({'error': 'Invalid variant format'}, status=status.HTTP_400_BAD_REQUEST)
        # Get or create category
        category, _ = Category.objects.get_or_create(name=category_name)
        product_variant.product.name = name
        product_variant.product.description = description
        product_variant.product.category = category
        product_variant.product.save()
        product_variant.product.variants.all().delete()  # Delete existing variants before adding new ones
        product_variant.product.product_image.all().delete()  # Delete existing images before adding new ones

        for variant in variants:
            product_variant = ProductVariant.objects.create(
            product=product_variant.product,
            size=variant.get("size"),
            color=variant.get("color"),
            name=f'{variant.get("size")}-{variant.get("color")}',
            price=variant.get("price"),
            stock_quantity=variant.get("stock_quantity")
        )

            images = variant.get("images", [])
            for i, img in enumerate(images):  # images = list of image URLs
                if isinstance(img, str) and (img.startswith("http://") or img.startswith("https://")):
                    image_file = save_image_from_url(img)
                else:
                    image_file = img
                if image_file:
                    ProductImage.objects.create(
                        product=product_variant.product,
                        variant=product_variant,
                        image=image_file,
                        is_primary=(i == 0)
                    )
        

    return Response({'message': 'Product updated successfully'}, status=status.HTTP_200_OK)







def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(email, otp):
    subject = 'Your OTP Code'
    message = f'Your OTP is {otp}'
    from_email = 'your_email@gmail.com'  # Replace with your Gmail address
    recipient_list = [email]

    # Use certifi's CA bundle for SSL context
    context = ssl.create_default_context(cafile=certifi.where())

    host=config('EMAIL_HOST')
    print(f'host = {host}')
    port=config('EMAIL_PORT', cast=int)
    username=config('EMAIL_HOST_USER')
    password=config('EMAIL_HOST_PASSWORD')
    use_tls=config('EMAIL_USE_TLS', cast=bool)
    ssl_context=context

    # Create a custom EmailBackend with the SSL context
    connection = EmailBackend(
        # host='smtp.gmail.com',           # Replace with your SMTP host if different
        # port=587,                        # Common port for TLS
        # username='sabarin992@gmail.com', # Replace with your Gmail address
        # password='rfly esiy kxku yhon',    # Replace with your app-specific password
        # use_tls=True,                    # Enable TLS
        # ssl_context=context              # Use the certifi SSL context

        host=config('EMAIL_HOST'),
        port=config('EMAIL_PORT', cast=int),
        username=config('EMAIL_HOST_USER'),
        password=config('EMAIL_HOST_PASSWORD'),
        use_tls=config('EMAIL_USE_TLS', cast=bool),
        ssl_context=context
    )

    try:
        send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False,
            connection=connection,       # Pass the custom connection
        )
    except Exception as e:
        pass



@api_view(["POST"])
@permission_classes([AllowAny])
def send_otp(request):
    """
    API endpoint to generate and send OTP to an email.
    """
    email = request.data.get("email")
    phone_number = request.data.get("phone_number")
    password1 = request.data.get("password1")
    password2 = request.data.get("password2")
    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    is_email_exist = CustomUser.objects.filter(email=email).exists()
    is_phone_number_exist = CustomUser.objects.filter(phone_number=phone_number).exists()
    if is_email_exist:
        return Response({'error':'Email Already Exist'},status=status.HTTP_400_BAD_REQUEST)
    elif is_phone_number_exist:
        return Response({'error':'Phone Number Already Exist'},status=status.HTTP_400_BAD_REQUEST)
    elif password1 != password2:
        return Response({'error':"Password Don't Match"},status=status.HTTP_400_BAD_REQUEST)

    otp = generate_otp()
    
    # Store OTP in Redis with a 10-minute expiry
    r.set(email, otp, ex=60)

    # Send OTP to user's email
    send_otp_email(email, otp)

    return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    API endpoint to verify OTP.
    """
    email = request.data.get("email")
    otp_entered = request.data.get("otp")

    if not email or not otp_entered:
        return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Retrieve OTP from Redis
    otp_stored = r.get(email)

    if otp_stored is None:
        return Response({"error": "OTP expired or not found"}, status=status.HTTP_400_BAD_REQUEST)

    if otp_entered == otp_stored:
        r.delete(email)  # Remove OTP after successful verification
        return Response({"message": "OTP verified successfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
    



# To get all products where the product is active and not deleted,
@api_view(['GET'])
@permission_classes([AllowAny])
def get_products(request):
    products = ProductVariant.objects.filter(product__is_active = True,product__is_deleted = False,is_active = True)    
    product_data = [
        
        {
                "id": product.id,
                "products":[{
                    "id":product.id,
                    "name":product.name
                } for product in Product.objects.all()],
                "name": product.product.name,
                # "description":product.product.description,
                "price": product.price,
                "discounted_percentage":product.product_discount,
                "discounted_amount": product.final_price,
                "category":product.product.category.name,
                # "stock_quantity":product.stock_quantity,
                "image": request.build_absolute_uri(product.product.product_image.get(product=product.product,variant = product,is_primary = True).image.url) if product.product.product_image.exists() else None,
        } 
        
        for product in products
    ]  

    return Response(product_data,status=status.HTTP_200_OK)
   


# To get all products for admin
@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_products(request):
    search = request.GET.get("search")
    if search:
        products = ProductVariant.objects.filter(product__name__icontains=search)
    else:
        products = ProductVariant.objects.all() 
    data = paginate_queryset(products,5,request)
    products_data = [
        {
            "id": product.id,
            "name": product.product.name,
            "price": product.price,
            "category": product.product.category.name,
            "stock_quantity": product.stock_quantity,
            "listed": product.is_active,
            "image": request.build_absolute_uri(product.product.product_image.get(product=product.product,variant = product,is_primary = True).image.url) if product.product.product_image.exists() else None,
        }
        for product in data["products"]
    ]
    response = data['paginator'].get_paginated_response(products_data)
    response.data['has_next'] = bool(data['paginator'].get_next_link())
    response.data['has_previous'] = bool(data['paginator'].get_previous_link())
    response.data['total_pages'] = data['total_pages']
    return Response(response.data,status=status.HTTP_200_OK)





# for list or unlist product
@api_view(['PUT'])
@permission_classes([AllowAny])
def list_unlist_product(request,id):
    
    product = ProductVariant.objects.get(pk = id)
    product.is_active = not product.is_active
    product.save()
    return Response({'message': 'Product status updated successfully','isListed':product.is_active}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def filter_product(request):
    categories = request.GET.get("category")  # List of categories
    search = request.GET.get("search")  # Search query
    sort = request.GET.get('sort')  # Sorting order (asc/desc)
    min_price = request.GET.get('minPrice')
    max_price = request.GET.get('maxPrice')

    print(f'min_price = {min_price} and max_price = {max_price}')


    # Subquery: get one variant per product
    product_ids = Product.objects.values('id')
    first_variant_subquery = ProductVariant.objects.filter(
        product_id=OuterRef('id'),is_active=True
    ).order_by('created_at')

    # Get one variant for each product
    first_variants = Product.objects.annotate(
        variant_id=Subquery(first_variant_subquery.values('id')[:1])
    ).values_list('variant_id', flat=True)

    products = ProductVariant.objects.filter(id__in=first_variants)
    

    # Step 2: Filter by category if provided
    if categories:
        category_list = categories.split(',')  # Split if categories are passed as a single string
        products = products.filter(product__category__name__in=category_list)

    # Step 3: Filter by search term if provided
    if search:
        products = products.filter(product__name__icontains=search)

    if min_price and max_price:
        products = products.filter(final_price__gte = min_price,final_price__lte = max_price)
        print(products)

    # Step 4: Apply sorting if provided
    if sort:
        if sort == "asc":
            products = products.order_by("final_price")  # Ascending order
        elif sort == "desc":
            products = products.order_by("-final_price")  # Descending order
        elif sort == "a_to_z":
            products = products.annotate(lower_name=Lower("product__name")).order_by("lower_name")
        elif sort == "z_to_a":
            products = products.annotate(lower_name=Lower("product__name")).order_by("-lower_name")
    

    # Step 5: Paginate the results
    data = paginate_queryset(products,8,request)
    # Step 5: Format response data    
    product_data = get_product_data(request,is_more_products=True,products=data['products'])
    response = data['paginator'].get_paginated_response(product_data)
    response.data['has_next'] = bool(data['paginator'].get_next_link())
    response.data['has_previous'] = bool(data['paginator'].get_previous_link())
    response.data['total_pages'] = data['total_pages']
    return Response(response.data, status=status.HTTP_200_OK)





@api_view(['GET'])
@permission_classes([AllowAny])
def product_details(request,id):
    product = ProductVariant.objects.get(pk = id)
    is_in_wishlist = Wishlist.objects.filter(user=request.user, product_variant=product).exists()
    is_in_cart = CartItem.objects.filter(user=request.user, product_variant=product).exists()
    product_data = product_data = get_product_data(request,is_more_products=False,product=product)
    # {'result':product_data,'is_in_wishlist':is_in_wishlist,'is_in_cart':is_in_cart}
    product_data['is_in_wishlist'] = is_in_wishlist
    product_data['is_in_cart'] = is_in_cart
    return Response(product_data,status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def related_products(request,id):
    product = ProductVariant.objects.get(pk = id)
    
    products = ProductVariant.objects.filter( 
        product__is_active=True, 
        product__is_deleted=False, 
        is_active=True,
        product__category__name = product.product.category.name
        )[:5]
    product_data = get_product_data(request,is_more_products=True,products=products)
    return Response(product_data,status=status.HTTP_200_OK)
    


# for get all users
@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_users(request):
    search = request.GET.get("search")  # Search query
    users = CustomUser.objects.filter(first_name__icontains=search,is_staff = False).order_by('-created_at') if search else CustomUser.objects.filter(is_staff = False).order_by('-created_at')
    data = paginate_queryset(users,5,request)
    users_data = get_users_data(request,users=data['products'])
    response = data['paginator'].get_paginated_response(users_data)
    response.data['has_next'] = bool(data['paginator'].get_next_link())
    response.data['has_previous'] = bool(data['paginator'].get_previous_link())
    response.data['total_pages'] = data['total_pages']
    return Response(response.data,status=status.HTTP_200_OK)

# for block and unblock user
@api_view(['GET'])
@permission_classes([AllowAny])
def block_unblock_user(request,id):
    user = CustomUser.objects.get(pk = id)
    user.is_active = False if user.is_active else True
    user.save()
    users = CustomUser.objects.all().order_by('-created_at')
    data = paginate_queryset(users,5,request)
    users_data = get_users_data(request,users=data['products'])
    response = data['paginator'].get_paginated_response(users_data)
    response.data['has_next'] = bool(data['paginator'].get_next_link())
    response.data['has_previous'] = bool(data['paginator'].get_previous_link())
    response.data['total_pages'] = data['total_pages']
    return Response(response.data,status=status.HTTP_200_OK)

# for edit user
@api_view(['POST'])
@permission_classes([AllowAny])
def edit_user(request,id):
    user = CustomUser.objects.get(pk = id)
    user.first_name = request.data["first_name"]
    user.last_name = request.data["last_name"]
    user.email = request.data["email"]
    user.phone_number = request.data["phone_number"]
    user.save()
    return Response('User Edited Successfull')


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_categories(request):
    print(request.user)
    search = request.GET.get("search")
    if search:
        categories = Category.objects.filter(name__icontains=search)
    else:
        categories = Category.objects.all()
    data = paginate_queryset(categories,3,request)
    categories_data = [
        {
            "id": category.id,  # serial number (starts from 1)
            "name": category.name,
            "description": category.description,
            "isListed": category.is_active,
        }
        for index, category in enumerate(data["products"])  
    ]
    response = data['paginator'].get_paginated_response(categories_data)
    response.data['has_next'] = bool(data['paginator'].get_next_link())
    response.data['has_previous'] = bool(data['paginator'].get_previous_link())
    response.data['total_pages'] = data['total_pages']
    return Response(response.data,status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_listed_categories(request):
    categories = Category.objects.filter(is_active = True)
    categories_list = [category.name.capitalize() for category in categories]
    response = {'categories': categories_list}
    return Response(response,status=status.HTTP_200_OK)




@api_view(['PUT'])
@permission_classes([AllowAny])
def list_unlist_category(request, id):
    category = Category.objects.get(pk=id)
    category.is_active = not category.is_active
    category.save()
    return Response({'message': 'Category status updated successfully','isListed':category.is_active}, status=status.HTTP_200_OK)



@api_view(['PUT'])
@permission_classes([AllowAny])
def edit_category(request, id):
    category = Category.objects.get(pk=id)
    name = request.data["name"]
    if category.name.lower() == name.lower():
        pass
    elif Category.objects.filter(name__iexact=name).exists():
        return Response({'error': 'Category with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    category.name = request.data["name"]
    category.description = request.data["description"]
    category.save()
    return Response('Category Edited Successfull',status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([AllowAny])
def add_category(request):
    name = request.data["name"]
    if Category.objects.filter(name__iexact=name).exists():
        return Response({'error': 'Category with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    category = Category.objects.create(name = request.data["name"],description = request.data["description"])
    return Response('Category Added Successfully',status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = CustomUser.objects.get(pk = request.user.id)
    logging.info(user.first_name)
    address = user.addresses.filter(is_primary=True).first()
    user_data = {
        "id":user.id,
        "profile_picture": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
        "address": {
                    "city":address.city if address.city else '',
                    "state":address.state if address.state else '',
                    "country":address.country if address.country else '',
                } if address else "",
        "first_name":user.first_name,
        "last_name":user.last_name,
        "email":user.email,
        "phone_number":user.phone_number
    }
    return Response(user_data,status=status.HTTP_200_OK)


@api_view(['PUT','GET'])
@permission_classes([IsAuthenticated])
def edit_user_profile(request):
    user = CustomUser.objects.get(pk = request.user.id)
    if request.method == 'GET':
        user_data = {
            "id":user.id,
            "first_name":user.first_name,
            "last_name":user.last_name,
            "email":user.email,
            "phone_number":user.phone_number,
                
        }
        return Response(user_data,status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        user.first_name = request.data["first_name"]
        user.last_name = request.data["last_name"]
        user.email = request.data["email"]
        user.phone_number = request.data["phone_number"]
        user.save()
        return Response('User Edited Successfull',status=status.HTTP_200_OK)
    

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def reset_password(request):
    user = CustomUser.objects.get(pk = request.user.id)
    old_password = request.data["old_password"]
    new_password = request.data["new_password"]
    if not check_password(old_password,user.password):
        return Response('Invalid Password',status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()
    return Response('Password Changed Successfull',status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_addresses(request):
    user = CustomUser.objects.get(pk = request.user.id)
    try:
        addresses = user.addresses.all()
        primary_address = user.addresses.filter(is_primary=True).first()
        addresses_data = [
            {
                "id": address.id,
                "name": address.name,
                "phone_no": address.phone_no,
                "street_address": address.street_address,
                "city": address.city,
                "state": address.state,
                "pin_code": address.pin_code,
                "country": address.country,
            
                
            }
            for address in addresses
        ]

        customer = {
                    "id": request.user.id,
                    "first_name": request.user.first_name,
                    "last_name": request.user.last_name,
                    "email": request.user.email,
                    "phone_number": request.user.phone_number,
                }

        response = {'addresses_data':addresses_data,'primary_address_id':primary_address.id,'customer':customer}
        return Response(response,status=status.HTTP_200_OK)
    except:
        return Response({'error':"The current user hasn't no addresses"},status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_address(request):
    user = CustomUser.objects.get(pk = request.user.id)
    name = request.data["name"]
    phone_no = request.data["phone_no"]
    street_address = request.data["street_address"]
    city = request.data["city"]
    state = request.data["state"]
    pin_code = request.data["pin_code"]
    country = request.data["country"]
    
    address = Address.objects.create(
        user=user,
        name=name,
        phone_no=phone_no,
        street_address=street_address,
        city=city,
        state=state,
        pin_code=pin_code,
        country=country
    )
    
    return Response('Address Added Successfull',status=status.HTTP_200_OK)


@api_view(['PUT','GET'])
@permission_classes([IsAuthenticated])
def edit_address(request,id):
    if request.method == 'PUT':
        address = Address.objects.get(pk = id)
        address.name = request.data["name"]
        address.phone_no = request.data["phone_no"]
        address.street_address = request.data["street_address"]
        address.city = request.data["city"]
        address.state = request.data["state"]
        address.pin_code = request.data["pin_code"]
        address.country = request.data["country"]
        address.save()
        return Response('Address Edited Successfull',status=status.HTTP_200_OK)
    else:
        address = Address.objects.get(pk = id)
        address_data = {
            "id": address.id,
            "name": address.name,
            "phone_no": address.phone_no,
            "street_address": address.street_address,
            "city": address.city,
            "state": address.state,
            "pin_code": address.pin_code,
            "country": address.country
        }
        return Response(address_data,status=status.HTTP_200_OK)
    

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_address(request,id):
    address = Address.objects.get(pk = id)
    address.delete()
    return Response('Address Deleted Successfull',status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    user = CustomUser.objects.get(pk=request.user.id)
    product_variant = ProductVariant.objects.get(pk=request.data["product_variant"])

    if product_variant.stock_quantity <= 0:
        return Response('The product is out of stock.', status=status.HTTP_400_BAD_REQUEST)
    size = request.data["size"]
    cart_item = CartItem.objects.filter(user=request.user, product_variant=product_variant, size=size).first()
    if cart_item:
        try:
            cart_item.quantity += 1
            cart_item.save()
            return Response('Incremented the product by 1', status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Remove from wishlist if exists
        Wishlist.objects.filter(user=request.user, product_variant=product_variant).delete()
        try:
            CartItem.objects.create(
                user=user,
                product_variant=product_variant,
                size=size,
                # quantity=quantity
            )
            return Response('Product added to cart', status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


        
    




# for get all cart data
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_cart_products(request):
    carts = CartItem.objects.filter(user = request.user)
    total_price = carts.aggregate(Sum('total_price'))
    total_discount = carts.aggregate(Sum('total_discount'))
    data = paginate_queryset(carts,5,request)
    cart_data = [
        {"id":item.id,
        "image":request.build_absolute_uri(item.get_variant_image()),
         "name":item.product_variant.product.name,
         "actual_price":item.get_actual_price(),
         "price":item.total_price,
         "size":item.size,
         "quantity":item.quantity,
         "discount_offer" : item.get_offer_amount()

                  }
                 for item in data["products"]
                 ]
    
    response = data['paginator'].get_paginated_response(cart_data)
    response.data['has_next'] = bool(data['paginator'].get_next_link())
    response.data['has_previous'] = bool(data['paginator'].get_previous_link())
    response.data['total_pages'] = data['total_pages']
    response = {'cart_data':response.data,'total_price':total_price['total_price__sum'],'total_discount':total_discount['total_discount__sum'],'cart_count':carts.count()}
    return Response(response,status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart(request,id):
    try:
        cart = CartItem.objects.get(pk=id)
        cart.quantity = int(request.data["quantity"])
        cart.save()
        return Response('success')
    except DRFValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_cartitem(request,id):
    cart_item = CartItem.objects.get(pk=id)
    cart_item.delete()
    return HttpResponse(f'Remove Cart item successfully')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    print(request.data)
    user = CustomUser.objects.get(pk=request.user.id)
    address_id = request.data.get("address_id")
    cart_items = CartItem.objects.filter(user=user)
    payment_method = request.data.get('payment_method')
    payment_status = request.data.get('payment_status')
    coupon_code = request.data.get('couponCode') 
    # discounted_amount=request.data['discounted_amount']
    total_price = request.data.get("total_price")
    total_discount = request.data.get("total_discount")
    coupon_discount = request.data.get("coupon_discount")
    final_amount = request.data.get("final_amount")


    if not cart_items.exists():
        return Response({'error': 'No items in the cart'}, status=status.HTTP_400_BAD_REQUEST)

    if not address_id:
        return Response({'error': 'Address is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        address = Address.objects.get(pk=address_id, user=user)
    except Address.DoesNotExist:
        return Response({'error': 'Invalid address'}, status=status.HTTP_400_BAD_REQUEST)

    # Order can't place if order amount > 1000 in case of COD
    if payment_method == "COD":
        if request.data['final_amount'] > 1000:
            return Response({'error':'Order above Rs 1000 should not be allowed for COD'},status=status.HTTP_400_BAD_REQUEST)
    
     # User coupon usage
    if coupon_code:
        try:
            coupon = Coupon.objects.get(code=coupon_code)
            usage, created = CouponUsage.objects.get_or_create(user=user, coupon=coupon)
            if usage.used:
                return Response({"error": "You have already applied this coupon."}, status=400)

            usage.used = True
            usage.save()

        except Coupon.DoesNotExist:
            return Response({"error": "Invalid coupon code."}, status=404)
    
    # Create order
    order = Order.objects.create(user=user, shipping_address=address,total_price=total_price,total_discount=total_discount,coupon_discount=coupon_discount,final_amount=final_amount)
    order_number = generate_order_number(order.id)
    order.order_no = order_number
    order.payment = payment_method if payment_method else 'COD'
    
    # Handle different payment methods and statuses
    if payment_method == 'RAZORPAY':
        order.razorpay_payment_status = payment_status
        if payment_status == 'CONFIRMED':
            order.status = 'CONFIRMED'
        elif payment_status == 'PAYMENT_PENDING':
            order.status = 'PAYMENT_PENDING'
        else:
            order.status = 'PENDING'
    elif payment_method == "WALLET":
        wallet = Wallet.objects.get(user=user)
        wallet.debit(order.total, f'Order payment for {order.order_no}')
        order.status = 'CONFIRMED'
    else:  # COD
        order.status = payment_status if payment_status else 'PENDING'
            
    order.save()

    # Add items to the order
    for cart_item in cart_items:
        OrderItem.objects.create(
            order=order,
            product_variant=cart_item.product_variant,
            quantity=cart_item.quantity,
            total_amount=cart_item.total_price
        )

    # Decrement the stock quantity of each product variant
    for cart_item in cart_items:
        product_variant = cart_item.product_variant
        if product_variant.stock_quantity < cart_item.quantity:
            return Response({'error': f'Insufficient stock for {product_variant.product.name}'}, status=status.HTTP_400_BAD_REQUEST)
        product_variant.stock_quantity -= cart_item.quantity
        product_variant.save()

    # Clear the cart  
    cart_items.delete()

    return Response({'message': 'Order placed successfully', 'order_id': order.id}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_payment(request):
    """
    Update payment status for an existing order after successful payment retry
    """
    try:
        order_id = request.data.get('order_id')
        payment_status = request.data.get('payment_status')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        if not order_id:
            return Response({'error': 'Order ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the order
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if order is in PAYMENT_PENDING status
        if order.status != 'PAYMENT_PENDING':
            return Response({'error': 'Order payment cannot be updated'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update payment details
        order.razorpay_payment_status = payment_status
        order.razorpay_payment_id = razorpay_payment_id
        order.razorpay_signature = razorpay_signature
        
        if payment_status == 'CONFIRMED':
            order.status = 'CONFIRMED'
        
        order.save()
        
        return Response({
            'message': 'Order payment updated successfully',
            'order_id': order.id,
            'status': order.status
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_orders(request):
    search = request.GET.get('search')
    
    user = CustomUser.objects.get(pk=request.user.id)
    orders = Order.objects.filter(user=user).order_by('-id')
    if search:
        orders = orders.filter(user__first_name__icontains=search) | orders.filter(order_no__icontains=search)
    data = paginate_queryset(orders,5,request)
    orders_data = [
        {
            "id":order.id,
             "customer": {
            "id": order.user.id,
            "first_name": order.user.first_name,
            "last_name": order.user.last_name,
            "email": order.user.email,
            "phone_number": order.user.phone_number,
        },
            "order_no": order.order_no,
            "status": order.status,
            "order_date": order.order_date.strftime('%d-%m-%Y'),
            "total_price": order.total_price,
            "total_discount":order.total_discount,
            "coupon_discount" : order.coupon_discount,
            "final_amount" : order.final_amount,
            "payment_status": order.razorpay_payment_status,
        }
        for order in data["products"]
    ]
    response = data['paginator'].get_paginated_response(orders_data)
    response.data['has_next'] = bool(data['paginator'].get_next_link())
    response.data['has_previous'] = bool(data['paginator'].get_previous_link())
    response.data['total_pages'] = data['total_pages']    
    return Response(response.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_details(request, id):
    try:
        order = Order.objects.get(pk=id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    order_items = [
        {
            "item_id":item.id,
            "product_variant_id":item.product_variant.id,
            "product_name": item.product_variant.product.name,
            "status":item.status,
            "variant": {
                "size": item.product_variant.size,
                "color": item.product_variant.color,
            },
            "quantity": item.quantity,
            "price": item.total_amount,
            "image": request.build_absolute_uri(
                item.product_variant.product.product_image.filter(
                    product=item.product_variant.product,
                    variant=item.product_variant,
                    is_primary=True
                ).first().image.url
            ) if item.product_variant.product.product_image.exists() else None,
        }
        for item in order.order_items.all()
    ]

    address = {
        "name": order.shipping_address.name,
        "phone_no": order.shipping_address.phone_no,
        "street_address": order.shipping_address.street_address,
        "city": order.shipping_address.city,
        "state": order.shipping_address.state,
        "pin_code": order.shipping_address.pin_code,
        "country": order.shipping_address.country,
    }

    order_data = {
        "id":order.id,
        "order_no": order.order_no,
        "customer": {
            "id": order.user.id,
            "first_name": order.user.first_name,
            "last_name": order.user.last_name,
            "email": order.user.email,
            "phone_number": order.user.phone_number,
        },
        "status": order.status,
        "order_date": order.order_date.strftime('%d-%m-%Y'),
        "payment_method":order.payment,
        "total_price": order.total_price,
        "total_discount":order.total_discount,
        "coupon_discount" : order.coupon_discount,
        "final_amount" : order.final_amount,
        "payment_status": order.status,
        "address": address,
        "items": order_items,
    }

    return Response(order_data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_order(request,id):
    try:
        order = Order.objects.get(pk = id, user=request.user)

        if order.status in ['DELIVERED', 'CANCELED', 'RETURNED']:
            return Response({'error': 'Order cannot be canceled.'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'CANCELED'
        order.save()
        for order_item in order.order_items.all():
            order_item.status = 'CANCELED'
            order_item.save()
            product_variant = ProductVariant.objects.get(pk=order_item.product_variant.id)
            product_variant.stock_quantity += order_item.quantity
            product_variant.save()
        
        return Response({'message': 'Order canceled successfully.'}, status=status.HTTP_200_OK)

    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_order_item(request, id):
    try:
        item = OrderItem.objects.get(pk=id, order__user=request.user)
        product_variant = ProductVariant.objects.get(pk = item.product_variant.id)

        if item.status in ['DELIVERED', 'CANCELED', 'RETURNED']:
            return Response({'error': 'Item cannot be canceled.'}, status=status.HTTP_400_BAD_REQUEST)

        item.status = 'CANCELED'
        item.save()
        wallet, created = Wallet.objects.get_or_create(user=item.order.user)
        wallet.credit(
                    amount=Decimal(str(item.total_amount)),
                    description=f"Refund for cancelled order item - {item.product_variant}"
                )
        order = item.order
        if all(i.status == 'CANCELED' for i in order.order_items.all()):
            order.status = 'CANCELED'
            order.save()

        # increment the product variant quantity
        product_variant.stock_quantity += item.quantity
        product_variant.save()
        

        return Response({'message': 'Order item canceled successfully.'}, status=status.HTTP_200_OK)

    except OrderItem.DoesNotExist:
        return Response({'error': 'Order item not found.'}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_order_status(request, id):
    try:
        order = Order.objects.get(pk=id)

        # Check if the user is authorized to update the order status
        if not request.user.is_staff and order.user != request.user:
            return Response({'error': 'You are not authorized to update this order.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if not new_status:
            return Response({'error': 'Status is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate the new status
        valid_statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED', 'RETURNED']
        if new_status.upper() not in valid_statuses:
            return Response({'error': f'Invalid status. Valid statuses are: {", ".join(valid_statuses)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Update the order status
        order.status = new_status
        order.save()

        # Update the status of all order items to match the order status
        order.order_items.update(status=new_status)

        return Response({'message': 'Order status updated successfully.', 'status': order.status}, status=status.HTTP_200_OK)

    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
    



# api for create order using razor pay

@api_view(['POST'])
def create_order(request):
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    amount = request.data.get('totalAmount')  # in rupees
   
    currency = 'INR'
    payment = client.order.create({
        'amount': int(amount) * 100,  # Razorpay works in paise
        'currency': currency,
        'payment_capture': 1
    })

    return Response({
        'order_id': payment['id'],
        'razorpay_key': 'rzp_test_nJdBkH2oyKo8BU',
        'amount': payment['amount']
    })




# api for verify payment using razor pay


@api_view(['POST'])
def verify_payment(request):
    try:
        razorpay_order_id = request.data.get('order_id')
        razorpay_payment_id = request.data.get('payment_id')
        razorpay_signature = request.data.get('signature')

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }

        # this will raise an exception if verification fails
        client.utility.verify_payment_signature(params_dict)

        return Response({'status': 'Payment verified successfully'}, status=status.HTTP_200_OK)

    except razorpay.errors.SignatureVerificationError:
        return Response({'status': 'Payment verification failed'}, status=status.HTTP_400_BAD_REQUEST)
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def retry_payment(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        
        # Check if payment is actually pending
        if order.status != 'PAYMENT_PENDING' or order.payment.lower() != 'razorpay':
            return Response({'success': False, 'message': 'Invalid payment retry request'})
        # Create Razorpay order
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        razorpay_order = client.order.create({
            'amount': int(order.total * 100),  # Convert to paise
            'currency': 'INR',
            'receipt': f'retry_order_{order.id}',
            'notes': {
                'order_id': str(order.id),
                'retry_payment': True
            }
        })
        order.status = "CONFIRMED"
        order.save()
        return Response({
            'success': True,
            'razorpay_order_id': razorpay_order['id'],
            'amount': razorpay_order['amount'],
            'currency': razorpay_order['currency'],
            'razorpay_key': settings.RAZORPAY_KEY_ID
        })
        
    except Exception as e:
        return Response({'success': False, 'message': str(e)})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_retry_payment(request):
    try:
        # Verify payment signature
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        # Verify signature
        client.utility.verify_payment_signature(request.data)
        
        # Update order payment status
        order = Order.objects.get(id=request.data['order_id'])
        order.payment_status = 'paid'
        order.razorpay_payment_id = request.data['razorpay_payment_id']
        order.save()
        
        return Response({'success': True, 'message': 'Payment verified successfully'})
        
    except Exception as e:
        return Response({'success': False, 'message': str(e)})







    
# pagination suggestion from jaseem sir
# =======================================

# def paginate_and_serialize(queryset, request, serializer_class, page_size):
#     paginator = PageNumberPagination()
#     paginator.page_size = page_size
#     paginated_queryset = paginator.paginate_queryset(queryset, request)
#     serializer = serializer_class(paginated_queryset, many=True)
#     return paginator.get_paginated_response({"status": True, "page_size": paginator.page_size, "data": serializer.data})




# def handle_exception(e):
#     exc_type, exc_obj, tb = sys.exc_info()
#     line_no = tb.tb_lineno
#     return Response({"status": False, "message": f"Error: {str(e)} at line {line_no}"}, status=status.HTTP_400_BAD_REQUEST)





@api_view(['POST'])
def return_order_item(request, order_item_id):
    try:
        order_item = OrderItem.objects.get(pk=order_item_id)

        # Prevent duplicate return
        if hasattr(order_item, 'order_item_return'):
            return Response({"error": "Return already requested"}, status=status.HTTP_400_BAD_REQUEST)

        # Get data from request
        sizing_issues = request.data.get("sizing_issues", False)
        damaged_item = request.data.get("damaged_item", False)
        incorrect_order = request.data.get("incorrect_order", False)
        delivery_delays = request.data.get("delivery_delays", False)
        other_reason = request.data.get("other_reason", "")

        # Create the return request
        return_request = OrderItemReturn(
            order_item=order_item,
            sizing_issues=bool(sizing_issues),
            damaged_item=bool(damaged_item),
            incorrect_order=bool(incorrect_order),
            delivery_delays=bool(delivery_delays),
            other_reason=other_reason,
        )

        return_request.save()

        # Return success response
        return Response({
            "message": "Return request submitted successfully",
            "return_id": return_request.id,
            "created_at": return_request.created_at,
        }, status=status.HTTP_201_CREATED)

    except OrderItem.DoesNotExist:
        return Response({"error": "Order item not found"}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def return_reasons(request,order_item_id):
    try:
        order_item = OrderItem.objects.get(pk=order_item_id)
        if hasattr(order_item, 'order_item_return'):
            order_item_return = OrderItemReturn.objects.get(order_item = order_item)
            reasons = {
                "sizing_issues": order_item_return.sizing_issues,
                "damaged_item": order_item_return.damaged_item,
                "incorrect_order": order_item_return.incorrect_order,
                "delivery_delays": order_item_return.delivery_delays,
                "other_reason": order_item_return.other_reason,
                "return_date":order_item_return.created_at.date().strftime("%d-%m-%Y  %I:%M %p")
            }
        
            return Response(reasons, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Order item return not found"}, status=status.HTTP_404_NOT_FOUND)
    except OrderItem.DoesNotExist:
        return Response({"error": "Order item not found"}, status=status.HTTP_404_NOT_FOUND)
    

# api for approve or reject the returned item
@api_view(['PUT'])
def handle_return_approval(request, order_item_id):
    try:
        order_item = OrderItem.objects.get(id=order_item_id)
        product_variant = ProductVariant.objects.get(pk = order_item.product_variant.id)

        

        # Ensure this order item has a return request
        if not hasattr(order_item, 'order_item_return'):
            return Response({"error": "No return request found."}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get("action")
       
        if action.lower() not in ["approved", "rejected"]:
            return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

        if action.lower() == "approved":
            order_item.status = "RETURNED"  # optional: update item status

            # increase the stock quantity
            product_variant.stock_quantity += order_item.quantity
            product_variant.save()
            # Refund the amount to the user's wallet

            wallet, created = Wallet.objects.get_or_create(user=order_item.order.user)
            wallet.credit(
                    amount=Decimal(str(order_item.total_amount)),
                    description=f"Refund for cancelled order item - {order_item.product_variant}"
                )
            # wallet, created = Wallet.objects.get_or_create(user=order_item.order.user)
            # wallet.balance += Decimal(str(order_item.total_amount))
            # wallet.save()
        else:
            order_item.status = "DELIVERED"  # optional: update item status

        # order_item.order_item_return.save()
        order_item.save()

        return Response({"message": f"Return {action}d successfully."})

    except OrderItem.DoesNotExist:
        return Response({"error": "Order item not found."}, status=status.HTTP_404_NOT_FOUND)



from .models import Coupon, CouponUsage

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_coupon(request):
    code = request.data.get('code')
    order_total = float(request.data.get('order_total', 0))
    user = request.user

    try:
        coupon = Coupon.objects.get(code=code)

        if not coupon.is_valid():
            return Response({"error": "Coupon is expired or inactive."}, status=400)

        if order_total < coupon.minimum_order_amount:
            return Response({"error": "Order does not meet the minimum amount for this coupon."}, status=400)

        try:
            usage = CouponUsage.objects.get(user=user, coupon=coupon)

            if usage.used:
                return Response({"error": "You have already applied this coupon."}, status=400)

        except:
            pass

        return Response({
            "code": coupon.code,
            "discount_percent": coupon.discount_percent,
        }, status=200)

    except Coupon.DoesNotExist:
        return Response({"error": "Invalid coupon code."}, status=404)


@api_view(['POST'])
def remove_coupon(request):
    code = request.data.get('code')

    try:
        coupon = Coupon.objects.get(code=code)

        # Mark it as "listed" again so it can be reused
        coupon.is_listed = True
        coupon.save()

        return Response({"message": "Coupon removed successfully."}, status=200)

    except Coupon.DoesNotExist:
        return Response({"error": "Invalid coupon code."}, status=404)



@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_valid_coupons(request):
    coupons = Coupon.objects.filter(active=True, valid_to__gte=datetime.now())
    coupons_data = [
        {
            "id": coupon.id,
            "code": coupon.code,
            "description": coupon.description,
            "discount_percent": coupon.discount_percent,
            "minimum_order_amount": coupon.minimum_order_amount,
            "expiry_date": coupon.valid_to.strftime('%d-%m-%Y'),
        }
        for coupon in coupons
    ]
    return Response(coupons_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    user = request.user
    product_variant_id = request.data.get("product_variant_id")
   

    try:
        product_variant = ProductVariant.objects.get(pk=product_variant_id)
    except ProductVariant.DoesNotExist:
        return Response({"error": "Product variant not found"}, status=status.HTTP_404_NOT_FOUND)

    wish_list_exists = Wishlist.objects.filter(user=user, product_variant=product_variant).exists()
    if wish_list_exists:
        return Response({"error": "Product is already in the wishlist"}, status=status.HTTP_400_BAD_REQUEST)

    # Add to wishlist
    Wishlist.objects.create(user=user, product_variant=product_variant)
    return Response({"message": "Product added to wishlist successfully"}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_variant_id):
    user = request.user

    try:
        wishlist_item = Wishlist.objects.get(user=user, product_variant_id=product_variant_id)
    except Wishlist.DoesNotExist:
        return Response({"error": "Wishlist item not found"}, status=status.HTTP_404_NOT_FOUND)

    # Remove from wishlist
    wishlist_item.delete()
    return Response({"message": "Product removed from wishlist successfully"}, status=status.HTTP_200_OK)

    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_product_in_wishlist(request, product_variant_id):
    user = request.user

    # Check if the product is in the wishlist
    exists = Wishlist.objects.filter(user=user, product_variant_id=product_variant_id).exists()

    return Response({"in_wishlist": exists}, status=status.HTTP_200_OK)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_wishlist_products(request):
    user = request.user
    wishlist_items = Wishlist.objects.filter(user=user)
    wishlist_data = [
        {
            "id": item.id,
            "id": item.product_variant.id,
            "name": item.product_variant.product.name,
            "price": item.product_variant.price,
            "size":item.product_variant.size,
            "color":item.product_variant.color,
            "image": request.build_absolute_uri(
                item.product_variant.product.product_image.filter(
                    product=item.product_variant.product,
                    variant=item.product_variant,
                    is_primary=True
                ).first().image.url
            ) if item.product_variant.product.product_image.exists() else None,
        }
        for item in wishlist_items
    ]
    response = {'wishlist_data':wishlist_data,'wishlist_count':wishlist_items.count()}
    return Response(response, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_picture(request):
    user = request.user
    profile_picture = request.FILES.get('profile_picture')

    if not profile_picture:
        return Response({"error": "Profile picture is required"}, status=status.HTTP_400_BAD_REQUEST)

    user.profile_picture = profile_picture
    user.save()

    return Response({"message": "Profile picture updated successfully"}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wallet_data(request):
    user = request.user
    wallet, created = Wallet.objects.get_or_create(user=user)
    transactions = wallet.transactions.all().order_by('-created_at')
    transactions_data = [
        {
            "id": transaction.id,
            "amount": transaction.amount,
            "description": transaction.description,
            "transaction_type": transaction.transaction_type,
            "created_at": transaction.created_at.strftime('%d-%m-%Y %I:%M %p'),
        }
        for transaction in transactions
    ]
    wallet_data = {
        "balance": wallet.balance,
        "transactions_data":transactions_data,
        "total_transactions":len(transactions_data)
    }
    return Response(wallet_data, status=status.HTTP_200_OK)




@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])

def add_money_to_wallet(request):
    user = request.user
    amount = request.data.get('amount')

    
    wallet= Wallet.objects.get(user=user)
    wallet.credit(
        amount=Decimal(amount),
        description=f"Added {amount} to wallet"

    )

    return Response(f'Added {amount} to wallet')



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_sales_report(request):
    """
    Generate sales report based on date filters
    Filters:
    - date_range: 'daily', 'weekly', 'monthly', 'yearly', 'custom'
    - start_date: YYYY-MM-DD (required if date_range is custom)
    - end_date: YYYY-MM-DD (required if date_range is custom)
    - download_format: 'pdf', 'excel', null (default: null - returns JSON)
    """


    date_range = request.query_params.get('date_range', 'daily')
    download_format = request.query_params.get('download_format', None)

    # Calculate date range based on the filter
    today = timezone.now().date()
    
    if date_range == 'daily':
        start_date = today
        end_date = today
    elif date_range == 'weekly':
        start_date = today - timedelta(days=today.weekday())
        end_date = today
    elif date_range == 'monthly':
        start_date = today.replace(day=1)
        end_date = today
    elif date_range == 'yearly':
        start_date = today.replace(month=1, day=1)
        end_date = today
    elif date_range == 'custom':
        try:
            start_date = datetime.strptime(request.query_params.get('start_date'), '%Y-%m-%d').date()
            end_date = datetime.strptime(request.query_params.get('end_date'), '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD for start_date and end_date"},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        return Response(
            {"error": "Invalid date_range. Choose from 'daily', 'weekly', 'monthly', 'yearly', 'custom'"},
            status=status.HTTP_400_BAD_REQUEST)
    
    # Query orders within the date range
    orders = Order.objects.filter(
        order_date__gte=start_date,
        order_date__lte=end_date,
        status__in=['DELIVERED']  # Only include completed orders
    ).order_by('-order_date')
    
    # Calculate sales metrics
    total_orders = orders.count()
    total_sales = orders.aggregate(total=Sum('total'))['total'] or 0
    
    # Get discount data from coupon usages related to these orders
    coupon_usages = CouponUsage.objects.filter(
        user__in=orders.values_list('user', flat=True),
        used=True,
        # Filter by created_at if you track when coupons were used
    )
    
    # Calculate total discount by looking at the difference between original and final price
    # This is a simplified approach - you may need to adjust based on your actual data model
    total_discount = 0
    discount_details = []
    
    for order in orders:
        # Check if shipping_chrg exists in your order model, which you're deducting from total
        original_amount = float(order.total) + float(order.shipping_chrg)
        
        # Look for coupon usage for this order
        coupon_usage = coupon_usages.filter(user=order.user).first()
        if coupon_usage:
            coupon = coupon_usage.coupon
            discount_amount = original_amount * (coupon.discount_percent / 100)
            total_discount += discount_amount
            
            discount_details.append({
                'order_id': order.id,
                'order_no': order.order_no,
                'coupon_code': coupon.code,
                'discount_percent': coupon.discount_percent,
                'discount_amount': discount_amount
            })
    
    # Prepare report data
    report_data = {
        'date_range': {
            'type': date_range,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
        },
        'summary': {
            'total_orders': total_orders,
            'total_sales': float(total_sales),
            'total_discount': float(total_discount),
            'net_sales': float(total_sales) - float(total_discount),
        },
        'orders': [],
        'discount_details': discount_details
    }
    
    # Add order details
    for order in orders:
        order_data = {
            'order_id': order.id,
            'order_no': order.order_no,
            'order_date': order.order_date.strftime('%Y-%m-%d'),
            'user': order.user.email,
            'status': order.status,
            'payment_method': order.payment,
            'total': float(order.total),
            'items': []
        }
        
        # Add order items
        order_items = OrderItem.objects.filter(order=order)
        for item in order_items:
            order_data['items'].append({
                'product': item.product_variant.product.name,
                'variant': item.product_variant.name,
                'quantity': item.quantity,
                'price': float(item.total_amount) / item.quantity,
                'total': float(item.total_amount)
            })
        
        report_data['orders'].append(order_data)
    
    # If download is requested, generate the appropriate file
    if download_format == 'excel':
        return generate_excel_report(report_data)
    elif download_format == 'pdf':
        return generate_pdf_report(report_data)
    
    # Otherwise return JSON response
    return Response(report_data)


def generate_excel_report(report_data):
    """Generate an Excel file from report data"""
    # Create a Pandas DataFrame for the main summary
    summary_df = pd.DataFrame([{
        'Date Range': f"{report_data['date_range']['start_date']} to {report_data['date_range']['end_date']}",
        'Total Orders': report_data['summary']['total_orders'],
        'Total Sales': report_data['summary']['total_sales'],
        'Total Discount': report_data['summary']['total_discount'],
        'Net Sales': report_data['summary']['net_sales']
    }])
    
    # Create a DataFrame for orders
    orders_data = []
    for order in report_data['orders']:
        orders_data.append({
            'Order ID': order['order_no'],
            'Date': order['order_date'],
            'Customer': order['user'],
            'Status': order['status'],
            'Payment Method': order['payment_method'],
            'Total': order['total']
        })
    
    orders_df = pd.DataFrame(orders_data)
    
    # Create a DataFrame for order items
    items_data = []
    for order in report_data['orders']:
        for item in order['items']:
            items_data.append({
                'Order ID': order['order_no'],
                'Product': item['product'],
                'Variant': item['variant'],
                'Quantity': item['quantity'],
                'Price': item['price'],
                'Total': item['total']
            })
    
    items_df = pd.DataFrame(items_data)
    
    # Create a DataFrame for discounts
    discounts_df = pd.DataFrame(report_data['discount_details'])
    
    # Create Excel writer with multiple sheets
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        summary_df.to_excel(writer, sheet_name='Summary', index=False)
        orders_df.to_excel(writer, sheet_name='Orders', index=False)
        items_df.to_excel(writer, sheet_name='Order Items', index=False)
        
        if len(report_data['discount_details']) > 0:
            discounts_df.to_excel(writer, sheet_name='Discounts', index=False)
    
    # Prepare response
    output.seek(0)
    
    # Create response
    filename = f"sales_report_{report_data['date_range']['start_date']}_to_{report_data['date_range']['end_date']}.xlsx"
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename={filename}'
    
    return response


def generate_pdf_report(report_data):
    """Generate a PDF file from report data"""
    # Create a file-like buffer to receive PDF data
    buffer = io.BytesIO()
    
    # Create the PDF object, using the buffer as its "file"
    pdf = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    
    # Add title
    title_style = styles['Heading1']
    title = Paragraph("Sales Report", title_style)
    elements.append(title)
    
    # Add date range
    date_text = f"Period: {report_data['date_range']['start_date']} to {report_data['date_range']['end_date']}"
    date_paragraph = Paragraph(date_text, styles['Normal'])
    elements.append(date_paragraph)
    elements.append(Paragraph("<br/>", styles['Normal']))
    
    # Add summary table
    summary_data = [
        ['Total Orders', 'Total Sales', 'Total Discount', 'Net Sales'],
        [
            report_data['summary']['total_orders'],
            f"${report_data['summary']['total_sales']:.2f}",
            f"${report_data['summary']['total_discount']:.2f}",
            f"${report_data['summary']['net_sales']:.2f}"
        ]
    ]
    
    summary_table = Table(summary_data)
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(summary_table)
    elements.append(Paragraph("<br/><br/>", styles['Normal']))
    
    # Add orders section
    elements.append(Paragraph("Order Details", styles['Heading2']))
    
    if report_data['orders']:
        # Create orders table
        orders_data = [['Order No', 'Date', 'Customer', 'Status', 'Payment', 'Total']]
        
        for order in report_data['orders']:
            orders_data.append([
                order['order_no'],
                order['order_date'],
                order['user'],
                order['status'],
                order['payment_method'],
                f"${order['total']:.2f}"
            ])
        
        orders_table = Table(orders_data)
        orders_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(orders_table)
    else:
        elements.append(Paragraph("No orders found for this period.", styles['Normal']))
    
    # Add discount details if any
    if report_data['discount_details']:
        elements.append(Paragraph("<br/><br/>", styles['Normal']))
        elements.append(Paragraph("Discount Details", styles['Heading2']))
        
        discount_data = [['Order No', 'Coupon Code', 'Discount %', 'Amount']]
        
        for discount in report_data['discount_details']:
            discount_data.append([
                discount['order_no'],
                discount['coupon_code'],
                f"{discount['discount_percent']}%",
                f"${discount['discount_amount']:.2f}"
            ])
        
        discount_table = Table(discount_data)
        discount_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(discount_table)
    
    # Build the PDF
    pdf.build(elements)
    
    # Get the value of the BytesIO buffer
    buffer.seek(0)
    
    # Create the HTTP response with PDF
    filename = f"sales_report_{report_data['date_range']['start_date']}_to_{report_data['date_range']['end_date']}.pdf"
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename={filename}'
    
    return response



@api_view(['GET', 'POST'])
def coupon_list(request):
    """
    List all coupons or create a new coupon
    """
    if request.method == 'GET':
        coupons = Coupon.objects.all()
        serializer = CouponSerializer(coupons, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CouponSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET', 'PUT', 'DELETE'])
def coupon_detail(request, pk):
    """
    Retrieve, update or delete a coupon
    """
    try:
        coupon = Coupon.objects.get(pk=pk)
    except Coupon.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CouponSerializer(coupon)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CouponSerializer(coupon, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        coupon.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



@api_view(['GET'])
def best_selling_products(request):
    # Get Top 10 best selling products
    top_selling_products = Product.objects.annotate(
            total_quantity_sold=Sum('variants__orderitem__quantity'),
            total_revenue=Sum('variants__orderitem__total_amount')
            ).filter(
                total_quantity_sold__isnull=False
            ).order_by('-total_quantity_sold')[:10]

    data = [
        {
            "product_id": product.id,
            "product_name": product.name,
            "total_quantity_sold": product.total_quantity_sold,
            "total_revenue": product.total_revenue
        }
        for product in top_selling_products
    ]
    return Response(data,status=status.HTTP_200_OK)


@api_view(['GET'])
def best_selling_categories(request):
    top_selling_categories = Category.objects.annotate(
        total_quantity_sold=Sum('products__variants__orderitem__quantity'),
        total_revenue=Sum('products__variants__orderitem__total_amount')
    ).filter(
        total_quantity_sold__isnull=False
    ).order_by('-total_quantity_sold')[:10]

    data = [
        {
            "category_id": category.id,
            "category_name": category.name,
            "total_quantity_sold": category.total_quantity_sold,
            "total_revenue": category.total_revenue
        }
        for category in top_selling_categories
    ]
    return Response(data,status=status.HTTP_200_OK)



@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password_send_otp(request):
    email = request.data.get("email")

    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

    otp = generate_otp()
    r.set(f"forgot:{email}", otp, ex=600)  # store with prefix to distinguish from signup OTP

    send_otp_email(email, otp)

    return Response({"message": "OTP sent to email for password reset"}, status=status.HTTP_200_OK)



@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password_verify_otp(request):
    email = request.data.get("email")
    otp_entered = request.data.get("otp")

    if not email or not otp_entered:
        return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

    otp_stored = r.get(f"forgot:{email}")

    if otp_stored is None:
        return Response({"error": "OTP expired or not found"}, status=status.HTTP_400_BAD_REQUEST)

    if otp_entered == otp_stored:
        r.set(f"forgot_verified:{email}", "true", ex=600)  # mark as verified
        r.delete(f"forgot:{email}")
        return Response({"message": "OTP verified, you can now reset your password"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_forgot_password(request):
    email = request.data.get("email")
    new_password = request.data.get("new_password")

    if not email or not new_password:
        return Response({"error": "Email and new password are required"}, status=status.HTTP_400_BAD_REQUEST)

    is_verified = r.get(f"forgot_verified:{email}")
    if not is_verified:
        return Response({"error": "OTP verification required"}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    user.set_password(new_password)
    user.save()

    r.delete(f"forgot_verified:{email}")

    return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)



class ProductOfferViewSet(viewsets.ModelViewSet):
    queryset = ProductOffer.objects.all()
    serializer_class = ProductOfferSerializer


class CategoryOfferViewSet(viewsets.ModelViewSet):
    queryset = CategoryOffer.objects.all()
    serializer_class = CategoryOfferSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "message": "List of all products fetched successfully.",
            "categories": [{"id":category.id,"name":category.name} for category in Category.objects.filter(is_active=True)],
            "category_offers": serializer.data
        }, status=status.HTTP_200_OK)



# 🔹 Add Review View
class AddReviewView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        product_variant = serializer.validated_data.get('product_variant')

        # Check if the user has an order item with the given product_variant and status=DELIVERED
        has_delivered = OrderItem.objects.filter(
            order__user=user,
            product_variant=product_variant,
            status='DELIVERED'
        ).exists()

        if not has_delivered:
            raise DRFValidationError("You can only review a product that you have purchased and was delivered.")

        # Save the review with the logged-in user
        serializer.save(user=user)


# 🔹 List Reviews for a Product Variant
class ListReviewView(generics.ListAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        product_variant_id = self.kwargs['product_variant_id']
        return Review.objects.filter(product_variant_id=product_variant_id).order_by('-created_at')