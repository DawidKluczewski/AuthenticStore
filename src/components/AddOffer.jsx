import { useState } from 'react';
import { storage, db, auth } from "../firebase.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AddOffer = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        title: "",
        category: "", 
        condition: "",
        subCondition: "",
        price: "",
        description: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) return alert("Wpisz tytuł ogłoszenia!");
        if (!formData.category) return alert("Wybierz kategorię!");
        if (!formData.condition) return alert("Wybierz stan produktu!");
        if (formData.condition === "Używany" && !formData.subCondition) return alert("Wybierz szczegółowy stan używanego produktu!");
        if (!formData.price || formData.price <= 0) return alert("Wpisz poprawną cenę!");
        if (!formData.description.trim()) return alert("Dodaj opis produktu!");
        if (!file) return alert("Musisz dodać co najmniej jedno zdjęcie!");

        setUploading(true);
        try {
            const fileRef = ref(storage, `offers/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            const photoURL = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, "offers"), {
                ...formData,
                price: Number(formData.price),
                photoUrl: photoURL,
                userId: auth.currentUser?.uid,
                userEmail: auth.currentUser?.email,
                createdAt: new Date()
            });

            alert("Ogłoszenie dodane pomyślnie!");
            navigate("/");
        } catch (error) {
            console.error("Błąd:", error);
            alert("Błąd: " + error.message);
        }
        setUploading(false);
    };

    return (
        <div className='flex flex-col items-center w-full mt-4 pb-10 px-4 font-sans'>
            <form onSubmit={handleUpload} className="w-full max-w-2xl">
                <div className="flex flex-col bg-white px-6 py-6 rounded-2xl border border-gray-200 shadow-xl">
                    <h1 className="text-3xl font-black uppercase text-center mb-6 text-blue-950 tracking-tight">
                        Dodaj nowe ogłoszenie
                    </h1>

                    <div className="flex flex-col gap-1 mb-4">
                        <label className="font-bold text-gray-700 text-sm ml-1">Tytuł ogłoszenia *</label>
                        <input 
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            type="text" 
                            placeholder="np. Aparat Sony A7III" 
                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-950 outline-none transition-all shadow-sm" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-1">
                            <label className="font-bold text-gray-700 text-sm ml-1">Kategoria *</label>
                            <select 
                                name="category" 
                                value={formData.category} 
                                onChange={handleChange} 
                                className="border-2 border-gray-100 rounded-xl px-3 h-11 bg-white focus:border-blue-950 outline-none shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <option value="" disabled>-- Wybierz kategorię --</option>
                                <option value="Elektronika">Elektronika</option>
                                <option value="Ubrania">Ubrania</option>
                                <option value="Motoryzacja">Motoryzacja</option>
                                <option value="Zwierzęta">Zwierzęta</option>
                                <option value="Żywność">Żywność</option>
                                <option value="Sport">Sport</option>
                                <option value="Dom i Ogród">Dom i Ogród</option>
                                <option value="Inne">Inne</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-bold text-gray-700 text-sm ml-1">Stan produktu *</label>
                            <select 
                                name="condition" 
                                value={formData.condition} 
                                onChange={handleChange} 
                                className="border-2 border-gray-100 rounded-xl px-3 h-11 bg-white focus:border-blue-950 outline-none shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <option value="" disabled>-- Wybierz stan --</option>
                                <option value="Nowy">Nowy</option>
                                <option value="Używany">Używany</option>
                                <option value="Uszkodzony">Uszkodzony</option>
                            </select>
                        </div>
                    </div>

                    {formData.condition === "Używany" && (
                        <div className="flex flex-col gap-1 mb-4 animate-fadeIn">
                            <label className="text-gray-700 italic text-sm font-bold ml-1">Precyzyjny stan używanego przedmiotu:</label>
                            <select 
                                name="subCondition" 
                                value={formData.subCondition} 
                                onChange={handleChange} 
                                className="border-2 border-blue-100 rounded-xl px-3 h-11 bg-white focus:border-blue-600 outline-none shadow-sm cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                <option value="" disabled>-- Wybierz stopień zużycia --</option>
                                <option>Jak nowy</option>
                                <option>Bardzo dobry</option>
                                <option>Dobry</option>
                                <option>Przeciętny</option>
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-1 mb-4">
                        <label className="font-bold text-gray-700 text-sm ml-1">Cena (PLN) *</label>
                        <input 
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            type="number" 
                            placeholder="Wpisz kwotę" 
                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-950 outline-none shadow-sm" 
                        />
                    </div>

                    <div className="flex flex-col gap-1 mb-4">
                        <label className="font-bold text-gray-700 text-sm ml-1">Opis produktu *</label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Napisz coś więcej o tym przedmiocie..." 
                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 min-h-[100px] focus:border-blue-950 outline-none shadow-sm" 
                        />
                    </div>

                    <div className="flex flex-col items-center p-4 gap-2 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 mb-6 hover:bg-gray-100 hover:border-blue-300 transition-all cursor-pointer group">
                        <p className="text-sm font-bold text-gray-500 group-hover:text-blue-950">Dodaj zdjęcie produktu *</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-950 file:text-white cursor-pointer transition-all shadow-md"
                        />
                        {file && <p className="text-xs text-green-600 font-bold mt-1">Wybrano: {file.name}</p>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={uploading} 
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                            uploading 
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-blue-950 text-white hover:bg-blue-900 hover:shadow-blue-200 hover:-translate-y-1"
                        }`}
                    >
                        {uploading ? "Wysyłanie..." : "Opublikuj ogłoszenie"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddOffer;