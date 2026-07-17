import { Link } from "react-router";
import logo from "../../assets/logo_no_txt.png";

const Logo = ({ path = "/", className = "" }) => {
  return (
    <Link
      to={path}
      className={`transition-opacity hover:opacity-70 ${className} flex items-center`}
      aria-label="Home"
    >
      <img
        src={logo}
        alt="RedPulse Logo"
        className="w-8 h-8 md:w-10 md:h-10 object-contain"
      />
      <span className="ml-2 font-bold text-xl">RedPulse</span>
    </Link>
  );
};

export default Logo;
