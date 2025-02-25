import React, { useState, useEffect } from "react";
import { CircleArrowLeft } from "lucide-react";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const ResponseList = ({ formTitle, question, onBack }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3001/api/responses/question/${question.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        //if (!response.ok) {
          //throw new Error("Erreur lors de la récupération des réponses");
        //}

        const data = await response.json();
        setResponses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [question.id]);

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
        <h2 className="text-xl mb-4 font-semibold">{formTitle}</h2>
      </div>
      <h2 className="text-lg mb-4 font-semibold">Réponses à : {question.label}</h2>

      {loading && (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>)}
      {error && (<Alert severity="error" sx={{ mb: 3 }}>
                          <AlertTitle>Erreur</AlertTitle>
                          {error}
                        </Alert>
                      )}
      {!loading && !error && responses.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libellé</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réponse</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {responses.map((response, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap">{response.label}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{response.answer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Alert severity="info">Aucune réponse pour cette question.</Alert>
      )}
    </div>
  );
};

export default ResponseList;
