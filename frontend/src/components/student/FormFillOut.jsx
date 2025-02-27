import React, { useState, useEffect } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { CircleArrowLeft } from "lucide-react";

const FormFillOut = ({ form, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Récupération des questions du formulaire
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3001/api/questions/questionnaire/${form.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des questions");
        }

        const data = await response.json();
        setQuestions(data);

        // Initialisation des réponses avec des valeurs vides
        const initialAnswers = {};
        data.forEach((question) => {
          if (question.type === "single_choice" && question.possible_answers && question.possible_answers.length > 0) {
            // Pour les questions à choix unique, on n'initialise pas de valeur
            initialAnswers[question.id] = null;
          } else if (question.type === "multiple_choice" && question.possible_answers && question.possible_answers.length > 0) {
            // Pour les questions à choix multiples, on initialise un tableau vide
            initialAnswers[question.id] = [];
          } else {
            // Pour les questions de type texte
            initialAnswers[question.id] = "";
          }
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [form.id]);

  // Gestion des changements de réponses
  const handleAnswerChange = (questionId, value, questionType) => {
    if (questionType === "multiple_choice") {
      // Pour les questions à choix multiples
      setAnswers((prevAnswers) => {
        const currentAnswers = [...(prevAnswers[questionId] || [])];
        
        if (currentAnswers.includes(value)) {
          // Si la valeur est déjà sélectionnée, la retirer
          return {
            ...prevAnswers,
            [questionId]: currentAnswers.filter((answer) => answer !== value),
          };
        } else {
          // Sinon, l'ajouter
          return {
            ...prevAnswers,
            [questionId]: [...currentAnswers, value],
          };
        }
      });
    } else if (questionType === "single_choice") {
      // Pour les questions à choix unique, remplacer la valeur
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionId]: value,
      }));
    } else {
      // Pour les questions de type texte
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionId]: value,
      }));
    }
  };

  // Vérification si toutes les questions ont été répondues
  const areAllQuestionsAnswered = () => {
    for (const question of questions) {
      if (
        answers[question.id] === null || 
        answers[question.id] === undefined || 
        answers[question.id] === "" ||
        (Array.isArray(answers[question.id]) && answers[question.id].length === 0)
      ) {
        return false;
      }
    }
    return true;
  };

  // Ouverture de la boîte de dialogue de confirmation
  const handleOpenConfirmation = () => {
    setConfirmationOpen(true);
  };

  // Fermeture de la boîte de dialogue de confirmation
  const handleCloseConfirmation = () => {
    setConfirmationOpen(false);
  };

  // Envoi des réponses au serveur en utilisant submitFullQuestionnaire
  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  
    try {
      const token = localStorage.getItem("token");
      
      // Préparer le tableau de réponses
      const responsesArray = questions.map(question => ({
        question_id: question.id,
        answer: answers[question.id]
      }));
      
      // Envoi de toutes les réponses en une seule requête
      const response = await fetch("http://localhost:3001/api/responses/submitFullQuestionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionnaire_id: form.id,
          responses: responsesArray
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi des réponses");
      }
      
      setSubmitSuccess(true);
      // Fermer le dialogue de confirmation
      setConfirmationOpen(false);
      
      // Rediriger vers la liste des formulaires après un court délai
      setTimeout(() => {
        onBack();
      }, 2000);
      
    } catch (err) {
      setSubmitError(err.message);
      setConfirmationOpen(false);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Rendu du type de champ en fonction du type de question
  const renderFieldByType = (question) => {
    switch (question.type) {
      case "text":
        return (
          <textarea
            className="mb-2 border font-semibold bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
          />
        );
      
      case "multiple_choice":
        // Gérer le cas où possible_answers est une chaîne JSON
        let possibleAnswers = [];
        if (typeof question.possible_answers === "string") {
          try {
            possibleAnswers = JSON.parse(question.possible_answers);
          } catch (e) {
            console.error("Erreur lors du parsing des réponses possibles:", e);
            return <p className="text-red-500">Erreur: Options invalides</p>;
          }
        } else if (Array.isArray(question.possible_answers)) {
          possibleAnswers = question.possible_answers;
        }

        return (
          <div className="space-y-2">
            {possibleAnswers.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={answers[question.id]?.includes(option) || false}
                  onChange={() => handleAnswerChange(question.id, option, question.type)}
                  className="h-4 w-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case "single_choice":
        // Gérer le cas où possible_answers est une chaîne JSON
        let singleChoiceOptions = [];
        if (typeof question.possible_answers === "string") {
            try {
            singleChoiceOptions = JSON.parse(question.possible_answers);
            } catch (e) {
            console.error("Erreur lors du parsing des réponses possibles:", e);
            return <p className="text-red-500">Erreur: Options invalides</p>;
            }
        } else if (Array.isArray(question.possible_answers)) {
            singleChoiceOptions = question.possible_answers;
        }

        return (
            <div className="space-y-2">
            {singleChoiceOptions.map((option, index) => (
                <label key={index} className="flex items-center space-x-2">
                <input
                    type="radio"
                    name={`single-choice-${question.id}`}
                    checked={answers[question.id] === option}
                    onChange={() => handleAnswerChange(question.id, option, question.type)}
                    className="h-4 w-4"
                />
                <span>{option}</span>
                </label>
            ))}
            </div>
        );
      
      default:
        return <p className="text-red-500">Type de question non pris en charge: {question.type}</p>;
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-2">
        <button 
            type="button" 
            onClick={onBack} 
            className="mb-1 p-2 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray rounded-lg"
        >
            <CircleArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* En-tête du formulaire */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
        <p className="text-gray-600">{form.description}</p>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Erreur</AlertTitle>
          {error}
        </Alert>
      )}

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Erreur lors de l'envoi</AlertTitle>
          {submitError}
        </Alert>
      )}

      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Succès</AlertTitle>
          Vos réponses ont été soumises avec succès!
        </Alert>
      )}

      {/* Questions du formulaire */}
      {questions.map((question, index) => (
        <div key={question.id} className="bg-white p-6 rounded-lg shadow-md">
          <label className="block mb-2 font-medium">
            {index + 1}. {question.label}{" "}
            <span className="text-red-500">*</span>
          </label>
          {renderFieldByType(question)}
        </div>
      ))}

      {/* Bouton d'envoi */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleOpenConfirmation}
          disabled={!areAllQuestionsAnswered() || submitLoading}
          className={`px-6 py-2 rounded-md ${
            areAllQuestionsAnswered()
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {submitLoading ? "Envoi en cours..." : "Envoyer"}
        </button>
      </div>

      {/* Dialogue de confirmation */}
      <Dialog
        open={confirmationOpen}
        onClose={handleCloseConfirmation}
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir soumettre vos réponses ? Une fois confirmée, cette action ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmation} color="primary">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            disabled={submitLoading}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FormFillOut;