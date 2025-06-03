"use client"

import { useContext, useEffect, useState } from "react"
import { ShopContext } from "../context/ShopContext"
import { Link } from "react-router-dom"
import api from "@/api"
import { toast } from "react-toastify"

const ProductItem = ({ id, image, name, price }) => {
  const { currency,isChangeWishList,setIsChangeWishList } = useContext(ShopContext)
  const [isInWishlist,setIsInWishList] = useState(false)

  console.log(id);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }
  


  useEffect(() => {
    if(!id){
      return
    }
    const fetchWishlistStatus = async () => {
      try {
        const res = await api.get(`/is_product_in_wishlist/${id}/`);
        if (res.status === 200) {
          setIsInWishList(res.data.in_wishlist);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist status", error);
      }
    };

    fetchWishlistStatus();
  },[id]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking the heart icon
    e.stopPropagation(); // prevent parent from receiving the click


    try {
      if (isInWishlist) {
        const res = await api.delete(`/remove_from_wishlist/${id}/`);
        if (res.status === 200) {
          setIsInWishList(false);
          setIsChangeWishList(!isChangeWishList)

        }
      } else {
        const res = await api.post('/add_to_wishlist/', { product_variant_id: id });
        
        if (res.status === 201) {
          setIsInWishList(true);
          setIsChangeWishList(!isChangeWishList)

        }
        
      }
    } catch (error) {
      setIsInWishList(false);
      toast.error(error?.response?.data?.error)
      // console.error("Wishlist toggle error:", error);
    }
  };

  return (
    <Link onClick={scrollToTop} className="text-gray-700 cursor-pointer relative group" to={`/product/${id}`}>
      <div className="overflow-hidden w-full aspect-square bg-gray-100 rounded-lg">
        <img
          className="object-cover w-full h-full hover:scale-110 transition-transform duration-300 ease-in-out"
          src={image || "/placeholder.svg"}
          alt={name}
        />
      </div>
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isInWishlist ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#FF4B4B"
            stroke="#FF4B4B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        )}
      </button>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">
        {currency} {price}
      </p>
    </Link>
  )
}

export default ProductItem