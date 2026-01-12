import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Parse from '../services/parse';
import { FaArrowRight, FaUser, FaEllipsisV } from 'react-icons/fa';
import bookIcon from '../assets/icons/book.svg';
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

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null); // Track which member's menu is open

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const query = new Parse.Query('NewGroup');
      const result = await query.get(groupId);
      
      setGroup({
        id: result.id,
        ...result.attributes
      });
    } catch (error) {
      console.error('Error fetching group details:', error);
      alert('שגיאה בטעינת פרטי הקבוצה');
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (memberEmail, currentAdminStatus) => {
    try {
      const query = new Parse.Query('NewGroup');
      const result = await query.get(groupId);
      const updatedMembers = result.get('members').map(member => {
        if (member.email === memberEmail) {
          return { ...member, admin: !currentAdminStatus };
        }
        return member;
      });
      
      result.set('members', updatedMembers);
      await result.save();
      
      // Update local state
      setGroup(prev => ({ ...prev, members: updatedMembers }));
      setActiveMenu(null);
      
      alert(currentAdminStatus ? 'המשתמש הוסר מתפקיד מנהל' : 'המשתמש הוגדר כמנהל');
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('שגיאה בעדכון הרשאות המשתמש');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">טוען...</div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  const {
    name,
    description = '',
    bookType,
    members = [],
    book = [],
    max = 0,
    booksReaded = 0,
    global = false,
    ownerName = '',
    ownerEmail = '',
    intention = '',
    dedicatedTo = ''
  } = group;

  const bookTypeName = getBookTypeName(bookType);
  const progress = max > 0 ? (book.length / max) * 100 : 0;
  const isOwner = currentUser?.get?.('email') === ownerEmail;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3E61A4] via-[#C7D8E9] to-[#C7D8E9]">
      {/* Header */}
      <div className="bg-[#04478E] text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/feed')}
            className="text-white hover:text-gray-200"
          >
            <FaArrowRight size={24} />
          </button>
          <h1 className="text-xl font-bold">פרטי הקבוצה</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        
        {/* Group Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-4 mb-4">
            <img src={bookIcon} alt="Book" className="w-8 h-8 text-[#04478E]" />
            <div className="flex-1 text-right">
              <h2 className="text-2xl font-bold text-[#04478E] mb-2">
                ספר {bookTypeName}: {name}
              </h2>
              {description && (
                <p className="text-gray-600 mb-2">{description}</p>
              )}
              {dedicatedTo && (
                <div className="flex items-center gap-2 mb-2" style={{ direction: 'rtl' }}>
                  <img src={getIntentionIcon(intention)} alt="intention" className="w-5 h-5" />
                  <span className="text-sm text-gray-500">{getIntentionPrefix(intention)} {dedicatedTo}</span>
                </div>
              )}
              <p className="text-sm text-gray-500">
                <span className="font-bold">מנהל הקבוצה:</span> {ownerName}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-bold">סוג:</span> {global ? 'קבוצה כללית' : 'קבוצה פרטית'}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>התקדמות: {book.length}/{max}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-[#E9F4FF] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#04478E] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {booksReaded > 0 && (
              <p className="text-sm text-gray-500 text-right">
                ספרים שהושלמו: {booksReaded}
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => navigate(`/group/${groupId}`)}
              className="bg-[#027EC5] text-white px-8 py-3 rounded-lg shadow-lg font-bold hover:bg-[#026aa6] transition"
            >
              לתחילת הקריאה
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg shadow-md p-6 overflow-visible">
          <h3 className="text-xl font-bold text-[#04478E] mb-4 text-right">
            חברי הקבוצה ({members.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto overflow-x-visible">
            {members.length === 0 ? (
              <p className="text-gray-500 text-center">אין חברים בקבוצה</p>
            ) : (
              members.map((member, index) => {
                const emailInitials = member.email ? member.email.substring(0, 2).toUpperCase() : '??';
                const memberName = member.name || member.email || 'משתמש';
                const isCurrentMemberOwner = member.email === ownerEmail;
                
                return (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors relative"
                  >
                    {/* Avatar */}
                    <div className="relative inline-block w-12 h-12 rounded-full border-2 border-[#04478E] bg-gradient-to-br from-[#027EC5] to-[#003A92] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {member.pic ? (
                        <img 
                          src={member.pic} 
                          alt={memberName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-bold">{emailInitials}</span>
                      )}
                    </div>
                    
                    {/* Member Info */}
                    <div className="flex-1 text-right">
                      <div className="font-bold text-[#04478E]">{memberName}</div>
                      {member.admin && (
                        <span className="inline-block mt-1 text-xs bg-[#027EC5] text-white px-2 py-1 rounded">
                          מנהל
                        </span>
                      )}
                    </div>
                    
                    {/* Three dots menu for owner (only for non-owner members) */}
                    {isOwner && !isCurrentMemberOwner && (
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === index ? null : index)}
                          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <FaEllipsisV className="text-gray-600" />
                        </button>
                        
                        {activeMenu === index && (
                          <>
                            {/* Backdrop to close menu */}
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setActiveMenu(null)}
                            />
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 min-w-[150px]">
                              <button
                                onClick={() => toggleAdminStatus(member.email, member.admin)}
                                className="w-full px-4 py-2 text-right hover:bg-gray-100 transition-colors text-sm text-gray-800 rounded-lg"
                              >
                                {member.admin ? 'הסר מנהל' : 'הגדר כמנהל'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
