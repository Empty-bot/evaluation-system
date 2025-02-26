import React, { useState, useEffect } from "react";
import FormFillOut from "./FormFillOut";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { NotebookPen } from "lucide-react";


const StudentFormsList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  
  const translateStatus = (status) => {
    const translations = {
      'published': 'Publié'
    };
    return translations[status] || status;
  };

  const fetchForms = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/questionnaires/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des formulaires");
      }

      const data = await response.json();
      setForms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleClick = (event, form) => {
    event.stopPropagation();
    setSelectedForm(form);
  };

  if (selectedForm) {
      return <FormFillOut form={selectedForm} onBack={() => setSelectedForm(null)} />
  }

  

  return (
    
    <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Liste des Formulaires</h2>

    {loading && (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>)}
      {error && (<Alert severity="error" sx={{ mb: 3 }}>
                  <AlertTitle>Erreur</AlertTitle>
                  {error}
                </Alert>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {forms.map((form) => (
              <tr
                key={form.id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={(event) => handleClick(event, form)}
              >
                <td className="px-4 py-2 whitespace-nowrap">{form.title}</td>
                <td className="px-4 py-2 whitespace-nowrap">{form.description}</td>
                <td className="px-4 py-2 whitespace-nowrap">{form.status ? translateStatus(form.status) : ''}</td>
                <td className="px-4 py-2 whitespace-nowrap flex space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-900 p-1 rounded bg-transparent border-none" 
                    onClick={(event) => handleClick(event, form)}
                    title="Répondre"
                  >
                    <NotebookPen className="w-4 h-4"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentFormsList;