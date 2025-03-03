import React, { useState, useEffect } from 'react';
import { Plus, CirclePlus, Trash2, X, Calendar, CircleArrowLeft } from 'lucide-react';
import { Alert } from '@mui/material';

const EditFormForm = ({ formId, onCancel, onUpdateForm }) => {
  const [formTitle, setFormTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('draft');
  const [questions, setQuestions] = useState([]);
  const [newQuestions, setNewQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [hasValidationError, setHasValidationError] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showDeleteQuestionPopup, setShowDeleteQuestionPopup] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [originalTitle, setOriginalTitle] = useState("");
  const [formErrors, setFormErrors] = useState({
    title: false,
    courseId: false,
    description: false
  });

  const questionTypes = [
    { value: 'multiple_choice', label: 'Choix multiples' },
    { value: 'single_choice', label: 'Choix unique' },
    { value: 'text', label: 'Question ouverte' }
  ];

  const checkDuplicateOptions = (answers) => {
    const uniqueAnswers = new Set(answers);
    return uniqueAnswers.size !== answers.length;
  };

  // Vérifier si une question a un label vide
  const checkEmptyLabel = (question) => {
    return !question.label || question.label.trim() === '';
  };

  // Vérifier si une question à choix a des options vides ou insuffisantes
  const checkChoiceOptions = (question) => {
    if (question.type !== 'multiple_choice' && question.type !== 'single_choice') {
      return false;
    }
    
    // Vérifie s'il n'y a qu'une seule option
    if (question.possible_answers.length < 2) {
      return true;
    }
    
    // Vérifie si des options sont vides
    return question.possible_answers.some(option => !option || option.trim() === '');
  };

  // Validation globale du formulaire
  useEffect(() => {
    const duplicateOptionsError = [...questions, ...newQuestions].some(question => 
      (question.type === 'multiple_choice' || question.type === 'single_choice') && 
      checkDuplicateOptions(question.possible_answers)
    );
    
    const emptyLabelError = [...questions, ...newQuestions].some(question => 
      checkEmptyLabel(question)
    );
    
    const choiceOptionsError = [...questions, ...newQuestions].some(question => 
      checkChoiceOptions(question)
    );
    
    const formFieldsError = !formTitle || !courseId || !description;
    
    setHasValidationError(
      duplicateOptionsError || 
      emptyLabelError || 
      choiceOptionsError || 
      formFieldsError
    );
  }, [questions, newQuestions, formTitle, courseId, description]);

  // Validation des champs du formulaire
  useEffect(() => {
    setFormErrors({
      title: !formTitle || formTitle.trim() === '',
      courseId: !courseId,
      description: !description || description.trim() === ''
    });
  }, [formTitle, courseId, description]);

  useEffect(() => {
    const fetchFormAndQuestions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        // Récupérer les infos du formulaire
        const formResponse = await fetch(`http://localhost:3001/api/questionnaires/${formId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!formResponse.ok) {
          throw new Error("Erreur lors de la récupération du questionnaire.");
        }

        const form = await formResponse.json();
        setOriginalTitle(form.title);
        
        // Format de la date de délai
        let formattedDeadline = "";
        if (form.deadline) {
          const deadlineDate = new Date(form.deadline);
          formattedDeadline = deadlineDate.toISOString().slice(0, 16);
        }
        
        setFormTitle(form.title);
        setCourseId(form.course_id || "");
        setDescription(form.description);
        setStatus(form.status);
        setDeadline(formattedDeadline);
        
        // Récupération des questions pour ce formulaire
        const questionsResponse = await fetch(`http://localhost:3001/api/questions/questionnaire/${form.id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!questionsResponse.ok) {
          throw new Error("Erreur lors de la récupération des questions.");
        }
        
        const questionsData = await questionsResponse.json();
        
        // Ajouter des Error flags à chaque question
        const questionsWithErrorFlags = questionsData.map(question => ({
          ...question,
          hasError: (question.type === 'multiple_choice' || question.type === 'single_choice') 
            ? checkDuplicateOptions(question.possible_answers) 
            : false,
          hasEmptyLabel: checkEmptyLabel(question),
          hasChoiceOptionsError: checkChoiceOptions(question)
        }));
        
        setQuestions(questionsWithErrorFlags);
      } catch (error) {
        setAlert({
          show: true,
          message: error.message,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFormAndQuestions();
  }, [formId]);

  const handleAddQuestion = () => {
    setNewQuestions([...newQuestions, {
      questionnaire_id: parseInt(formId),
      label: '',
      type: 'multiple_choice',
      possible_answers: ['Option n° 1'],
      hasError: false,
      hasEmptyLabel: true,
      hasChoiceOptionsError: true,
      isNew: true
    }]);
  };

  const handleRemoveQuestion = (index, isNewQuestion) => {
    if (isNewQuestion) {
      // Enlever du tableau des nouvelles questions
      setNewQuestions(newQuestions.filter((_, i) => i !== index));
    } else {
      // Si la question existait déjà, popup de confirmation
      setQuestionToDelete(questions[index]);
      setShowDeleteQuestionPopup(true);
    }
  };

  const confirmDeleteQuestion = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/questions/${questionToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression de la question.");

      // Remove from state
      setQuestions(questions.filter(q => q.id !== questionToDelete.id));
      setAlert({
        show: true,
        message: 'Question supprimée avec succès',
        severity: 'success'
      });
    } catch (error) {
      setAlert({
        show: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setShowDeleteQuestionPopup(false);
      setQuestionToDelete(null);
    }
  };

  const handleQuestionChange = (index, field, value, isNewQuestion) => {
    if (isNewQuestion) {
      const updatedNewQuestions = [...newQuestions];
      if (field === 'type') {
        if (value === 'single_choice' || value === 'multiple_choice') {
          updatedNewQuestions[index] = {
            ...updatedNewQuestions[index],
            type: value,
            possible_answers: ['Option n° 1'],
            hasError: false,
            hasChoiceOptionsError: true
          };
        } else {
          updatedNewQuestions[index] = {
            ...updatedNewQuestions[index],
            type: value,
            possible_answers: [],
            hasError: false,
            hasChoiceOptionsError: false
          };
        }
      } else if (field === 'label') {
        updatedNewQuestions[index] = { 
          ...updatedNewQuestions[index], 
          [field]: value,
          hasEmptyLabel: !value || value.trim() === ''
        };
      } else {
        updatedNewQuestions[index] = { ...updatedNewQuestions[index], [field]: value };
        if (field === 'possible_answers') {
          updatedNewQuestions[index].hasError = checkDuplicateOptions(value);
          updatedNewQuestions[index].hasChoiceOptionsError = checkChoiceOptions({
            ...updatedNewQuestions[index],
            possible_answers: value
          });
        }
      }
      setNewQuestions(updatedNewQuestions);
    } else {
      const updatedQuestions = [...questions];
      if (field === 'type') {
        if (value === 'single_choice' || value === 'multiple_choice') {
          updatedQuestions[index] = {
            ...updatedQuestions[index],
            type: value,
            possible_answers: ['Option n° 1'],
            hasError: false,
            hasChoiceOptionsError: true
          };
        } else {
          updatedQuestions[index] = {
            ...updatedQuestions[index],
            type: value,
            possible_answers: [],
            hasError: false,
            hasChoiceOptionsError: false
          };
        }
      } else if (field === 'label') {
        updatedQuestions[index] = { 
          ...updatedQuestions[index], 
          [field]: value,
          hasEmptyLabel: !value || value.trim() === ''
        };
      } else {
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        if (field === 'possible_answers') {
          updatedQuestions[index].hasError = checkDuplicateOptions(value);
          updatedQuestions[index].hasChoiceOptionsError = checkChoiceOptions({
            ...updatedQuestions[index],
            possible_answers: value
          });
        }
      }
      setQuestions(updatedQuestions);
    }
  };

  const handleAddOption = (questionIndex, isNewQuestion) => {
    if (isNewQuestion) {
      const updatedNewQuestions = [...newQuestions];
      updatedNewQuestions[questionIndex].possible_answers.push(
        `Option n° ${updatedNewQuestions[questionIndex].possible_answers.length + 1}`
      );
      // Vérifier si nous avons maintenant suffisamment d'options
      updatedNewQuestions[questionIndex].hasChoiceOptionsError = checkChoiceOptions(updatedNewQuestions[questionIndex]);
      setNewQuestions(updatedNewQuestions);
    } else {
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].possible_answers.push(
        `Option n° ${updatedQuestions[questionIndex].possible_answers.length + 1}`
      );
      // Vérifier si nous avons maintenant suffisamment d'options
      updatedQuestions[questionIndex].hasChoiceOptionsError = checkChoiceOptions(updatedQuestions[questionIndex]);
      setQuestions(updatedQuestions);
    }
  };

  const handleRemoveOption = (questionIndex, optionIndex, isNewQuestion) => {
    if (isNewQuestion) {
      const updatedNewQuestions = [...newQuestions];
      updatedNewQuestions[questionIndex].possible_answers = 
        updatedNewQuestions[questionIndex].possible_answers.filter((_, i) => i !== optionIndex);
      
      // Mettre à jour les drapeaux d'erreur
      updatedNewQuestions[questionIndex].hasError = 
        checkDuplicateOptions(updatedNewQuestions[questionIndex].possible_answers);
      updatedNewQuestions[questionIndex].hasChoiceOptionsError = 
        checkChoiceOptions(updatedNewQuestions[questionIndex]);
      
      setNewQuestions(updatedNewQuestions);
    } else {
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].possible_answers = 
        updatedQuestions[questionIndex].possible_answers.filter((_, i) => i !== optionIndex);
      
      // Mettre à jour les drapeaux d'erreur
      updatedQuestions[questionIndex].hasError = 
        checkDuplicateOptions(updatedQuestions[questionIndex].possible_answers);
      updatedQuestions[questionIndex].hasChoiceOptionsError = 
        checkChoiceOptions(updatedQuestions[questionIndex]);
      
      setQuestions(updatedQuestions);
    }
  };

  const handleUpdateClick = () => {
    setShowConfirmPopup(true);
  };

  const confirmUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Mettre à jour les infos formulaire
      const formResponse = await fetch(`http://localhost:3001/api/questionnaires/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle,
          description: description,
          status: status,
          course_id: parseInt(courseId),
          deadline: deadline || null,
        }),
      });

      if (!formResponse.ok) throw new Error("Erreur lors de la mise à jour du questionnaire.");
      
      // Mettre à jour les questions existantes
      await Promise.all(questions.map(question => 
        fetch(`http://localhost:3001/api/questions/${question.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            label: question.label,
            type: question.type,
            possible_answers: question.possible_answers
          })
        })
      ));
      
      // Créer les nouvelles questions
      await Promise.all(newQuestions.map(question => 
        fetch('http://localhost:3001/api/questions', {
          method: 'POST',
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            questionnaire_id: parseInt(formId),
            label: question.label,
            type: question.type,
            possible_answers: question.possible_answers
          })
        })
      ));

      setAlert({
        show: true,
        message: 'Questionnaire mis à jour avec succès',
        severity: 'success'
      });
      
      onUpdateForm(); // Rafraichir la liste après mise à jour
      onCancel(); // Retourner à la liste des formulaires
    } catch (error) {
      setAlert({
        show: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setShowConfirmPopup(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onCancel}
          className="mb-4 p-2 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray rounded-lg"
        >
          <CircleArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4">Modifier le questionnaire "{originalTitle}"</h2>
      </div>
      
      {alert.show && (
        <Alert severity={alert.severity} className="mb-4">
          {alert.message}
        </Alert>
      )}
      
      {/* Confirmation de mise à jour */}
      {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg mb-4">
              Confirmer les modifications du questionnaire ?
              {status === 'published' && status !== 'draft' && 
                " Attention, vous allez publier ce questionnaire. Une fois publié, certaines modifications ne seront plus possibles."}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={confirmUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation de supression de question */}
      {showDeleteQuestionPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg mb-4">
              Êtes-vous sûr de vouloir supprimer cette question ?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={confirmDeleteQuestion}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Supprimer
              </button>
              <button
                onClick={() => setShowDeleteQuestionPopup(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Chargement...</p>
        </div>
      ) : (
        <>
          {/* Section information de formulaire */}
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="mb-2">
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Formulaire sans titre"
                className={`text-xl font-semibold border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.title ? 'border-red-500' : ''}`}
              />
              {formErrors.title && (
                <p className="text-red-500 text-sm mt-1">
                  Le titre du questionnaire est requis
                </p>
              )}
            </div>
            
            <div className="mb-2">
              <input
                type="number"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="ID Cours"
                className={`font-semibold bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:bg-white [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:bg-white border ${formErrors.courseId ? 'border-red-500' : ''}`}
              />
              {formErrors.courseId && (
                <p className="text-red-500 text-sm mt-1">
                  L'ID du cours est requis
                </p>
              )}
            </div>
            
            <div className="mb-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du formulaire"
                className={`font-semibold bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border ${formErrors.description ? 'border-red-500' : ''}`}
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  La description du questionnaire est requis
                </p>
              )}
            </div>
            
            <div className="mb-2 relative">
              <div className="flex items-center">
                <Calendar className="absolute left-3 text-gray-500" size={16} />
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="Délai (optionnel)"
                  className="mb-2 pl-10 border font-semibold bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-sm text-gray-500">Délai de réponse (optionnel)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="closed">Clôturé</option>
              </select>
            </div>
          </div>
          
          {/* Section des questions existantes */}
          {questions.map((question, index) => (
            <div key={`existing-${index}`} className="bg-white rounded-lg shadow p-6 mb-4 relative grid gap-4">
              <div className="mb-2">
                <input
                  type="text"
                  value={question.label}
                  onChange={(e) => handleQuestionChange(index, 'label', e.target.value, false)}
                  placeholder="Question sans titre"
                  className={`w-full border font-semibold bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${question.hasEmptyLabel ? 'border-red-500' : ''}`}
                />
                {question.hasEmptyLabel && (
                  <p className="text-red-500 text-sm mt-1">
                    Le libellé de la question est requis
                  </p>
                )}
              </div>
              
              <select
                value={question.type}
                onChange={(e) => handleQuestionChange(index, 'type', e.target.value, false)}
                className="mb-2 border font-semibold bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {questionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {(question.type === 'multiple_choice' || question.type === 'single_choice') && (
                <div className="mb-4">
                  {question.possible_answers.map((option, optionIndex) => (
                    <div key={optionIndex} className="mb-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newAnswers = [...question.possible_answers];
                          newAnswers[optionIndex] = e.target.value;
                          handleQuestionChange(index, 'possible_answers', newAnswers, false);
                        }}
                        className={`w-full mb-2 border font-semibold bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!option || option.trim() === '' ? 'border-red-500' : (question.hasError ? 'border-red-500' : '')}`}
                      />
                      {question.possible_answers.length > 1 && (
                        <button
                          onClick={() => handleRemoveOption(index, optionIndex, false)}
                          className="text-red-500 bg-white hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                      {(!option || option.trim() === '') && (
                        <p className="text-red-500 text-sm mt-1 mb-1">
                          Les options ne peuvent pas être vides
                        </p>
                      )}
                    </div>
                  ))}
                  {question.hasError && (
                    <p className="text-red-500 text-sm mt-1 mb-1">
                      Les options doivent être uniques
                    </p>
                  )}
                  {question.hasChoiceOptionsError && question.possible_answers.length < 2 && (
                    <p className="text-red-500 text-sm mt-1 mb-1">
                      Au moins deux options sont nécessaires
                    </p>
                  )}
                  <button
                    onClick={() => handleAddOption(index, false)}
                    className="px-2 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4"/>
                  </button>
                </div>
              )}

              <button
                onClick={() => handleRemoveQuestion(index, false)}
                className="bg-white absolute bottom-4 right-4"
              >
                <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700" />
              </button>
            </div>
          ))}
          
          {/* Section des nouvelles questions */}
          {newQuestions.map((question, index) => (
            <div key={`new-${index}`} className="bg-white rounded-lg shadow p-6 mb-4 relative grid gap-4 border-l-4 border-green-500">
              <div className="absolute top-2 right-2 text-xs font-medium text-green-600">
                Nouvelle question
              </div>
              
              <div className="mb-2">
                <input
                  type="text"
                  value={question.label}
                  onChange={(e) => handleQuestionChange(index, 'label', e.target.value, true)}
                  placeholder="Question sans titre"
                  className={`w-full border font-semibold bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${question.hasEmptyLabel ? 'border-red-500' : ''}`}
                />
                {question.hasEmptyLabel && (
                  <p className="text-red-500 text-sm mt-1">
                    Le libellé de la question est obligatoire
                  </p>
                )}
              </div>
              
              <select
                value={question.type}
                onChange={(e) => handleQuestionChange(index, 'type', e.target.value, true)}
                className="mb-2 border font-semibold bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {questionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {(question.type === 'multiple_choice' || question.type === 'single_choice') && (
                <div className="mb-4">
                  {question.possible_answers.map((option, optionIndex) => (
                    <div key={optionIndex} className="mb-2 flex items-center gap-2 relative">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newAnswers = [...question.possible_answers];
                          newAnswers[optionIndex] = e.target.value;
                          handleQuestionChange(index, 'possible_answers', newAnswers, true);
                        }}
                        className={`w-full mb-2 border font-semibold bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!option || option.trim() === '' ? 'border-red-500' : (question.hasError ? 'border-red-500' : '')}`}
                      />
                      {question.possible_answers.length > 1 && (
                        <button
                          onClick={() => handleRemoveOption(index, optionIndex, true)}
                          className="text-red-500 bg-white hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                      {(!option || option.trim() === '') && (
                        <p className="text-red-500 text-sm absolute -bottom-2 left-2">
                          L'option ne peut pas être vide
                        </p>
                      )}
                    </div>
                  ))}
                  {question.hasError && (
                    <p className="text-red-500 text-sm mt-1 mb-1">
                      Les options doivent être uniques
                    </p>
                  )}
                  {question.hasChoiceOptionsError && question.possible_answers.length < 2 && (
                    <p className="text-red-500 text-sm mt-1 mb-1">
                      Au moins deux options sont nécessaires
                    </p>
                  )}
                  <button
                    onClick={() => handleAddOption(index, true)}
                    className="px-2 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4"/>
                  </button>
                </div>
              )}

              <button
                onClick={() => handleRemoveQuestion(index, true)}
                className="bg-white absolute bottom-4 right-4"
              >
                <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700" />
              </button>
            </div>
          ))}
          
          {/* Bouton d'ajout de question */}
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 sm:right-8">
            <button
              onClick={handleAddQuestion}
              className="bg-white rounded-full p-2 shadow hover:bg-gray-50"
            >
              <CirclePlus className="h-7 w-7" />
            </button>
          </div>
          
          {/* Bouton de mise à jour */}
          <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow">
            <button
              onClick={handleUpdateClick}
              disabled={hasValidationError || loading}
              className={`${
                hasValidationError || loading
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-4 py-2 rounded`}
            >
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditFormForm;