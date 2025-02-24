import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { CircleArrowLeft } from "lucide-react";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const EditUserForm = ({ userId, onCancel, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    surname: "",
    email: "",
    role: "",
    department: "",
    adminPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [originalName, setOriginalName] = useState({ first_name: "", surname: "" });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de l'utilisateur.");
        }

        const user = await response.json();
        setOriginalName({ first_name: user.first_name, surname: user.surname });
        setFormData({
          first_name: user.first_name,
          surname: user.surname,
          email: user.email,
          role: user.role,
          department: user.department || "",
          adminPassword: "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmPopup(true);
  };

  const confirmUpdate = async () => {
    setShowConfirmPopup(false);
    setLoading(true);
    setError("");
    setSuccess("");
  
    try {
      // Vérifier d'abord le mot de passe administrateur
      const isPasswordValid = await verifyAdminPassword();
      if (!isPasswordValid) {
        return; // Stopper l'exécution si le mot de passe est faux
      }
  
      const token = localStorage.getItem("token");
  
      const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          department: formData.department,
          first_name: formData.first_name,
          surname: formData.surname,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'utilisateur.");
      }
  
      setSuccess("Utilisateur mis à jour avec succès !");
      onUpdateUser(); // Rafraîchir la liste après la mise à jour
      onCancel();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const verifyAdminPassword = async () => {
    try {
      // Récupérer la chaîne JSON
      const userString = localStorage.getItem("user");
      const userObject = JSON.parse(userString);
      const adminId = userObject.id;
      const token = localStorage.getItem("token");
  
      const response = await fetch("http://localhost:3001/api/auth/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminId: adminId, password: formData.adminPassword }),
      });
  
      if (!response.ok) {
        throw new Error("Mot de passe administrateur incorrect.");
      }
  
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };
  

  return (
    <div>
    <div className="space-y-6 max-w-lg mx-auto">
    <div className="flex items-center gap-4">
        <button 
            type="button" 
            onClick={onCancel} 
            className="mb-4 p-2 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray rounded-lg"
        >
            <CircleArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl text-center font-semibold mb-4">Modifier les informations de {originalName.first_name} {originalName.surname}</h2>
    </div>
    {error && (<Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Erreur</AlertTitle>
              {error}
            </Alert>)}
    {success && (<Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>)}

    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
          <input type="text" placeholder="Modifiez le prénom" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input type="text" placeholder="Modifiez le nom" value={formData.surname} onChange={(e) => setFormData({ ...formData, surname: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" placeholder="Modifiez l'adresse mail" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          <option value="student">Étudiant</option>
          <option value="teacher">Enseignant</option>
          <option value="quality_manager">Responsable qualité</option>
          <option value="admin">Administrateur</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Votre Mot de passe</label>
        <div className="relative">
          <input type={showAdminPassword ? "text" : "password"} placeholder="Mot de passe administrateur" value={formData.adminPassword} onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute inset-y-0 right-1 pr-3 flex items-center text-sm bg-transparent border-none">
            {showAdminPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
          </button>
        </div>
      </div>
      <div className="flex space-x-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 hover:bg-gray-600 bg-gray-400 text-white rounded-lg">Annuler</button>
        <button type="submit" disabled={loading} className={`px-4 py-2 rounded-lg w-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
            {loading ? "Modification..." : "Valider les changements"}
        </button>
        
      </div>
    </form>
    {showConfirmPopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-lg mb-4">Êtes-vous sûr de vouloir effectuer ces modifications ?</p>
          <div className="flex justify-end space-x-4"> {/* Ajout de justify-end pour aligner les boutons à droite */}
            <button 
              onClick={confirmUpdate} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Oui
            </button>
            <button 
              onClick={() => setShowConfirmPopup(false)} 
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            >
              Non, annuler
            </button>
          </div>
        </div>
      </div>
      )}
  </div>
  </div>
  );
};

export default EditUserForm;