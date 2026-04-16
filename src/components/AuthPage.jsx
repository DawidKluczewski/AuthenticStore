import { useState } from "react";
import { auth, db } from "../firebase.js"; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          email: email,
          createdAt: new Date(),
        });
        
        alert("Konto zostało założone! Teraz możesz się zalogować.");
        setIsRegistering(false);
      } else {

        await signInWithEmailAndPassword(auth, email, password);
        alert("Zalogowano pomyślnie!");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert("Błąd: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border-t-8 border-blue-950">
        <h2 className="text-3xl font-bold text-center text-blue-950 mb-8">
          {isRegistering ? "Stwórz konto" : "Zaloguj się"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-blue-950 ml-1">Email</label>
            <input
              type="email"
              placeholder="twoj@email.com"
              className="px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-sky-600 outline-none transition duration-200"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-blue-950 ml-1">Hasło</label>
            <input
              type="password"
              placeholder="********"
              className="px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-sky-600 outline-none transition duration-200"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-950 border-b-4 border-r-3 border-sky-600 rounded-lg px-4 py-3 text-white font-bold cursor-pointer hover:bg-blue-700 hover:text-white transition duration-200 active:scale-95 shadow-md"
          >
            {isRegistering ? "Zarejestruj się" : "Zaloguj się"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            {isRegistering ? "Masz już konto?" : "Nie masz konta?"}{" "}
            <span
              className="text-sky-600 font-bold cursor-pointer hover:underline ml-1"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? "Zaloguj się" : "Załóż je tutaj"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;