import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import EditCourseForm from "./EditCourseForm";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [courseToEditName, setCourseToEditName] = useState(null);
  
  // États pour la barre de recherche
  const [searchType, setSearchType] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    setInfoMessage(null); 
    
    // URL de base par défaut
    let url = "http://localhost:3001/api/courses/";
    
    try {
      // Adapter l'URL en fonction du type de recherche
      if (searchType === "department" && department) {
        url = `http://localhost:3001/api/courses/by-department/${encodeURIComponent(department)}`;
      } else if (searchType === "department_level" && department && level) {
        url = `http://localhost:3001/api/courses/by-department-and-level/${encodeURIComponent(department)}/${encodeURIComponent(level)}`;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Afficher la réponse complète en cas d'erreur pour le débogage
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erreur inconnue" }));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setCourses(data.data || []);
      
      // Définir le message d'info si nécessaire
      if (!data.data || data.data.length === 0) {
        if (searchType === "department") {
          setInfoMessage(`Aucun cours trouvé pour le département ${department}.`);
        } else if (searchType === "department_level") {
          setInfoMessage(`Aucun cours trouvé pour le département ${department} et le niveau ${level}.`);
        } else {
          setInfoMessage("Aucun cours trouvé.");
        }
      }
    } catch (err) {
      setError(err.message);
      setCourses([]); 
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser le filtre
  const resetFilter = () => {
    setSearchType("");
    setDepartment("");
    setLevel("");
  };

  useEffect(() => {
    if (searchType === "" && department === "" && level === "") {
      fetchCourses(); 
    }
  }, [searchType, department, level]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEditClick = (event, course) => {
    event.stopPropagation();
    setEditingCourseId(course.id);
    setCourseToEditName(course.name)
  };

  const handleDeleteClick = (event, course) => {
    event.stopPropagation();
    setCourseToDelete(course);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/courses/${courseToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du cours.");
      }

      setCourses(courses.filter(c => c.id !== courseToDelete.id));
      setCourseToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fonction pour gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page
    fetchCourses();
  };

  return (
    <div className="space-y-4">
      {/* Popup de confirmation de suppression */}
      {courseToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg mb-4 text-center">
              Êtes-vous sûr de vouloir supprimer le cours <strong>{courseToDelete.name}</strong> ?
              Cette action est <span className="text-red-600 font-bold">irréversible</span>.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={confirmDeleteCourse} 
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg"
              >
                Oui, supprimer
              </button>
              <button 
                onClick={() => setCourseToDelete(null)} 
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCourseId ? (
        <EditCourseForm courseName={courseToEditName} courseId={editingCourseId} onCancel={() => setEditingCourseId(null)} onUpdateCourse={fetchCourses} />
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Liste des Cours</h2>
          
          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-4">
            <select 
              value={searchType} 
              onChange={(e) => {
                setSearchType(e.target.value);
                setDepartment("");
                setLevel("");
              }} 
              className="border border-gray-300 bg-gray-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Filtrer par...</option>
              <option value="department">Département</option>
              <option value="department_level">Département et Niveau</option>
            </select>

            {(searchType === "department" || searchType === "department_level") && (
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                className="border border-gray-300 bg-gray-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un département</option>
                <option value="DSTI">DSTI</option>
                <option value="DGAE">DGAE</option>
                <option value="DGO">DGO</option>
                <option value="DU2ADT">DU2ADT</option>
                <option value="DST2AN">DST2AN</option>
              </select>
            )}

            {searchType === "department_level" && (
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)}
                className="border border-gray-300 bg-gray-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un niveau</option>
                <option value="Licence 1">Licence 1</option>
                <option value="Licence 2">Licence 2</option>
                <option value="Licence 3">Licence 3</option>
                <option value="Master 1">Master 1</option>
                <option value="Master 2">Master 2</option>
              </select>
            )}

            <button 
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={
                (searchType === "department" && !department) || 
                (searchType === "department_level" && (!department || !level))
              }
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button 
              type="button"
              onClick={resetFilter} 
              className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Réinitialiser le filtre
            </button>
          </form>
          
          {loading && (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Erreur</AlertTitle>
              {error}
            </Alert>
          )}
          
          {!loading && !error && courses.length === 0 && infoMessage && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {infoMessage}
            </Alert>
          )}
          
          {!loading && !error && courses.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-100">
                      <td className="px-4 py-2 whitespace-nowrap">{course.id}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{course.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{course.code}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{course.department}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{course.level}</td>
                      <td className="px-4 py-2 whitespace-nowrap flex space-x-2">
                        <button 
                          onClick={(event) => handleEditClick(event, course)} 
                          className="text-blue-600 hover:text-blue-900 p-1 rounded bg-transparent border-none" 
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(event) => handleDeleteClick(event, course)} 
                          className="text-red-600 hover:text-red-900 p-1 rounded bg-transparent border-none" 
                          title="Supprimer"
                        >
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
      )}
    </div>
  );
};

export default CourseManagement;