import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Icônes pour afficher/masquer le mot de passe
import logo from "../assets/LOGOUAM.png"; // Logo UAM

const Register = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Vérifier que l'utilisateur est admin
  if (!user || user.role !== "admin") {
    return <p className="text-red-500 text-center">Accès refusé. Seuls les administrateurs peuvent ajouter des utilisateurs.</p>;
  }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
    department: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      setSuccess("Utilisateur créé avec succès !");
      setFormData({ email: "", password: "", role: "student", department: "" });

      // Redirection après 2 secondes
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 w-full">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-md lg:max-w-xl min-h-[500px] lg:min-h-[600px] flex flex-col items-center">
        {/* Logo */}
        <img src={logo} alt="Logo UAM" className="w-24 h-32 md:w-32 md:h-40 mb-6" />

        {/* Titre principal */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#993921]">
          Plateforme d'évaluation des enseignements
        </h1>

        {/* Texte "Créer un compte" */}
        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">Créer un utilisateur</p>
        
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 md:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Entrez l'email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-1 md:mt-2 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#993921] focus:border-[#993921] bg-white text-black"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">
              Mot de passe
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Entrez le mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full mt-1 md:mt-2 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#993921] focus:border-[#993921] bg-white text-black pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-1 pr-3 flex items-center text-sm leading-5 mt-7 bg-transparent border-none p-0"
            >
              {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
            </button>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 text-left">
              Rôle
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full mt-1 md:mt-2 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#993921] focus:border-[#993921] bg-white text-black"
            >
              <option value="student">Étudiant</option>
              <option value="teacher">Enseignant</option>
              <option value="quality_manager">Responsable qualité</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 text-left">
              Département
            </label>
            <input
              type="text"
              name="department"
              placeholder="Département"
              value={formData.department}
              onChange={handleChange}
              className="w-full mt-1 md:mt-2 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#993921] focus:border-[#993921] bg-white text-black"
            />
          </div>

          {/* Conteneur pour le bouton */}
          <div className="flex justify-end mt-6 md:mt-8">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#993921] text-white py-2 md:py-3 px-6 md:px-8 rounded-lg hover:bg-[#7a2c19] focus:outline-none focus:ring-2 focus:ring-[#993921] focus:ring-offset-2 text-sm"
            >
              {loading ? "Création..." : "Créer l'utilisateur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

