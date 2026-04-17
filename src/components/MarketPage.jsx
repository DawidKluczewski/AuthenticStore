import { useEffect, useState } from "react";
import { db } from "../firebase.js";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const MarketPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const offersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOffers(offersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <p className="text-blue-950 font-bold animate-pulse">Ładowanie ogłoszeń...</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-[60vh] py-10 px-4">
      <h1 className="text-4xl font-black text-blue-950 uppercase tracking-tighter mb-2">
        Witaj na Marketplace!
      </h1>
      <p className="text-gray-500 font-medium mb-10 text-center">
        Przeglądaj najnowsze okazje od naszych użytkowników
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-7xl">
        {offers.map((offer) => (
          <div
            key={offer.id}
            onClick={() => navigate(`/product/${offer.id}`)}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="h-52 overflow-hidden bg-gray-50">
              <img
                src={offer.photoUrl}
                alt={offer.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-1 rounded-md uppercase tracking-wider">
                  {offer.category}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {offer.condition}
                </span>
              </div>
              
              <h3 className="text-blue-950 font-bold text-lg truncate mb-1">
                {offer.title}
              </h3>
              
              <p className="text-sky-600 font-black text-2xl">
                {offer.price} <span className="text-sm">PLN</span>
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-medium italic">
                  {offer.userEmail?.split('@')[0]}
                </span>
                <button className="text-blue-950 font-black text-[10px] uppercase group-hover:text-sky-600 transition-colors">
                  Szczegóły
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {offers.length === 0 && (
        <div className="flex flex-col items-center mt-20 opacity-30">
          <p className="text-xl font-bold text-blue-950">Jeszcze nie ma tu żadnych ogłoszeń...</p>
          <p className="text-sm">Bądź pierwszy i dodaj coś od siebie!</p>
        </div>
      )}
    </div>
  );
};

export default MarketPage;