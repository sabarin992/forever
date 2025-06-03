import api from '@/api';
import React, { useState } from 'react'
import { toast } from 'react-toastify';

const AddAddress = () => {
    const [addressData, setAddressData] = useState({
        name: "",
        phone_no: "",
        street_address: "",
        city: "",
        state: "",
        pin_code: "",
        country: "",
      });
      
      const handleAddressChange = (e) => {
        setAddressData({ ...addressData, [e.target.name]: e.target.value });
      };
      
      const handleAddAddress = async(e) => {
        e.preventDefault();
        try {
          const response = await api.post("/add_address/", addressData);
          console.log(addressData);
          
          toast.success("Address added successfully!");

        } catch (error) {
          console.log(error);
          toast.error("Failed to add address.");
        }
        
      };
      
  return (
    <>
    <form
  onSubmit={handleAddAddress}
  className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
>
  {/* Header */}
  <div className="inline-flex items-center gap-2 mb-2 mt-10">
    <p className="prata-regular text-3xl">Add Address</p>
    <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
  </div>

  {/* Name */}
  <input
    className="w-full px-3 py-2 border border-gray-800"
    type="text"
    name="name"
    placeholder="Name"
    value={addressData.name}
    onChange={handleAddressChange}
    required
  />

  {/* Phone Number */}
  <input
    className="w-full px-3 py-2 border border-gray-800"
    type="text"
    name="phone_no"
    placeholder="Phone Number"
    value={addressData.phone_no}
    onChange={handleAddressChange}
    required
  />

  {/* Street Address */}
  <input
    className="w-full px-3 py-2 border border-gray-800"
    type="text"
    name="street_address"
    placeholder="Street Address"
    value={addressData.street_address}
    onChange={handleAddressChange}
    required
  />

  {/* City */}
  <input
    className="w-full px-3 py-2 border border-gray-800"
    type="text"
    name="city"
    placeholder="City"
    value={addressData.city}
    onChange={handleAddressChange}
    required
  />

  {/* State */}
  <input
    className="w-full px-3 py-2 border border-gray-800"
    type="text"
    name="state"
    placeholder="State"
    value={addressData.state}
    onChange={handleAddressChange}
    required
  />

  {/* Pin Code */}
  <input
    className="w-full px-3 py-2 border border-gray-800"
    type="text"
    name="pin_code"
    placeholder="Pin Code"
    value={addressData.pin_code}
    onChange={handleAddressChange}
    required
  />

  {/* Country */}
  <input
    className="w-full px-3 py-2 border border-gray-800"
    type="text"
    name="country"
    placeholder="Country"
    value={addressData.country}
    onChange={handleAddressChange}
    required
  />

  {/* Submit Button */}
  <button className="bg-black text-white px-8 py-2 font-light mt-4">
    Add Address
  </button>
</form>

    </>
  )
}

export default AddAddress