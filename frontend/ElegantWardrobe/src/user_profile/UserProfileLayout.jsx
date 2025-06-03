import React from "react";
import { Outlet } from "react-router-dom";
import UserProfileSiderbar from "./UserProfileSiderbar";
import UserProfileNavbar from "./UserProfileNavbar";

const UserProfileLayout = () => {
  return (
    <div>
      <UserProfileNavbar />
      <hr />
      <div className="flex">
        <div className="w-[20%]">
          <UserProfileSiderbar />
        </div>
        <div className="w-[80%] px-16 pt-10 pb-20">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserProfileLayout;
