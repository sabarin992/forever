import React, { use, useState } from 'react'
import { useLocation } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-toastify';

const CategoryEdit = () => {
    const location = useLocation();
    const{id,name,description} = location.state;
    console.log(id,name,description);
    const [categoryData,setCategoryData]=useState({
        name:name,
        description:description
    })

    const handleUpdate = async() => {
        // Handle the update logic here
        try {
            const res = await api.put(`/edit-category/${id}`, categoryData);
            console.log(res.data);
            if (res.status === 200) {
                toast.success("Category updated successfully");
            } else {
                toast.error("Error updating category");
            }
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("Error updating category");
        }
        

    }
    
  return (
    <div className="bg-[#f0f7f5] rounded-lg p-6">
    <div className="flex justify-center items-center mb-6">
      <h2 className="text-2xl font-bold">Edit Category</h2>
    </div>
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label htmlFor="name" className="text-lg font-medium w-32">
          Name:
        </label>
        <input
          id="name"
          value={categoryData.name}
            onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
          className="flex-1 bg-white border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div className="flex gap-4">
        <label htmlFor="description" className="text-lg font-medium w-32">
          Description:
        </label>
        <textarea
          id="description"
          value={categoryData.description}
          onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
          className="flex-1 min-h-[120px] bg-white border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div className="flex justify-center mt-8">
        <button
        onClick={handleUpdate}
          className="bg-black text-white hover:bg-black/90 px-12 py-2 rounded-md transition-colors"
        >
          Update Category
        </button>
      </div>
    </div>
  </div>
  )
}

export default CategoryEdit