import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext'; // Import Socket Context
import Parse from '../services/parse';
import GroupCard from '../components/GroupCard';
import CreateGroupModal from '../components/CreateGroupModal';
import SideMenu from '../components/SideMenu';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEllipsisV } from 'react-icons/fa';

// Icons
import profileIcon from '../assets/icons/profile.png';
import arabicIcon from '../assets/icons/arabic.png';
import listingIcon from '../assets/icons/listing.png';
import menuBookIcon from '../assets/icons/menu_book.png';
import homeIcon from '../assets/icons/home.png';
import appLogo from '/app-logo.png';
import bookSvg from '../assets/icons/book.svg';
import emptyListImg from '/empty-list.png';

const TabButton = ({ isActive, onClick, count, label }) => (
  <div 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center p-2 rounded cursor-pointer border transition-colors ${
        isActive 
            ? 'bg-[#04478E] border-[#04478E] text-white' 
            : 'bg-transparent border-[#04478E] text-[#04478E] hover:bg-white/10'
    }`}
  >
     <span className="font-bold text-sm">{count}</span>
     <span className="text-xs font-bold">{label}</span>
  </div>
);

export default function Feed() {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const { connections, members } = useSocket(); // Use real-time stats
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('private'); // global, shared, private
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  
  const [counts, setCounts] = useState({ global: 0, shared: 0, private: 0 });
  const [groupsCache, setGroupsCache] = useState({ global: null, shared: null, private: null });

  useEffect(() => {
    if (!authLoading) {
      fetchCounts();
      fetchGroups();
    }
  }, [currentUser, authLoading]);

  useEffect(() => {
    // When tab switches, check cache first
    if (!authLoading && currentUser) {
      if (groupsCache[activeTab]) {
        setGroups(groupsCache[activeTab]);
      } else {
        fetchGroups();
      }
    }
  }, [activeTab]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const query = new Parse.Query('NewGroup');
      
      // Apply server-side filtering based on activeTab and user
      if (!currentUser) {
        // Anonymous users: only global groups
        query.equalTo('global', true);
      } else {
        const email = currentUser.get('email');
        
        switch (activeTab) {
          case 'global':
            query.equalTo('global', true);
            break;
          case 'shared':
            // Query for groups where members array contains an object with matching email
            // but user is NOT the owner
            query.equalTo('members.email', email);
            query.notEqualTo('ownerEmail', email);
            break;
          case 'private':
            query.equalTo('ownerEmail', email);
            break;
        }
      }
      
      query.limit(1000);
      const results = await query.find();
      
      const parsedGroups = results.map(g => ({
         id: g.id,
         ...g.attributes 
      }));

      setGroups(parsedGroups);
      
      // Cache the results for this tab
      if (currentUser) {
        setGroupsCache(prev => ({ ...prev, [activeTab]: parsedGroups }));
      }

    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    if (!currentUser) return;
    
    try {
      const email = currentUser.get('email');
      
      // Count global groups
      const globalQuery = new Parse.Query('NewGroup');
      globalQuery.equalTo('global', true);
      const g_global = await globalQuery.count();
      
      // Count shared groups (where user is member but not owner)
      const sharedQuery = new Parse.Query('NewGroup');
      sharedQuery.equalTo('members.email', email);
      sharedQuery.notEqualTo('ownerEmail', email);
      const g_shared = await sharedQuery.count();
      
      // Count private groups
      const privateQuery = new Parse.Query('NewGroup');
      privateQuery.equalTo('ownerEmail', email);
      const g_private = await privateQuery.count();
      
      setCounts({ global: g_global, shared: g_shared, private: g_private });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const handleOpenModal = () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    setEditingGroup(null);
    setIsModalOpen(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleCreateGroup = async (groupData) => {
    if (!currentUser) {
      alert('יש להתחבר כדי ליצור קבוצה');
      return;
    }

    try {
      // Check if editing existing group
      if (groupData.groupId) {
        // Update existing group
        const query = new Parse.Query('NewGroup');
        const group = await query.get(groupData.groupId);
        
        group.set('global', groupData.groupType === 2);
        group.set('description', groupData.groupDescription);
        group.set('name', groupData.groupName);
        group.set('intention', groupData.groupIntention);
        group.set('dedicatedTo', groupData.groupDedication);
        
        // Update book image if provided
        if (groupData.bookImage && groupData.bookImage.trim() !== '') {
          group.set('bookImage', groupData.bookImage);
        } else {
          group.unset('bookImage');
        }
        
        await group.save();
        
        // Close modal, clear cache, and refresh
        setIsModalOpen(false);
        setEditingGroup(null);
        setGroupsCache({ global: null, shared: null, private: null });
        fetchGroups();
        
        alert('הקבוצה עודכנה בהצלחה!');
      } else {
        // Create new group
        const newGroup = new Parse.Object('NewGroup');
        newGroup.set('global', groupData.groupType === 2);
        newGroup.set('description', groupData.groupDescription);
        newGroup.set('ownerId', currentUser.id);
        newGroup.set('ownerName', currentUser.get('displayName') || 'אורח');
        newGroup.set('ownerEmail', currentUser.get('email'));
        newGroup.set('name', groupData.groupName);
        newGroup.set('bookType', groupData.bookType);
        newGroup.set('intention', groupData.groupIntention);
        newGroup.set('dedicatedTo', groupData.groupDedication);
        newGroup.set('book', []);
        newGroup.set('inProgress', []);
        newGroup.set('inProgressData', {}); // New field to track timestamps
        newGroup.set('members', [{
          email: currentUser.get('email'),
          name: currentUser.get('displayName') || currentUser.get('email') || 'משתמש',
          pic: currentUser.get('photoUrl') || '',
          admin: true
        }]); // Add creator as member with name, profile picture and admin rights
        newGroup.set('booksReaded', 0);
        
        // Set max based on book type
        const maxParts = groupData.bookType === '3' ? 525 : groupData.bookType === '2' ? 150 : 385;
        newGroup.set('max', maxParts);

        // Set book image if provided
        if (groupData.bookImage && groupData.bookImage.trim() !== '') {
          newGroup.set('bookImage', groupData.bookImage);
        }

        await newGroup.save();
        
        // Close modal, clear cache, switch to private tab, and refresh
        setIsModalOpen(false);
        setEditingGroup(null);
        setGroupsCache({ global: null, shared: null, private: null });
        setActiveTab('private');
        
        alert('הקבוצה נוצרה בהצלחה!');
      }
    } catch (error) {
      console.error('Error creating/updating group:', error);
      alert('שגיאה בשמירת הקבוצה');
    }
  };

  // Groups are already filtered from server, just return them
  const displayedGroups = groups;

  // Show loading while auth is initializing
  if (authLoading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">טוען...</div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, rgb(62, 97, 164) 0%, rgb(199, 216, 233) 30%, rgb(199, 216, 233) 100%)' }}>
      
      {/* Top Bar */}
      <div className="pt-4 px-4 pb-2 text-white">
          <div className="max-w-7xl mx-auto w-full">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                     {/* Avatar */}
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                        {currentUser?.get('photoUrl') ? (
                            <img src={currentUser.get('photoUrl')} alt="User" />
                        ) : (
                            <FaUser />
                        )}
                     </div>
                  </div>

                  {/* Logo Centered */}
                  <img src={appLogo} alt="Tanya" className="h-8" />

                  {/* Menu Button */}
                  {currentUser ? (
                    <button onClick={() => setIsSideMenuOpen(true)}>
                        <FaEllipsisV />
                    </button>
                  ) : (
                    <button onClick={() => navigate('/login')} className="text-sm font-bold">
                        התחבר
                    </button>
                  )}
              </div>

              <div className="text-right px-2 mb-4">
                  <div className="text-lg">
                      <span className="font-bold">
                        {currentUser ? (currentUser.get('displayName') || 'אורח') : 'אורח'}
                      </span>
                      <span> ,שלום </span>
                  </div>
                  <div className="text-[#E9F4FF]/80 text-sm">
                     איזה ספרים תרצו להשלים היום?
                  </div>
              </div>
              
              {/* Tabs - Only show for authenticated users */}
              {currentUser && (
              <div className="flex gap-2 mb-2 px-1 dir-rtl flex-row-reverse" style={{direction: 'rtl'}}> 
                 <TabButton 
                    label="ספרים כלליים" 
                    count={counts.global} 
                    isActive={activeTab === 'global'} 
                    onClick={() => setActiveTab('global')} 
                 />
                 
                 <TabButton 
                    label="ספרים ששותפו איתך" 
                    count={counts.shared} 
                    isActive={activeTab === 'shared'} 
                    onClick={() => setActiveTab('shared')} 
                 />
                 
                 <TabButton 
                    label="ספרים פרטיים שלך" 
                    count={counts.private} 
                    isActive={activeTab === 'private'} 
                    onClick={() => setActiveTab('private')} 
                 />
              </div>
              )}
          </div>
      </div>

      {/* Main Content List */}
      <div className="flex-grow overflow-y-auto pb-24 pt-2 px-2 sm:px-4">
          {loading ? (
              <div className="text-center mt-10 text-gray-500">טוען...</div>
          ) : displayedGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-20 px-4">
                  <img src={emptyListImg} alt="Empty" className="w-48 h-48 mb-6" />
                  {activeTab === 'private' && (
                      <div className="text-center text-gray-600 text-lg leading-relaxed">
                          <div>עדיין לא פתחת ספר משלך?</div>
                          <div>אל דאגה, לעולם לא מאוחר...</div>
                      </div>
                  )}
              </div>
          ) : (
              <div className="max-w-7xl mx-auto w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {displayedGroups.map((g, idx) => (
                          <GroupCard key={g.id} group={g} index={idx} onEdit={handleEditGroup} currentUser={currentUser} />
                      ))}
                  </div>
              </div>
          )}
      </div>

      {/* Floating Action Button (FAB) replacement - Bottom Left Fixed */}
      <div className="fixed bottom-20 left-4 z-10">
          <button 
            onClick={handleOpenModal}
            className="bg-[#027EC5] text-white w-16 h-16 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-1 hover:bg-[#026aa6]"
          >
              <img src={bookSvg} alt="New" className="w-5 h-5 filter invert brightness-0 saturate-100" style={{filter: 'brightness(0) invert(1)'}} /> 
              {/* SVG color fix via filter or use FaBook */}
              <span className="text-[10px] font-bold text-center leading-tight">לפתיחת<br/>ספר חדש</span>
          </button>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingGroup(null);
        }}
        onSubmit={handleCreateGroup}
        editGroup={editingGroup}
      />

      {/* Side Menu */}
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        currentUser={currentUser}
        onLogout={() => {
          logout();
          navigate('/login');
        }}
      />

      {/* Socket Stats Bar - only show when 10+ connections */}
      {(connections >= 10) && (
          <div className="absolute bottom-16 left-0 right-0 bg-[#DAF2FF] rounded-t-2xl shadow-[0_-4px_-6px_rgba(0,0,0,0.1)] py-2 px-4 z-0">
             <div className="max-w-7xl mx-auto w-full flex justify-around text-[#04478E] font-bold text-center text-xs">
                <div>
                    <div>{connections}</div>
                    <div>מחוברים כעת</div>
                </div>
                <div>
                    <div>{members}</div>
                    <div>משתתפים פעילים</div>
                </div>
             </div>
          </div>
      )}

      {/* Bottom Navigation (Static) */}
      <div className="bg-white border-t border-gray-200 py-2">
          <div className="max-w-7xl mx-auto w-full flex justify-around items-center text-[#04478E] text-xs font-bold">
              {/* Items as per flutter: Profile, Arabic, Listing, Daily, Home */}
              {/* Order in Flutter was: Profile(0), Arabic(1), Listing(2), Daily(3), Home(4) */}
              
              <div className="flex flex-col items-center opacity-50">
                 <img src={profileIcon} className="h-6 w-6 mb-1"/>
                 <span>אישי</span>
              </div>
               <div className="flex flex-col items-center opacity-50">
                 <img src={arabicIcon} className="h-6 w-6 mb-1"/>
                 <span>ערבית</span>
              </div>
               <div className="flex flex-col items-center opacity-50">
                 <img src={listingIcon} className="h-6 w-6 mb-1"/>
                 <span>מוקלט</span>
              </div>
               <div className="flex flex-col items-center opacity-50">
                 <img src={menuBookIcon} className="h-6 w-6 mb-1"/>
                 <span>יומי</span>
              </div>
               <div className="flex flex-col items-center text-[#04478E]">
                 <img src={homeIcon} className="h-6 w-6 mb-1"/>
                 <span>בית</span>
              </div>
          </div>
      </div>

    </div>
  );
}
