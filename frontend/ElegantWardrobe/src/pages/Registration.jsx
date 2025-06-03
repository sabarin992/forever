import React, { useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import OtpVerification from "../components/OtpVerification";
import { ClipLoader } from "react-spinners";

const Registration = () => {
  // const [currentState, setCurrentState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password1: "",
    password2: "",
  });

  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onHandleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password1 !== formData.password2) {
        toast.error("Passwords do not match!");
        return;
      }
      setLoading(true); // Start loading
      try {
        // Send OTP request
        await api.post("/send-otp/", {
          email: formData.email,
        });
  
        setOtpSent(true); // Show OTP verification component
      } catch (error) {
        alert("Error sending OTP. Try again!");
      }
    finally {
      setLoading(false); // Stop loading
    }

    // try {
    //   const res = await api.post("/register/", formData);
    //   if (res.status === 201) {
    //     toast.success("Registration Successfull");
    //     navigate("/");
    //   }
    // } catch (error) {
    //   toast.error(
    //     error.response.data.phone_number ? "Phone Number already exist" : null
    //   );
    //   toast.error(error.response.data.email ? "Email already exist" : null);
    // }
  };
  return (
    <>
    {loading ? (
      <div className="w-full h-screen flex items-center justify-center">
      <ClipLoader color="#000" size={40} />
    </div>
    ) : !otpSent?(
        <form
        onSubmit={onHandleSubmit}
        className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
      >
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text-3xl">Sign Up</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>
        
        {/* Firtname */}
        <input
          className="w-full px-3 py-2 border border-gray-800"
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />

        {/* Lastname */}
        <input
          className="w-full px-3 py-2 border border-gray-800"
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
  
        {/* Email */}
        <input
          className="w-full px-3 py-2 border border-gray-800"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
  
        {/* Phone Number */}
        <input
          className="w-full px-3 py-2 border border-gray-800"
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
          required
        />
  
        {/* Password */}
        <input
          className="w-full px-3 py-2 border border-gray-800"
          type="password"
          name="password1"
          placeholder="Password"
          value={formData.password1}
          onChange={handleChange}
          required
        />
  
        {/* Confirm Password */}
        <input
          className="w-full px-3 py-2 border border-gray-800"
          type="password"
          name="password2"
          placeholder="Confirm Password"
          value={formData.password2}
          onChange={handleChange}
          required
        />
  
        <div className="w-full flex justify-between text-sm mt-[-8px]">
          {/* <p className="cursor-pointer">Forgot your Password?</p> */}
  
          <p className="cursor-pointer" onClick={()=>{navigate('/login')}}>Login Here</p>
        </div>

        {/* Submit Button */}
        <button className="bg-black text-white px-8 py-2 font-light mt-4 ">
          Sign Up
        </button>
      </form>
    ):(
        <OtpVerification formData={formData} setOtpSent={setOtpSent}/>
      )}
    </>
  );
};

export default Registration;
