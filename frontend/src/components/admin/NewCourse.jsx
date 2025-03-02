import React, { useState } from 'react';
import { Alert, AlertTitle } from '@mui/material';

const NewCourse = () => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: '',
    level: ''
  });

  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const isFormValid = () => {
    return formData.code && formData.name && formData.department && formData.level;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const token = localStorage.getItem("token");   
      const response = await fetch('http://localhost:3001/api/courses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de la création du cours.");
      }

      setFormSuccess(data.message);
      setFormData({
        code: '',
        name: '',
        department: '',
        level: ''
      });
    } catch (error) {
      setFormError(error.message || "Une erreur est survenue lors de la création du cours.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-xl text-center font-semibold mb-4">Créer un nouveau cours</h2>
      {formError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Erreur</AlertTitle>
          {formError}
        </Alert>
      )}
      
      {formSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {formSuccess}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input 
            type="text" 
            placeholder="Entrez le code du cours" 
            value={formData.code} 
            onChange={(e) => setFormData({ ...formData, code: e.target.value })} 
            required 
            className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input 
            type="text" 
            placeholder="Entrez le nom du cours" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            required 
            className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
          <select 
            value={formData.department} 
            onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
            className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" 
            required
          >
            <option value="">Sélectionnez un département</option>
            <option value="DSTI">DSTI</option>
            <option value="DGAE">DGAE</option>
            <option value="DGO">DGO</option>
            <option value="DU2ADT">DU2ADT</option>
            <option value="DST2AN">DST2AN</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
          <select 
            value={formData.level} 
            onChange={(e) => setFormData({ ...formData, level: e.target.value })} 
            className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" 
            required
          >
            <option value="">Sélectionnez un niveau</option>
            <option value="Licence 1">Licence 1</option>
            <option value="Licence 2">Licence 2</option>
            <option value="Licence 3">Licence 3</option>
            <option value="Master 1">Master 1</option>
            <option value="Master 2">Master 2</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={formLoading || !isFormValid()} 
          className={`px-4 py-2 rounded-lg w-full ${formLoading || !isFormValid() ? "bg-gray-400 cursor-not-allowed text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          {formLoading ? "Création..." : "Créer le cours"}
        </button>
      </form>
    </div>
  );
};

export default NewCourse;