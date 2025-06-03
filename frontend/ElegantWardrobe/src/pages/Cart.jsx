import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CartTotal from '../components/CartTotal'
import { useNavigate } from 'react-router-dom'
import api from '@/api'
import { toast } from 'react-toastify'
import Pagination from '@/components/Pagination'

const Cart = () => {
  const {
    currency,cartData,totalAmount,
    quantity,setQuantity,setCartId,
    removeCartItem,activePage,setActivePage,hasNext,hasPrevious,totalPages
  } = useContext(ShopContext)
  const navigate = useNavigate()


  // const removeCartItem = async(id)=>{
  //     try {
  //       const res =  await api.delete(`/remove_cartitem/${id}/`)
  //       setIsRomoveCartItem(!isRomoveCartItem)
  //       toast.success(res.data)
  //     } catch (error) {
  //       console.log(error.message);
        
  //     }
  // }
  console.log(quantity);
  

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'}/>
      </div>

      <div>
        {
          cartData.map((productData,index)=>{
            // const productData = products.find((product)=>product._id === item._id)
            // console.log(productData)

            return (
              <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                <div className='flex items-start gap-6'>
                   <img className='w-16 sm:w-20' src={productData.image} alt="" />
                   <div>
                    <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                    <div className="flex items-center gap-5 mt-2">
                      <p>{currency} {productData.price}</p>
                      <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{productData.size}</p>
                    </div>
                   </div>
                </div>
                <input onChange={(e)=>{
                  setCartId(productData.id);
                  setQuantity(e.target.value);
                  
                }
                  } className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 ' type="number" min={1} max={5} defaultValue={productData.quantity} />
                <img onClick={()=>{removeCartItem(productData.id)}} className='w-4 mr-4 sm:w-5 cursor-pointer' src={assets.bin_icon} alt="" />
              </div>
            )
          })
        }
      </div>
      <div className='flex justify-end my-20'>
        <div className="w-full sm:w-[450px]">
          <CartTotal totalAmount={totalAmount}/> 
          <div className="w-full text-end">
            <button onClick={()=>{navigate('/place-order')}} className='bg-black text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
          </div>
        </div>
        
      </div>
      <Pagination activePage={activePage} setActivePage = {setActivePage} hasNext={hasNext} hasPrevious = {hasPrevious} totalPages = {totalPages}/>
    </div>
  )
}

export default Cart