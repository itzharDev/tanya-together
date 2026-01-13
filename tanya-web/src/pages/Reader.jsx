import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSSR } from '../context/SSRContext';
import Parse from '../services/parse';
import { getHebrewGematria } from '../utils/hebrew';
import { FaArrowLeft, FaEllipsisV, FaCheck, FaRandom } from 'react-icons/fa';
import tanyaIcon from '../assets/icons/tanya_icon.svg';
import { getIntentionPrefix } from '../constants/groupTypes';

export default function Reader() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const ssrData = useSSR();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [part, setPart] = useState(null);
  const [url, setUrl] = useState('');
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [membershipChecked, setMembershipChecked] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [PDFComponents, setPDFComponents] = useState(null);

  // Load react-pdf dynamically on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-pdf').then((module) => {
        const { Document, Page, pdfjs } = module;
        // Set up PDF.js worker
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        setPDFComponents({ Document, Page });
        setIsClient(true);
      });
      
      // Import CSS dynamically
      import('react-pdf/dist/Page/AnnotationLayer.css');
      import('react-pdf/dist/Page/TextLayer.css');
    }
  }, []);

  // Set page width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== 'undefined') {
        setPageWidth(Math.min(window.innerWidth, 800));
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    if (groupId) {
      loadGroupAndPart();
    }
  }, [groupId]);

  // Check membership after group loads (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined' || !group || membershipChecked) return;
    
    const checkMembership = () => {
      const members = group.members || [];
      const userEmail = currentUser?.get('email');
      
      // Only show popup if user is logged in and not a member
      if (currentUser && userEmail && !members.some(m => m.email === userEmail)) {
        setShowJoinPopup(true);
      }
      
      setMembershipChecked(true);
    };
    
    checkMembership();
  }, [group, currentUser, membershipChecked]);

  // Cleanup: remove part from inProgress when component unmounts (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server
    
    return () => {
      if (group && part) {
        // Async cleanup - remove from inProgress if user leaves without finishing
        const cleanup = async () => {
          try {
            const query = new Parse.Query('NewGroup');
            const g = await query.get(group.id);
            const partStr = part.toString();
            const inProgressData = g.get('inProgressData') || {};
            
            // Remove from inProgressData
            delete inProgressData[partStr];
            
            g.set('inProgressData', inProgressData);
            g.set('inProgress', Object.keys(inProgressData)); // Update legacy array
            await g.save();
          } catch (error) {
            console.error('Cleanup error:', error);
          }
        };
        cleanup();
      }
    };
  }, [group, part]);

  // Update meta tags for social sharing (client-side only)
  useEffect(() => {
    if (typeof document === 'undefined') return; // Skip on server
    
    if (group) {
      document.title = `ספר ${group.name} - תניא המחולק`;
      
      // Update or create meta tags
      const updateMetaTag = (property, content) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      updateMetaTag('og:title', `ספר ${group.name}`);
      updateMetaTag('og:description', `קרא את ספר ${group.name} - תניא המחולק`);
      if (group.bookImage) {
        updateMetaTag('og:image', group.bookImage);
      }
      updateMetaTag('og:type', 'website');
    }
  }, [group]);

  const getRandomWithExclusion = (start, end, exclude) => {
    const available = [];
    for (let i = start; i <= end; i++) {
        if (!exclude.includes(i)) available.push(i);
    }
    if (available.length === 0) return null; // No parts left
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  };

  const cleanupStaleInProgress = async (group) => {
    // Clean up parts that have been in progress for more than 2 hours
    const TWO_HOURS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const now = Date.now();
    
    const inProgressData = group.get('inProgressData') || {};
    const updatedInProgressData = {};
    
    // Keep only entries that are less than 2 hours old
    Object.keys(inProgressData).forEach(partNum => {
      const timestamp = inProgressData[partNum];
      if (now - timestamp < TWO_HOURS) {
        updatedInProgressData[partNum] = timestamp;
      }
    });
    
    // Update if there were any changes
    if (Object.keys(updatedInProgressData).length !== Object.keys(inProgressData).length) {
      group.set('inProgressData', updatedInProgressData);
      // Also update the legacy inProgress array for backward compatibility
      group.set('inProgress', Object.keys(updatedInProgressData));
      await group.save();
    }
    
    return updatedInProgressData;
  };

  const loadGroupAndPart = async () => {
    setLoading(true);
    try {
        // Fetch Group
        const query = new Parse.Query('NewGroup');
        const g = await query.get(groupId);
        
        // Clean up stale inProgress entries first
        const cleanedInProgressData = await cleanupStaleInProgress(g);
        
        let localGroup = {
            id: g.id,
            ...g.attributes,
            // Ensure arrays exist
            book: g.get('book') || [],
            inProgress: Object.keys(cleanedInProgressData),
            max: g.get('max') || 0,
            bookType: g.get('bookType') || '1',
            name: g.get('name'),
            bookImage: g.get('bookImage') || null,
            booksReaded: g.get('booksReaded') || 0,
            dedicatedTo: g.get('dedicatedTo') || '',
            intention: g.get('intention') || '1',
        };
        
        // Determine Part - exclude both completed and in-progress parts
        const exclude = [
            ...localGroup.book.map(Number),
            ...localGroup.inProgress.map(Number)
        ];
        
        let selectedPart = getRandomWithExclusion(1, localGroup.max, exclude);
        
        if (!selectedPart) {
            if (typeof window !== 'undefined') {
              alert("אין עוד פרקים זמינים לקריאה!");
              navigate('/feed');
            }
            return;
        }

        // Update Server: Add to inProgress with timestamp
        const partStr = selectedPart.toString();
        if (!localGroup.inProgress.includes(partStr)) {
             const inProgressData = g.get('inProgressData') || {};
             inProgressData[partStr] = Date.now(); // Store current timestamp
             
             g.set('inProgressData', inProgressData);
             g.set('inProgress', Object.keys(inProgressData)); // Update legacy array
             await g.save();
             
             localGroup.inProgress.push(partStr);
        }

        // Construct URL
        let contentUrl = '';
        if (localGroup.bookType === '1' || localGroup.bookType === '3') {
            contentUrl = `https://s3.amazonaws.com/DvarMalchus/tanya/socialTanya/${selectedPart}.pdf`;
        } else if (localGroup.bookType === '2') {
            const hebrewPart = getHebrewGematria(selectedPart);
            contentUrl = `https://nerlazadik.co.il/תהילים/תהילים-פרק-${hebrewPart}/`;
        }

        setGroup(localGroup);
        setPart(selectedPart);
        setUrl(contentUrl);
        setMembershipChecked(false); // Reset for new group load

    } catch (error) {
        console.error("Error loading group:", error);
        if (typeof window !== 'undefined') {
          alert("שגיאה בטעינת התוכן");
          navigate('/feed');
        }
    } finally {
        setLoading(false);
    }
  };

  const handleBackWithoutFinish = async () => {
      if (!group || !part) return;
      
      try {
          const query = new Parse.Query('NewGroup');
          const g = await query.get(group.id);
          
          const partStr = part.toString();
          const inProgressData = g.get('inProgressData') || {};
          
          // Remove from inProgressData
          delete inProgressData[partStr];
          
          g.set('inProgressData', inProgressData);
          g.set('inProgress', Object.keys(inProgressData)); // Update legacy array
          await g.save();
      } catch (error) {
          console.error('Error removing from inProgress:', error);
      }
  };

  const handleBack = async () => {
      await handleBackWithoutFinish();
      navigate('/feed');
  };

  const handleFinish = async () => {
      if (!group || !part) {
          return;
      }
      
      // Trigger button animation
      setButtonClicked(true);
      setTimeout(() => setButtonClicked(false), 600);
      
      try {
          const query = new Parse.Query('NewGroup');
          const g = await query.get(group.id);
          
          const partStr = part.toString();
          const inProgressData = g.get('inProgressData') || {};
          let book = g.get('book') || [];
          let booksReaded = g.get('booksReaded') || 0;
          const max = g.get('max') || 0;
          
          // Remove from inProgressData
          delete inProgressData[partStr];
          
          // Add to book (read)
          if (!book.includes(partStr)) {
              book.push(partStr);
          }
          
          // Check if this was the last part (book completed)
          if (book.length >= max) {
              booksReaded += 1;
              book = []; // Reset book array for next cycle
              if (typeof window !== 'undefined') {
                alert(`מזל טוב! השלמתם את הספר! ספרים שהושלמו: ${booksReaded}`);
              }
          }
          
          g.set('inProgressData', inProgressData);
          g.set('inProgress', Object.keys(inProgressData)); // Update legacy array
          g.set('book', book);
          g.set('booksReaded', booksReaded);
          await g.save();
          
          // Update local state
          setGroup(prev => ({ ...prev, book, booksReaded, inProgress: Object.keys(inProgressData) }));
          
          // Show success popup instead of navigating away
          if (typeof window !== 'undefined') {
            setShowSuccessPopup(true);
          }
      } catch (error) {
          console.error("Error finishing part:", error);
          if (typeof window !== 'undefined') {
            alert('שגיאה בש׷ירת התקדמות: ' + error.message);
          }
      }
  };

  const handleJoinGroup = async () => {
    if (!currentUser) {
      // Redirect to login
      navigate('/login', { state: { from: `/group/${groupId}` } });
      return;
    }
    
    try {
      const query = new Parse.Query('NewGroup');
      const g = await query.get(groupId);
      const members = g.get('members') || [];
      const userEmail = currentUser.get('email');
      const userName = currentUser.get('displayName') || currentUser.get('email') || 'משתמש';
      const userPhoto = currentUser.get('photoUrl') || '';
      
      if (!members.some(m => m.email === userEmail)) {
        members.push({
          email: userEmail,
          name: userName,
          pic: userPhoto
        });
        g.set('members', members);
        await g.save();
        
        // Update local state
        setGroup(prev => ({ ...prev, members }));
      }
      
      setShowJoinPopup(false);
    } catch (error) {
      console.error('Error joining group:', error);
      alert('שגיאה בהצטרפות לקבוצה');
    }
  };

  const handleDeclineJoin = () => {
    setShowJoinPopup(false);
  };

  const handleGetDifferentPart = async () => {
    if (!group || !part) return;
    
    try {
      setLoading(true);
      
      // Remove current part from inProgress
      const query = new Parse.Query('NewGroup');
      const g = await query.get(group.id);
      
      const partStr = part.toString();
      const inProgressData = g.get('inProgressData') || {};
      
      // Remove current part from inProgressData
      delete inProgressData[partStr];
      
      g.set('inProgressData', inProgressData);
      g.set('inProgress', Object.keys(inProgressData));
      await g.save();
      
      // Get a new random part
      const cleanedInProgressData = await cleanupStaleInProgress(g);
      
      const updatedGroup = {
        ...group,
        inProgress: Object.keys(cleanedInProgressData)
      };
      
      // Determine new Part - exclude both completed and in-progress parts
      const exclude = [
        ...updatedGroup.book.map(Number),
        ...updatedGroup.inProgress.map(Number)
      ];
      
      let newPart = getRandomWithExclusion(1, updatedGroup.max, exclude);
      
      if (!newPart) {
        if (typeof window !== 'undefined') {
          alert("אין עוד פרקים זמינים לקריאה!");
          navigate('/feed');
        }
        return;
      }
      
      // Add new part to inProgress
      const newPartStr = newPart.toString();
      const updatedInProgressData = g.get('inProgressData') || {};
      updatedInProgressData[newPartStr] = Date.now();
      
      g.set('inProgressData', updatedInProgressData);
      g.set('inProgress', Object.keys(updatedInProgressData));
      await g.save();
      
      // Construct new URL
      let contentUrl = '';
      if (updatedGroup.bookType === '1' || updatedGroup.bookType === '3') {
        contentUrl = `https://s3.amazonaws.com/DvarMalchus/tanya/socialTanya/${newPart}.pdf`;
      } else if (updatedGroup.bookType === '2') {
        const hebrewPart = getHebrewGematria(newPart);
        contentUrl = `https://nerlazadik.co.il/תהילים/תהילים-פרק-${hebrewPart}/`;
      }
      
      // Update state
      setGroup({ ...updatedGroup, inProgress: Object.keys(updatedInProgressData) });
      setPart(newPart);
      setUrl(contentUrl);
      
    } catch (error) {
      console.error('Error getting different part:', error);
      alert('שגיאה בקבלת קטע אחר');
    } finally {
      setLoading(false);
    }
  };

  // Show SSR data or loading state
  if (loading && !ssrData) {
    return <div className="text-center mt-20">טוען...</div>;
  }

  // Use SSR data if client data hasn't loaded yet
  const displayGroup = group || (ssrData ? { name: ssrData.name, bookImage: ssrData.bookImage } : null);

  if (!displayGroup) {
    return <div className="text-center mt-20">טוען...</div>;
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, rgb(62, 97, 164) 0%, rgb(199, 216, 233) 30%, rgb(199, 216, 233) 100%)' }}>
       {/* Header */}
       <div className="p-4 text-white flex items-center justify-between">
            <button onClick={handleBack}><FaArrowLeft /></button>
            <div className="flex flex-col items-center">
              {group?.dedicatedTo ? (
                <div className="font-bold text-lg text-center">
                  {getIntentionPrefix(group.intention || '1')} {group.dedicatedTo}
                </div>
              ) : (
                <div className="font-bold text-lg">ספר {displayGroup.name}</div>
              )}
              {group?.booksReaded > 0 && (
                <div className="text-xs text-white/80">ספרים שהושלמו: {group.booksReaded}</div>
              )}
            </div>
            <button><FaEllipsisV /></button>
       </div>

       {/* Progress Info - Only show for authenticated users */}
       {currentUser && (
       <div className="px-6 pb-4 text-white">
           <div className="flex justify-between text-sm mb-1">
               <span>{group?.book?.length}/{group?.max}</span>
               <span>סיום הספר</span>
           </div>
           
           <div className="h-2 bg-[#E9F4FF]/20 rounded-full overflow-hidden">
               <div className="h-full bg-white transition-all duration-500" style={{ width: `${(group?.book?.length / group?.max) * 100}%` }}></div>
           </div>
           
           <div className="text-right text-sm mt-2">
               {group?.inProgress?.length} פרקים בקריאה כעת
           </div>
       </div>
       )}

       {/* Viewer */}
       <div className="flex-grow relative bg-white" style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
           {group?.bookType === '2' ? (
               <iframe 
                 src={url} 
                 title="Content"
                 className="w-full h-full border-0"
                 scrolling="yes"
                 // Note: Sandbox might block scripts on target site, but needed for security if creating generic viewer
                 // sandbox="allow-scripts allow-same-origin"
               />
           ) : (
               // PDF Viewer using react-pdf (client-side only)
               <div className="w-full flex flex-col items-center py-4">
                 {!isClient || !PDFComponents ? (
                   <div className="flex flex-col items-center justify-center h-64 gap-4">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#027EC5]"></div>
                     <div className="text-gray-500">טוען...</div>
                   </div>
                 ) : (() => {
                   const { Document, Page } = PDFComponents;
                   return (
                     <>
                       <Document
                         file={url}
                     onLoadSuccess={onDocumentLoadSuccess}
                     loading={
                       <div className="flex flex-col items-center justify-center h-64 gap-4">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#027EC5]"></div>
                         <div className="text-gray-500">טוען PDF...</div>
                       </div>
                     }
                         error={
                           <div className="flex items-center justify-center h-64 text-red-500">
                             שגיאה בטעינת PDF
                           </div>
                         }
                       >
                         {numPages && Array.from(new Array(numPages), (el, index) => (
                           <Page
                             key={`page_${index + 1}`}
                             pageNumber={index + 1}
                             width={pageWidth}
                             renderTextLayer={true}
                             renderAnnotationLayer={true}
                             className="mb-4 shadow-lg"
                           />
                         ))}
                       </Document>
                       {numPages && (
                         <div className="text-gray-500 text-sm mt-4 mb-8">
                           סה"כ {numPages} עמודים
                         </div>
                       )}
                     </>
                   );
                 })()}
               </div>
           )}
       </div>

       {/* Action Buttons - Fixed to bottom corners */}
       <div className="fixed bottom-10 left-6 z-30">
           <button 
             onClick={handleFinish}
             className={`bg-[#10AC52] text-white w-16 h-16 rounded-lg shadow-lg flex flex-col items-center justify-center hover:bg-[#0e9647] transition-transform ${
               buttonClicked ? 'scale-125 rotate-12' : 'scale-100'
             }`}
           >
              <FaCheck className="text-xl mb-1" />
              <span className="text-[10px] font-bold text-center leading-tight">קראתי<br/>את הקטע</span>
           </button>
       </div>
       
       {/* Get Different Part Button - Fixed to bottom right */}
       <div className="fixed bottom-10 right-6 z-30">
           <button 
             onClick={handleGetDifferentPart}
             disabled={loading}
             className="bg-[#FF9800] text-white w-16 h-16 rounded-lg shadow-lg flex flex-col items-center justify-center hover:bg-[#F57C00] disabled:opacity-50 disabled:cursor-not-allowed"
           >
              <FaRandom className="text-xl mb-1" />
              <span className="text-[10px] font-bold text-center leading-tight">קבל<br/>קטע אחר</span>
           </button>
       </div>

       {/* Dedication Text - Bottom Static */}
       <div className="bg-white/90 py-2 text-center text-gray-700 text-sm">
         לע"נ יוסף חיים יעקב בן מיכאל סאסי אביטבול ז"ל
       </div>

       {/* Success Popup - Read Another Part */}
       {showSuccessPopup && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSuccessPopup(false)}>
           <div className="bg-white rounded-lg p-6 mx-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
             <div className="text-center mb-6">
               <div className="text-6xl mb-4">✅</div>
               <h2 className="text-2xl font-bold text-[#10AC52] mb-2">
                 כל הכבוד!
               </h2>
               <p className="text-gray-700">
                 סיימת את הקטע
               </p>
             </div>
             <div className="flex flex-col gap-3">
               <button
                 onClick={() => {
                   setShowSuccessPopup(false);
                   handleGetDifferentPart();
                 }}
                 className="w-full px-6 py-3 bg-[#027EC5] text-white rounded-lg font-bold hover:bg-[#026aa6] transition text-lg"
               >
                 לקריאת קטע נוסף
               </button>
               
               <a
                 href={`https://wa.me/972555637282?text=${encodeURIComponent(
                   `היי,\nאני מעוניין לקבל תזכורת להמשך לימוד בקבוצה:\n${window.location.origin}/group/${groupId}`
                 )}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="w-full px-6 py-3 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#20BA5A] transition flex items-center justify-center gap-2"
               >
                 <span>📲</span>
                 הרשם לקבלת תזכורת להמשך לימוד
               </a>
               
               <button
                 onClick={() => {
                   setShowSuccessPopup(false);
                   navigate('/feed');
                 }}
                 className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
               >
                 חזרה לעמוד הראשי
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Join Group Popup */}
       {showJoinPopup && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleDeclineJoin}>
           <div className="bg-white rounded-lg p-6 mx-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
             <h2 className="text-xl font-bold text-[#003A92] mb-4 text-center">
               רוצה להצטרף לקבוצה?
             </h2>
             <p className="text-gray-700 mb-6 text-center">
               {currentUser 
                 ? 'הצטרף לקבוצה כדי לראות אותה ברשימת הספרים שלך'
                 : 'יש להתחבר כדי להצטרף לקבוצה. אפשר גם להמשיך לקרוא בלי להירשם.'
               }
             </p>
             <div className="flex gap-3">
               <button
                 onClick={handleDeclineJoin}
                 className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
               >
                 המשך בלי להצטרף
               </button>
               <button
                 onClick={handleJoinGroup}
                 className="flex-1 px-4 py-3 bg-[#003A92] text-white rounded-lg font-bold hover:bg-[#002a6b]"
               >
                 {currentUser ? 'הצטרף לקבוצה' : 'התחבר והצטרף'}
               </button>
             </div>
           </div>
         </div>
       )}

    </div>
  );
}
