import React, { useState, useEffect } from "react";
import { CircleArrowLeft } from "lucide-react";
import ResponseList from "./ResponseList";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { CircleChevronRight } from "lucide-react";

const QuestionList = ({ form, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  const translateType = (type) => {
    const translations = {
      'text': 'Texte',
      'multiple_choice': 'Choix multiples',
      'single_choice': 'Choix unique'
    };
    return translations[type] || type;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3001/api/questions/questionnaire/${form.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des questions");
        }

        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [form.id]);

  const handleChevronClick = (event, question) => {
    event.stopPropagation();
    setSelectedQuestion(question)
  }

  if (selectedQuestion) {
    return <ResponseList formTitle={form.title} question={selectedQuestion} onBack={() => setSelectedQuestion(null)} />;
  }

  return (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              type="button" 
              onClick={onBack} 
              className="mb-4 p-2 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray rounded-lg"
            >
              <CircleArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl mb-4 font-semibold">{form.title}</h2>
          </div>
          <h2 className="text-lg mb-4 font-semibold">Questions</h2>
          <p className="text-gray-600"><strong>{form.description}</strong></p>

          {loading && (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>)}
          {error && (<Alert severity="error" sx={{ mb: 3 }}>
                              <AlertTitle>Erreur</AlertTitle>
                              {error}
                            </Alert>
                          )}
          {!loading && !error && questions.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libellé</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question) => (
                    <tr 
                      key={question.id} 
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => setSelectedQuestion(question)}
                    >
                      <td className="px-4 py-2 whitespace-nowrap">{question.label}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{question.type ? translateType(question.type) : ''}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <button 
                          onClick={(event) => handleChevronClick(event, question)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded bg-transparent border-none" 
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
          ) : (
            <Alert severity="info">Ce questionnaire ne contient pas de questions pour le moment.</Alert>
          )}
        </div>
  );
};

export default QuestionList;
