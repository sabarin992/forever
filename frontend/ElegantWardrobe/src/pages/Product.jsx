"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import api from "../api";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, isAddToCart, setIsAddToCart,isChangeWishList,setIsChangeWishList } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  // Ref for the image container
  const imageContainerRef = useRef(null);

  useEffect(() => {
    try {
      const fetchProductData = async () => {
        const res = await api.get(`/product_details/${productId}/`);
        setProductData(res.data);
        setImage(res.data.image);
        console.log(res.data);
      };
      fetchProductData();
    } catch (error) {
      console.log(error.message);
    }
  }, [productId]);

  // Handle mouse movement for direct zoom effect
  const handleMouseMove = (e) => {
    const image = e.currentTarget.querySelector("img");
    const { width, height } = e.currentTarget.getBoundingClientRect();

    // Calculate mouse position as percentage
    const x =
      ((e.clientX - e.currentTarget.getBoundingClientRect().left) / width) *
      100;
    const y =
      ((e.clientY - e.currentTarget.getBoundingClientRect().top) / height) *
      100;

    // Apply transform to the image
    image.style.transformOrigin = `${x}% ${y}%`;
  };

  // function to add product to cart
  const addToCart = async (itemId, size) => {
    console.log("itemId", itemId);

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
      });
      toast.success(res.data);
      setIsAddToCart(!isAddToCart);
    } catch (error) {
      toast.error(error?.response?.data);
      console.log(error);
      
    }
  };

  // function to add to cart
  const addToWishList = async (id) => {
    try {
      const res = await api.post("/add_to_wishlist/", {
        product_variant_id: id,
      });
      if (res.status === 201) {
        setIsChangeWishList(!isChangeWishList)
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.error)
      console.log(error?.response?.data?.error);
      
    }
  };

  // function for change the variant

  const handleVariantChange = async (id) => {
    try {
      const res = await api.get(`/product_details/${id}/`);
      setProductData(res.data);
      setImage(res.data.image);
    } catch (error) {
      console.log(error.message);
    }
    console.log(color, size);
  };

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* -----------Product Data--------- */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* ----------Product Images---------- */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.images.map((item, index) => (
              <img
                onClick={() => {
                  setImage(item);
                }}
                src={item || "/placeholder.svg"}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt=""
              />
            ))}
          </div>
          <div
            className="w-full sm:w-[80%] overflow-hidden rounded-lg shadow-md relative"
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

        {/* ---------------Product Info------------ */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <img
              src={assets.star_icon || "/placeholder.svg"}
              alt=""
              className="w-3 5"
            />
            <img
              src={assets.star_icon || "/placeholder.svg"}
              alt=""
              className="w-3 5"
            />
            <img
              src={assets.star_icon || "/placeholder.svg"}
              alt=""
              className="w-3 5"
            />
            <img
              src={assets.star_icon || "/placeholder.svg"}
              alt=""
              className="w-3 5"
            />
            <img
              src={assets.star_dull_icon || "/placeholder.svg"}
              alt=""
              className="w-3 5"
            />
            <p className="p-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => {
                    setSize(item.size);
                    // handleVariantChange(item.variant_id)
                  }}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item.size === size ? "border-orange-500" : ""
                  }`}
                  key={item.variant_id}
                >
                  {item.size}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Color</p>
            <div className="flex gap-2">
              {productData.colors.map((item, index) => (
                <button
                  onClick={() => {
                    setColor(item.color);
                    handleVariantChange(item.variant_id);
                  }}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item.color === color ? "border-orange-500" : ""
                  }`}
                  key={item.variant_id}
                >
                  {item.color}
                </button>
              ))}
            </div>
            {/* stock */}
            {productData.stock_quantity > 0 ? (
              <p className="text-green-600">
                In Stock: {productData.stock_quantity} left
              </p>
            ) : (
              <p className="text-red-600">Out of Stock</p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                addToCart(productData.id, size);
              }}
              className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
            >
              ADD TO CART
            </button>
            <button
              onClick={() => {
                addToWishList(productData.id);
                // Add logic to handle adding to wishlist here
              }}
              className="bg-gray-200 text-black px-8 py-3 text-sm active:bg-gray-300 ml-4 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
              ADD TO WISHLIST
            </button>
          </div>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product</p>
            <p>Cash on delivery in available on this product</p>
            <p>Easy return and exchange policy within 7 days</p>
          </div>
        </div>
      </div>
      {/* ----------Descriptions & Review Section------------ */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">Description</b>
          <p className="border px-5 py-3 text-sm">Reviews(122)</p>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Delectus
            in consectetur harum cum molestias, sunt, enim, soluta neque dolor
            qui porro fugit. Culpa, eius veritatis. Possimus quis totam
            assumenda, pariatur nisi perferendis. Ea quia corporis beatae
            perferendis commodi magni officiis esse, vitae animi minus
            perspiciatis iusto fuga et eius accusantium ipsum pariatur non dicta
            corrupti excepturi atque iure. Nesciunt dicta quos optio vitae sed,
            maiores provident dolorem tempore sunt magni.
          </p>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            Reprehenderit assumenda, perspiciatis pariatur eum iure error
            perferendis ex? Voluptatum repudiandae, qui, sequi obcaecati ex nisi
            fugit architecto numquam molestias sit quas. Officia nam sequi
            voluptate soluta animi commodi nemo consequatur modi explicabo
            dolorem, aspernatur perspiciatis quaerat, rem obcaecati temporibus
            at neque.
          </p>
        </div>
      </div>
      {/* -------------Display the related product----------- */}
      <RelatedProducts productId={productData.id} />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
