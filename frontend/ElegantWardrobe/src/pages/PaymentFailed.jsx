import api from "@/api";
import { ShopContext } from "@/context/ShopContext";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PaymentFailed = () => {
  const { currency } = useContext(ShopContext);
  const [orderDetails, setOrderDetails] = useState({});
  const location = useLocation();
  const { orderId } = location.state;

  console.log(orderId);
  

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        const res = await api.get(`/order_details/${orderId}/`);
        console.log(res.data.items);

        setOrderDetails(res.data);
      } catch (error) {
        console.log(error);
        
      }
    };
    getOrderDetails();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Payment Failed
        </h1>
      </div>

      <div className="text-center text-gray-600 mb-6">
        <p>
          Sorry, there was an issue processing your payment for order
          #ORD202505150002. You can retry the payment below.
        </p>
        <p className="font-semibold mt-2">
          Note:{" "}
          <span className="font-normal">
            If you navigate away from this page, the order will be marked as
            failed, and you will need to place a new order.
          </span>
        </p>
      </div>

      {/* Order Information */}
      <div className="border border-gray-200 rounded-lg p-6 mb-4">
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-900">
          Order Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-gray-600 font-medium">Order Number</p>
            <p className="text-gray-900">#ORD202505150002</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">Order Date</p>
            <p className="text-gray-900">15 May 2025, 7:35 pm</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">Payment Method</p>
            <p className="text-gray-900">RAZORPAY</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">Payment Status</p>
            <p className="text-red-500">Failed</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="border border-gray-200 rounded-lg p-6 mb-4">
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-900">
          Order Items
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src="/placeholder.svg?height=96&width=96"
              alt="AX - Spencer Chronograph"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-medium text-gray-900">
              AX - Spencer Chronograph
            </h3>
            <p className="text-gray-600">Color: Gold | Qty: 1</p>
            <p className="font-semibold text-gray-900 mt-1">₹13,496</p>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="border border-gray-200 rounded-lg p-6 mb-4">
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-900">
          Delivery Address
        </h2>
        <p className="text-center text-gray-600">
          Brocamp, Kochi, Kerala - 682202
        </p>
      </div>

      {/* Price Details */}
      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-900">
          Price Details
        </h2>
        <div className="space-y-2 max-w-xs mx-auto">
          <div className="flex justify-between">
            <span className="text-gray-600">Items Total:</span>
            <span className="text-gray-900">₹13,496</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST (12%):</span>
            <span className="text-gray-900">₹1,619.52</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping Fee:</span>
            <span className="text-gray-900">₹100</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
            <span className="text-gray-900">Total Amount:</span>
            <span className="text-gray-900">₹15,215.52</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium transition-colors">
          Retry Payment
        </button>
        <button className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-md font-medium transition-colors">
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default PaymentFailed;
