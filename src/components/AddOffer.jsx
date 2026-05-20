import { useState, useRef } from 'react'; 
import { storage, db, auth } from "../firebase.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha"; 

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
    const recaptchaRef = useRef(); 
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [captchaToken, setCaptchaToken] = useState(null); 
    
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

        if (!formData.title.trim()) return alert("Wpisz tytuł!");
        if (!formData.category) return alert("Wybierz kategorię!");
        if (!formData.condition) return alert("Wybierz stan produktu!");
        if (formData.condition === "Używany" && !formData.subCondition) return alert("Wybierz szczegółowy stan produktu!");
        if (!formData.price || formData.price <= 0) return alert("Wpisz cenę!");
        if (!file) return alert("Dodaj zdjęcie!");

        if (!captchaToken) {
            return alert("Proszę potwierdzić, że nie jesteś robotem!");
        }

        setUploading(true);
        
        try {
            setLoadingText("Analizowanie zdjęcia...");
            const isImageValid = await validateImageCategory(file, formData.category);
            
            if (!isImageValid) {
                alert(`Zdjęcie nie pasuje do kategorii "${formData.category}".`);
                setUploading(false);
                setLoadingText("");
                recaptchaRef.current.reset();
                setCaptchaToken(null);
                return;
            }

            setLoadingText("Wysyłanie ogłoszenia...");

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

            setLoadingText("Autoryzacja z Google Cloud...");
            try {
                const CLIENT_EMAIL = "firebase-adminsdk-fbsvc@authentic-store-493314.iam.gserviceaccount.com";
                const PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCtBe2EJ8CyoP+T\ngGmSI2hHLyO6DTgXlpcQ0lkS/ch90YbEFP/z86MxuncWk5a57c1JA5DIBfxxa/Q0\nsmhOr/lwzQj16eb2VELI1yVJjLWPrmKxnlH3zTtQXwPE4nwTDzQ8smuDO7Xh/vFy\nCy8jSn6HGxLeCAkzjHp3N6Ioxie0m8duFEAMGwEn4rCxKriZKf77P1Giy9HHJqxV\nIP20iObYrNrmhHg/H8Cwin//57jRsHM+YlEFp+9nnwM+tN+DHusV8nWmogGcBrCV\nfWGOY8MOlQCj5wj1mvLL+3f/XvQa5yIVzEoNQ9qQ/lM9fa4/CfTNwNU219fR5QU9\nD3uCCqJJAgMBAAECggEASPIM1wCjfyvdVGR5HcGLvycimtfj5B37Bn6ISzdvhYwG\nkzh/SGxZSyff+Uaz7yNQvw2fxpSvf2oSBP2KeFI8idAHjRXV59hSZ7Y85CtMiIzu\n0w96Y0zFSvcj8afCw45PaZ+XMDbGUcdYJ8qLTwejHHbPl4gvyOna39Q2q5YPO1cY\nHQLnlsrcUaGk4XSAmcSSeKssgg8SpOix/c5+eFLuQxbDhJ7jUswrg7mSPNZO4hdP\nq+1qfZGw9l1Ar0viagP+C6ne2uoy7pNNVqWcF2QhekvO6iQE7CzYsTQgdeMPjhHB\nwjYXz0Kqbseda+Nif9zraoNRw/V+96g+rsw2Zv08uQKBgQDeUivCAl2op6mv1GVF\nPSKsC7w/xL5Q25rjHvKsbj12G1GWU4mAvygd+lV7MCxc6U9upoRP/KnqhvhXK0J2\nFjWYxJMIlOLOdIKo0JyEYyUqtp3zNG82H4ip71Fn8gWrz/uyTaCLHC+i+HYKhefx\n7KNQsPuIa235ovygGmzFf4MMYwKBgQDHO/AojyyX0LhJAqKOmNELsUoiCH3d1SYQ\nMpmbY6vUv8GIU+FD8QIx9EGG/CnETippF3VunalUUVCku5aRUpzdIjaUcIVixVHs\nqMb4SdYhUVZ0ikEvgX//BGLjzQ1UqR3z3kK9++75Oh5cgyxGRT/mecTVidc1Umay\nRLk7qOtIYwKBgDBakuXZeeFqxf9WJMiQaXAeBU2hTvtrKB7p5kIWoAuGGZKmjKuR\n5/nNLrZiXeO/YuVgFjsHazV1MaJT6FqirfmSF6CwMTxSHvD0nnY00iqeGXCCIQYW\nibTcNkpzW0RpMgcv1xEqijnZ7GKRiUcW/tZYB/090GeRSXzRAoNaHnidAoGBAJEN\nQGInKw40tZbiRjuPYtMidpikmg7Bun6ceF07icTQ/zQj7aOrei+oZ3TBbh8v0YzF\nuYeZXci3kwD8WjjfbrlIyXf1HAe3JVgp4QKvryh+sXUTmzXdELU4Gk9D4Oq8XcRJ\nE0qCe5AUEjrEfZ2DmWxRR084leiKX552jm2zI+mFAoGAFIKWFQTUnlCZr4EUUgJT\n6q2POCZVgurHfFYxMpMmHVy/ph9AtWhZ5ADZjF/0wJ0GSu4kS6kq3jQNp6jjD/a0\nj8dWJOH1XAmybor8Gno/ozMf5bgzbirH9fd32Wqn9bBTEKo7FJ0v1SHl5M5prLXY\nOt0dHy3MoSY/bF9pGtU+MeA=\n-----END PRIVATE KEY-----";

                const PROJECT_ID = "authentic-store-493314"; 
                const LOCATION = "europe-central2"; 

                const iat = Math.floor(Date.now() / 1000);
                const exp = iat + 3600;

                const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }))
                    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
                const claimSet = btoa(JSON.stringify({
                    iss: CLIENT_EMAIL,
                    scope: "https://www.googleapis.com/auth/cloud-platform",
                    aud: "https://oauth2.googleapis.com/token",
                    exp: exp,
                    iat: iat
                })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

                const pemHeader = "-----BEGIN PRIVATE KEY-----";
                const pemFooter = "-----END PRIVATE KEY-----";
                const pemContents = PRIVATE_KEY.substring(PRIVATE_KEY.indexOf(pemHeader) + pemHeader.length, PRIVATE_KEY.indexOf(pemFooter)).replace(/\s/g, "");
                const binaryDerString = window.atob(pemContents);
                const binaryDer = new Uint8Array(binaryDerString.length);
                for (let i = 0; i < binaryDerString.length; i++) {
                    binaryDer[i] = binaryDerString.charCodeAt(i);
                }

                const cryptoKey = await window.crypto.subtle.importKey(
                    "pkcs8",
                    binaryDer.buffer,
                    { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
                    false,
                    ["sign"]
                );

                const signatureBuffer = await window.crypto.subtle.sign(
                    "RSASSA-PKCS1-v1_5",
                    cryptoKey,
                    new TextEncoder().encode(`${header}.${claimSet}`)
                );
                
                const signature = btoa(String.fromCharCode.apply(null, new Uint8Array(signatureBuffer)))
                    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

                const jwt = `${header}.${claimSet}.${signature}`;

                const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
                });
                
                const tokenData = await tokenResponse.json();
                const accessToken = tokenData.access_token;

                setLoadingText("Uruchamianie integracji GCP...");
                const gcpUrl = `https://integrations.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/integrations/-:execute`;

                const response = await fetch(gcpUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        triggerId: "api_trigger/marketplace-integration_API_1", 
                        inputParameters: {
                            "offer_title": { "stringValue": formData.title },
                            "offer_price": { "doubleValue": Number(formData.price) },
                            "user_email": { "stringValue": auth.currentUser?.email || "anonymous" },
                            "offer_description": { "stringValue": formData.description || "" },
                            "offer_subcategory": { "stringValue": formData.category || "" },
                            "offer_subcondition": { "stringValue": formData.subCondition || "" }
                        }
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.error("GCP Response Error Log:", errText);
                } else {
                    console.log("POŁĄCZENIE DZIAŁA");
                }

            } catch (gcpError) {
                console.error("Błąd podczas strzału do Application Integration:", gcpError);
            }

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

                    <div className="flex flex-col gap-1 mb-4">
                        <label className="font-bold text-gray-700 text-sm ml-1">Tytuł ogłoszenia *</label>
                        <input name="title" value={formData.title} onChange={handleChange} type="text" className="w-full border-2 border-gray-100 rounded-xl px-4 py-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-1">
                            <label className="font-bold text-gray-700 text-sm ml-1">Kategoria *</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="border-2 border-gray-100 rounded-xl px-3 h-11 bg-white cursor-pointer">
                                <option value="" disabled>-- Wybierz --</option>
                                {Object.keys(categoryKeywords).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                <option value="Inne">Inne</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-bold text-gray-700 text-sm ml-1">Stan produktu *</label>
                            <select name="condition" value={formData.condition} onChange={handleChange} className="border-2 border-gray-100 rounded-xl px-3 h-11 bg-white cursor-pointer">
                                <option value="" disabled>-- Wybierz --</option>
                                <option value="Nowy">Nowy</option>
                                <option value="Używany">Używany</option>
                            </select>
                        </div>
                    </div>

                    {formData.condition === "Używany" && (
                        <div className="flex flex-col gap-1 mb-4">
                            <label className="font-bold text-gray-700 text-sm ml-1">Szczegółowy stan produktu *</label>
                            <select name="subCondition" value={formData.subCondition} onChange={handleChange} className="border-2 border-gray-100 rounded-xl px-3 h-11 bg-white cursor-pointer">
                                <option value="" disabled>-- Wybierz --</option>
                                <option value="Idealny">Idealny</option>
                                <option value="Bardzo dobry">Bardzo dobry</option>
                                <option value="Dobry">Dobry</option>
                                <option value="Dopuszczający">Dopuszczający</option>
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-1 mb-4">
                        <label className="font-bold text-gray-700 text-sm ml-1">Opis produktu</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 h-24 resize-none" />
                    </div>

                    <div className="flex flex-col gap-1 mb-4">
                        <label className="font-bold text-gray-700 text-sm ml-1">Cena (PLN) *</label>
                        <input name="price" value={formData.price} onChange={handleChange} type="number" className="w-full border-2 border-gray-100 rounded-xl px-4 py-2" />
                    </div>

                    <div className="flex flex-col gap-1 mb-6">
                        <label className="font-bold text-gray-700 text-sm ml-1">Dodaj zdjęcie produktu *</label>
                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-xs file:bg-blue-950 file:text-white file:rounded-full file:border-0 file:px-4 file:py-2 cursor-pointer" />
                    </div>

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
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all cursor-pointer ${
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