import React, { useState, useEffect } from "react";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { CircleArrowLeft } from "lucide-react"; // Assurez-vous d'importer l'icône

const EditCourseForm = ({ courseName, courseId, onCancel, onUpdateCourse }) => {
  const [course, setCourse] = useState({
    name: "",
    code: "",
    department: "",
    level: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3001/api/courses/${courseId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des informations du cours.");
        }

        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(course),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour du cours.");
      }

      setSuccess("Cours mis à jour avec succès !");
      
      // Attendre un peu avant de fermer le formulaire pour que l'utilisateur voie le message de succès
      setTimeout(() => {
        onUpdateCourse();
        onCancel();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Vérifier si tous les champs sont remplis
  const isFormValid = () => {
    return course.name && course.code && course.department && course.level;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={onCancel} 
            className="mb-4 p-2 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray rounded-lg"
          >
            <CircleArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl text-center font-semibold mb-4">Modifier le cours {courseName}</h2>
        </div>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Erreur</AlertTitle>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du Cours
            </label>
            <input
              type="text"
              name="name"
              value={course.name}
              onChange={handleChange}
              required
              placeholder="Entrez le nom du cours"
              className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code du Cours
            </label>
            <input
              type="text"
              name="code"
              value={course.code}
              onChange={handleChange}
              required
              placeholder="Entrez le code du cours"
              className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Département
            </label>
            <select
              name="department"
              value={course.department}
              onChange={handleChange}
              required
              className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un département</option>
              <option value="DSTI">DSTI</option>
              <option value="DGAE">DGAE</option>
              <option value="DGO">DGO</option>
              <option value="DU2ADT">DU2ADT</option>
              <option value="DST2AN">DST2AN</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau
            </label>
            <select
              name="level"
              value={course.level}
              onChange={handleChange}
              required
              className="border bg-white border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un niveau</option>
              <option value="Licence 1">Licence 1</option>
              <option value="Licence 2">Licence 2</option>
              <option value="Licence 3">Licence 3</option>
              <option value="Master 1">Master 1</option>
              <option value="Master 2">Master 2</option>
            </select>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={submitting || !isFormValid()}
              className={`px-4 py-2 rounded-lg w-full ${submitting || !isFormValid() ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              {submitting ? "Enregistrement..." : "Valider les changements"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseForm;