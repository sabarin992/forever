import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets as admin_assets } from '../admin_assets/assets'
import { assets as user_assets } from '../../assets/assets'
import AdminLogout from './AdminLogout'

const AdminSidebar = () => {
  return ( 
    <div className=''>
        <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
            <NavLink to={'sales-report'} className='flex border items-center gap-3 border-gray-300 border-r-0 px-3 py-2 rounded-1'>
                <img className='w-5 h-5 ' src={admin_assets.order_icon} alt="" />
                <p className='hidden md:block'>DashBoard</p>
            </NavLink>
            <NavLink to={'products'} className='flex border items-center gap-3 border-gray-300 border-r-0 px-3 py-2 rounded-1'>
                <img className='w-5 h-5 ' src={admin_assets.order_icon} alt="" />
                <p className='hidden md:block'>Prodcts</p>
            </NavLink>
            <NavLink to={'users'} className='flex border items-center gap-3 border-gray-300 border-r-0 px-3 py-2 rounded-1'>
                <img className='w-5 h-5 ' src={user_assets.profile_icon} alt="" />
                <p className='hidden md:block'>Users</p>
            </NavLink>
            <NavLink to={'categories'} className='flex border items-center gap-3 border-gray-300 border-r-0 px-3 py-2 rounded-1'>
                <img className='w-5 h-5 ' src={user_assets.profile_icon} alt="" />
                <p className='hidden md:block'>Categories</p>
            </NavLink>
            <NavLink to={'coupon-management'} className='flex border items-center gap-3 border-gray-300 border-r-0 px-3 py-2 rounded-1'>
                <img className='w-5 h-5 ' src={user_assets.profile_icon} alt="" />
                <p className='hidden md:block'>Coupon</p>
            </NavLink>
            <NavLink to={'list'} className='flex border items-center gap-3 border-gray-300 border-r-0 px-3 py-2 rounded-1'>
                <img className='w-5 h-5 ' src={admin_assets.order_icon} alt="" />
                <p className='hidden md:block'>List Items</p>
            </NavLink>
            <NavLink to={'orders'} className='flex border items-center gap-3 border-gray-300 border-r-0 px-3 py-2 rounded-1'>
                <img className='w-5 h-5 ' src={admin_assets.order_icon} alt="" />
                <p className='hidden md:block'>Orders</p>
            </NavLink>
            <div className='flex border items-center gap-3 border-gray-300 border-r-0 px-3 py-2 rounded-1'>
                <AdminLogout/>
            </div>
        </div>
    </div>
  )
}

export default AdminSidebar