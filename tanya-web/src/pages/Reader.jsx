import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSSR } from '../context/SSRContext';
import Parse from '../services/parse';
import { getHebrewGematria } from '../utils/hebrew';
import { FaArrowLeft, FaEllipsisV, FaCheck } from 'react-icons/fa';
import tanyaIcon from '../assets/icons/tanya_icon.svg'; 

export default function Reader() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const ssrData = useSSR();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [part, setPart] = useState(null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (groupId) {
      loadGroupAndPart();
    }
  }, [groupId]);

  // Cleanup: remove part from inProgress when component unmounts (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server
    
    return () => {
      if (group && part) {
        // Async cleanup - remove from inProgress if user leaves without finishing
        const cleanup = async () => {
          try {
            console.log('Component unmounting - removing part from inProgress:', part);
            const query = new Parse.Query('NewGroup');
            const g = await query.get(group.id);
            let inProgress = g.get('inProgress') || [];
            inProgress = inProgress.filter(p => p !== part.toString());
            g.set('inProgress', inProgress);
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

  const loadGroupAndPart = async () => {
    setLoading(true);
    try {
        // Fetch Group
        const query = new Parse.Query('NewGroup');
        const g = await query.get(groupId);
        
        let localGroup = {
            id: g.id,
            ...g.attributes,
            // Ensure arrays exist
            book: g.get('book') || [],
            inProgress: g.get('inProgress') || [],
            max: g.get('max') || 0,
            bookType: g.get('bookType') || '1',
            name: g.get('name'),
            bookImage: g.get('bookImage') || null,
            booksReaded: g.get('booksReaded') || 0,
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

        console.log('Selected Part:', selectedPart);

        // Update Server: Add to inProgress (for all users - authenticated and anonymous)
        if (!localGroup.inProgress.includes(selectedPart.toString())) {
             localGroup.inProgress.push(selectedPart.toString());
             g.set('inProgress', localGroup.inProgress);
             await g.save();
             console.log('Added part to inProgress:', selectedPart);
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
          console.log('Removing part from inProgress (user left without finishing):', part);
          const query = new Parse.Query('NewGroup');
          const g = await query.get(group.id);
          
          let inProgress = g.get('inProgress') || [];
          inProgress = inProgress.filter(p => p !== part.toString());
          
          g.set('inProgress', inProgress);
          await g.save();
          console.log('Removed from inProgress');
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
          console.log('No group or part');
          return;
      }
      
      try {
          console.log('Finishing part:', part, 'for group:', group.id);
          
          const query = new Parse.Query('NewGroup');
          const g = await query.get(group.id);
          
          let inProgress = g.get('inProgress') || [];
          let book = g.get('book') || [];
          let booksReaded = g.get('booksReaded') || 0;
          const max = g.get('max') || 0;
          
          console.log('Before update - inProgress:', inProgress, 'book:', book, 'booksReaded:', booksReaded);
          
          // Remove from inProgress
          inProgress = inProgress.filter(p => p !== part.toString());
          
          // Add to book (read)
          if (!book.includes(part.toString())) {
              book.push(part.toString());
          }
          
          // Check if this was the last part (book completed)
          if (book.length >= max) {
              console.log('מזל טוב! הספר הושלם!');
              booksReaded += 1;
              book = []; // Reset book array for next cycle
              if (typeof window !== 'undefined') {
                alert(`מזל טוב! השלמתם את הספר! ספרים שהושלמו: ${booksReaded}`);
              }
          }
          
          console.log('After update - inProgress:', inProgress, 'book:', book, 'booksReaded:', booksReaded);
          
          g.set('inProgress', inProgress);
          g.set('book', book);
          g.set('booksReaded', booksReaded);
          await g.save();
          
          console.log('Successfully saved!');
          
          if (typeof window !== 'undefined') {
            navigate('/feed');
          }
      } catch (error) {
          console.error("Error finishing part:", error);
          if (typeof window !== 'undefined') {
            alert('שגיאה בשׇירת התקדמות: ' + error.message);
          }
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
    <div className="flex flex-col h-screen bg-[#E9F4FF]">
       {/* Header */}
       <div className="bg-[#003A92] p-4 text-white flex items-center justify-between">
            <button onClick={handleBack}><FaArrowLeft /></button>
            <div className="flex flex-col items-center">
              <div className="font-bold text-lg">ספר {displayGroup.name}</div>
              {group?.booksReaded > 0 && (
                <div className="text-xs text-[#E9F4FF]/80">ספרים שהושלמו: {group.booksReaded}</div>
              )}
            </div>
            <button><FaEllipsisV /></button>
       </div>

       {/* Progress Info - Only show for authenticated users */}
       {currentUser && (
       <div className="bg-[#003A92] px-6 pb-4 text-white">
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
       <div className="flex-grow relative bg-white overflow-hidden">
           {group?.bookType === '2' ? (
               <iframe 
                 src={url} 
                 title="Content"
                 className="w-full h-full border-0"
                 // Note: Sandbox might block scripts on target site, but needed for security if creating generic viewer
                 // sandbox="allow-scripts allow-same-origin"
               />
           ) : (
               <object data={url} type="application/pdf" className="w-full h-full">
                   <p>Browser does not support PDF. <a href={url}>Download</a></p>
               </object>
           )}
       </div>

       {/* Finish Button - Floating */}
       <div className="absolute bottom-10 left-6">
           <button 
             onClick={handleFinish}
             className="bg-[#10AC52] text-white w-16 h-16 rounded-lg shadow-lg flex flex-col items-center justify-center hover:bg-[#0e9647]"
           >
              <FaCheck className="text-xl mb-1" />
              <span className="text-[10px] font-bold text-center leading-tight">סיימתי<br/>את הפרק</span>
           </button>
       </div>

    </div>
  );
}
