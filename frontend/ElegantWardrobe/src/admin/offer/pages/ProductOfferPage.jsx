import React, { useEffect, useState } from 'react'
import { Edit, Trash } from "lucide-react";
import api from '@/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProductOfferPage = () => {

   const [offers,setOffers] = useState([])
   const [products,setProducts] = useState([])
   const navigate = useNavigate()
   const [isChangeOffer,setIsChangeOffer] = useState(false) 

   useEffect(()=>{
    const getOffers = async()=>{
        try {
            const res = await api.get('/product_offers/')
            const product_res = await api.get('/products/')
            setOffers(res?.data)
            setProducts(product_res?.data[0]?.products)
            // console.log(product_res?.data[0]?.products)
        } catch (error) {
            console.log(error.message)
        }
    }
    getOffers()
   },[isChangeOffer])

   const removeProductOffer = async(id)=>{
      try {
        const res = await api.delete(`/product_offers/${id}/`)
        if(res.status === 204){
          toast.success('Product offer deleted successfully!')
        }
        
        setIsChangeOffer(!isChangeOffer)
      } catch (error) {
        console.log(error.message);
        
      }

   }


  return (
    <>
    <div className='flex justify-end'>
        <button onClick={()=>{navigate('/admin/offer/add-product-offer',{state:products})}} className='bg-black text-white py-2 hover:bg-black/90 w-52 mb-5'>Add Product offer</button>
    </div>

    {/* <button onClick={()=>{console.log(products)}}>show products</button> */}

    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-4 text-left border-b">Sl. No</th>
            <th className="p-4 text-left border-b">Product Name</th>
            <th className="p-4 text-left border-b">Discount (%)</th>
            <th className="p-4 text-left border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer, index) => (
            <tr key={offer.id} className="border-b">
              <td className="p-4">{index + 1}</td>
              <td className="p-4 font-serif">{offer.product_name}</td>
              <td className="p-4">{offer.discount_percentage}%</td>
              <td className="p-4">
                <div className="flex space-x-2">
                  <button
                    className="p-2 bg-gray-100 rounded-md"
                   onClick={()=>{navigate('/admin/offer/edit-product-offer',{state:{offer,products}})}
                    }
                  >
                    <Edit className="h-4 w-4"/>
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
                    <Trash onClick={()=>{removeProductOffer(offer.id)}} className="h-4 w-4" />
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

export default ProductOfferPage