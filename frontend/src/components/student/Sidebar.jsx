import React, { useState, useContext } from "react";
import { UserCircle, LogOut, FileSpreadsheet } from "lucide-react";
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
            <a
                href="#"
                onClick={() => setActiveSection("edit-profile")}
                className={`flex items-center space-x-2 mb-8 p-2 rounded -mx-2 ${
                activeSection === "edit-profile"
                    ? "text-[#993921] hover:text-[#993921] bg-[#f5e0db]"
                    : "text-gray-700 hover:text-[#993921] hover:bg-[#f5e0db]"
                }`}
            >
                <UserCircle className="w-6 h-6" />
                <span className="text-lg font-semibold">{userName}</span>
            </a>

            <nav className="space-y-4">

            <a
                href="#"
                onClick={() => setActiveSection("forms")}
                className={`flex items-center space-x-2 p-2 rounded ${
                activeSection === "forms"
                    ? "text-[#993921] hover:text-[#993921] bg-[#f5e0db]"
                    : "text-gray-700 hover:text-[#993921] hover:bg-[#f5e0db]"
                }`}
            >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Formulaires</span>
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
                className="px-4 py-2 bg-[#993921] hover:bg-[#7a2712] text-white rounded-lg"
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
