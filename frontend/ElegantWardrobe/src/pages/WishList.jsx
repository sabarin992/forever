import api from "@/api";
import WishlistTable from "@/components/ WishlistTable";
import Title from "@/components/Title";
import { ShopContext } from "@/context/ShopContext";
import { Rss } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const WishList = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWishListId, setSelectedWishListId] = useState(null);
  const {
    currency,
    wishlistItems,
    isAddToCart,
    setIsAddToCart,
    isChangeWishList,
    setIsChangeWishList,
  } = useContext(ShopContext);


  // // The below 3 function is for wishlist delete confirmation modal

  const handleDeleteClick = (wishListId) => {
    setSelectedWishListId(wishListId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    // Call your API to delete user here
    try {
      const res = await api.delete(`/remove_from_wishlist/${selectedWishListId}/`);
      toast.success(res.data.message);
      setIsChangeWishList(!isChangeWishList);
      setIsModalOpen(false);
      setSelectedWishListId(null);
    } catch (error) {
      console.log(error);
    }
    // After delete
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedWishListId(null);
  };



  const handleAddToCart = async (itemId, size, color, quantity) => {
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
        quantity: quantity,
      });
      toast.success(res.data);
      setIsAddToCart(!isAddToCart);
    } catch (error) {
      // console.log(error);
      if (error?.response?.data?.error) {
        const match = error?.response?.data?.error.match(/'([^']+)'/);
        const cleanMessage = match ? match[1] : error?.response?.data?.error;

        console.log(cleanMessage);
        toast.error(cleanMessage);
      } else {
        toast.error(error?.response?.data);
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"WISHLIST"} />
      </div>
      <WishlistTable
        items={wishlistItems}
        // onRemove={handleRemove}
        onAddToCart={handleAddToCart}
        currency={currency}
        handleDeleteClick={handleDeleteClick}
        handleConfirmDelete={handleConfirmDelete}
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
      />
    </div>
  );
};

export default WishList;
