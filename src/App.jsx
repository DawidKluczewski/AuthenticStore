import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import Navbar from "./components/Navbar";
import Baner from "./components/Baner";

function App() {
  return (
    <div className="h-[2400px]">
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <Navbar />
      </nav>
      <Baner />
    </div>
  );
}

export default App;
