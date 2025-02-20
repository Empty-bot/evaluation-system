import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Search } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState(""); // "email", "role" ou "course"
  const [searchValue, setSearchValue] = useState(""); // Valeur entrée par l'admin

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    let url = "http://localhost:3001/api/users/";

    if (searchType && searchValue) {
      if (searchType === "email") {
        url = `http://localhost:3001/api/users/emailsearch/${searchValue}`;
      } else if (searchType === "role") {
        url = `http://localhost:3001/api/users/role/${searchValue}`;
      } else if (searchType === "course") {
        url = `http://localhost:3001/api/users/course/${searchValue}`;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Liste des Utilisateurs</h2>
      {/* Barre de recherche */}
      <div className="flex space-x-4 mb-4">
        <select 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)} 
          className="border border-gray-300 bg-gray-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filtrer par...</option>
          <option value="email">Email</option>
          <option value="role">Rôle</option>
          <option value="course">Cours</option>
        </select>

        <input 
          type="text" 
          value={searchValue} 
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Entrez la valeur"
          className="border border-gray-300 bg-gray-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          disabled={!searchType} 
        />

        <button 
          onClick={fetchUsers} 
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!searchType || !searchValue}
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {loading && <p className="text-gray-600">Chargement...</p>}
      {error && <p className="text-red-500">Erreur: {error}</p>}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-2 whitespace-nowrap">{user.first_name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{user.surname}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{user.role}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{user.department}</td>
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

export default UserManagement;
