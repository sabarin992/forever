import api from "@/api";
import { ShopContext } from "@/context/ShopContext";
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "@/components/InvoicePDF";
import ReturnOrderModal from "@/components/ReturnOrder";

const OrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState({});
  const { currency } = useContext(ShopContext);
  const location = useLocation();
  const { orderId } = location.state;
  const navigate = useNavigate();
  // const [iscancelOrder, setIsCancelOrder] = useState(false);
  const [isChangeOrderItem, setIsChangeOrderItem] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [orderItemId, setOrderItemId] = useState(0);

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
  }, [isChangeOrderItem]);

  //   for cancel the order
  // const cancelOrder = async (id) => {
  //   console.log(iscancelOrder);

  //   try {
  //     const res = await api.put(`/cancel_order/${id}/`);
  //     toast.success(res.data.message);
  //     setIsCancelOrder(true);
  //   } catch (error) {
  //     toast.error(error?.response?.data?.error);
  //     setIsCancelOrder(false);
  //   }
  // };

  //   for cancel order_item
  const cancelOrderItem = async (id) => {
    try {
      const res = await api.put(`/cancel_order_item/${id}/`);
      toast.success(res.data.message);
      setIsChangeOrderItem(!isChangeOrderItem);
    } catch (error) {
      toast.error(error?.response?.data?.error);
      // setIsCancelOrderItem();
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
        <div className="mb-4">
          {/* <h1 className="text-2xl font-bold text-gray-800">Order {orderDetails.order_no}</h1> */}
          <p className="text-gray-500">Ordered on {orderDetails.order_date}</p>
          <span className="inline-block px-3 py-1 mt-2 bg-yellow-400 text-yellow-800 rounded-md text-sm font-medium">
            {orderDetails.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-medium text-gray-700 mb-2">Order Status</h2>
            <p className="text-gray-600">{orderDetails.status}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-medium text-gray-700 mb-2">Payment Method</h2>
            <p className="text-gray-600">
              {orderDetails.payment_method === "COD"
                ? "Cash On Delivery"
                : null}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-medium text-gray-700 mb-2">Payment Status</h2>
            <p className="text-gray-600">{orderDetails.payment_status}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="font-medium text-gray-700 mb-4">Products Ordered</h2>

          {orderDetails.items?.map((item, index) => (
            <div
              key={item.item_id}
              className="border-b border-gray-200 pb-4 mb-4"
            >
              {showReturnModal && (
                <ReturnOrderModal
                  orderItemId={orderItemId}
                  showReturnModal={showReturnModal}
                  setShowReturnModal={setShowReturnModal}
                  isChangeOrderItem = {isChangeOrderItem} 
                  setIsChangeOrderItem = {setIsChangeOrderItem}
                />
              )}
              <div className="flex flex-col md:flex-row items-start">
                <div className="w-20 h-20 mr-4 mb-2 md:mb-0">
                  <img
                    src={item.image || "fallback.jpg"}
                    alt="Tissot Seastar 1000 Chronograph"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">
                    {item.product_name} {item.item_id}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Color: {item.variant?.color || "N/A"} | Qty: {item.quantity}
                  </p>
                  <p className="font-medium mt-1">
                    {currency} {item.price}
                  </p>
                  {item.status === "DELIVERED" ? (
                    <button
                      onClick={() => {
                        setOrderItemId(item.item_id)
                        setShowReturnModal(!showReturnModal);
                      }}
                      className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Return item
                    </button>
                  ) : (item.status === "PENDING")?(
                    <button
                      onClick={() => {
                        cancelOrderItem(item.item_id);
                      }}
                      className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Cancel Order
                    </button>
                  ):null}
                </div>
                <div className="flex flex-col items-center">
                  {/* item status */}
                  <h2 className="font-medium text-gray-700 mb-2">Status</h2>
                  <p className="text-gray-600">{item.status}</p>

                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="font-medium text-gray-700 mb-2">
            Shipping Information
          </h2>
          <p className="text-gray-600">
            {orderDetails.address?.name}, {orderDetails.address?.city},{" "}
            {orderDetails.address?.state} - {orderDetails.address?.pin_code}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="font-medium text-gray-700 mb-4">Price Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-800">
                {currency} {orderDetails.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST (12%):</span>
              <span className="text-gray-800">
                {currency} {orderDetails.total * 0.12}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-800">{currency} 40</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
              <span>Total:</span>
              <span>
                {currency} {orderDetails.total + orderDetails.total * 0.12 + 40}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-3">
          <button
            onClick={() => {
              navigate("/orders");
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Back to Orders
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* {orderDetails.status === "DELIVERED" ? (
              // return order
              <button
                onClick={() => {
                  setShowReturnModal(!showReturnModal);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Return Order
              </button>
            ) : (
              // cancel order
              <button
                onClick={() => {
                  cancelOrder(orderId);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                {orderDetails.status === "CANCELED"
                  ? "Order cancelled"
                  : "Cancel Order"}
              </button>
            )} */}

            {/* <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors">
        Download Invoice
      </button> */}
            <PDFDownloadLink
              document={<InvoicePDF order={orderDetails} />}
              fileName={`invoice_order_${orderDetails.id}.pdf`}
              className="border flex justify-center items-center p-2 rounded"
            >
              {({ loading }) =>
                loading ? "Preparing Invoice..." : "Download Invoice"
              }
            </PDFDownloadLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
