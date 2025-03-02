import React, { useState, useEffect } from "react";
import QuestionList from "./QuestionList";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { CircleChevronRight, Search } from "lucide-react";


const FormsList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  // États pour la barre de recherche
  const [searchType, setSearchType] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");

  const translateStatus = (status) => {
    const translations = {
      'draft': 'Brouillon',
      'closed': 'Clôturé',
      'published': 'Publié'
    };
    return translations[status] || status;
  };

  function formatDeadline(isoString) {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  const fetchForms = async () => {
    setLoading(true);
    setError(null);
    
    // URL de base par défaut
    let url = "http://localhost:3001/api/questionnaires/";
    
    try {
      // Adapter l'URL en fonction du type de recherche
      if (searchType === "department" && department) {
        url = `http://localhost:3001/api/questionnaires/by-department/${encodeURIComponent(department)}`;
      } else if (searchType === "department_level" && department && level) {
        url = `http://localhost:3001/api/questionnaires/by-department-and-level/${encodeURIComponent(department)}/${encodeURIComponent(level)}`;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Afficher la réponse complète en cas d'erreur pour le débogage
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erreur inconnue" }));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.data.length === 0) {
        setInfoMessage(data.message);
      } else {
          setForms(data.data);
          setInfoMessage(""); // Réinitialiser le message s'il y a des résultats
      }
      setForms(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser le filtre
  const resetFilter = () => {
    setSearchType("");
    setDepartment("");
    setLevel("");
  };

  useEffect(() => {
      if (searchType === "" && department === "" && level === "") {
        fetchForms(); // Relance la récupération des formulaires après réinitialisation
      }
    }, [searchType, department, level]);

  useEffect(() => {
    fetchForms();
  }, []);

  // Fonction pour gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page
    fetchForms();
  };

  if (selectedForm) {
      return <QuestionList form={selectedForm} onBack={() => setSelectedForm(null)} />
  }

  return (
    
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Liste des Formulaires</h2>
      
      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-4">
        <select 
          value={searchType} 
          onChange={(e) => {
            setSearchType(e.target.value);
            setDepartment("");
            setLevel("");
          }} 
          className="border border-gray-300 bg-gray-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filtrer par...</option>
          <option value="department">Département</option>
          <option value="department_level">Département et Niveau</option>
        </select>

        {(searchType === "department" || searchType === "department_level") && (
          <select 
            value={department} 
            onChange={(e) => setDepartment(e.target.value)}
            className="border border-gray-300 bg-gray-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un département</option>
            <option value="DSTI">DSTI</option>
            <option value="DGAE">DGAE</option>
            <option value="DGO">DGO</option>
            <option value="DU2ADT">DU2ADT</option>
            <option value="DST2AN">DST2AN</option>
          </select>
        )}

        {searchType === "department_level" && (
          <select 
            value={level} 
            onChange={(e) => setLevel(e.target.value)}
            className="border border-gray-300 bg-gray-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un niveau</option>
            <option value="Licence 1">Licence 1</option>
            <option value="Licence 2">Licence 2</option>
            <option value="Licence 3">Licence 3</option>
            <option value="Master 1">Master 1</option>
            <option value="Master 2">Master 2</option>
          </select>
        )}

        <button 
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={
            (searchType === "department" && !department) || 
            (searchType === "department_level" && (!department || !level))
          }
        >
          <Search className="w-5 h-5" />
        </button>
        
        <button 
          type="button"
          onClick={resetFilter} 
          className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Réinitialiser le filtre
        </button>
      </form>

      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Erreur</AlertTitle>
          {error}
        </Alert>
      )}

      {!loading && !error && forms.length === 0 && infoMessage && (
        <Alert severity="info" sx={{ mb: 3 }}>
        {infoMessage}
        </Alert>
    )}
      
      {!loading && !error && forms.length > 0 && (
      <div className="bg-white rounded-lg shadow overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Délai</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {forms.map((form) => (
              <tr
                key={form.id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedForm(form)}
              >
                <td className="px-4 py-2 whitespace-nowrap">{form.title}</td>
                <td className="px-4 py-2 whitespace-nowrap">{form.description}</td>
                <td className="px-4 py-2 whitespace-nowrap">{form.status ? translateStatus(form.status) : ''}</td>
                <td className="px-4 py-2 whitespace-nowrap">{form.deadline ? formatDeadline(form.deadline) : ''}</td>
                <td className="px-4 py-2 whitespace-nowrap flex space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-900 p-1 rounded bg-transparent border-none" 
                    onClick={() => setSelectedForm(form)}
                    title="Voir plus"
                  >
                    <CircleChevronRight className="w-4 h-4"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default FormsList;


