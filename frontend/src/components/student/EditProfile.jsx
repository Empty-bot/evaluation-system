import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Alert, AlertTitle } from '@mui/material';

const EditProfile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [personalData, setPersonalData] = useState({
    first_name: '',
    surname: '',
    department: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null);
  
  // Récupérer les données utilisateur du localStorage au chargement
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    setPersonalData({
      first_name: user.first_name || '',
      surname: user.surname || '',
      department: user.department || ''
    });
  }, []);
  
  // Récupérer le token d'authentification
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };
  
  // Vérifier si tous les champs personnels sont remplis
  const isPersonalFormValid = () => {
    return personalData.first_name.trim() !== '' && 
           personalData.surname.trim() !== '';
  };
  
  // Vérifier si le formulaire de mot de passe est valide
  const isPasswordFormValid = () => {
    if (!isPasswordVerified) {
      return passwordData.currentPassword.trim() !== '';
    } else {
      return passwordData.newPassword.trim() !== '' && 
             passwordData.confirmPassword.trim() !== '' && 
             passwordData.newPassword === passwordData.confirmPassword;
    }
  };
  
  // Gérer la vérification du mot de passe actuel
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      setFormError('Veuillez entrer votre mot de passe actuel');
      return;
    }
    
    setIsVerifyingPassword(true);
    setFormError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const token = getAuthToken();
      
      const response = await fetch('http://localhost:3001/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsPasswordVerified(true);
        setFormSuccess('Mot de passe vérifié avec succès');
        setTimeout(() => setFormSuccess(''), 3000);
      } else {
        setFormError(data.message || 'Mot de passe incorrect');
      }
    } catch (error) {
      setFormError('Erreur lors de la vérification du mot de passe');
    } finally {
      setIsVerifyingPassword(false);
    }
  };
  
  // Préparer l'action de soumission du formulaire d'informations personnelles
  const preparePersonalSubmit = (e) => {
    e.preventDefault();
    
    if (!isPersonalFormValid()) {
      setFormError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setPopupAction('updatePersonal');
    setShowConfirmPopup(true);
  };
  
  // In the handlePersonalSubmit function
  const handlePersonalSubmit = async () => {
    setFormLoading(true);
    setFormError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const token = getAuthToken();
      
      // Get the user ID from localStorage, making sure it's exactly the same type
      // as what's stored in the JWT token
      // If your JWT stores the ID as a number, convert user.id to a number
      const userId = Number(user.id); // or String(user.id) if JWT stores it as string
      
      console.log("Submitting for user ID:", userId, "Type:", typeof userId);
      
      const response = await fetch(`http://localhost:3001/api/users/updatePersonal/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(personalData)
      });
      
      const data = await response.json();
      console.log("Response:", data);
      
      if (response.ok && data.success) {
        // Mise à jour du localStorage avec les nouvelles données
        const updatedUser = { ...user, ...personalData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setFormSuccess('Informations personnelles mises à jour avec succès');
        setTimeout(() => setFormSuccess(''), 3000);
      } else {
        setFormError(data.message || data.error || 'Erreur lors de la mise à jour des informations');
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      setFormError('Erreur lors de la mise à jour des informations');
    } finally {
      setFormLoading(false);
    }
  };

  // Gérer la soumission du formulaire de changement de mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordVerified) {
      await handleVerifyPassword(e);
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setPopupAction('updatePassword');
    setShowConfirmPopup(true);
  };

  // Exécuter le changement de mot de passe
  const executePasswordUpdate = async () => {
    setFormLoading(true);
    setFormError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const token = getAuthToken();
      
      const userId = user.id;
      
      const response = await fetch(`http://localhost:3001/api/users/updatePassword/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) { 
        setFormSuccess(data.message || 'Mot de passe mis à jour avec succès');
        // Réinitialiser les champs
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsPasswordVerified(false);
        setTimeout(() => setFormSuccess(''), 3000);
      } else {
        setFormError(data.error || 'Erreur lors de la mise à jour du mot de passe');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setFormError('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setFormLoading(false);
    }
  };
  
  // Confirmation de l'action
  const confirmAction = () => {
    setShowConfirmPopup(false);
    
    if (popupAction === 'updatePersonal') {
      handlePersonalSubmit();
    } else if (popupAction === 'updatePassword') {
      executePasswordUpdate();
    }
  };
  
  // Réinitialiser le formulaire de mot de passe
  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsPasswordVerified(false);
    setFormError('');
    setFormSuccess('');
  };
  
  // Changer d'onglet
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormError('');
    setFormSuccess('');
    
    if (tab === 'password') {
      resetPasswordForm();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
      <h2 className="text-xl text-center font-semibold mb-6">Modifier mon profil</h2>
      
      {/* Onglets */}
      <div className="flex mb-6 justify-center items-center">
        <button
          className={`py-2 px-4 font-medium mr-2 ${activeTab === 'personal' 
            ? "text-[#993921] bg-[#f5e0db]" 
            : "text-gray-700 hover:text-[#993921] bg-white hover:bg-[#f5e0db]"}`} 
          onClick={() => handleTabChange('personal')}
        >
          Changer mes infos
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'password' 
            ? "text-[#993921] bg-[#f5e0db]" 
            : "text-gray-700 hover:text-[#993921] bg-white hover:bg-[#f5e0db]"}`}
          onClick={() => handleTabChange('password')}
        >
          Changer mon mot de passe
        </button>
      </div>
      
      {/* Messages d'erreur et de succès */}
      {formError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Erreur</AlertTitle>
          {formError}
        </Alert>
      )}
      
      {formSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {formSuccess}
        </Alert>
      )}
      
      {/* Formulaire pour modifier les informations personnelles */}
      {activeTab === 'personal' && (
        <form onSubmit={preparePersonalSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              placeholder="Entrez votre prénom"
              value={personalData.first_name}
              onChange={(e) => setPersonalData({ ...personalData, first_name: e.target.value })}
              required
              className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a1432b] w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              placeholder="Entrez votre nom"
              value={personalData.surname}
              onChange={(e) => setPersonalData({ ...personalData, surname: e.target.value })}
              required
              className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a1432b] w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Département (facultatif)</label>
            <input
              type="text"
              placeholder="Entrez votre département"
              value={personalData.department}
              onChange={(e) => setPersonalData({ ...personalData, department: e.target.value })}
              className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a1432b] w-full"
            />
          </div>
          
          <button
            type="submit"
            disabled={formLoading || !isPersonalFormValid()}
            className={`px-4 py-2 rounded-lg w-full ${
              formLoading || !isPersonalFormValid() ? "bg-gray-400 cursor-not-allowed" : "bg-[#993921] text-white hover:bg-[#7a2712]"
            }`}
          >
            {formLoading ? "Mise à jour..." : "Mettre à jour mes informations"}
          </button>
        </form>
      )}
      
      {/* Formulaire pour changer le mot de passe */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          {/* Vérification du mot de passe actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Entrez votre mot de passe actuel"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                disabled={isPasswordVerified}
                className={`border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a1432b] w-full pr-10 ${
                  isPasswordVerified ? "bg-gray-100" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-1 pr-3 flex items-center text-sm leading-5 mt-0 bg-transparent border-none p-13"
              >
                {showCurrentPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
          </div>
          
          {/* Champs pour le nouveau mot de passe (visibles uniquement après vérification) */}
          {isPasswordVerified && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Créez un nouveau mot de passe sécurisé"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a1432b] w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-1 pr-3 flex items-center text-sm leading-5 mt-0 bg-transparent border-none p-13"
                  >
                    {showNewPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez le nouveau mot de passe"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="border bg-white border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a1432b] w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-1 pr-3 flex items-center text-sm leading-5 mt-0 bg-transparent border-none p-13"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                  </button>
                </div>
              </div>
              
              {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-red-500 text-sm">Les mots de passe ne correspondent pas.</p>
              )}
            </>
          )}
          
          <button
            type="submit"
            disabled={formLoading || !isPasswordFormValid() || (isPasswordVerified && passwordData.newPassword !== passwordData.confirmPassword)}
            className={`px-4 py-2 rounded-lg w-full ${
              formLoading || !isPasswordFormValid() || (isPasswordVerified && passwordData.newPassword !== passwordData.confirmPassword)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#993921] text-white hover:bg-[#7a2712]"
            }`}
          >
            {formLoading 
              ? "Traitement..." 
              : isPasswordVerified 
                ? "Mettre à jour le mot de passe" 
                : "Vérifier le mot de passe actuel"}
          </button>
          
          {isPasswordVerified && (
            <button
              type="button"
              onClick={resetPasswordForm}
              className="px-4 py-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            >
              Annuler
            </button>
          )}
        </form>
      )}
      
      {/* Popup de confirmation */}
      {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg mb-4">
              {popupAction === 'updatePersonal' 
                ? "Êtes-vous sûr de vouloir modifier vos informations personnelles ?" 
                : "Êtes-vous sûr de vouloir modifier votre mot de passe ?"}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-[#993921] hover:bg-[#7a2712] text-white rounded-lg"
              >
                Oui
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Non, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;