import Pagination from "@/components/Pagination";
import React, { useContext, useEffect, useState } from "react";
import SearchComponent from "../components/SearchComponent";
import api from "@/api";
import { ShopContext } from "@/context/ShopContext";
import { SearchContext } from "@/context/SearchContextProvider";
import { useNavigate } from "react-router-dom";


function AdminOrders() {

  const [orders,setOrders] = useState([])
  const {currency} = useContext(ShopContext)
  const {search,setSearch} = useContext(SearchContext)

  const [activePage, setActivePage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate()
  // Sample data for the table
  // const orders = [
  //   {
  //     id: "ORD-2025-001",
  //     customer: "John Smith",
  //     date: "05/04/2025",
  //     totalAmount: 2500.00,
  //     status: "Completed",
  //     image: "/placeholder.svg?height=80&width=80"
  //   },
  //   {
  //     id: "ORD-2025-002",
  //     customer: "Sarah Johnson",
  //     date: "05/03/2025",
  //     totalAmount: 1800.00,
  //     status: "Processing",
  //     image: "/placeholder.svg?height=80&width=80"
  //   },
  //   {
  //     id: "ORD-2025-003",
  //     customer: "Michael Brown",
  //     date: "05/02/2025",
  //     totalAmount: 3500.00,
  //     status: "Shipped",
  //     image: "/placeholder.svg?height=80&width=80"
  //   },
  //   {
  //     id: "ORD-2025-004",
  //     customer: "Emily Davis",
  //     date: "05/01/2025",
  //     totalAmount: 950.00,
  //     status: "Completed",
  //     image: "/placeholder.svg?height=80&width=80"
  //   },
  //   {
  //     id: "ORD-2025-005",
  //     customer: "Robert Wilson",
  //     date: "04/30/2025",
  //     totalAmount: 1200.00,
  //     status: "Cancelled",
  //     image: "/placeholder.svg?height=80&width=80"
  //   }
  // ];

  useEffect(()=>{
    
    const getOrders = async()=>{
      try {
        const res = await api.get('get_all_orders',{params:{page:activePage,search:search}})       
        setOrders(res.data.results)
        setHasNext(res.data.has_next)
        setHasPrevious(res.data.has_previous)
        setTotalPages(res.data.total_pages)
      } catch (error) {
        console.log(error.message);
        
      }
      
    }
    getOrders()
  },[activePage,search])

  // Function to render status with appropriate color
  const renderStatus = (status) => {
    const statusColors = {
      "CONFIRMED": "bg-green-100 text-green-800",
      // "PENDING": "bg-blue-100 text-blue-800",
      "SHIPPED": "bg-purple-100 text-purple-800",
      "CANCELED": "bg-red-100 text-red-800",
      "Pending": "bg-yellow-100 text-yellow-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="w-full bg-white p-4 md:p-6">
      {/* Search Bar */}
      <div className="mb-6">
        {/* <div className="relative max-w-md ml-auto">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div> */}
        <SearchComponent />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left font-medium text-gray-800">Order ID</th>
              <th className="py-3 px-4 text-left font-medium text-gray-800">Customer</th>
              <th className="py-3 px-4 text-left font-medium text-gray-800">Date</th>
              <th className="py-3 px-4 text-left font-medium text-gray-800">Total Amount</th>
              <th className="py-3 px-4 text-left font-medium text-gray-800">Status</th>
              <th className="py-3 px-4 text-left font-medium text-gray-800">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {orders?.map((order, index) => (
              <tr 
                key={order?.id} 
                className={`border-t border-gray-200 hover:bg-gray-50 transition-colors`}
              >
                <td className="py-4 px-4">{order?.order_no}</td>
                <td className="py-4 px-4">{order?.customer.first_name}</td>
                <td className="py-4 px-4">{order?.order_date}</td>
                <td className="py-4 px-4">{currency}{order?.final_amount?.toFixed(2)}</td>
                <td className="py-4 px-4">{renderStatus(order?.status)}</td>
                <td className="py-4 px-4">
                  <div className="flex space-x-2">
                  <button onClick={()=>{navigate('/admin/order-details',{state:{orderId:order.id}})}} className='border px-4 py-2 text-sm font-medium rounded-sm'>Details</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination activePage={activePage} setActivePage = {setActivePage} hasNext={hasNext} hasPrevious = {hasPrevious} totalPages = {totalPages}/>
      </div>
    </div>
  );
}

export default AdminOrders;