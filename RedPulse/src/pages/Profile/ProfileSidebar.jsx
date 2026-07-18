import { NavLink } from "react-router";
import {
  FaUser,
  FaMapMarkerAlt,
  FaHeart,
  FaHandHoldingMedical,
} from "react-icons/fa";

const navItems = [
  { to: "/profile", label: "Personal Info", icon: FaUser, end: true },
  { to: "/profile/address", label: "Address", icon: FaMapMarkerAlt },
  { to: "/profile/stats", label: "Donation Stats", icon: FaHeart },
  { to: "/profile/requests", label: "Blood Requests", icon: FaHandHoldingMedical },
];

const ProfileSidebar = ({ unreadCount }) => {
  return (
    <nav className="bg-base-100 rounded-box shadow-xl p-2">
      <ul className="menu w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 w-full text-left ${isActive ? "active font-semibold" : ""}`
                }
              >
                <Icon className="text-lg" />
                <span className="flex-1">{item.label}</span>
                {item.to === "/profile/requests" && unreadCount > 0 && (
                  <span className="badge badge-primary badge-sm">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ProfileSidebar;
