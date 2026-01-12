import React from 'react';
import { FaShareAlt, FaUser, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import bookIcon from '../assets/icons/book.svg'; 
import sunIcon from '../assets/icons/sun.png';
import tanyaIcon from '../assets/icons/tanya_icon.svg';
import { getIntentionIcon } from '../constants/groupTypes';

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
      <div className="bg-white rounded-lg p-4 flex flex-col items-stretch space-y-3">
        
        {/* Header: Icon | Title | Share */}
        <div className="flex items-center justify-between text-[#04478E]">
           <img src={bookIcon} alt="Book" className="w-5 h-5 text-[#04478E]" />

          <div className="flex-grow text-right px-4">
            <div className="font-bold text-lg line-clamp-2">
              ספר {bookTypeName} {index + 1}: {name}
            </div>
             {booksReaded > 0 && (
               <div className="text-xs text-gray-500">ספרים שהושלמו: {booksReaded}</div>
             )}
           </div>

           <div className="flex flex-col gap-2">
             <button 
               onClick={handleShare}
               className="flex items-center gap-2 text-gray-600 hover:text-[#04478E] transition-colors cursor-pointer"
             >
               <span className="text-sm">שיתוף</span>
               <FaShareAlt />
             </button>
             {canEdit && (
               <button 
                 onClick={() => onEdit && onEdit(group)}
                 className="flex items-center gap-2 text-gray-600 hover:text-[#04478E] transition-colors cursor-pointer"
               >
                 <span className="text-sm">עריכה</span>
                 <FaEdit />
               </button>
             )}
           </div>
        </div>

        {/* Members Avatars (Right Aligned) */}
        <div 
          onClick={handleMembersClick}
          className="flex justify-start overflow-hidden py-1 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ direction: 'rtl' }}
        >
             {members.slice(0, 7).map((member, i) => {
               // Get first 2 letters from email
               const emailInitials = member.email ? member.email.substring(0, 2).toUpperCase() : '??';
               
               return (
                 <div key={i} className="relative inline-block w-[30px] h-[30px] rounded-full border-2 border-white bg-gradient-to-br from-[#027EC5] to-[#003A92] flex items-center justify-center overflow-hidden">
                    {/* Display member profile picture or email initials */}
                    {member.pic ? (
                      <img 
                        src={member.pic} 
                        alt={member.email} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-[10px] font-bold">{emailInitials}</span>
                    )}
                    {/* Online indicator dot - mock */}
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400 transform translate-x-1/3 -translate-y-1/3"></span>
                 </div>
               );
             })}
        </div>

        {/* Progress Bar Row */}
        <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500 w-16 text-center">{book.length}/{max}</span>
            
            <div className="flex-grow mx-4 h-2 bg-[#E9F4FF] rounded-full overflow-hidden relative">
                 <div 
                    className="h-full bg-[#04478E] rounded-full"
                    style={{ width: `${progress}%` }}
                 ></div>
            </div>

            <img src={sunIcon} alt="Sun" className="w-8 h-8 opacity-80" />
        </div>

        {/* Action Button & Status */}
        <div className="flex items-center mt-2">
             <div className="flex-grow text-right">
                <div className="text-sm text-gray-600 mb-1">
                  {inProgress.length > 0 ? `${inProgress.length} פרטים בקריאה כעת` : ''}
                </div>
                {description && (
                  <div className="flex items-center gap-2">
                    <img src={getIntentionIcon(intention)} alt="intention" className="w-6 h-6 flex-shrink-0" />
                    <div className="text-xs text-gray-500 line-clamp-2 flex-1 text-right">
                      {description}
                    </div>
                  </div>
                )}
             </div>

             <button 
               onClick={() => navigate(`/group/${group.id}`)}
               className="bg-[#027EC5] text-white px-6 py-2 rounded shadow font-bold hover:bg-[#026aa6] transition"
             >
                {inProgress.length === 0 ? 'לתחילת הקריאה' : 'להמשך קריאה'}
             </button>
        </div>

      </div>
    </div>
  );
}
