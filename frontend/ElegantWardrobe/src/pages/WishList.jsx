import api from "@/api";
import WishlistTable from "@/components/ WishlistTable";
import Title from "@/components/Title";
import { ShopContext } from "@/context/ShopContext";
import { Rss } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const WishList = () => {
  // Sample data

  const {currency,wishlistItems,isAddToCart,setIsAddToCart,isChangeWishList,setIsChangeWishList} = useContext(ShopContext)

 console.log(wishlistItems)

  const handleRemove = async(id) => {
   try {
    const res = await api.delete(`/remove_from_wishlist/${id}/`);
    toast.success(res.data.message)
    setIsChangeWishList(!isChangeWishList)
   } catch (error) {
    console.log(error)
   }
    // Implement your remove logic here
  };

  const handleAddToCart = async(itemId,size,color,quantity) => {
        console.log("Quantity", quantity);
    
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
            quantity:quantity
          });
          toast.success(res.data);
          setIsAddToCart(!isAddToCart);
        } catch (error) {
          toast.error(error?.response?.data);
        }

  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"WISHLIST"} />
      </div>
      <WishlistTable
        items={wishlistItems}
        onRemove={handleRemove}
        onAddToCart={handleAddToCart}
        currency = {currency}
      />
    </div>
  );
};

export default WishList;
