import { useState, useRef } from 'react'; // Dodano useRef
import { storage, db, auth } from "../firebase.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha"; // Import Captchy

const categoryKeywords = {
    "Elektronika": ["electronic", "computer", "phone", "gadget", "camera", "audio", "device", "laptop", "television", "screen", "keyboard"],
    "Ubrania": ["clothing", "apparel", "shoe", "footwear", "shirt", "pants", "dress", "jacket", "fashion", "jeans"],
    "Motoryzacja": ["vehicle", "car", "motorcycle", "auto", "tire", "wheel", "transport", "engine", "scooter"],
    "Zwierzęta": ["animal", "pet", "dog", "cat", "bird", "mammal", "wildlife", "fish", "reptile"],
    "Żywność": ["food", "dish", "fruit", "vegetable", "meal", "cuisine", "ingredient", "drink", "baking"],
    "Sport": ["sport", "fitness", "ball", "bicycle", "gym", "racket", "exercise", "snowboard", "ski"],
    "Dom i Ogród": ["furniture", "plant", "garden", "chair", "table", "bed", "home", "flower", "appliance", "wood"]
};

const AddOffer = () => {
    const navigate = useNavigate();
    const recaptchaRef = useRef(); // Ref do manualnego resetowania Captchy
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [captchaToken, setCaptchaToken] = useState(null); // Stan dla tokena Captcha
    
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

    // Funkcja wywoływana przy zmianie statusu Captchy
    const onCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const validateImageCategory = (imageFile, selectedCategory) => {
        if (selectedCategory === "Inne") return Promise.resolve(true);

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            
            reader.onloadend = async () => {
                try {
                    const base64data = reader.result.split(',')[1];
                    const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
                    
                    if (!apiKey) {
                        alert("Brak klucza API Google Vision!");
                        return resolve(false);
                    }

                    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            requests: [{
                                image: { content: base64data },
                                features: [{ type: 'LABEL_DETECTION', maxResults: 15 }]
                            }]
                        })
                    });

                    const data = await response.json();
                    const labels = data.responses[0].labelAnnotations?.map(l => l.description.toLowerCase()) || [];
                    const keywords = categoryKeywords[selectedCategory] || [];

                    const isMatch = labels.some(label => 
                        keywords.some(keyword => label.includes(keyword))
                    );

                    resolve(isMatch);
                } catch (error) {
                    console.error("Błąd Vision API:", error);
                    resolve(false); 
                }
            };
            reader.onerror = () => reject(new Error("Błąd odczytu pliku"));
        });
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        // 1. Walidacja formularza
        if (!formData.title.trim()) return alert("Wpisz tytuł!");
        if (!formData.category) return alert("Wybierz kategorię!");
        if (!formData.price || formData.price <= 0) return alert("Wpisz cenę!");
        if (!file) return alert("Dodaj zdjęcie!");

        // 2. Walidacja CAPTCHA
        if (!captchaToken) {
            return alert("Proszę potwierdzić, że nie jesteś robotem!");
        }

        setUploading(true);
        
        try {
            // Walidacja AI
            setLoadingText("Analizowanie zdjęcia...");
            const isImageValid = await validateImageCategory(file, formData.category);
            
            if (!isImageValid) {
                alert(`Zdjęcie nie pasuje do kategorii "${formData.category}".`);
                setUploading(false);
                setLoadingText("");
                // Resetujemy Captchę, by wymusić nową weryfikację przy kolejnej próbie
                recaptchaRef.current.reset();
                setCaptchaToken(null);
                return;
            }

            setLoadingText("Wysyłanie ogłoszenia...");

            // Firebase Storage
            const fileRef = ref(storage, `offers/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            const photoURL = await getDownloadURL(snapshot.ref);

            // Firestore
            await addDoc(collection(db, "offers"), {
                ...formData,
                price: Number(formData.price),
                photoUrl: photoURL,
                userId: auth.currentUser?.uid,
                userEmail: auth.currentUser?.email,
                createdAt: new Date()
            });

            alert("Sukces!");
            navigate("/");
        } catch (error) {
            console.error("Błąd:", error);
            alert("Błąd: " + error.message);
            recaptchaRef.current.reset();
            setCaptchaToken(null);
        }
        
        setUploading(false);
        setLoadingText("");
    };

    return (
        <div className='flex flex-col items-center w-full mt-4 pb-10 px-4 font-sans'>
            <form onSubmit={handleUpload} className="w-full max-w-2xl">
                <div className="flex flex-col bg-white px-6 py-6 rounded-2xl border border-gray-200 shadow-xl">
                    <h1 className="text-3xl font-black uppercase text-center mb-6 text-blue-950 tracking-tight">
                        Dodaj nowe ogłoszenie
                    </h1>

                    {/* --- POLA FORMULARZA (bez zmian) --- */}
                    <div className="flex flex-col gap-1 mb-4">
                        <label className="font-bold text-gray-700 text-sm ml-1">Tytuł ogłoszenia *</label>
                        <input name="title" value={formData.title} onChange={handleChange} type="text" className="w-full border-2 border-gray-100 rounded-xl px-4 py-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-1">
                            <label className="font-bold text-gray-700 text-sm ml-1">Kategoria *</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="border-2 border-gray-100 rounded-xl px-3 h-11 bg-white">
                                <option value="" disabled>-- Wybierz --</option>
                                {Object.keys(categoryKeywords).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                <option value="Inne">Inne</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-bold text-gray-700 text-sm ml-1">Stan produktu *</label>
                            <select name="condition" value={formData.condition} onChange={handleChange} className="border-2 border-gray-100 rounded-xl px-3 h-11 bg-white">
                                <option value="" disabled>-- Wybierz --</option>
                                <option value="Nowy">Nowy</option>
                                <option value="Używany">Używany</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-4">
                        <label className="font-bold text-gray-700 text-sm ml-1">Cena (PLN) *</label>
                        <input name="price" value={formData.price} onChange={handleChange} type="number" className="w-full border-2 border-gray-100 rounded-xl px-4 py-2" />
                    </div>

                    <div className="flex flex-col gap-1 mb-6">
                        <label className="font-bold text-gray-700 text-sm ml-1">Dodaj zdjęcie produktu *</label>
                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-xs file:bg-blue-950 file:text-white file:rounded-full file:border-0 file:px-4 file:py-2" />
                    </div>

                    {/* --- KOMPONENT RECAPTCHA --- */}
                    <div className="flex justify-center mb-6">
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                            onChange={onCaptchaChange}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={uploading} 
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all ${
                            uploading ? "bg-gray-400" : "bg-blue-950 text-white hover:bg-blue-900"
                        }`}
                    >
                        {uploading ? loadingText : "Opublikuj ogłoszenie"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddOffer;