import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import logo from "../assets/LOGOUAM.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch(`http://localhost:3001/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }
      
      setMessage(data.message);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
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

        {/* Texte "Mot de passe oublié" */}
        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
          Mot de passe oublié
        </p>

        {/* Messages d'alerte */}
        {message && (
          <Alert className="w-full" severity="success" sx={{ mb: 3 }}>
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

          {/* Conteneur pour le bouton et le lien */}
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
              disabled={loading}
              className="bg-[#993921] text-white py-2 md:py-3 px-6 md:px-8 rounded-lg hover:bg-[#7a2c19] focus:outline-none focus:ring-2 focus:ring-[#993921] focus:ring-offset-2 text-sm"
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;