import React, { useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleAuth from "../components/GoogleAuth";

const Login = () => {
  // const [currentState, setCurrentState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onHandleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login/", { email, password });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      toast.success("Login Successful");
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };
  return (
    <form
      onSubmit={onHandleSubmit}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Login</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <input
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        className="w-full px-3 py-2 border border-gray-800"
        type="email"
        placeholder="Email"
        required
      />

      <input
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        className="w-full px-3 py-2 border border-gray-800"
        type="password"
        placeholder="Password"
        required
      />
      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer" onClick={()=>{navigate('/forgot-password-sent-otp-form/')}}>Forgot your Password?</p>

        <p className="cursor-pointer" onClick={()=>{navigate('/register')}}>Create Account</p>
      </div>
      <button className="bg-black text-white px-8 py-2 font-light mt-4">
        Login
      </button>
      <div className="w-full  text-white py-2 rounded-md transition-colors duration-200">
        <GoogleOAuthProvider clientId="302235449578-4lrgfd6518k3mn0hfc53nnjfod9einj5.apps.googleusercontent.com">
          <GoogleAuth />
        </GoogleOAuthProvider>
      </div>
    </form>
  );
};

export default Login;
