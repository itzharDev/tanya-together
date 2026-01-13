import React from 'react';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import bookIcon from '../assets/icons/book.svg'; 
import tanyaIcon from '../assets/icons/tanya_icon.svg';
import sunglassesIcon from '../assets/icons/sunglasses.png';
import { getIntentionIcon, getIntentionPrefix } from '../constants/groupTypes';

// Helper to get Book Type Name
const getBookTypeName = (type) => {
    switch (type) {
        case '1': return 'תניא';
        case '2': return 'תהילים';
        case '3': return 'משנה';
        default: return 'תניא';
    }
};

export default function GroupCard({ group, index, onEdit, currentUser }) {
  const navigate = useNavigate();
  const { 
    name, 
    members = [], 
    book = [], 
    max = 0, 
    bookType, 
    inProgress = [],
    booksReaded = 0,
    description = '',
    dedicatedTo = '',
    intention = '1'
  } = group;

  const progress = max > 0 ? (book.length / max) * 100 : 0;
  const bookTypeName = getBookTypeName(bookType);
  
  // Check if current user is admin or owner
  const userEmail = currentUser?.get?.('email');
  const isAdmin = members.some(member => member.email === userEmail && member.admin === true);
  const isOwner = group.ownerEmail === userEmail;
  const canEdit = isAdmin || isOwner;

  const handleShare = async () => {
    const url = `${window.location.origin}/group/${group.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      alert('הקישור הועתק ללוח!');
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('הקישור הועתק ללוח!');
      } catch (err) {
        alert('שגיאה בהעתקת הקישור');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleMembersClick = (e) => {
    e.stopPropagation();
    navigate(`/group-details/${group.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-transparent hover:border-blue-100 transition-colors h-full">
      <div className="bg-white rounded-lg p-3 flex flex-col items-stretch space-y-2">
        
        {/* Header: Title | Share */}
        <div className="flex items-start justify-between text-[#04478E]">
          <div className="flex-grow text-right">
            <div className="font-bold text-lg line-clamp-2 mb-1">
              ספר {bookTypeName}: {name}
            </div>
            
            {/* Members Avatars under title */}
            <div 
              onClick={handleMembersClick}
              className="flex justify-start overflow-hidden cursor-pointer hover:opacity-80 transition-opacity mb-2"
              style={{ direction: 'rtl' }}
            >
                 {members.slice(0, 7).map((member, i) => {
                   const emailInitials = member.email ? member.email.substring(0, 2).toUpperCase() : '??';
                   
                   return (
                     <div key={i} className="relative inline-block w-[30px] h-[30px] rounded-full border-2 border-white bg-gradient-to-br from-[#027EC5] to-[#003A92] flex items-center justify-center overflow-hidden">
                        {member.pic ? (
                          <img 
                            src={member.pic} 
                            alt={member.email} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-[10px] font-bold">{emailInitials}</span>
                        )}
                     </div>
                   );
                 })}
            </div>
            
            {booksReaded > 0 && (
              <div className="text-xs text-gray-500">ספרים שהושלמו: {booksReaded}</div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded text-[#04478E] hover:bg-gray-50 transition-colors"
            >
              <img src="/share.png" alt="share" className="w-4 h-4" />
              <span className="text-sm">שיתוף</span>
            </button>
            {canEdit && (
              <button 
                onClick={() => onEdit && onEdit(group)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded text-[#04478E] hover:bg-gray-50 transition-colors"
                style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
              >
                <img src="/edit.png" alt="edit" className="w-4 h-4" />
                <span className="text-sm">עריכה</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Row */}
        <div className="pt-3">
            <div className="flex items-center gap-4">
                {/* Progress bar container with labels */}
                <div className="flex-grow">
                    {/* Progress bar with book icon */}
                    <div className="h-2 bg-[#E9F4FF] rounded-full overflow-visible relative mb-1">
                      <div 
                         className="h-full bg-[#04478E] rounded-full"
                         style={{ width: `${progress}%` }}
                      ></div>
                      {/* Book icon positioned above progress bar */}
                      <img 
                        src={bookIcon} 
                        alt="Progress" 
                        className="w-5 h-5 absolute z-10"
                        style={{ right: `${Math.min(progress, 100)}%`, transform: 'translateX(50%)', bottom: '100%', marginBottom: '2px' }}
                      />
                    </div>
                    
                    {/* Labels row below progress bar */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{book.length}/{max}</span>
                        <span className="text-sm text-gray-500">סיום הספר</span>
                    </div>
                </div>
                
                {/* Sun icon on the left */}
                <img src="/sun.png" alt="Sun" className="w-8 h-8 opacity-80 flex-shrink-0" />
            </div>
        </div>

        {/* Action Button & Status */}
        <div className="flex items-center">
             <div className="flex-grow text-right">
                {inProgress.length > 0 && (
                  <div className="flex items-center gap-2 mb-1">
                    <img src={sunglassesIcon} alt="reading" className="w-5 h-5" />
                    <span className="text-xs text-gray-500">{inProgress.length} פרקים בקריאה כעת</span>
                  </div>
                )}
                {dedicatedTo && (
                  <div className="flex items-center gap-2">
                    <img 
                      src={getIntentionIcon(intention)} 
                      alt="intention" 
                      className="w-6 h-6 flex-shrink-0" 
                      style={{ filter: 'brightness(0) saturate(100%) invert(18%) sepia(89%) saturate(1729%) hue-rotate(200deg) brightness(95%) contrast(101%)' }}
                    />
                    <div className="text-xs text-gray-500 line-clamp-2 flex-1 text-right">
                      {getIntentionPrefix(intention)} {dedicatedTo}
                    </div>
                  </div>
                )}
             </div>

             <button 
               onClick={() => navigate(`/group/${group.id}`)}
               className="bg-[#027EC5] text-white px-4 py-1 rounded shadow font-bold hover:bg-[#026aa6] transition"
             >
                {inProgress.length === 0 ? 'לתחילת הקריאה' : 'להמשך קריאה'}
             </button>
        </div>

      </div>
    </div>
  );
}
