import {
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlineSupport,
  HiOutlineUser,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { sellerSidebarStyles as s } from "../assets/dummyStyles";
import { useAuth } from "../context/useAuth";
import Logo from "./common/Logo";
import { NavLink } from "react-router-dom";
const SellerSidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: "Dashboard", icon: HiOutlineViewGrid, path: "/dashboard" },
    {
      name: "My Listings",
      icon: HiOutlineClipboardList,
      path: "/my-properties",
    },
    { name: "Leads", icon: HiOutlineChartBar, path: "/inquiries" },
    { name: "Messages", icon: HiOutlineViewGrid, path: "/chat-messages" },
    { name: "Profile", icon: HiOutlineUser, path: "/profile" },
    { name: "Support", icon: HiOutlineSupport, path: "/contact" },
  ];

  return (
    <>
      {/* BACKDROP ONLY */}
      {isOpen && <div className={s.backdrop} onClick={onClose} />}

      {/* SIDEBAR */}
      <aside
        className={`${s.sidebar} ${isOpen ? s.sidebarOpen : s.sidebarClosed}`}
      >
        {/* Logo */}
        <div className={s.logoContainer}>
          <Logo fontSize="1.25rem" iconSize={20} />
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 mb-5">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <HiOutlineUser size={20} />
          </div>

          <div>
            <p className="font-semibold text-sm text-gray-800">
              {user?.name || "Seller"}
            </p>
            <p className="text-xs text-gray-500">{user?.email || "No Email"}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className={s.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `${s.navLink} ${isActive ? s.navLinkActive : s.navLinkInactive}`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className={s.logoContainer}>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className={s.logoutButton}
          >
            <HiOutlineLogout size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SellerSidebar;
