"use client";

import { use, useContext, useEffect, useState } from "react";
import api from "../../api";
import {useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SearchComponent from "../components/SearchComponent";
import { SearchContext } from "../../context/SearchContextProvider";
import Pagination from "../../components/Pagination";

export default function CategoryManagement() {
const [render, setRender] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    isListed: true,
  });
  const navigate = useNavigate();
  const { search } = useContext(SearchContext);

  const [activePage, setActivePage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  


// Function to handle the toggle switch for listing/unlisting categories
  const handleToggle = async (id) => {
    const res = await api.put(`/list_unlist_category/${id}`);
    console.log(res.data);
    if (res.status === 200) {
      const updatedCategories = categories.map((category) =>
        category.id === id
          ? { ...category, isListed: res.data.isListed }
          : category
      );
      setCategories(updatedCategories);
    } else {
      console.error("Error updating category status:", res.statusText);
    }

  };

//   Function to handle changes in the new category form
  const handleNewCategoryChange = (field, value) => {
    setNewCategory({
      ...newCategory,
      [field]: value,
    });

    console.log(newCategory);
  };

//   Function to handle saving the new category
  const handleSave = () => {
    const saveCategory = async () => {
      try {
        const res = await api.post("/add_category/", newCategory);
        console.log(res.data);
        if (res.status === 200) {
          setNewCategory({ name: "", description: "", isListed: true });
          toast.success("Category added successfully");
            setRender(true);
        } 
      } catch (error) {
        
        toast.error(error?.response?.data?.error);
        setRender(false);
      }
    };
    saveCategory();

  };

//   Function to fetch categories from the API
  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await api.get(`/categories/${search && `?search=${search}`}`,{params:{page:activePage}});
        console.log(res.data);
        setCategories(res.data.results);
        setHasNext(res.data.has_next)
        setHasPrevious(res.data.has_previous)
        setTotalPages(res.data.total_pages)
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    getCategories();
  }, [render,search,activePage]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
        
      {/* Category List */}
      <div className="rounded-lg p-4">
      <SearchComponent />
        <div className="bg-black text-white p-4 rounded-md grid grid-cols-4 font-medium">
          <div>S.No</div>
          <div>Category Name</div>
          <div className="text-center">List / Unlist</div>
          <div className="text-center">Edit</div>
        </div>

        <div className="divide-y">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="grid grid-cols-4 items-center py-4 pl-6"
            >
              <div>{index + 1}</div>
              <div className="font-medium">{category.name}</div>
              <div className="flex justify-center items-center">
                {/* Custom toggle switch */}
                <div
                  className="relative inline-block w-12 h-6 cursor-pointer"
                  onClick={() => handleToggle(category.id)}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={category.isListed}
                    readOnly
                  />
                  <div
                    className={`block w-12 h-6 rounded-full transition ${
                      category.isListed ? "bg-black" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                      category.isListed ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                {/* Edit button */}
                <button 
                onClick={() => {navigate('/admin/category-edit', { state: { id: category.id, name: category.name, description: category.description } })}}
                className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-gray-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Pagination activePage={activePage} setActivePage = {setActivePage} hasNext={hasNext} hasPrevious = {hasPrevious} totalPages = {totalPages}/>
      {/* Add New Category */}
      <div className="rounded-lg p-6">
        <div className="flex justify-center items-center mb-6">
          <h2 className="text-2xl font-bold">Add New Category</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label htmlFor="name" className="text-lg font-medium w-32">
              Name:
            </label>
            <input
              id="name"
              value={newCategory.name}
              onChange={(e) => handleNewCategoryChange("name", e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div className="flex gap-4">
            <label htmlFor="description" className="text-lg font-medium w-32">
              Description:
            </label>
            <textarea
              id="description"
              value={newCategory.description}
              onChange={(e) =>
                handleNewCategoryChange("description", e.target.value)
              }
              className="flex-1 min-h-[120px] bg-white border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleSave}
              className="bg-black text-white hover:bg-black/90 px-12 py-2 rounded-md transition-colors"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
