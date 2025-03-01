import React, { useState } from 'react';
import { PanelRightOpen, PanelLeftOpen } from 'lucide-react';
import FormsList from '../components/quality/FormsList';
import Sidebar from '../components/quality/Sidebar';
import EditProfile from '../components/quality/EditProfile';

const QualityDashboard = () => {
  const [activeSection, setActiveSection] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderMainContent = () => {
    switch (activeSection) {
      case 'forms':
        return <FormsList />;
      case 'edit-profile' :
        return <EditProfile />;
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
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} isSidebarOpen={isSidebarOpen} />

        {/* Main content */}
        <div className={`flex-1 transition-all duration-200 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'} lg:ml-64`}>
          <main className="p-8 bg-gray-100 min-h-screen pb-24">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="lg:hidden mb-4 p-2 bg-blue-600 text-white rounded"
            >
              {isSidebarOpen ? <PanelRightOpen className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quality Manager Dashboard</h1>
            {renderMainContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default QualityDashboard;