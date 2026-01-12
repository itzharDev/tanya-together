import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaShare, FaBook, FaHeart, FaChevronDown, FaChevronUp, FaSignOutAlt } from 'react-icons/fa';

export default function SideMenu({ isOpen, onClose, currentUser, onLogout }) {
  const navigate = useNavigate();
  const [thanksExpanded, setThanksExpanded] = useState(false);

  if (!isOpen) return null;

  const handleShareApp = async () => {
    const shareUrl = window.location.origin;
    const shareText = 'תניא המחולק - אפליקציה לקריאת תניא בקבוצות';
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'תניא המחולק',
          text: shareText,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('הקישור הועתק ללוח!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleStoryPage = () => {
    navigate('/segula');
    onClose();
  };

  const handleSettings = () => {
    // Navigate to settings page
    alert('עמוד הגדרות יפותח בקרוב');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Side Menu */}
      <div 
        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] shadow-xl z-50 transform transition-transform"
        style={{ 
          direction: 'rtl',
          background: 'linear-gradient(180deg, rgb(62, 97, 164) 0%, rgb(199, 216, 233) 30%, rgb(199, 216, 233) 100%)'
        }}
      >
        <div className="flex flex-col h-full">
          
          {/* Header - User Profile */}
          <div className="bg-transparent text-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {currentUser?.get('photoUrl') ? (
                  <img 
                    src={currentUser.get('photoUrl')} 
                    alt="User" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-2xl" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">
                  {currentUser?.get('displayName') || 'אורח'}
                </div>
                <div className="text-sm text-white/80">
                  {currentUser?.get('email') || ''}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            
            {/* Settings */}
            <button
              onClick={handleSettings}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-right"
            >
              <FaCog className="text-[#003A92] text-xl" />
              <span className="text-gray-800 font-medium">הגדרות</span>
            </button>

            {/* Share App */}
            <button
              onClick={handleShareApp}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-right"
            >
              <FaShare className="text-[#003A92] text-xl" />
              <span className="text-gray-800 font-medium">שיתוף</span>
            </button>

            {/* Tanya Story/Segula */}
            <button
              onClick={handleStoryPage}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-right"
            >
              <FaBook className="text-[#003A92] text-xl" />
              <span className="text-gray-800 font-medium">סגולה לאמירת התניא</span>
            </button>

            {/* Thanks Section - Expandable */}
            <div className="border-t border-gray-200">
              <button
                onClick={() => setThanksExpanded(!thanksExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-right"
              >
                <div className="flex items-center gap-4">
                  <FaHeart className="text-[#003A92] text-xl" />
                  <span className="text-gray-800 font-medium">תודה</span>
                </div>
                {thanksExpanded ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>
              
              {thanksExpanded && (
                <div className="bg-gray-50 px-6 py-4 text-sm text-gray-600">
                  <div className="space-y-2">
                    <p className="font-semibold text-[#003A92]">תודה לתורמים:</p>
                    <ul className="space-y-1 mr-4">
                      <li>• נורית אביטבול</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-3">
                      האפליקציה מתקיימת הודות לתרומותיכם הנדיבות
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Logout - Bottom */}
          <div className="border-t border-gray-200">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-red-50 transition-colors text-right"
            >
              <FaSignOutAlt className="text-red-600 text-xl" />
              <span className="text-red-600 font-medium">יציאה</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
