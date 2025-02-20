import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const NewUserForm = ({ onCreateUser }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    surname: "",
    email: "",
    role: "student",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setFormError("Les mots de passe ne correspondent pas.");
      return;
    }

    setFormLoading(true);
    const success = await onCreateUser(formData);
    setFormLoading(false);

    if (success) {
      setFormSuccess("Utilisateur créé avec succès !");
      setFormData({ first_name: "", surname: "", email: "", role: "student", department: "", password: "", confirmPassword: "" });
    } else {
      setFormError("Erreur lors de la création de l'utilisateur.");
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Créer un nouvel utilisateur</h2>
      {formError && <p className="text-red-500">{formError}</p>}
      {formSuccess && <p className="text-green-500">{formSuccess}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input type="text" placeholder="Entrez le prénom de l'utilisateur" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input type="text" placeholder="Entrez le nom de l'utilisateur" value={formData.surname} onChange={(e) => setFormData({ ...formData, surname: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" placeholder="Entrez l'adresse email de l'utilisateur" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
          <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" required>
            <option value="student">Étudiant</option>
            <option value="teacher">Enseignant</option>
            <option value="quality_manager">Responsable qualité</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Département (facultatif)</label>
          <input type="text" placeholder="Entrez le département de l'utilisateur" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Créez un mot de passe sécurisé" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-1 pr-3 flex items-center text-sm leading-5 mt-0 bg-transparent border-none p-13">
                {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirmez le mot de passe" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-1 pr-3 flex items-center text-sm leading-5 mt-0 bg-transparent border-none p-13">
                {showConfirmPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
          </div>

          {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && <p className="text-red-500 text-sm">Les mots de passe ne correspondent pas.</p>}
        </div>

        <button type="submit" disabled={formLoading || formData.password !== formData.confirmPassword} className={`px-4 py-2 rounded-lg w-full ${formLoading || formData.password !== formData.confirmPassword ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
          {formLoading ? "Création..." : "Créer l'utilisateur"}
        </button>
      </form>
    </div>
  );
};

export default NewUserForm;
