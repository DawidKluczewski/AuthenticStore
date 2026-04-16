import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase.js";
import { signOut } from "firebase/auth";

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleProtectedAction = (target) => {
    if (user) {
      navigate(target);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="py-1 px-8 gap-2 flex items-center w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="flex w-1/3 justify-center">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-20 cursor-pointer" />
        </Link>
      </div>

      <div className="flex gap-6 font-bold w-1/3 justify-center text-md text-blue-950">
        <button onClick={() => handleProtectedAction("/")} className="cursor-pointer hover:text-sky-600">
          Kupuj
        </button>
        <Link to="/about" className="hover:text-sky-600">O Nas</Link>
        <Link to="/faq" className="hover:text-sky-600">FAQ</Link>
      </div>

      <div className="flex gap-6 w-1/3 justify-center items-center text-md">
        <button 
          onClick={() => handleProtectedAction("/add-post")} 
          className="mr-12 bg-blue-950 border-b-4 border-r-3 border-sky-600 rounded-lg px-4 py-2 text-white font-bold cursor-pointer hover:bg-blue-700 transition duration-200"
        >
          Dodaj Ogłoszenie
        </button>

        {user ? (
          <button 
            onClick={() => signOut(auth)}
            className="flex w-12 h-12 cursor-pointer text-white items-center justify-center bg-blue-950 rounded-full font-bold uppercase hover:bg-gray-800 transition duration-200 border-none outline-none"
          >
            {user.email.charAt(0)}
          </button>
        ) : (
          <Link to="/login" className="font-black text-blue-950 hover:text-sky-600">
            Zaloguj
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;