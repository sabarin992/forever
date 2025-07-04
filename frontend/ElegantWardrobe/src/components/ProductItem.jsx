
import { useContext, useEffect, useState } from "react"
import { ShopContext } from "../context/ShopContext"
import { Link } from "react-router-dom"
import api from "@/api"
import { toast } from "react-toastify"

const ProductItem = ({ id, image, name, finalPrice, realPrice, discountedPercentage }) => {
  const { currency, isChangeWishList, setIsChangeWishList } = useContext(ShopContext)
  const [isInWishlist, setIsInWishList] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  console.log(id);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    if (!id) {
      return
    }
    const fetchWishlistStatus = async () => {
      try {
        const res = await api.get(`/is_product_in_wishlist/${id}/`);
        if (res.status === 200) {
          setIsInWishList(res.data.in_wishlist);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist status", error);
      }
    };

    fetchWishlistStatus();
  }, [id]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isInWishlist) {
        const res = await api.delete(`/remove_from_wishlist/${id}/`);
        if (res.status === 200) {
          setIsInWishList(false);
          setIsChangeWishList(!isChangeWishList)
        }
      } else {
        const res = await api.post('/add_to_wishlist/', { product_variant_id: id });
        
        if (res.status === 201) {
          setIsInWishList(true);
          setIsChangeWishList(!isChangeWishList)
        }
      }
    } catch (error) {
      setIsInWishList(false);
      toast.error(error?.response?.data?.error)
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-1 overflow-hidden border border-gray-100">
      <Link 
        onClick={scrollToTop} 
        className="block cursor-pointer" 
        to={`/product/${id}`}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl">
          {/* Loading Skeleton */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
          )}
          
          <img
            className={`object-cover w-full h-full transition-all duration-700 ease-out group-hover:scale-110 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            src={image || "/placeholder.svg"}
            alt={name}
            onLoad={handleImageLoad}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Discount Badge */}
          {discountedPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg transform rotate-[-3deg] group-hover:rotate-0 transition-transform duration-300">
              -{discountedPercentage}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="font-medium text-gray-900 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
            {name}
          </h3>
          
          {/* Price Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                {currency} {finalPrice}
              </span>
              {realPrice && realPrice !== finalPrice && (
                <span className="text-sm text-gray-400 line-through font-medium">
                  {currency} {realPrice}
                </span>
              )}
            </div>
            
            {discountedPercentage > 0 && (
              <div className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-md border border-green-200">
                Save {discountedPercentage}%
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <div className="relative">
          {isInWishlist ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="#ef4444"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hover:stroke-red-500 transition-colors duration-200"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          )}
        </div>
      </button>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-gray-200 group-hover:ring-gray-300 transition-all duration-300 pointer-events-none" />
    </div>
  )
}

export default ProductItem


// "use client"

// import { useContext, useEffect, useState } from "react"
// import { ShopContext } from "../context/ShopContext"
// import { Link } from "react-router-dom"
// import api from "@/api"
// import { toast } from "react-toastify"

// const ProductItem = ({ id, image, name, finalPrice, realPrice,discountedPercentage}) => {
//   const { currency,isChangeWishList,setIsChangeWishList } = useContext(ShopContext)
//   const [isInWishlist,setIsInWishList] = useState(false)

//   console.log(id);
  
//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     })
//   }
  


//   useEffect(() => {
//     if(!id){
//       return
//     }
//     const fetchWishlistStatus = async () => {
//       try {
//         const res = await api.get(`/is_product_in_wishlist/${id}/`);
//         if (res.status === 200) {
//           setIsInWishList(res.data.in_wishlist);
//         }
//       } catch (error) {
//         console.error("Failed to fetch wishlist status", error);
//       }
//     };

//     fetchWishlistStatus();
//   },[id]);

//   const handleWishlistToggle = async (e) => {
//     e.preventDefault(); // Prevent navigation when clicking the heart icon
//     e.stopPropagation(); // prevent parent from receiving the click


//     try {
//       if (isInWishlist) {
//         const res = await api.delete(`/remove_from_wishlist/${id}/`);
//         if (res.status === 200) {
//           setIsInWishList(false);
//           setIsChangeWishList(!isChangeWishList)

//         }
//       } else {
//         const res = await api.post('/add_to_wishlist/', { product_variant_id: id });
        
//         if (res.status === 201) {
//           setIsInWishList(true);
//           setIsChangeWishList(!isChangeWishList)

//         }
        
//       }
//     } catch (error) {
//       setIsInWishList(false);
//       toast.error(error?.response?.data?.error)
//       // console.error("Wishlist toggle error:", error);
//     }
//   };

//   return (
//     <Link onClick={scrollToTop} className="text-gray-700 cursor-pointer relative group" to={`/product/${id}`}>
//       <div className="overflow-hidden w-full aspect-square bg-gray-100 rounded-lg">
//         <img
//           className="object-cover w-full h-full hover:scale-110 transition-transform duration-300 ease-in-out"
//           src={image || "/placeholder.svg"}
//           alt={name}
//         />
//       </div>
//       <button
//         onClick={handleWishlistToggle}
//         className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
//         aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
//       >
//         {isInWishlist ? (
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="20"
//             height="20"
//             viewBox="0 0 24 24"
//             fill="#FF4B4B"
//             stroke="#FF4B4B"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
//           </svg>
//         ) : (
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="20"
//             height="20"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
//           </svg>
//         )}
//       </button>
//       <p className="pt-3 pb-1 text-sm">{name}</p>
//       <div className="flex gap-2">
//         <p className="text-sm font-medium">
//         {currency} {finalPrice}
//       </p>
//       <p className="text-sm font-medium font-small text-gray-400 line-through">
//         {currency} {realPrice}
//       </p>
//       <p className="text-sm font-medium font-small text-green-600 ">
//         {discountedPercentage}% off
//       </p>
//       </div>
//     </Link>
//   )
// }

// export default ProductItem