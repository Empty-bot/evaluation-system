import React, { useState, useEffect } from 'react';
import { Plus, CirclePlus, Trash2, X, Calendar } from 'lucide-react';
import { Alert } from '@mui/material';

const NewForm = () => {
  const [formTitle, setFormTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [publishOnCreate, setPublishOnCreate] = useState(false);
  const [questions, setQuestions] = useState([{
    label: '',
    type: 'multiple_choice',
    possible_answers: ['Option n° 1'],
    hasError: false
  }]);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [hasValidationError, setHasValidationError] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [formErrors, setFormErrors] = useState({
    title: false,
    courseId: false,
    description: false
  });
  const [loading, setLoading] = useState(false);

  const questionTypes = [
    { value: 'multiple_choice', label: 'Choix multiples' },
    { value: 'single_choice', label: 'Choix unique' },
    { value: 'text', label: 'Question ouverte' }
  ];

  // Fonctions de vérification
  const checkDuplicateOptions = (answers) => {
    const uniqueAnswers = new Set(answers);
    return uniqueAnswers.size !== answers.length;
  };

  const checkEmptyLabel = (question) => {
    return !question.label || question.label.trim() === '';
  };

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

  // Validation des champs du formulaire
  useEffect(() => {
    setFormErrors({
      title: !formTitle || formTitle.trim() === '',
      courseId: !courseId,
      description: !description || description.trim() === ''
    });
  }, [formTitle, courseId, description]);

  // Logique de validation globale
  useEffect(() => {
    const duplicateOptionsError = questions.some(question => 
      (question.type === 'multiple_choice' || question.type === 'single_choice') && 
      checkDuplicateOptions(question.possible_answers)
    );
    
    const emptyLabelError = questions.some(question => 
      checkEmptyLabel(question)
    );
    
    const choiceOptionsError = questions.some(question => 
      checkChoiceOptions(question)
    );
    
    const formFieldsError = !formTitle || !courseId || !description;
    
    setHasValidationError(
      duplicateOptionsError || 
      emptyLabelError || 
      choiceOptionsError || 
      formFieldsError
    );
  }, [questions, formTitle, courseId, description]);

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      label: '',
      type: 'multiple_choice',
      possible_answers: ['Option n° 1'],
      hasError: false
    }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'type') {
      if (value === 'single_choice' || value === 'multiple_choice') {
        newQuestions[index] = {
          ...newQuestions[index],
          type: value,
          possible_answers: ['Option n° 1'],
          hasError: false
        };
      } else {
        newQuestions[index] = {
          ...newQuestions[index],
          type: value,
          possible_answers: [],
          hasError: false
        };
      }
    } else {
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      if (field === 'possible_answers') {
        newQuestions[index].hasError = checkDuplicateOptions(value);
      }
    }
    setQuestions(newQuestions);
  };

  const handleAddOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].possible_answers.push(`Option n° ${newQuestions[questionIndex].possible_answers.length + 1}`);
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].possible_answers = 
      newQuestions[questionIndex].possible_answers.filter((_, i) => i !== optionIndex);
    newQuestions[questionIndex].hasError = 
      checkDuplicateOptions(newQuestions[questionIndex].possible_answers);
    setQuestions(newQuestions);
  };

  const handleCreateClick = () => {
    if (hasValidationError) return;
    setShowConfirmPopup(true);
  };

  const createQuestionnaire = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");  
      const questionnaireResponse = await fetch('http://localhost:3001/api/questionnaires', {
        method: 'POST',
        headers: { 
            "Content-Type": "application/json",
             Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify({
          title: formTitle,
          description,
          status: publishOnCreate ? 'published' : 'draft',
          course_id: parseInt(courseId),
          deadline: deadline || null,
        })
      });

      if (!questionnaireResponse.ok) throw new Error('Erreur lors de la création du questionnaire');
      
      const questionnaire = await questionnaireResponse.json();
      
      await Promise.all(questions.map(question => 
        fetch('http://localhost:3001/api/questions', {
          method: 'POST',
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
          body: JSON.stringify({
            questionnaire_id: questionnaire.id,
            label: question.label,
            type: question.type,
            possible_answers: question.possible_answers
          })
        })
      ));

      setAlert({
        show: true,
        message: 'Questionnaire créé avec succès',
        severity: 'success'
      });

      // Réinitialiser le formulaire après création réussie
      setFormTitle('');
      setCourseId('');
      setDescription('');
      setDeadline('');
      setPublishOnCreate(false);
      setQuestions([{
        label: '',
        type: 'multiple_choice',
        possible_answers: ['Option n° 1'],
        hasError: false
      }]);

    } catch (error) {
      setAlert({
        show: true,
        message: 'Erreur lors de la création du questionnaire',
        severity: 'error'
      });
    } finally {
        setShowConfirmPopup(false);
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl text-center font-semibold mb-4">Créer un nouveau formulaire</h2>  
      {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg mb-4">
              {publishOnCreate 
                ? "Etes-vous sûr de vouloir publier ce questionnaire ? Vous ne pourrez plus en modifier les contenus une fois cette action effectuée."
                : "Etes-vous sûr de vouloir mettre ce questionnaire en brouillon ?"}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={createQuestionnaire}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                disabled={loading}
              >
                {loading ? "Création..." : "Oui"}
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                disabled={loading}
              >
                Non, annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {alert.show && (
        <Alert severity={alert.severity} className="mb-4">
          {alert.message}
        </Alert>
      )}
      
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Formulaire sans titre"
          className={`text-xl font-semibold mb-2 border bg-white border-${formErrors.title ? 'red-500' : 'gray-300'} p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {formErrors.title && (
          <p className="text-red-500 text-sm mt-1 mb-2">Le titre du questionnaire est requis</p>
        )}
        
        <input
          type="number"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="ID Cours"
          className={`mb-2 border font-semibold bg-white border-${formErrors.courseId ? 'red-500' : 'gray-300'} p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:bg-white [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:bg-white`}
        />
        {formErrors.courseId && (
          <p className="text-red-500 text-sm mt-1 mb-2">L'ID du cours est requis</p>
        )}
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du formulaire"
          className={`mb-2 border font-semibold bg-white border-${formErrors.description ? 'red-500' : 'gray-300'} p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {formErrors.description && (
          <p className="text-red-500 text-sm mt-1 mb-2">La description du questionnaire est requis</p>
        )}
        
        {/* Ajout du champ deadline */}
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
      </div>

      {questions.map((question, index) => {
        const hasEmptyLabel = checkEmptyLabel(question);
        const hasChoiceOptionsError = checkChoiceOptions(question);
        
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6 mb-4 relative grid gap-4">
            <input
              type="text"
              value={question.label}
              onChange={(e) => handleQuestionChange(index, 'label', e.target.value)}
              placeholder="Question sans titre"
              className={`w-full mb-2 border font-semibold bg-white border-${hasEmptyLabel ? 'red-500' : 'gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {hasEmptyLabel && (
              <p className="text-red-500 text-sm mt-1 mb-2">Le libellé de la question est requis</p>
            )}
            
            <select
              value={question.type}
              onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
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
                        handleQuestionChange(index, 'possible_answers', newAnswers);
                      }}
                      className={`w-full mb-2 border font-semibold bg-white border-${question.hasError || !option || option.trim() === '' ? 'red-500' : 'gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {question.possible_answers.length > 1 && (
                      <button
                        onClick={() => handleRemoveOption(index, optionIndex)}
                        className="text-red-500 bg-white hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                {question.hasError && (
                  <p className="text-red-500 text-sm mt-1">
                    Les options doivent être uniques
                  </p>
                )}
                {hasChoiceOptionsError && question.possible_answers.length < 2 && (
                  <p className="text-red-500 text-sm mt-1">
                    Au moins deux options sont nécessaires
                  </p>
                )}
                {hasChoiceOptionsError && question.possible_answers.some(option => !option || option.trim() === '') && (
                  <p className="text-red-500 text-sm mt-1">
                    Les options ne peuvent pas être vides
                  </p>
                )}
                <button
                  onClick={() => handleAddOption(index)}
                  className="px-2 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Plus className="w-4 h-4"/>
                </button>
              </div>
            )}

            <button
              onClick={() => handleRemoveQuestion(index)}
              className="bg-white absolute bottom-4 right-4"
            >
              <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700" />
            </button>
          </div>
        );
      })}

      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 sm:right-8">
        <button
          onClick={handleAddQuestion}
          className="bg-white rounded-full p-2 shadow hover:bg-gray-50"
        >
          <CirclePlus className="h-7 w-7" />
        </button>
      </div>

      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={publishOnCreate}
            onChange={(e) => setPublishOnCreate(e.target.checked)}
            className="mr-2 bg-white"
          />
          Créer et publier
        </label>
        <button
          onClick={handleCreateClick}
          disabled={hasValidationError || loading}
          className={`${
            hasValidationError || loading
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white px-4 py-2 rounded flex-grow`}
        >
          {loading ? "Création..." : "Créer"}
        </button>
      </div>
    </div>
  );
};

export default NewForm;