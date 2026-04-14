import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "./App.css";

function App() {
  const testFirestore = async () => {
    try {
      const docRef = await addDoc(collection(db, "testy"), {
        wiadomosc: "Działa! Pozdro mordko!",
        data: new Date(),
      });
      console.log("Dokument zapisany z ID: ", docRef.id);
      alert("Dane wysłane do Firestore!");
    } catch (e) {
      console.error("Błąd zapisu: ", e);
    }
  };

  return (
    <div className="App">
      <h1>AuthenticStore test Firestore</h1>
      <button onClick={testFirestore}>Wyślij coś do bazy</button>
    </div>
  );
}

export default App;
