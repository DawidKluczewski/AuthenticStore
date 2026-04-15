import logo from "../assets/logo.png";
import { useState } from "react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  return (
    <div className="py-1 px-8 gap-2 flex  items-center w-full">
      <div className="flex w-1/3 justify-center ">
        <img src={logo} alt="Logo" className="h-20 cursor-pointer" />
      </div>

      <div className="flex gap-6 font-bold w-1/3 justify-center text-md">
        <a href="">Kupuj</a>
        <a href="">O Nas</a>
        <a href="">FAQ</a>
      </div>

      <div className="flex gap-6  w-1/3 justify-center items-center text-md">
        <button className="mr-12 bg-blue-950 border-b-4 border-r-3  border-sky-600 rounded-lg px-4 py-2 text-white font-bold cursor-pointer hover:text-black hover:bg-blue-700 transition duration-200 hover:border-blue-900 ">
          Dodaj Ogłoszenie
        </button>

        {isLoggedIn ? (
          <div className="flex gap-6">
            <button className="flex w-12 h-12 cursor-pointer text-white items-center justify-center bg-black rounded-full">
              A
            </button>
          </div>
        ) : (
          <div className="flex gap-6 font-black">
            <button className="flex items-center justify-center cursor-pointer">Zaloguj</button>

          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
