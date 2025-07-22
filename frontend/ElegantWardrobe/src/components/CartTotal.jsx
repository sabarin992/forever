import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";

const CartTotal = ({ totalPrice, totalDiscount, discount }) => {
  const { currency, delivery_fee } = useContext(ShopContext);

  const coupon_discount = discount
    ? ((totalPrice - totalDiscount) * discount) / 100
    : 0;

    
  const total_price =
    totalDiscount && discount
      ? totalPrice - (totalDiscount + (((totalPrice-totalDiscount)*discount)/100))
      : totalDiscount
      ? totalPrice - totalDiscount
      : discount
      ? totalPrice - discount
      : totalPrice;


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
          <p>Offer Discount</p>
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

        {/* <div className="flex justify-between">
            <b>Total</b>
            <b>{currency} {totalPrice - totalDiscount}.00</b>
        </div> */}

        {!discount ? (
          <div className="flex justify-between">
            <b>Total</b>
            <b>
              {/* {currency} {totalPrice - totalDiscount}.00 */}
              {currency} {total_price}
            </b>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-2 text-sm">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p>
                {currency} {totalPrice - totalDiscount}
              </p>
            </div>
            <div className="flex justify-between">
              <p>Coupon Discount</p>
              <p>
                {currency} {coupon_discount}
              </p>
            </div>
            <hr />
            <div className="flex justify-between">
              <b>Total</b>
              <b>
                {/* {currency}{" "}
                {totalPrice -
                  totalDiscount -
                  ((totalPrice - totalDiscount) * discount) / 100}
                .00 */}
                {currency}{" "}
                {total_price}
            
              </b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartTotal;
