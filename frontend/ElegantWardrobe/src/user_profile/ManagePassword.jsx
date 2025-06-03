import api from "@/api";
import React, { useState } from "react";
import { toast } from "react-toastify";

const ManagePassword = () => {

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
          ...prev,
          [name]: value
        }));
      };
      
      const handlePasswordReset = async(e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
          toast.error("New and confirm passwords do not match!");
          return;
        }
      
        try {
            const response = await api.put("/reset_password/",passwordData);
            toast.success("Password reset successfully!");
            
        } catch (error) {
            console.log(error);
            
        }
      };
      
  return (
    <>
      <form
        onSubmit={handlePasswordReset}
        className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
      >
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text-3xl">Reset Password</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>

        {/* Old Password */}
        <input
          className="w-full px-3 py-2 border border-gray-800"
          type="password"
          name="old_password"
          placeholder="Old Password"
          value={passwordData.old_password}
          onChange={handlePasswordChange}
          required
        />

        {/* New Password */}
        <input
          className="w-full px-3 py-2 border border-gray-800"
          type="password"
          name="new_password"
          placeholder="New Password"
          value={passwordData.new_password}
          onChange={handlePasswordChange}
          required
        />

        {/* Confirm Password */}
        <input
          className="w-full px-3 py-2 border border-gray-800"
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={passwordData.confirm_password}
          onChange={handlePasswordChange}
          required
        />

        {/* Submit Button */}
        <button className="bg-black text-white px-8 py-2 font-light mt-4">
          Reset Password
        </button>
      </form>
    </>
  );
};

export default ManagePassword;
