"use client";

import { use, useContext, useEffect, useState } from "react";
import { ChevronDown, Filter, PlusCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {adminApi} from "@/api";
import { useNavigate } from "react-router-dom";
import Pagination from "@/components/Pagination";
import { SearchContext } from "@/context/SearchContextProvider";
import SearchComponent from "../components/SearchComponent";

export default function AdminProducts() {
  const [date, setDate] = useState("14 Feb 2019");
  const [category, setCategory] = useState("All");
  const [products, setProduct] = useState([]);
  const navigate = useNavigate();

  const { search } = useContext(SearchContext);

  const [activePage, setActivePage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const getProducts = async () => {
      const res = await adminApi.get(
        `/get_all_products/${search && `?search=${search}`}`,
        { params: { page: activePage } }
      );
      setProduct(res.data.results);
      setHasNext(res.data.has_next);
      setHasPrevious(res.data.has_previous);
      setTotalPages(res.data.total_pages);
    };

    getProducts();
  }, [activePage, search]);

  // Function to handle the toggle switch for listing/unlisting products
  const handleToggle = async (id) => {
    try {
      const res = await adminApi.put(`/list_unlist_product/${id}/`);
      if (res.status === 200) {
        const updatedProducts = products.map((product) =>
          product.id === id
            ? { ...product, listed: res.data.isListed }
            : product
        );
        setProduct(updatedProducts);
      } else {
        console.error("Error updating product status:", res.statusText);
      }
    } catch (error) {}
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-end mb-8">
          {/* <div className="flex">
            <div className="flex items-center justify-center bg-gray-50 p-4 border border-gray-200">
              <Filter className="h-5 w-5" />
            </div>
            <div className="p-4 border-t border-b border-r border-gray-200">
              Filter By
            </div>
            <div className="flex items-center justify-between p-4 border-t border-b border-r border-gray-200 min-w-[180px]">
              <span>{date}</span>
              <ChevronDown className="h-5 w-5 ml-2" />
            </div>
            <div className="flex items-center justify-between p-4 border-t border-b border-r border-gray-200 min-w-[180px]">
              <span>Category</span>
              <ChevronDown className="h-5 w-5 ml-2" />
            </div>
          </div> */}
          <Button
            variant="default"
            onClick={() => {
              navigate("/admin/add-product");
            }}
            className="bg-black text-white rounded-md hover:bg-black/90"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            ADD NEW PRODUCT
          </Button>
        </div>
        <SearchComponent />   
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left border-b">Image</th>
                <th className="p-4 text-left border-b">Product Name</th>
                <th className="p-4 text-left border-b">Category</th>
                <th className="p-4 text-left border-b">Price</th>
                <th className="p-4 text-left border-b">Piece</th>
                <th className="p-4 text-left border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="p-4">
                    <img src={product.image} className="h-16 w-16" alt="" />
                  </td>
                  <td className="p-4 font-serif">{product.name}</td>
                  <td className="p-4">{product.category}</td>
                  <td className="p-4">{product.price.toFixed(2)}</td>
                  <td className="p-4">{product.stock_quantity}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="p-2 bg-gray-100 rounded-md">
                        <Edit
                          onClick={() => {
                            navigate("/admin/edit-product", {
                              state: { id: product.id },
                            });
                          }}
                          className="h-4 w-4"
                        />
                      </button>
                      <button
                        onClick={() => {
                          if (product.listed) {
                            window.confirm(
                              `Are you sure you want to unlist this product?`
                            );
                          } else {
                            window.confirm(
                              `Are you sure you want to list this product?`
                            );
                          }
                          handleToggle(product.id);
                        }}
                        className={`px-4 py-2 rounded-md ${
                          product.listed
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {product.listed ? "List" : "Unlist"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        activePage={activePage}
        setActivePage={setActivePage}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        totalPages={totalPages}
      />
    </>
  );
}
