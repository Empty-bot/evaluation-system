import React, { useState, useEffect } from "react";
import { CircleArrowLeft } from "lucide-react";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const EditFormForm = ({ formId, onCancel, onUpdateForm }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    course_id: "",
    deadline: "", // Ajout du champ deadline
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [originalTitle, setOriginalTitle] = useState("");

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3001/api/questionnaires/${formId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du questionnaire.");
        }

        const form = await response.json();
        
        // Vérifier que le formulaire est en mode brouillon
        if (form.status !== "draft") {
          setError("Seuls les questionnaires en brouillon peuvent être modifiés.");
          return;
        }

        // Formatage de la date pour l'input datetime-local
        let formattedDeadline = "";
        if (form.deadline) {
          // Convertir la date en format YYYY-MM-DDTHH:MM
          const deadlineDate = new Date(form.deadline);
          formattedDeadline = deadlineDate.toISOString().slice(0, 16);
        }

        setOriginalTitle(form.title);
        setFormData({
          title: form.title,
          description: form.description,
          status: form.status,
          course_id: form.course_id || "",
          deadline: formattedDeadline,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmPopup(true);
  };

  const confirmUpdate = async () => {
    setShowConfirmPopup(false);
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:3001/api/questionnaires/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          course_id: formData.course_id,
          deadline: formData.deadline || null, // Envoi de null si aucune date n'est spécifiée
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du questionnaire.");
      }

      setSuccess("Questionnaire mis à jour avec succès !");
      onUpdateForm(); // Rafraîchir la liste après la mise à jour
      onCancel();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="flex items-center gap-4">
            <button 
                onClick={onCancel}
                className="mb-4 p-2 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray rounded-lg"
            >
                <CircleArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl text-center font-semibold mb-4">Modifier le questionnaire "{originalTitle}"</h2>
        </div>
        {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <AlertTitle>Erreur</AlertTitle>
                  {error}
                </Alert>
              )}
        {success && (<Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>)}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="closed">Clôturé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cours</label>
            <input type="text" value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} required className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Délai</label>
            <input 
              type="datetime-local" 
              value={formData.deadline} 
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} 
              className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Laissez vide si aucun délai n'est prévu</p>
          </div>

          <div className="flex space-x-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 hover:bg-gray-600 bg-gray-400 text-white rounded-lg">Annuler</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 rounded-lg w-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
              {loading ? "Modification..." : "Valider les changements"}
            </button>
          </div>
        </form>
      </div>

      {/* Popup de confirmation */}
      {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg mb-4">Confirmer les modifications ?</p>
            <div className="flex justify-end space-x-4">
              <button onClick={confirmUpdate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Confirmer</button>
              <button onClick={() => setShowConfirmPopup(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditFormForm;