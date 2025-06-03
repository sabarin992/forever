import api from '@/api';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ForgotPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const { email} = location.state || {};
  const navigate = useNavigate()

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.success("Passwords do not match");
      return;
    }

    try {
      const res = await api.post('/reset_forgot_password/', {
        email,
        new_password: newPassword,
      });
      toast.success(res.data.message);
      navigate('/login/')

    } catch (error) {
      toast.error(error.response?.data?.error || "Reset failed");
    }
  };

  return (
    <div>
         
        <form onSubmit={handleResetPassword}>
      <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
<div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Reset Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
        <input
        type="password"
        className='w-[300px] px-3 py-2 border border-gray-800'
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New Password"
        required
      />
      <input
        type="password"
        className='w-[300px] px-3 py-2 border border-gray-800'
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        required
      />
      <button type="submit" className="bg-black text-white px-8 py-2 font-light mt-4">Reset Password</button>
      </div>
      {message && <p>{message}</p>}
    </form>
    </div>
  );
}
