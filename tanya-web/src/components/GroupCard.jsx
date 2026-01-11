import React from 'react';
import { FaShareAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import bookIcon from '../assets/icons/book.svg'; 
import sunIcon from '../assets/icons/sun.png';
import tanyaIcon from '../assets/icons/tanya_icon.svg';

// Helper to get Book Type Name
const getBookTypeName = (type) => {
    switch (type) {
        case '1': return 'תניא';
        case '2': return 'תהילים';
        case '3': return 'משנה';
        default: return 'תניא';
    }
};

export default function GroupCard({ group, index }) {
  const navigate = useNavigate();
  const { 
    name, 
    members = [], 
    book = [], 
    max = 0, 
    bookType, 
    inProgress = [] 
  } = group;

  const progress = max > 0 ? (book.length / max) * 100 : 0;
  const bookTypeName = getBookTypeName(bookType);

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-transparent hover:border-blue-100 transition-colors h-full">
      <div className="bg-white rounded-lg p-4 flex flex-col items-stretch space-y-3">
        
        {/* Header: Share | Title | Icon */}
        <div className="flex items-center justify-between text-[#04478E]">
           <div className="flex items-center space-x-2 text-gray-600">
             <FaShareAlt />
             <span className="text-sm">שיתוף</span>
           </div>

           <div className="flex-grow text-right px-4 font-bold text-lg truncate">
             ספר {bookTypeName} {index + 1}: {name}
           </div>

           <img src={bookIcon} alt="Book" className="w-5 h-5 text-[#04478E]" />
        </div>

        {/* Members Avatars (Right Aligned) */}
        <div className="flex justify-end -space-x-2 overflow-hidden py-1">
             {members.slice(0, 7).map((member, i) => (
                 <div key={i} className="relative inline-block w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                    {/* Placeholder for avatar image or icon */}
                    <FaUser className="text-gray-500 text-xs" />
                    {/* Online indicator dot - mock */}
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400 transform translate-x-1/3 -translate-y-1/3"></span>
                 </div>
             ))}
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
             <div className="flex-grow text-right text-sm text-gray-600">
                {inProgress.length > 0 ? `${inProgress.length} פרטים בקריאה כעת` : ''}
             </div>

             <button 
               onClick={() => navigate(`/reader/${group.id}`)}
               className="bg-[#027EC5] text-white px-6 py-2 rounded shadow font-bold hover:bg-[#026aa6] transition"
             >
                {inProgress.length === 0 ? 'לתחילת הקריאה' : 'להמשך קריאה'}
             </button>
        </div>

      </div>
    </div>
  );
}
