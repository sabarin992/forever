import React from "react";

const PriceRangeFilter = () => {
  return (
    <div className="min-w-60">
      <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-md transition-all duration-300 ease-in-out">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              Price
            </h3>
          </div>

          <form className="flex flex-col gap-3">
            <input
              type="number"
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-200 text-sm font-medium"
            >
              Go
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;



// import React from "react";

// const PriceRangeFilter = () => {
//   return (
//     <div className="min-w-60">
//       {/* Price Range Filter */}
//       <div
//         className='mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ease-in-out'>
//         <div className="p-5">
//           <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
//             <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
//             <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
//               Price
//             </h3>
//           </div>
//           <form action="">
//             <input type="number" placeholder="Min" /><br />
//             <input type="number" placeholder="Max" /><br />
//             <button>Go</button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PriceRangeFilter;
