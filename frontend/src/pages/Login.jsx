import React, { useState, useContext } from "react"; 
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import logo from "../assets/LOGOUAM.png"; 
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { AuthContext } from "../context/AuthContext"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); 

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
        data = await response.json();
      } catch (err) {
        const text = await response.text();
        throw new Error(text || "Une erreur inconnue s'est produite.");
      }
  
      if (!response.ok) {
        throw new Error(data.error || "Une erreur s'est produite.");
      }
  
      // Stocker le token JWT et mettre à jour le contexte
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Mettre à jour le contexte d'authentification
      setUser(data.user);
      
      // Rediriger en fonction du rôle
      switch (data.user.role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "teacher":
          navigate("/teacher-dashboard");
          break;
        case "student":
          navigate("/student-dashboard");
          break;
        case "quality_manager":
          navigate("/quality-dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
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
          className="w-24 h-32 md:w-32 md:h-40 mb-6"
        />

        {/* Titre principal */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#993921]">
          Plateforme d'évaluation des enseignements
        </h1>

        {/* Texte "Connexion" */}
        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
          Connexion
        </p>
        {error && (
          <Alert className="w-full" severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Erreur</AlertTitle>
            {error}
          </Alert>
        )}
        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 md:space-y-6">
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
              className="w-full mt-1 md:mt-2 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#993921] focus:border-[#993921] bg-white text-black"
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
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 md:mt-2 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#993921] focus:border-[#993921] bg-white text-black pr-10"
            />
            {/* Icône pour afficher/masquer le mot de passe */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-1 pr-3 flex items-center text-sm leading-5 mt-7 bg-transparent border-none p-0"
            >
              {showPassword ? (
                <FaEyeSlash className="text-gray-500" />
              ) : (
                <FaEye className="text-gray-500" />
              )}
            </button>
          </div>

          {/* Conteneur pour le bouton et le lien */}
          <div className="flex items-center justify-between mt-6 md:mt-8">
            <a
              onClick={() => navigate('/forgot-password')}
              href="#"
              className="text-sm text-gray-500 hover:text-[#993921]"
            >
              Mot de passe oublié ?
            </a>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#993921] text-white py-2 md:py-3 px-6 md:px-8 rounded-lg hover:bg-[#7a2c19] focus:outline-none focus:ring-2 focus:ring-[#993921] focus:ring-offset-2 text-sm"
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