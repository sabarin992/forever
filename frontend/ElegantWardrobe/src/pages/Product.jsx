"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import api from "../api";
import { toast } from "react-toastify";
import ProductReview from "@/components/ProductReview";

const Product = () => {
  const { productId } = useParams();
  const {
    products,
    currency,
    isAddToCart,
    setIsAddToCart,
    isChangeWishList,
    setIsChangeWishList,
  } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewProductId,setReviewProductId] = useState(null)

  // Ref for the image container
  const imageContainerRef = useRef(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/product_details/${productId}/`);
        console.log(res.data);

        setProductData(res.data);
        setImage(res.data.image);
      } catch (error) {
        console.log(error.message);
      } finally {
        setTimeout(() => setIsLoading(false), 800); // Add loading delay for smooth transition
      }
    };
    fetchProductData();
  }, [productId]);

  // Handle mouse movement for direct zoom effect
  const handleMouseMove = (e) => {
    const image = e.currentTarget.querySelector("img");
    const { width, height } = e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - e.currentTarget.getBoundingClientRect().left) / width) *
      100;
    const y =
      ((e.clientY - e.currentTarget.getBoundingClientRect().top) / height) *
      100;

    image.style.transformOrigin = `${x}% ${y}%`;
  };

  // function to add product to cart
  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select the product size");
      return;
    } else if (!color) {
      toast.error("Select the product color");
      return;
    }

    try {
      const res = await api.post(`/add_to_cart/`, {
        product_variant: itemId,
        size: size,
        quantity: quantity,
      });
      toast.success(res.data);
      setIsAddToCart(!isAddToCart);
    } catch (error) {
      // toast.error(error?.response?.data);
      console.log(error);
      if (error?.response?.data?.error) {
        const match = error?.response?.data?.error.match(/'([^']+)'/);
        const cleanMessage = match ? match[1] : error?.response?.data?.error;

        console.log(cleanMessage);
        toast.error(cleanMessage);
        // console.log(error?.response?.data?.error);
      }
    }
  };

  // function to add to wishlist
  const addToWishList = async (id) => {
    try {
      const res = await api.post("/add_to_wishlist/", {
        product_variant_id: id,
      });
      if (res.status === 201) {
        setIsChangeWishList(!isChangeWishList);
        setIsWishlisted(!isWishlisted);
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.error);
      console.log(error?.response?.data?.error);
    }
  };

  // function for change the variant
  const handleVariantChange = async (id) => {
    try {
      const res = await api.get(`/product_details/${id}/`);
      setReviewProductId(id)
      setProductData(res.data);
      setImage(res.data.image);
    } catch (error) {
      console.log(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full animate-spin"></div>
          <div className="w-20 h-20 border-4 border-black border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-black rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return productData ? (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <a
            href="/"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Home
          </a>
          <span>/</span>
          <a
            href="/products"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Products
          </a>
          <span>/</span>
          <span className="text-gray-900 font-medium">{productData.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Main Product Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
          <div className="flex gap-8 lg:gap-16 flex-col lg:flex-row p-8 lg:p-12">
            {/* Product Images */}
            <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
              <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full max-h-[500px]">
                {productData.images.map((item, index) => (
                  <img
                    onClick={() => {
                      setImage(item);
                    }}
                    src={item || "/placeholder.svg"}
                    key={index}
                    className="w-[24%] sm:w-full h-16 sm:h-20 object-cover sm:mb-3 flex-shrink-0 cursor-pointer transform hover:scale-105 transition-transform duration-300 rounded-lg border-2 border-transparent hover:border-blue-300"
                    alt=""
                  />
                ))}
              </div>
              <div
                className="w-full sm:w-[80%] h-64 sm:h-[500px] overflow-hidden rounded-lg shadow-lg relative bg-gray-100"
                ref={imageContainerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={(e) => {
                  const image = e.currentTarget.querySelector("img");
                  image.style.transition = "transform 0.1s ease";
                  image.style.transform = "scale(2.5)";
                }}
                onMouseLeave={(e) => {
                  const image = e.currentTarget.querySelector("img");
                  image.style.transition = "transform 0.3s ease";
                  image.style.transform = "scale(1)";
                }}
              >
                {/* Main product image with zoom effect */}
                <img
                  src={image || "/placeholder.svg"}
                  className="object-cover w-full h-full transition-transform duration-100"
                  alt={productData.name}
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-6">
              {/* Product Title & Rating */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {productData.name}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < 4 ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 font-medium">
                    (122 reviews)
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ⭐ Bestseller
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                {productData.discounted_amount != 0 ? (
                  <>
                    <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                      {currency}
                      {productData.discounted_amount}
                    </span>
                    <span className="text-2xl text-gray-400 line-through font-medium">
                      {currency}
                      {productData.price}
                    </span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                      {Math.round(
                        ((productData.price - productData.discounted_amount) /
                          productData.price) *
                          100
                      )}
                      % OFF
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                      {currency}
                      {productData.price}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed">
                {productData.description}
              </p>

              {/* Size Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Size</h3>
                  {/* <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200">
                    Size Guide
                  </button> */}
                </div>
                <div className="flex flex-wrap gap-3">
                  {productData.sizes.map((item, index) => (
                    <button
                      key={item.variant_id}
                      onClick={() => setSize(item.size)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        item.size === size
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {item.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {productData.colors.map((item, index) => (
                    <button
                      key={item.variant_id}
                      onClick={() => {
                        setColor(item.color);
                        handleVariantChange(item.variant_id);
                      }}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        item.color === color
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {item.color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                {productData.stock_quantity > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 font-semibold">
                      In Stock - {productData.stock_quantity} left
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-semibold">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>

              {/* Quantity Selector */}
              {/* <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Quantity
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="px-6 py-3 font-semibold text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(5, quantity + 1))}
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div> */}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!productData.is_in_cart ? (
                  <button
                    onClick={() => addToCart(productData.id, size)}
                    className="flex-1 bg-black hover:from-blue-700  text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 group"
                  >
                    <svg
                      className="w-6 h-6 group-hover:animate-bounce"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5m6 1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                      />
                    </svg>
                    ADD TO CART
                  </button>
                ) : null}
                {!productData.is_in_wishlist ? (
                  <button
                    onClick={() => addToWishList(productData.id)}
                    className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 group ${
                      isWishlisted
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 group-hover:animate-pulse ${
                        isWishlisted ? "fill-current" : ""
                      }`}
                      fill={isWishlisted ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    {isWishlisted ? "WISHLISTED" : "WISHLIST"}
                  </button>
                ) : null}
              </div>

              {/* Product Features */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>100% Original Product</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  <span>Cash on Delivery Available</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Easy Return & Exchange within 7 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Reviews Tabs */}
        <div className="mt-16 bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("description")}
              className={`flex-1 px-8 py-6 font-semibold text-lg transition-all duration-300 ${
                activeTab === "description"
                  ? "border-b-4 border-black text-black bg-gray-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex-1 px-8 py-6 font-semibold text-lg transition-all duration-300 ${
                activeTab === "reviews"
                  ? "border-b-4 border-black text-black bg-gray-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Reviews (122)
            </button>
          </div>

          <div className="p-8 lg:p-12">
            {activeTab === "description" ? (
              <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
                <p>
                  Experience premium quality with our carefully crafted product
                  that combines style, comfort, and durability. Made from the
                  finest materials and designed with attention to every detail,
                  this product represents the perfect blend of form and
                  function.
                </p>
                <p>
                  Our commitment to excellence ensures that each piece meets the
                  highest standards of quality and craftsmanship. Whether you're
                  looking for everyday comfort or special occasion elegance,
                  this product delivers on all fronts.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Material & Care
                    </h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Premium quality materials</li>
                      <li>• Machine washable</li>
                      <li>• Fade-resistant colors</li>
                      <li>• Wrinkle-free fabric</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Features
                    </h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Comfortable fit</li>
                      <li>• Durable construction</li>
                      <li>• Versatile styling</li>
                      <li>• All-season wear</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <ProductReview productId = {reviewProductId?reviewProductId:productId}/>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <RelatedProducts productId={productData.id} />
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500 text-xl">Product not found</div>
    </div>
  );
};

export default Product;

// "use client";

// import { useContext, useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { ShopContext } from "../context/ShopContext";
// import { assets } from "../assets/assets";
// import RelatedProducts from "../components/RelatedProducts";
// import api from "../api";
// import { toast } from "react-toastify";

// const Product = () => {
//   const { productId } = useParams();
//   const { products, currency, isAddToCart, setIsAddToCart,isChangeWishList,setIsChangeWishList } =
//     useContext(ShopContext);
//   const [productData, setProductData] = useState(false);
//   const [image, setImage] = useState("");
//   const [size, setSize] = useState("");
//   const [color, setColor] = useState("");

//   // Ref for the image container
//   const imageContainerRef = useRef(null);

//   useEffect(() => {
//     try {
//       const fetchProductData = async () => {
//         const res = await api.get(`/product_details/${productId}/`);
//         setProductData(res.data);
//         setImage(res.data.image);
//         console.log(res.data);
//       };
//       fetchProductData();
//     } catch (error) {
//       console.log(error.message);
//     }
//   }, [productId]);

//   // Handle mouse movement for direct zoom effect
//   const handleMouseMove = (e) => {
//     const image = e.currentTarget.querySelector("img");
//     const { width, height } = e.currentTarget.getBoundingClientRect();

//     // Calculate mouse position as percentage
//     const x =
//       ((e.clientX - e.currentTarget.getBoundingClientRect().left) / width) *
//       100;
//     const y =
//       ((e.clientY - e.currentTarget.getBoundingClientRect().top) / height) *
//       100;

//     // Apply transform to the image
//     image.style.transformOrigin = `${x}% ${y}%`;
//   };

//   // function to add product to cart
//   const addToCart = async (itemId, size) => {
//     console.log("itemId", itemId);

//     if (!size) {
//       toast.error("Select the product size");
//       return;
//     } else if (!color) {
//       toast.error("Select the product color");
//       return;
//     }

//     try {
//       const res = await api.post(`/add_to_cart/`, {
//         product_variant: itemId,
//         size: size,
//       });
//       toast.success(res.data);
//       setIsAddToCart(!isAddToCart);
//     } catch (error) {
//       toast.error(error?.response?.data);
//       console.log(error);

//     }
//   };

//   // function to add to cart
//   const addToWishList = async (id) => {
//     try {
//       const res = await api.post("/add_to_wishlist/", {
//         product_variant_id: id,
//       });
//       if (res.status === 201) {
//         setIsChangeWishList(!isChangeWishList)
//         toast.success(res.data.message);
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.error)
//       console.log(error?.response?.data?.error);

//     }
//   };

//   // function for change the variant

//   const handleVariantChange = async (id) => {
//     try {
//       const res = await api.get(`/product_details/${id}/`);
//       setProductData(res.data);
//       setImage(res.data.image);
//     } catch (error) {
//       console.log(error.message);
//     }
//     console.log(color, size);
//   };

//   return productData ? (
//     <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
//       {/* -----------Product Data--------- */}
//       <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
//         {/* ----------Product Images---------- */}
//         <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
//           <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
//             {productData.images.map((item, index) => (
//               <img
//                 onClick={() => {
//                   setImage(item);
//                 }}
//                 src={item || "/placeholder.svg"}
//                 key={index}
//                 className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
//                 alt=""
//               />
//             ))}
//           </div>
//           <div
//             className="w-full sm:w-[80%] overflow-hidden rounded-lg shadow-md relative"
//             ref={imageContainerRef}
//             onMouseMove={handleMouseMove}
//             onMouseEnter={(e) => {
//               const image = e.currentTarget.querySelector("img");
//               image.style.transition = "transform 0.1s ease";
//               image.style.transform = "scale(2.5)";
//             }}
//             onMouseLeave={(e) => {
//               const image = e.currentTarget.querySelector("img");
//               image.style.transition = "transform 0.3s ease";
//               image.style.transform = "scale(1)";
//             }}
//           >
//             {/* Main product image with zoom effect */}
//             <img
//               src={image || "/placeholder.svg"}
//               className="object-cover w-full h-full transition-transform duration-100"
//               alt={productData.name}
//             />
//           </div>
//         </div>

//         {/* ---------------Product Info------------ */}
//         <div className="flex-1">
//           <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
//           <div className="flex items-center gap-1 mt-2">
//             <img
//               src={assets.star_icon || "/placeholder.svg"}
//               alt=""
//               className="w-3 5"
//             />
//             <img
//               src={assets.star_icon || "/placeholder.svg"}
//               alt=""
//               className="w-3 5"
//             />
//             <img
//               src={assets.star_icon || "/placeholder.svg"}
//               alt=""
//               className="w-3 5"
//             />
//             <img
//               src={assets.star_icon || "/placeholder.svg"}
//               alt=""
//               className="w-3 5"
//             />
//             <img
//               src={assets.star_dull_icon || "/placeholder.svg"}
//               alt=""
//               className="w-3 5"
//             />
//             <p className="p-2">(122)</p>
//           </div>
//          <div className="flex gap-4">
//            <p className="mt-5 text-3xl font-medium">
//             {currency}
//             {productData.discounted_amount}
//           </p>
//           <p className="mt-5 text-3xl font-small text-gray-400 line-through">
//             {currency}
//             {productData.price}
//           </p>
//          </div>
//           <p className="mt-5 text-gray-500 md:w-4/5">
//             {productData.description}
//           </p>
//           <div className="flex flex-col gap-4 my-8">
//             <p>Select Size</p>
//             <div className="flex gap-2">
//               {productData.sizes.map((item, index) => (
//                 <button
//                   onClick={() => {
//                     setSize(item.size);
//                     // handleVariantChange(item.variant_id)
//                   }}
//                   className={`border py-2 px-4 bg-gray-100 ${
//                     item.size === size ? "border-orange-500" : ""
//                   }`}
//                   key={item.variant_id}
//                 >
//                   {item.size}
//                 </button>
//               ))}
//             </div>
//           </div>
//           <div className="flex flex-col gap-4 my-8">
//             <p>Select Color</p>
//             <div className="flex gap-2">
//               {productData.colors.map((item, index) => (
//                 <button
//                   onClick={() => {
//                     setColor(item.color);
//                     handleVariantChange(item.variant_id);
//                   }}
//                   className={`border py-2 px-4 bg-gray-100 ${
//                     item.color === color ? "border-orange-500" : ""
//                   }`}
//                   key={item.variant_id}
//                 >
//                   {item.color}
//                 </button>
//               ))}
//             </div>
//             {/* stock */}
//             {productData.stock_quantity > 0 ? (
//               <p className="text-green-600">
//                 In Stock: {productData.stock_quantity} left
//               </p>
//             ) : (
//               <p className="text-red-600">Out of Stock</p>
//             )}
//           </div>
//           <div className="flex gap-4">
//             <button
//               onClick={() => {
//                 addToCart(productData.id, size);
//               }}
//               className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
//             >
//               ADD TO CART
//             </button>
//             <button
//               onClick={() => {
//                 addToWishList(productData.id);
//                 // Add logic to handle adding to wishlist here
//               }}
//               className="bg-gray-200 text-black px-8 py-3 text-sm active:bg-gray-300 ml-4 flex items-center gap-2"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth={1.5}
//                 stroke="currentColor"
//                 className="w-5 h-5"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
//                 />
//               </svg>
//               ADD TO WISHLIST
//             </button>
//           </div>
//           <hr className="mt-8 sm:w-4/5" />
//           <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
//             <p>100% Original Product</p>
//             <p>Cash on delivery in available on this product</p>
//             <p>Easy return and exchange policy within 7 days</p>
//           </div>
//         </div>
//       </div>
//       {/* ----------Descriptions & Review Section------------ */}
//       <div className="mt-20">
//         <div className="flex">
//           <b className="border px-5 py-3 text-sm">Description</b>
//           <p className="border px-5 py-3 text-sm">Reviews(122)</p>
//         </div>
//         <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
//           <p>
//             Lorem ipsum dolor sit, amet consectetur adipisicing elit. Delectus
//             in consectetur harum cum molestias, sunt, enim, soluta neque dolor
//             qui porro fugit. Culpa, eius veritatis. Possimus quis totam
//             assumenda, pariatur nisi perferendis. Ea quia corporis beatae
//             perferendis commodi magni officiis esse, vitae animi minus
//             perspiciatis iusto fuga et eius accusantium ipsum pariatur non dicta
//             corrupti excepturi atque iure. Nesciunt dicta quos optio vitae sed,
//             maiores provident dolorem tempore sunt magni.
//           </p>
//           <p>
//             Lorem ipsum dolor, sit amet consectetur adipisicing elit.
//             Reprehenderit assumenda, perspiciatis pariatur eum iure error
//             perferendis ex? Voluptatum repudiandae, qui, sequi obcaecati ex nisi
//             fugit architecto numquam molestias sit quas. Officia nam sequi
//             voluptate soluta animi commodi nemo consequatur modi explicabo
//             dolorem, aspernatur perspiciatis quaerat, rem obcaecati temporibus
//             at neque.
//           </p>
//         </div>
//       </div>
//       {/* -------------Display the related product----------- */}
//       <RelatedProducts productId={productData.id} />
//     </div>
//   ) : (
//     <div className="opacity-0"></div>
//   );
// };

// export default Product;
