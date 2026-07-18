import {
  FaUser,
  FaMapMarkerAlt,
  FaHeart,
  FaEnvelope,
} from "react-icons/fa";

const navItems = [
  { id: "info", label: "Personal Info", icon: FaUser },
  { id: "address", label: "Address", icon: FaMapMarkerAlt },
  { id: "stats", label: "Donation Stats", icon: FaHeart },
  { id: "messages", label: "Messages", icon: FaEnvelope },
];

const ProfileSidebar = ({ activeTab, setActiveTab, unreadCount }) => {
  return (
    <nav className="bg-base-100 rounded-box shadow-xl p-2">
      <ul className="menu w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full text-left ${
                  isActive ? "active font-semibold" : ""
                }`}
              >
                <Icon className="text-lg" />
                <span className="flex-1">{item.label}</span>
                {item.id === "messages" && unreadCount > 0 && (
                  <span className="badge badge-primary badge-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ProfileSidebar;
