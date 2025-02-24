import React, { useState, useEffect } from 'react';
import { Trash2, Plus, CircleArrowLeft } from 'lucide-react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

export default function EditQuestionForm({ questionId, onCancel, onUpdate }) {
  // États
  const [formData, setFormData] = useState({
    label: "",
    type: "",
    possible_answers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3001/api/questions/${questionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erreur lors du chargement de la question");

        const data = await response.json();
        setFormData({
          label: data.label || "",
          type: data.type || "",
          possible_answers: Array.isArray(data.possible_answers) 
            ? data.possible_answers 
            : data.possible_answers ? JSON.parse(data.possible_answers) : []
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  // Handlers
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      type: newType,
      possible_answers: newType === 'text' ? [] : newType === 'boolean' ? ["", ""] : ["", ""]
    }));
  };

  const handleAnswerChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      possible_answers: prev.possible_answers.map((ans, i) => i === index ? value : ans)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const submitForm = async () => {
    try {
      setLoading(true);
      setError("");
  
      // Validation des données selon le type
      if (!formData.label.trim()) {
        throw new Error("Le libellé est requis");
      }
  
      let validatedAnswers = [];
      
      if (formData.type === "multiple_choice") {
        validatedAnswers = formData.possible_answers.filter(answer => answer.trim());
        if (validatedAnswers.length < 2) {
          throw new Error("Au moins deux réponses valides sont requises pour une question à choix multiples");
        }
      } 
      else if (formData.type === "boolean") {
        validatedAnswers = formData.possible_answers.filter(answer => answer.trim());
        if (validatedAnswers.length !== 2) {
          throw new Error("Exactement deux réponses sont requises pour une question fermée");
        }
      }
  
      // Préparation des données pour l'API
      const requestBody = {
        label: formData.label.trim(),
        type: formData.type,
        possible_answers: formData.type === "text" ? [] : validatedAnswers
      };
  
      // Envoi de la requête
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour de la question");
      }
  
      // Si tout s'est bien passé, on ferme le popup et on notifie le parent
      setShowConfirmation(false);
      onUpdate();
    } catch (err) {
      setError(err.message);
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onCancel}
          className="mb-4 p-2 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray rounded-lg"
        >
          <CircleArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl text-center font-semibold mb-4">Modifier la question</h2>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Erreur</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Libellé de la question */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Libellé de la question
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
            className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Saisissez votre question"
            required
          />
        </div>

        {/* Type de question */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Type de question
          </label>
          <select
            value={formData.type}
            onChange={handleTypeChange}
            className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionnez un type</option>
            <option value="text">Réponse libre</option>
            <option value="multiple_choice">Choix multiples</option>
            <option value="boolean">Choix unique</option>
          </select>
        </div>

        {/* Réponses possibles (conditionnelles) */}
        {formData.type !== 'text' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              {formData.type === 'boolean' ? 'Options de réponse' : 'Réponses possibles'}
            </label>
            
            <div className="space-y-3">
              {formData.possible_answers.map((answer, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={e => handleAnswerChange(index, e.target.value)}
                    className="flex-1 border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={formData.type === 'boolean' ? 
                      `Option ${index + 1}` : 
                      `Réponse ${index + 1}`
                    }
                    required
                  />
                  
                  {formData.type === 'multiple_choice' && formData.possible_answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newAnswers = formData.possible_answers.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, possible_answers: newAnswers }));
                      }}
                      className="text-red-600 hover:text-red-900 p-2 rounded bg-transparent border-none ml-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {formData.type === 'multiple_choice' && (
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    possible_answers: [...prev.possible_answers, ""]
                  }));
                }}
                className="px-2 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4"/>
              </button>
            )}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 hover:bg-gray-600 bg-gray-400 text-white rounded-lg"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>

      {/* Popup de confirmation */}
    {showConfirmation && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Confirmer les modifications ?</h3>
        <div className="flex gap-4 justify-end">
            <button
            onClick={() => setShowConfirmation(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            disabled={loading}
            >
            Annuler
            </button>
            <button
            onClick={submitForm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg ${
                loading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            >
            {loading ? "Modification en cours..." : "Confirmer"}
            </button>
        </div>
        </div>
    </div>
    )}
    </div>
  );
}