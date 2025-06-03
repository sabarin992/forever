import { useContext, useEffect, useState } from "react";
import api from "../../api";
import { useLocation, useNavigate } from "react-router-dom";
import SearchComponent from "../components/SearchComponent";
import { SearchContext } from "../../context/SearchContextProvider";
import Pagination from "../../components/Pagination";

export default function AdminUsers() {
  const [filterValue, setFilterValue] = useState("blocked");
  const [block, setblock] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { search } = useContext(SearchContext);

  const [activePage, setActivePage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await api.get(`/users/${search && `?search=${search}`}`,{params:{page:activePage}});
        console.log(res.data);
        setUsers(res.data.results);
        setHasNext(res.data.has_next)
        setHasPrevious(res.data.has_previous)
        setTotalPages(res.data.total_pages)
      } catch (error) {
        console.log(error.message);
      }
    };

    getUsers();
  }, [search,activePage]);




  const toggleBlockStatus = async (userId) => {
    try {
      const res = await api.get(`/block_unblock_user/${userId}/`);
      setUsers(res.data);
    } catch (error) {}
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-normal text-center mb-8">Users</h1>

      {/* Filter Section */}
      <div className="flex mb-6 max-w-md">
        <div className="bg-[#f0f5f5] rounded-l-lg flex items-center justify-center px-4 py-3 border border-r-0 border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
            />
          </svg>
        </div>
        <div className="bg-[#f0f5f5] px-4 py-3 border border-gray-200 flex items-center">
          <span className="text-gray-700">Filter By</span>
        </div>
        <div className="bg-[#f0f5f5] rounded-r-lg flex-1 px-4 py-3 border border-l-0 border-gray-200 flex items-center justify-between">
          <span>{filterValue}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>
      <SearchComponent />

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="py-3 px-4 text-left">S.No</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Mobile</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
              >
                <td className="py-3 px-4 border-b border-gray-200">
                  {index + 1}
                </td>
                <td className="py-3 px-4 border-b border-gray-200">
                  {user.first_name}
                </td>
                <td className="py-3 px-4 border-b border-gray-200">
                  {user.email}
                </td>
                <td className="py-3 px-4 border-b border-gray-200">
                  {user.phone_number}
                </td>
                <td className="py-3 px-4 border-b border-gray-200">
                  {/* {user.is_active?'Active':'Blocked'} */}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.is_active
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {user.is_active ? "Active" : "Block"}
                  </span>
                </td>
                <td className="py-3 px-4 border-b border-gray-200 flex gap-2">
                  <button
                    onClick={() => {
                      navigate("/admin/edit-user/", {
                        state: {
                          id: user.id,
                          first_name: user.first_name,
                          last_name: user.last_name,
                          email: user.email,
                          phone_number: user.phone_number,
                        },
                      });
                    }}
                    className="flex items-center px-3 py-1.5 text-white bg-black hover:bg-gray-800 rounded-lg text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      if (user.is_active) {
                        window.confirm(
                          `Are you sure you want to block this user?`
                        );
                      } else {
                        window.confirm(
                          `Are you sure you want to unblock this user?`
                        );
                      }
                      toggleBlockStatus(user.id);
                    }}
                    className={`flex items-center px-3 py-1.5 text-white ${
                      user.is_active
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } rounded-lg text-sm`}
                  >
                    {user.is_active ? "🚫 Block" : " ✅ Unblock"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination activePage={activePage} setActivePage = {setActivePage} hasNext={hasNext} hasPrevious = {hasPrevious} totalPages = {totalPages}/>
    </div>
  );
}
