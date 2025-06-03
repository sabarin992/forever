import React, { useState } from "react";

const Pagination = (props) => {
    const {activePage,setActivePage,hasNext,hasPrevious,totalPages} = props;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);   
  return (
    <>
      <div className="flex justify-center gap-4 mt-10">
        <a onClick={()=>{setActivePage((pre)=>pre-1)}} className={`py-[8px] px-[16px] cursor-pointer border border-gray-300 ${activePage === "prev"?'bg-black text-white':''} ${!hasPrevious?'pointer-events-none text-gray-400':''}`}>&laquo;</a>
        {
            pages.map((page,index)=>{
                return <a key={index} onClick={()=>{setActivePage(page)}} className={`py-[8px] px-[16px] cursor-pointer border border-gray-300 ${activePage === page?'bg-black text-white':''}`}>{page}</a>
            })
        }
        <a onClick={()=>{setActivePage((pre)=>pre+1)}} className={`py-[8px] px-[16px] cursor-pointer border border-gray-300 ${activePage === "next"?'bg-black text-white':''} ${!hasNext?'pointer-events-none text-gray-400':''}`}>&raquo;</a>
      </div>
    </>
  );
};

export default Pagination;
