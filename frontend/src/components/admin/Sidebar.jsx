import React, { useState, useContext } from "react";
import { UserCircle, Users, UserPlus, FilePlus2, BookText, BookPlus, LogOut, FileSpreadsheet } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = ({ activeSection, setActiveSection, isSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem("user")); // Récupérer l'utilisateur depuis le stockage local
  const userName = user ? `${user.first_name} ${user.surname}` : "Utilisateur"; // Afficher le prénom et le nom ou un texte par défaut
  const { logout } = useContext(AuthContext);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirmation(false);
  };

  return (
    <>
      <div
        className={`w-64 bg-white shadow-lg flex flex-col fixed h-full transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        } lg:translate-x-0`}
      >
        <div className="p-6 flex-1">
          {/* Profil utilisateur cliquable */}
          <a
            href="#"
            onClick={() => setActiveSection("edit-profile")}
            className={`flex items-center space-x-2 mb-8 p-2 rounded -mx-2 ${
              activeSection === "edit-profile"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <UserCircle className="w-6 h-6" />
            <span className="text-lg font-semibold">{userName}</span>
          </a>

          <nav className="space-y-4">
            <a
              href="#"
              onClick={() => setActiveSection("users")}
              className={`flex items-center space-x-2 p-2 rounded ${
                activeSection === "users"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Utilisateurs</span>
            </a>
            <a
              href="#"
              onClick={() => setActiveSection("new-user")}
              className={`flex items-center space-x-2 p-2 rounded ${
                activeSection === "new-user"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>Nouvel utilisateur</span>
            </a>
            <a
              href="#"
              onClick={() => setActiveSection("forms")}
              className={`flex items-center space-x-2 p-2 rounded ${
                activeSection === "forms"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Formulaires</span>
            </a>
            <a
              href="#"
              onClick={() => setActiveSection("new-form")}
              className={`flex items-center space-x-2 p-2 rounded ${
                activeSection === "new-form"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <FilePlus2 className="w-5 h-5" />
              <span>Nouveau formulaire</span>
            </a>
            <a
              href="#"
              onClick={() => setActiveSection("courses")}
              className={`flex items-center space-x-2 p-2 rounded ${
                activeSection === "courses"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <BookText className="w-5 h-5" />
              <span>Cours</span>
            </a>
            <a
              href="#"
              onClick={() => setActiveSection("new-course")}
              className={`flex items-center space-x-2 p-2 rounded ${
                activeSection === "new-course"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <BookPlus className="w-5 h-5" />
              <span>Nouveau cours</span>
            </a>
          </nav>
        </div>
        <div className="p-6 border-t">
          <a
            href="#"
            onClick={handleLogoutClick}
            className="flex items-center space-x-2 text-gray-700 hover:text-red-600 p-2 rounded hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </a>
        </div>
      </div>

      {/* Popup de confirmation de déconnexion */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg mb-4">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Oui
              </button>
              <button
                onClick={() => setShowLogoutConfirmation(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Non, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;