import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/LOGOUAM.png";

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [validating, setValidating] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();
  
  // Vérifier la validité du token lors du chargement du composant
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/auth/reset-password/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Token invalide');
        }
        
        setTokenValid(true);
      } catch (err) {
        setError('Le lien de réinitialisation est invalide ou a expiré.');
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
  // Vérifier si les mots de passe correspondent en temps réel
  useEffect(() => {
    // Vérification uniquement si les deux champs ont un contenu
    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      // Si l'un des champs est vide, on considère que les mots de passe ne correspondent pas
      setPasswordsMatch(false);
    }
  }, [password, confirmPassword]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérification supplémentaire au moment de la soumission
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch(`http://localhost:3001/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }
      
      setMessage(data.message);
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };
  
  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 w-full">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo UAM" className="w-16 h-20" />
          </div>
          <p className="text-lg text-gray-600">Vérification du lien de réinitialisation...</p>
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#993921]"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!tokenValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 w-full">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-md lg:max-w-xl flex flex-col items-center">
          <img
            src={logo}
            alt="Logo UAM"
            className="w-24 h-32 md:w-32 md:h-40 mb-6"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#993921]">
            Réinitialisation impossible
          </h1>
          
          <Alert className="w-full" severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Erreur</AlertTitle>
            {error}
          </Alert>
          
          <p className="text-lg text-gray-600 mb-6">Veuillez demander un nouveau lien de réinitialisation.</p>
          
          <button
            onClick={() => navigate('/forgot-password')}
            className="bg-[#993921] text-white py-2 md:py-3 px-6 md:px-8 rounded-lg hover:bg-[#7a2c19] focus:outline-none focus:ring-2 focus:ring-[#993921] focus:ring-offset-2 text-sm"
          >
            Retour à Mot de passe oublié
          </button>
        </div>
      </div>
    );
  }
  
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

        {/* Texte "Réinitialiser votre mot de passe" */}
        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
          Réinitialiser votre mot de passe
        </p>

        {/* Messages d'alerte */}
        {message && (
          <Alert className="w-full" severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Succès</AlertTitle>
            {message}
          </Alert>
        )}
        
        {error && (
          <Alert className="w-full" severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Erreur</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 md:space-y-6">
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 text-left"
            >
              Nouveau mot de passe
            </label>
            <input
              placeholder="Entrez votre nouveau mot de passe"
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="8"
              className="w-full mt-1 md:mt-2 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#993921] focus:border-[#993921] bg-white text-black pr-10"
            />
            {/* Icône pour afficher/masquer le mot de passe */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-1 pr-3 flex items-center text-sm leading-5 mt-8 bg-transparent border-none p-0"
            >
              {showPassword ? (
                <FaEyeSlash className="text-gray-500" />
              ) : (
                <FaEye className="text-gray-500" />
              )}
            </button>
          </div>
          
          <div className="relative">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 text-left"
            >
              Confirmer le mot de passe
            </label>
            <input
              placeholder="Confirmez votre mot de passe"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="8"
              className={`w-full min-h-[50px] mt-1 md:mt-2 px-3 md:px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-black pr-10 ${
                confirmPassword 
                  ? (passwordsMatch 
                      ? "border-green-500 focus:ring-green-500 focus:border-green-500" 
                      : "border-red-500 focus:ring-red-500 focus:border-red-500")
                  : "border-gray-300 focus:ring-[#993921] focus:border-[#993921]"
              }`}
            />
            {/* Icône pour afficher/masquer le mot de passe */}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-1 pr-3 flex items-center text-sm leading-5 mt-3 bg-transparent border-none p-0"
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="text-gray-500" />
              ) : (
                <FaEye className="text-gray-500" />
              )}
            </button>
    
            {/* Message de validation */}
            {/* Conteneur du message d'erreur avec hauteur fixe */}
            <div className="h-5">
                <p className={`text-xs transition-opacity duration-200 ${confirmPassword && !passwordsMatch ? "text-red-500 opacity-100" : "opacity-0"}`}>
                    Les mots de passe ne correspondent pas
                </p>
                <p className={`text-xs transition-opacity duration-200 ${confirmPassword && passwordsMatch ? "text-green-500 opacity-100" : "opacity-0"}`}>
                    Les mots de passe correspondent
                </p>
            </div>

          </div> 

          {/* Bouton de soumission */}
          <div className="flex items-center justify-between mt-6 md:mt-8">
            <a
              onClick={() => navigate('/login')}
              href="#"
              className="text-sm text-gray-500 hover:text-[#993921]"
            >
              Retour à la connexion
            </a>
            <button
              type="submit"
              disabled={loading || !passwordsMatch || !password || !confirmPassword}
              className={`py-2 md:py-3 px-6 md:px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm ${
                passwordsMatch && password && confirmPassword
                  ? "bg-[#993921] text-white hover:bg-[#7a2c19] focus:ring-[#993921]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? "Réinitialisation..." : "Réinitialiser"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;