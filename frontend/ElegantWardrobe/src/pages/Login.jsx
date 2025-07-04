import React, { useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleAuth from "../components/GoogleAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters long";
    return "";
  };

  // Real-time validation
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      default:
        break;
    }
    return error;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Real-time validation if field has been touched
    if (touched.email) {
      const error = validateField("email", value);
      setErrors(prev => ({ ...prev, email: error }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Real-time validation if field has been touched
    if (touched.password) {
      const error = validateField("password", value);
      setErrors(prev => ({ ...prev, password: error }));
    }
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    const error = validateField("email", email);
    setErrors(prev => ({ ...prev, email: error }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    const error = validateField("password", password);
    setErrors(prev => ({ ...prev, password: error }));
  };

  // Validate all fields
  const validateAllFields = () => {
    const newErrors = {};
    newErrors.email = validateEmail(email);
    newErrors.password = validatePassword(password);
    
    setErrors(newErrors);
    setTouched({
      email: true,
      password: true,
    });

    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== "");
  };

  const onHandleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateAllFields()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/login/", { email, password });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      toast.success("Login Successful");
      navigate("/");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-3 py-2 border transition-colors duration-200";
    if (errors[fieldName] && touched[fieldName]) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500`;
    } else if (touched[fieldName] && !errors[fieldName]) {
      return `${baseClass} border-green-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500`;
    }
    return `${baseClass} border-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`;
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

      {/* Email Field */}
      <div className="w-full">
        <input
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          className={getInputClassName("email")}
          type="email"
          placeholder="Email"
          value={email}
          disabled={isSubmitting}
        />
        {errors.email && touched.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="w-full">
        <input
          onChange={handlePasswordChange}
          onBlur={handlePasswordBlur}
          className={getInputClassName("password")}
          type="password"
          placeholder="Password"
          value={password}
          disabled={isSubmitting}
        />
        {errors.password && touched.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p 
          className="cursor-pointer hover:text-blue-600 transition-colors duration-200" 
          onClick={() => { navigate('/forgot-password-sent-otp-form/') }}
        >
          Forgot your Password?
        </p>
        <p 
          className="cursor-pointer hover:text-blue-600 transition-colors duration-200" 
          onClick={() => { navigate('/register') }}
        >
          Create Account
        </p>
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className={`px-8 py-2 font-light mt-4 transition-colors duration-200 ${
          isSubmitting 
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

      <div className="w-full text-white py-2 rounded-md transition-colors duration-200">
        <GoogleOAuthProvider clientId="302235449578-4lrgfd6518k3mn0hfc53nnjfod9einj5.apps.googleusercontent.com">
          <GoogleAuth />
        </GoogleOAuthProvider>
      </div>
    </form>
  );
};

export default Login;

// import React, { useState } from "react";
// import api from "../api";
// import { toast } from "react-toastify";
// import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
// import { useNavigate } from "react-router-dom";
// import { GoogleOAuthProvider } from "@react-oauth/google";
// import GoogleAuth from "../components/GoogleAuth";

// const Login = () => {
//   // const [currentState, setCurrentState] = useState("Sign Up");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const onHandleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/login/", { email, password });
//       localStorage.setItem(ACCESS_TOKEN, res.data.access);
//       localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
//       toast.success("Login Successful");
//       navigate("/");
//     } catch (error) {
//       toast.error(error.response.data.error);
//     }
//   };
//   return (
//     <form
//       onSubmit={onHandleSubmit}
//       className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
//     >
//       <div className="inline-flex items-center gap-2 mb-2 mt-10">
//         <p className="prata-regular text-3xl">Login</p>
//         <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
//       </div>

//       <input
//         onChange={(e) => {
//           setEmail(e.target.value);
//         }}
//         className="w-full px-3 py-2 border border-gray-800"
//         type="email"
//         placeholder="Email"
//         required
//       />

//       <input
//         onChange={(e) => {
//           setPassword(e.target.value);
//         }}
//         className="w-full px-3 py-2 border border-gray-800"
//         type="password"
//         placeholder="Password"
//         required
//       />
//       <div className="w-full flex justify-between text-sm mt-[-8px]">
//         <p className="cursor-pointer" onClick={()=>{navigate('/forgot-password-sent-otp-form/')}}>Forgot your Password?</p>

//         <p className="cursor-pointer" onClick={()=>{navigate('/register')}}>Create Account</p>
//       </div>
//       <button className="bg-black text-white px-8 py-2 font-light mt-4">
//         Login
//       </button>
//       <div className="w-full  text-white py-2 rounded-md transition-colors duration-200">
//         <GoogleOAuthProvider clientId="302235449578-4lrgfd6518k3mn0hfc53nnjfod9einj5.apps.googleusercontent.com">
//           <GoogleAuth />
//         </GoogleOAuthProvider>
//       </div>
//     </form>
//   );
// };

// export default Login;
