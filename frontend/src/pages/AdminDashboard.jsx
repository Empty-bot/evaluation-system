import React, { useState, useEffect } from 'react';
import { UserCircle, Users, UserPlus, FilePlus2, Bell, LogOut, FileSpreadsheet, PanelRightOpen, PanelLeftOpen, Pencil, Trash2, Search } from 'lucide-react';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchType, setSearchType] = useState(""); // "email", "role" ou "course"
  const [searchValue, setSearchValue] = useState(""); // Valeur entrée par l'admin

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    let url = "http://localhost:3001/api/users/";
  
    if (searchType && searchValue) {
      if (searchType === "email") {
        url = `http://localhost:3001/api/users/email/${searchValue}`;
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
    if (activeSection === 'users') {
      fetchUsers();
    }
  }, [activeSection]);

  const renderMainContent = () => {
    switch (activeSection) {
      case 'users':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Liste des Utilisateurs</h2>
            {loading && <p className="text-gray-600">Chargement...</p>}
            {error && <p className="text-red-500">Erreur: {error}</p>}
            {!loading && !error && (
              <>
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

                {/* Tableau des utilisateurs */}
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
              </>
            )}
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p>Sélectionnez une option dans le menu</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`w-64 bg-white shadow-lg flex flex-col fixed h-full transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-64'} lg:translate-x-0`}>
          <div className="p-6 flex-1">
            <div className="flex items-center space-x-2 mb-8">
              <UserCircle className="w-6 h-6" />
              <span className="text-lg font-semibold">Admin</span>
            </div>
            
            <nav className="space-y-4">
              <a 
                href="#" 
                onClick={() => setActiveSection('users')}
                className={`flex items-center space-x-2 p-2 rounded ${
                  activeSection === 'users' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Utilisateurs</span>
              </a>
              
              <a 
                href="#" 
                onClick={() => setActiveSection('new-user')}
                className={`flex items-center space-x-2 p-2 rounded ${
                  activeSection === 'new-user' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span>Nouvel utilisateur</span>
              </a>

              <a 
                href="#" 
                onClick={() => setActiveSection('forms')}
                className={`flex items-center space-x-2 p-2 rounded ${
                  activeSection === 'new-form' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Formulaires</span>
              </a>

              <a 
                href="#" 
                onClick={() => setActiveSection('forms')}
                className={`flex items-center space-x-2 p-2 rounded ${
                  activeSection === 'new-form' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <FilePlus2 className="w-5 h-5" />
                <span>Nouveau formulaire</span>
              </a>
              
              <a href="#" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 p-2 rounded hover:bg-blue-50">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </a>
            </nav>
          </div>
          
          <div className="p-6 border-t">
            <a href="#" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 p-2 rounded hover:bg-red-50">
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </a>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex-1 transition-all duration-200 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'} lg:ml-64`}>
          <main className="p-8 bg-gray-100 min-h-screen">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="lg:hidden mb-4 p-2 bg-blue-600 text-white rounded"
            >
              {isSidebarOpen ? (
                <PanelRightOpen className="w-5 h-5" />
              ) : (
                <PanelLeftOpen className="w-5 h-5" />
              )}
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            {renderMainContent()}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#a37956] shadow-lg py-4 px-8 text-center fixed bottom-0 w-full lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#C5C5CF]">© 2025 Université Amadou Mahtar Mbow - Plateforme d'évaluation des enseignements</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;