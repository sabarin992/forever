import React, { useContext, useEffect, useState } from 'react'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import api from '@/api'
import Pagination from '@/components/Pagination'
import { useNavigate } from 'react-router-dom'

const Orders= () => {
  const {products,currency} = useContext(ShopContext)
  const [orders,setOrders] = useState([])
  const navigate = useNavigate()

  const [activePage, setActivePage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(()=>{
   const getOrders = async()=>{
    try {
      const res = await api.get('get_all_orders',{params:{page:activePage}});
      setOrders(res.data.results)
      setHasNext(res.data.has_next)
      setHasPrevious(res.data.has_previous)
      setTotalPages(res.data.total_pages)
      
    } catch (error) {
      console.log(error.message);
      
    }
   }
   getOrders()
  },[activePage])

  return (
    <div className='border-t pt-16'>
      <div className="text-2xl">
        <Title text1={'MY'} text2={'ORDERS'}/>
      </div>
      <div>
        {
            orders.map((item,index)=>{
              return ( 
              <div key={index}  className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4 '>
                <div className='flex items-start gap-6 text-sm'>
                  {/* <img className='w-16 sm:w-20' src={item.image[0]} alt="" /> */}
                  <div>
                    <p className='sm:text-base font-medium'>Order Number : {item.order_no}</p>
                    <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                      {/* <p className='text-lg'>{currency}{item.price}</p>
                      <p>Quantity : 1</p>
                      <p>Size : M</p> */}
                      
                    </div>
                    <p>Payment Status : {item.payment_status}</p>
                    <p className='mt-2'>Order Date: <span className='text-gray-400'>{item.order_date}</span></p>
                  </div>
                </div>
                <div className='md:w-1/2 flex justify-between'>
                  <div className='flex items-center gap-2'>
                      <p className='min-w-2 h-2 rounded-full bg-green-500 '></p>
                      <p className='text-sm md:text-base'>{item.status}</p>
                  </div>
                  <button onClick={()=>{navigate('/order-details',{state:{orderId:item.id}})}} className='border px-4 py-2 text-sm font-medium rounded-sm'>Details</button>
                </div>
              </div>
              )
            })
        }
      </div>
      <Pagination activePage={activePage} setActivePage = {setActivePage} hasNext={hasNext} hasPrevious = {hasPrevious} totalPages = {totalPages}/>
    </div>
  )
}

export default Orders