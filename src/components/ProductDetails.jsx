import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, "offers", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct(docSnap.data());
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div className="text-center mt-20">Ładowanie szczegółów...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-10 bg-white p-6 rounded-3xl shadow-lg">
        <div className="w-full md:w-1/2">
          <img
            src={product.photoUrl}
            alt={product.title}
            className="w-full rounded-2xl shadow-md object-contain max-h-[500px]"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-4xl font-black text-blue-950 uppercase leading-none">
            {product.title}
          </h1>
          <p className="text-3xl font-black text-sky-600 mt-4">
            {product.price} PLN
          </p>
          
          <div className="mt-6 space-y-2 border-y py-4 border-gray-100">
            <p className="text-gray-700"><strong>Kategoria:</strong> {product.category}</p>
            <p className="text-gray-700"><strong>Stan:</strong> {product.condition} {product.subCondition && `(${product.subCondition})`}</p>
            <p className="text-gray-700 text-sm italic">Dodano przez: {product.userEmail}</p>
          </div>

          <div className="mt-6">
            <h2 className="font-bold text-lg text-blue-950 mb-2">Opis produktu:</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          <button className="mt-auto w-full bg-blue-950 text-white py-4 rounded-xl font-bold hover:bg-sky-700 transition-all uppercase tracking-widest cursor-pointer active:scale-95 shadow-lg">
            Kontakt ze sprzedającym
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;