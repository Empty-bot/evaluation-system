import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importez les icônes
import logo from "../assets/LOGOUAM.png"; // Importez le logo

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le mot de passe

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      let data;
      try {
        data = await response.json(); // Essayer de parser la réponse comme JSON
      } catch (err) {
        // Si ce n'est pas du JSON, récupérer le texte brut
        const text = await response.text();
        throw new Error(text || "Une erreur inconnue s'est produite.");
      }
  
      if (!response.ok) {
        // Utilisez le message d'erreur spécifique retourné par le backend
        throw new Error(data.error || "Une erreur s'est produite.");
      }
  
      // Stocker le token JWT et rediriger si nécessaire
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Connexion réussie !");
    } catch (err) {
      // Affichez le message d'erreur spécifique
      setError(err.message);
    } finally {
      setLoading(false);
    }
  
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 w-full">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-md lg:max-w-xl min-h-[500px] lg:min-h-[600px] flex flex-col items-center">
        {/* Logo */}
        <img
          src={logo}
          alt="Logo UAM"
          className="w-24 h-32 md:w-32 md:h-40 mb-6" /* Logo responsive */
        />

        {/* Titre principal */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#993921]">
          Plateforme d'évaluation des enseignements
        </h1>

        {/* Texte "Connexion" */}
        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8"> {/* Texte responsive */}
          Connexion
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 md:space-y-6"> {/* Espacement responsive */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 text-left"
            >
              Email
            </label>
            <input
              placeholder="Entrez votre email"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 md:mt-2 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#993921] focus:border-[#993921] bg-white text-black" /* Champ de texte responsive */
            />
          </div>
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 text-left"
            >
              Mot de passe
            </label>
            <input
              placeholder="Entrez votre mot de passe"
              type={showPassword ? "text" : "password"} /* Basculer entre text et password */
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 md:mt-2 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#993921] focus:border-[#993921] bg-white text-black pr-10" /* Champ de texte responsive */
            />
            {/* Icône pour afficher/masquer le mot de passe */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-1 pr-3 flex items-center text-sm leading-5 mt-7 bg-transparent border-none p-0" // Key changes here
            >
              {showPassword ? (
                <FaEyeSlash className="text-gray-500" />
              ) : (
                <FaEye className="text-gray-500" />
              )}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Conteneur pour le bouton et le lien */}
          <div className="flex items-center justify-between mt-6 md:mt-8"> {/* Espacement responsive */}
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-[#993921]"
            >
              Mot de passe oublié ?
            </a>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#993921] text-white py-2 md:py-3 px-6 md:px-8 rounded-lg hover:bg-[#7a2c19] focus:outline-none focus:ring-2 focus:ring-[#993921] focus:ring-offset-2 text-sm" /* Bouton responsive */
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;