import api from '@/api'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash } from "lucide-react";
import { toast } from 'react-toastify';

const CategoryOfferPage = () => {

   const [offers,setOffers] = useState([])
   const [categories,setCategories] = useState([])
   const [isChangeOffer,setIsChangeOffer] = useState(false) 
   const navigate = useNavigate()

   useEffect(()=>{
    const getOffers = async()=>{
        try {
            const res = await api.get('/category_offers/')
            setOffers(res?.data?.category_offers)
            setCategories(res?.data?.categories)
            
        } catch (error) {
            console.log(error.message)
        }
    }
    getOffers()
   },[isChangeOffer])

   const removeCategoryOffer = async(id)=>{
      try {
        const res = await api.delete(`/category_offers/${id}/`)
        if(res.status === 204){
          toast.success('Product offer deleted successfully!')
          setIsChangeOffer(!isChangeOffer)
        }
        
        setIsChangeOffer(!isChangeOffer)
      } catch (error) {
        console.log(error.message);
        
      }

   }


  return (
    <>
        <div className='flex justify-end'>
        <button onClick={()=>{navigate('/admin/offer/add-category-offer',{state:categories})}} className='bg-black text-white py-2 hover:bg-black/90 w-52 mb-5'>Add Category Offer</button>
    </div>

    {/* <button onClick={()=>{console.log(products)}}>show products</button> */}

    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-4 text-left border-b">Sl. No</th>
            <th className="p-4 text-left border-b">Category Name</th>
            <th className="p-4 text-left border-b">Discount (%)</th>
            <th className="p-4 text-left border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer, index) => (
            <tr key={offer.id} className="border-b">
              <td className="p-4">{index + 1}</td>
              <td className="p-4 font-serif">{offer.category_name}</td>
              <td className="p-4">{offer.discount_percentage}%</td>
              <td className="p-4">
                <div className="flex space-x-2">
                  <button
                    className="p-2 bg-gray-100 rounded-md"
                    onClick={() =>
                      navigate("/admin/offer/edit-category-offer/", {
                        state: {offer,categories},
                      })
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 bg-red-100 text-red-700 rounded-md"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this offer?")) {
                        // Call delete function here
                        console.log("Deleting offer with ID:", offer.id);
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" onClick={()=>{removeCategoryOffer(offer.id)}} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  )
}

export default CategoryOfferPage