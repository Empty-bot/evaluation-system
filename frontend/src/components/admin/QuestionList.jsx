import React, { useState, useEffect } from "react";
import { Pencil, Trash2, CircleArrowLeft } from "lucide-react";

const QuestionList = ({ form, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        <h2 className="text-xl font-semibold">{form.title}</h2>
      </div>
      <p className="text-gray-600">{form.description}</p>

      {loading && <p className="text-gray-600">Chargement...</p>}
      {error && <p className="text-red-500">Erreur: {error}</p>}
      {!loading && !error && (
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
                <tr key={question.id} className="hover:bg-gray-100">
                  <td className="px-4 py-2 whitespace-nowrap">{question.label}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{question.type}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 p-1 rounded bg-transparent border-none" title="Modifier">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 p-1 rounded bg-transparent border-none ml-2" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
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

export default QuestionList;
