import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";

const CartTotal = ({totalPrice,discount,totalDiscount}) => {
  const { currency, delivery_fee} = useContext(ShopContext);

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Price</p>
          <p>
            {currency}
            {totalPrice}
          </p>
        </div>
        <div className="flex justify-between">
          <p>Discount</p>
          <p>
            {currency}
            {totalDiscount}
          </p>
        </div>
        <hr />

        {/* Shipping Fee  */}
        {/* ============= */}

        {/* <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>
            {currency}
            {delivery_fee} 
          </p>
        </div>

        <hr /> */}

        {discount && <>
          <div className="flex justify-between">
          <p>Discount</p>
          <p>
            
            {currency} {(totalAmount)*(discount/100)}
          </p>
        </div>
        <hr />
        </>}

        {/* If you want to add delivery fee+( reduce discount amount) to the total amount then use this code */}
        {/* ================================================================================================ */}

        {/* <div className="flex justify-between">
            <b>Total</b>
            <b>{currency} {!totalAmount? 0 
            : discount?(totalAmount+delivery_fee) - ((totalAmount)*(discount/100))
            :totalAmount+delivery_fee}.00</b>
        </div> */}

         {/* elif you want to add discount with total amount then use this code */}
        {/* ========================================================================== */}

        <div className="flex justify-between">
            <b>Total</b>
            <b>{currency} {totalPrice - totalDiscount}.00</b>
        </div>


      </div>
    </div>
  );
};

export default CartTotal;
