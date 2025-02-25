import React from "react";
import { UserCircle, LogOut, FileSpreadsheet } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";


const Sidebar = ({ activeSection, setActiveSection, isSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem("user")); // Récupérer l'utilisateur depuis le stockage local
  const userName = user ? `${user.first_name} ${user.surname}` : "Utilisateur"; // Afficher le prénom et le nom ou un texte par défaut  
  const { logout } = useContext(AuthContext);
  
  return (
    <div
      className={`w-64 bg-white shadow-lg flex flex-col fixed h-full transform transition-transform duration-200 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-64"
      } lg:translate-x-0`}
    >
      <div className="p-6 flex-1">
        <div className="flex items-center space-x-2 mb-8">
          <UserCircle className="w-6 h-6" />
          <span className="text-lg font-semibold">{userName}</span>
        </div>

        <nav className="space-y-4">

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

        </nav>
      </div>

      <div className="p-6 border-t">
        <a
          href="#"
          onClick={logout}
          className="flex items-center space-x-2 text-gray-700 hover:text-red-600 p-2 rounded hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
