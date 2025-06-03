import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "@/context/ShopContext";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { Edit, PlusCircle, Trash } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../utils/alert";
import RazorpayCheckout from "@/components/RazorPayCheckout";
import Coupon from "@/components/Coupon";
import ShowALLValidCoupons from "@/components/ShowALLValidCoupons";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("COD");
  const [status,setStatus] = useState('PENDING')
  const [customer, setCustomer] = useState({});
  const [shipAddress, setShipAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const { totalAmount,delivery_fee } = useContext(ShopContext);
  const [discount, setDiscount] = useState(null);
  const navigate = useNavigate();
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponCode, setCouponCode] = useState("");




  





  const handlePlaceOrder = async () => {
    console.log(method);
    try {
      const res = await api.post(`/place_order/`, {
        address_id: shipAddress,
        total: discount
          ? (totalAmount+delivery_fee) - (totalAmount * (discount / 100))
          : totalAmount+delivery_fee,
          couponCode:couponCode,
          payment_method:method,
          payment_status:status
      });
      console.log(res.data);
      showSuccessAlert(
        "Order Placed",
        "Your order has been successfully placed!"
      );
      navigate("/order-success", { state: { orderId: res.data.order_id } });
    } catch (error) {
      console.log(error.response.data);
      toast.error(error?.response?.data?.error)
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }
  
    try {
      const response = await api.post("create_order/", {
        totalAmount: discount
          ? (totalAmount + delivery_fee) - (totalAmount * (discount / 100))
          : totalAmount + delivery_fee,
      });
  
      const data = response.data;
      const createdOrderId = data.order_id; // Store it here
  
      const options = {
        key: data.razorpay_key,
        amount: data.amount,
        currency: "INR",
        name: "My Shop",
        description: "Purchase Payment",
        order_id: createdOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/verify_payment/", {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
  
            // place order
            const res = await api.post(`/place_order/`, {
              address_id: shipAddress,
              total: discount
                ? (totalAmount + delivery_fee) - (totalAmount * (discount / 100))
                : totalAmount + delivery_fee,
              payment_method: method,
              payment_status: method === 'COD' ? 'PENDING' : 'CONFIRMED',
              couponCode:couponCode,
            });
  
            showSuccessAlert(
              "Order Placed",
              "Your order has been successfully placed!"
            );
            navigate("/order-success", { state: { orderId: res.data.order_id } });
          } catch (error) {
            console.log(error.response?.data);
            toast.error(error?.response?.data?.error);
          }
        },
        prefill: {
          name: customer.first_name || "Customer Name",
          email: customer.email || "customer@example.com",
          contact: customer.phone_number || "9999999999",
        },
        theme: {
          color: "#0d6efd",
        },
        modal: {
          ondismiss: function () {
            
            navigate("/payment-failed", { state: { orderId: createdOrderId } });
          },
        },
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Unable to start payment");
    }
  };

  // const handlePayment = async () => {
  //   const res = await loadRazorpayScript();
  //   if (!res) {
  //     alert("Razorpay SDK failed to load.");
  //     return;
  //   }

  //   try {
  //     const response = await api.post("create_order/", {
  //       totalAmount: discount ? (totalAmount+delivery_fee) - (totalAmount * (discount / 100)) : totalAmount
  //     });
  //     const data = response.data;
  //     console.log(response);

  //     const options = {
  //       key: data.razorpay_key,
  //       amount: data.amount,
  //       currency: "INR",
  //       name: "My Shop",
  //       description: "Purchase Payment",
  //       order_id: data.order_id,
  //       handler: async function (response) {
  //         try {
  //           const verifyRes = await api.post("/verify_payment/", {
  //             order_id: response.razorpay_order_id,
  //             payment_id: response.razorpay_payment_id,
  //             signature: response.razorpay_signature,
  //           });
  //           alert(verifyRes.data.status);
  //           // place order
  //           try {
  //             const res = await api.post(`/place_order/`, {
  //               address_id: shipAddress,
  //               total: discount
  //                 ? (totalAmount+delivery_fee) - (totalAmount * (discount / 100))
  //                 : totalAmount+delivery_fee,
  //                 payment_method : method,
  //                 payment_status : method === 'COD'?'PENDING':'CONFIRMED'
  //             });
  //             setOrderId(res.data.res.data.order_id)
  //             console.log(res.data);
  //             showSuccessAlert(
  //               "Order Placed",
  //               "Your order has been successfully placed!"
  //             );
  //             navigate("/order-success", { state: { orderId: res.data.order_id } });
  //           } catch (error) {
  //             console.log(error.response.data);
  //             toast.error(error?.response?.data?.error)
  //           }
  //         } catch (err) {
  //           console.error("Payment verification failed", err);
  //           alert("Payment verification failed");
  //         }
  //       },
  //       prefill: {
  //         name: customer.first_name || "Customer Name",
  //         email: customer.email || "customer@example.com",
  //         contact: customer.phone_number || "9999999999",
  //       },
  //       theme: {
  //         color: "#0d6efd",
  //       },
  //       modal: {
  //         ondismiss: function () {
  //           // User closed the Razorpay popup
            
  //           navigate("/payment-failed",{ state: { orderId: orderId} });// order id used here
  //         }
  //       }
  //     };

  //     const rzp = new window.Razorpay(options);
  //     rzp.open();
  //   } catch (err) {
  //     console.error("Order creation failed:", err);
  //     alert("Unable to start payment");
  //   }
  // };

  useEffect(() => {
    const getAddresses = async () => {
      try {
        const res = await api.get("/get_all_addresses/");
        setAddresses(res.data.addresses_data);
        setCustomer(res.data.customer);
        setShipAddress(res.data.primary_address_id);
      } catch (error) {
        console.log(error.message);
      }
    };
    getAddresses();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* ---------------- Left Side ------------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"Choose"} text2={"Address"} />
        </div>
        <div className="flex justify-end mb-4">
          <Button
            variant="default"
            onClick={() => navigate("/profile/add-address")}
            className="bg-black text-white rounded-md hover:bg-black/90 w-52" // Set width here
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            ADD NEW ADDRESS
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex justify-between items-center border p-4 rounded-md"
            >
              <div>
                <h2 className="text-lg font-semibold">{address.name}</h2>
                <p>{address.address}</p>
                <p>
                  {address.city}, {address.state} - {address.zipcode}
                </p>
              </div>
              <div className="flex gap-4"></div>
              <p
                onClick={() => {
                  setShipAddress(address.id);
                }}
                className={`min-w-3.5 h-3.5 border rounded-full cursor-pointer ${
                  shipAddress === address.id ? "bg-black" : ""
                }`}
              ></p>
            </div>
          ))}
        </div>
        {/* <div className="flex gap-3">
          <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='First Name' />
          <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='Last Name' />
        </div>
        <input type="email" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='Email Address'/>
        <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder="Street"/>
        <div className="flex gap-3">
          <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='City' />
          <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='States' />
        </div>
        <div className="flex gap-3">
          <input type="number" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='Zipcode' />
          <input type="text" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='Country' />
        </div>
        <input type="number" className="border border-gray-300 rounded py-1.5 px-3.5 w-full" placeholder='Phone' /> */}
      </div>

      {/* ---------------- Right Side -------------- */}
      <div className="mt-8">
        <div className="mt-8 min-w-80 ">
          <CartTotal totalAmount={totalAmount} discount={discount} />
        </div>
        {/* coupon */}
        <div className="flex gap-4 items-center">
          <Coupon
            cartTotal={totalAmount}
            discount={discount}
            setDiscount={setDiscount}
            couponCode = {couponCode}
            setCouponCode = {setCouponCode}
          />
          <Button
            variant="outline"
            className="border border-black text-black hover:bg-gray-100"
            onClick={() => setShowCoupons(!showCoupons)}
          >
            {showCoupons ? "Hide Coupons" : "Show Coupons"}
          </Button>
        </div>
        {discount && (
          <p className="text-green-600 mt-2">
            Coupon applied! You get {discount}% off.
          </p>
        )}

        {showCoupons && <ShowALLValidCoupons />}

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />

          {/* ------ Payment Method Selection ------ */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => {
                setMethod("WALLET");
                setStatus('CONFIRMED')
              }}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "WALLET" ? "bg-black" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                WALLET
              </p>
            </div>
            <div
              onClick={() => {
                setMethod("RAZORPAY");
                setStatus('CONFIRMED')
              }}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "RAZORPAY" ? "bg-black" : ""
                }`}
              ></p>
              <img className="h-5 mx-4 " src={assets.razorpay_logo} alt="" />
            </div>
            <div
              onClick={() => {
                setMethod("COD");
                setStatus('PENDING')
              }}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "COD" ? "bg-black" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>
          {/* <div>{method === 'razorpay'?<RazorpayCheckout amount = {totalAmount} name = {customer.first_name} email = {customer.email} phone = {customer.phone_number} />:null}</div> */}
          <div className="w-full text-end mt-8">
            <button
              onClick={
                method === "COD" || method === 'WALLET'
                  ? handlePlaceOrder
                  : method === "RAZORPAY"
                  ? handlePayment
                  : () => {}
              }
              className="bg-black text-white text-sm my-8 px-16 py-3"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
