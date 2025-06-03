import api from '@/api';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClipLoader } from "react-spinners";


const EditProfile = () => {

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
      });

    const [oldEmail, setOldEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
      const [loading, setLoading] = useState(false);
      


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
    

      const onHandleSubmit = async (e) => {
        e.preventDefault()
        if (formData.email !== oldEmail) {
            setLoading(true); // Start loading
            try {
                const res = await api.post("/send-otp/", {
                  email: formData.email,
                });
                setOtpSent(true); // Show OTP verification component
              } catch (error) {
                toast.error("Error sending OTP. Try again!");
              }
              finally {
                setLoading(false); // Stop loading
              }
        }
        else{
            setOtpSent(false)
            try {
                const res = await api.put(`/edit_user_profile/`, formData);
                if (res.status === 200) {
                    toast.success("Profile Updated Successfully");
                }
                else {
                    toast.error("Profile Update Failed");
                }
                
            } catch (error) {
                console.log(error.message);
            }
            
        } 
        
        
    }

    const handleVerifyOtp = async () => {
        // const response = await api.post("/verify-otp/", {
        //     email: formData.email,
        //     otp: otp,
        //   });

        try {   
            const response = await api.post("/verify-otp/", {
                email: formData.email,
                otp: otp,
              });
    
              if (response.data.message === "OTP verified successfully") {
                setOtpSent(false);
                toast.success("OTP verified successfully");
                try {
                    const res = await api.put(`/edit_user_profile/`, formData);
                    if (res.status === 200) {
                        toast.success("Profile Updated Successfully");
                    }
                    else {
                        toast.error("Profile Update Failed");
                    }
                    
                } catch (error) {
                    console.log(error.message);
                }
                
              }
        }
        catch (error) {
            toast.error("Invalid OTP! Try again.")
        }
        
        
    }

    useEffect(()=>{
       const getUsersData = async () => {
            try {
                const res = await api.get(`/edit_user_profile/`);
                setFormData(res.data);
                setOldEmail(res.data.email)
                
            } catch (error) {
                console.log(error.message);
            }
        }
        getUsersData()
    },[])
  return (
    <>
{loading ? (
      <div className="w-full h-screen flex items-center justify-center">
      <ClipLoader color="#000" size={40} />
    </div>
    ) :!otpSent
?     <form
onSubmit={onHandleSubmit}
className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
>
<div className="inline-flex items-center gap-2 mb-2 mt-10">
  <p className="prata-regular text-3xl">Edit Profile</p>
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

{/* <div className="w-full flex justify-between text-sm mt-[-8px]">
 

  <p className="cursor-pointer" onClick={()=>{navigate('/login')}}>Login Here</p>
</div> */}

{/* Submit Button */}
<button className="bg-black text-white px-8 py-2 font-light mt-4 ">
  Edit
</button>
</form>
:          <div className="min-h-screen flex items-center justify-center bg-white p-4">
<div className="w-full max-w-md space-y-8">
    {/* <!-- Main Content --> */}
    <div className="text-center space-y-6">
        {/* <!-- Header --> */}
        <h1 className="text-xl md:text-2xl font-medium text-center">
            Check your Gmail, we sent a otp to your account
        </h1>

        {/* <!-- OTP Form --> */}
        <form className="space-y-6">
            <div class211015Name="space-y-4">
                <label className="block text-lg font-medium text-center">
                    Enter OTP
                </label>
                <input 
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    className="w-full max-w-[200px] mx-auto block px-4 py-2 text-center bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                />
            </div>

            {/* <!-- Resend Link --> */}
            <div className="text-center">
                <button 
                    type="button"
                    className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                >
                    resent OTP
                </button>
            </div>

            {/* <!-- Continue Button --> */}
            <button 
                type="button"
                onClick={handleVerifyOtp}
                className="w-full max-w-[200px] mx-auto block px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors duration-200"
            >
                CONTINUE
            </button>
        </form>
    </div>
</div>
</div>}
    </>
  )
}

export default EditProfile