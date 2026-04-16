

import { useState } from 'react';
import { storage } from "../firebase.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const AddOffer = () => {

    const [option, setOption] = useState("")
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("Wybierz najpierw plik!");

        setUploading(true);
        try {
            // 1. Tworzymy referencję (ścieżkę) w chmurze
            const fileRef = ref(storage, `test_uploads/${Date.now()}_${file.name}`);

            // 2. Wysyłamy plik
            const snapshot = await uploadBytes(fileRef, file);
            console.log("Plik wysłany!");

            // 3. Pobieramy link publiczny (opcjonalnie, żeby sprawdzić czy działa)
            const downloadURL = await getDownloadURL(snapshot.ref);
            setUrl(downloadURL);

            alert("Sukces! Zdjęcie jest już w chmurze.");
        } catch (error) {
            console.error("Błąd wysyłania:", error);
        }
        setUploading(false);
    };


    return (
        <div className='flex flex-col items-center w-full mt-4 '>

            <form>

                <div className="flex flex-col w-3xl bg-black/20 px-10 py-5 rounded-xl">
                    <h1 className="text-4xl mt-12 font-black uppercase text-center mb-5">Dodaj nowe ogłoszenie</h1>

                    <div className="flex flex-col gap-1 w-full px-4 py-3">
                        <p className="font-semibold text-lg">Tytuł</p>
                        <input type="text" placeholder="np. Aparat Sony A7III" className="w-full border rounded-md px-4 py-1 h-9" />
                    </div>

                    <div className="flex flex-col gap-1 w-full px-4 py-3">
                        <p className="font-semibold text-lg">Kategoria</p>
                        <select className="w-full border rounded-md px-4 py-1 h-9">
                            <option>Elektronika</option>
                            <option>Ubrania</option>
                            <option>Motoryzacja</option>
                            <option>Zwierzęta</option>
                            <option>Żywność</option>
                            <option>Sport</option>
                            <option>Dom i Ogród</option>
                            <option>Inne</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1 w-full px-4 py-3">
                        <p className="font-semibold text-lg">Stan</p>
                        <select className="w-full border rounded-md px-4 py-1 h-9" value={option} onChange={(e) => setOption(e.target.value)}>
                            <option>Nowy</option>
                            <option>Używany</option>
                            <option>Uszkodzony</option>
                        </select>

                        {option === "Używany" ? (
                            <div className="flex flex-col mt-3">
                                <p className="text-black/70 italic font-medium">Wybierz stan: </p>
                                <select className="w-full border rounded-md px-4 py-1 h-9">
                                    <option>Jak nowy</option>
                                    <option>Bardzo dobry</option>
                                    <option>Dobry</option>
                                    <option>Przeciętny</option>
                                </select></div>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-1 w-full px-4 py-3">
                        <p className="font-semibold text-lg">Cena</p>
                        <input type="number" placeholder="np. 1500 zł" className="w-full border rounded-md px-4 py-1 h-9" />
                    </div>

                    <div className="flex flex-col gap-1 w-full px-4 py-3">
                        <p className="font-semibold text-lg">Opis</p>
                        <textarea placeholder="Opis produktu" className="w-full border rounded-md px-4 py-1 min-h-40 " />
                    </div>


                    <div className="flex flex-col items-center p-10 gap-4">
                        <p>Prześlij zdjęcie produktu</p>
                        {url && (
                            <div className="mt-4">
                                <img src={url} alt="Uploaded" className="w-64 rounded-lg shadow-md" />
                            </div>
                        )}
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                        />

                    </div>
                    <div className="flex flex-col gap-1 w-full px-4 py-3">

                        <button type="submit" onClick={handleUpload} disabled={uploading} className="bg-navy-900 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-all disabled:opacity-50"
                        >
                            {uploading ? "Wysyłam..." : "Wyślij ogłoszenie"}

                        </button>
                    </div>
                </div>
            </form >



        </div >
    )
}

export default AddOffer