import { useState } from 'react';
import axios from 'axios';
import api from '@/api';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ForgotPasswordOtpVerificationForm() {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const { email} = location.state || {};
  const navigate = useNavigate()

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/forgot_password_verify_otp/', { email, otp });
      toast.success(res.data.message)
      navigate('/forgot-password/',{state: { email: email},})
    } catch (error) {
      console.log(error);
      
      toast.error(error.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Verify OTP</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
    <form onSubmit={handleVerifyOtp}>
      <input
        type="text"
        className="w-[300px] px-3 py-2 border border-gray-800"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        required
      />
      <br/>
      <button type="submit" className="bg-black text-white px-8 py-2 font-light mt-4">Verify OTP</button>
    </form>
    </div>
  );
}
