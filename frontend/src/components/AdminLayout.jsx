import { useState } from "react";
import { adminLayoutStyles as s } from "../assets/dummyStyles";
import AdminSidebar from "./AdminSidebar";
import DashboardNavbar from "./DashboardNavbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  return (
    <div className={s.layout}>
      <AdminSidebar
        isOpen={isSideBarOpen}
        onClose={() => setIsSideBarOpen(false)}
      />
      <div className={s.mainWrapper}>
        <DashboardNavbar onMenuClick={() => setIsSideBarOpen(true)} />
        <main className={s.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
