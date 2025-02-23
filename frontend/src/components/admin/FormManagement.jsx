import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Lock } from "lucide-react";
import QuestionList from "./QuestionList";
import EditFormForm from "./EditFormForm";

const FormManagement = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [editingFormId, setEditingFormId] = useState(null);
  const [showStatusError, setShowStatusError] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [formToClose, setFormToClose] = useState(null);

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

  const handleEditClick = (event, form) => {
    event.stopPropagation();
    if (form.status === "draft") {
      setEditingFormId(form.id);
    } else {
      setShowStatusError(true);
    }
  };

  const handleDeleteClick = (event, form) => {
    event.stopPropagation();
    setFormToDelete(form);
  };

  const confirmDeleteForm = async () => {
    if (!formToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/questionnaires/${formToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du questionnaire.");
      }

      setForms(forms.filter(f => f.id !== formToDelete.id));
      setFormToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseClick = (event, form) => {
    event.stopPropagation();
    setFormToClose(form);
  };

  const confirmCloseForm = async () => {
    if (!formToClose) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/questionnaires/${formToClose.id}/close`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la clôture du questionnaire.");
      }

      setForms(forms.map(f => (f.id === formToClose.id ? { ...f, status: "closed" } : f)));
      setFormToClose(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (selectedForm) {
    return <QuestionList form={selectedForm} onBack={() => setSelectedForm(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Popup d'erreur si le questionnaire est publié ou clôturé */}
      {showStatusError && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg mb-4 text-center text-red-600">
              Impossible de modifier un questionnaire publié ou clôturé.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setShowStatusError(false)} 
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmation de suppression */}
      {formToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg mb-4 text-center">
              Êtes-vous sûr de vouloir supprimer le questionnaire <strong>{formToDelete.title}</strong> ?
              Cette action est <span className="text-red-600 font-bold">irréversible</span>.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={confirmDeleteForm} 
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg"
              >
                Oui, supprimer
              </button>
              <button 
                onClick={() => setFormToDelete(null)} 
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmation de clôture */}
      {formToClose && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg mb-4 text-center">
              Êtes-vous sûr de vouloir <strong>clôturer</strong> le questionnaire <strong>{formToClose.title}</strong> ?
              Une fois clôturé, il ne pourra plus être modifié.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={confirmCloseForm} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Oui, clôturer
              </button>
              <button 
                onClick={() => setFormToClose(null)} 
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {editingFormId ? (
        <EditFormForm formId={editingFormId} onCancel={() => setEditingFormId(null)} onUpdateForm={fetchForms} />
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Liste des Formulaires</h2>
          {loading && <p className="text-gray-600">Chargement...</p>}
          {error && <p className="text-red-500">Erreur: {error}</p>}
          {!loading && !error && (
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
                    <tr key={form.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{form.title}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{form.description}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{form.status}</td>
                      <td className="px-4 py-2 whitespace-nowrap flex space-x-2">
                        <button 
                          onClick={(event) => handleEditClick(event, form)} 
                          className="text-blue-600 hover:text-blue-900 p-1 rounded bg-transparent border-none" 
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(event) => handleDeleteClick(event, form)} 
                          className="text-red-600 hover:text-red-900 p-1 rounded bg-transparent border-none" 
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {form.status === "published" && (
                          <button 
                            onClick={(event) => handleCloseClick(event, form)} 
                            className="text-gray-600 hover:text-gray-900 p-1 rounded bg-transparent border-none" 
                            title="Clôturer"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormManagement;


