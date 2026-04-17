import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

import Navbar from "./components/Navbar";
import AuthPage from "./components/AuthPage";
import Baner from "./components/Baner";
import MarketPage from "./components/MarketPage";
import About from "./components/About";
import Faq from "./components/Faq";
import AddOffer from "./components/AddOffer.jsx";
import ProductDetails from "./components/ProductDetails";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar user={user} />
        <main className="grow">
          <Routes>
            <Route path="/" element={user ? <MarketPage /> : <Baner />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/add-post" element={user ? <AddOffer /> : <Navigate to="/login" />} />
            <Route path="/product/:id" element={<ProductDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;