import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import zhitIcon from '../assets/icons/vi.png';
import dedicationIcon from '../assets/icons/dedication.png';
import hazlahaIcon from '../assets/icons/hazlaha.png';
import zarakayamaIcon from '../assets/icons/zarakayama.png';
import refuaIcon from '../assets/icons/refua.png';
import otherIcon from '../assets/icons/other.png';
import tanyaIconImg from '../assets/icons/tanya_icon.svg';
import menuBookIcon from '../assets/icons/menu_book.png';

const booksType = [
  { text: 'תניא', icon: tanyaIconImg, type: '1' },
  { text: 'תהילים', icon: menuBookIcon, type: '2' },
  { text: 'משניות', icon: menuBookIcon, type: '3' },
];

const intentions = [
  { text: 'זכות', icon: zhitIcon, type: '1' },
  { text: 'ע״נ', icon: dedicationIcon, type: '2' },
  { text: 'הצלחה', icon: hazlahaIcon, type: '3' },
  { text: 'זחו״ק', icon: zarakayamaIcon, type: '4' },
  { text: 'רפואה', icon: refuaIcon, type: '5' },
  { text: 'אחר', icon: otherIcon, type: '7' },
];

export default function CreateGroupModal({ isOpen, onClose, onSubmit }) {
  const [groupType, setGroupType] = useState(1); // 1=private, 2=public
  const [bookType, setBookType] = useState('1');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupDedication, setGroupDedication] = useState('');
  const [groupIntention, setGroupIntention] = useState('1');
  const [bookImage, setBookImage] = useState('');
  
  const [errors, setErrors] = useState({
    name: false,
    description: false,
    dedication: false,
  });

  const handleSubmit = () => {
    // Validate
    const newErrors = {
      name: !groupName || groupName.trim() === '',
      description: !groupDescription || groupDescription.trim() === '',
      dedication: !groupDedication || groupDedication.trim() === '',
    };
    
    setErrors(newErrors);
    
    if (newErrors.name || newErrors.description || newErrors.dedication) {
      return;
    }
    
    // Submit
    onSubmit({
      groupType,
      bookType,
      groupName,
      groupDescription,
      groupDedication,
      groupIntention,
      bookImage,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-6 text-center border-b">
          <div className="flex justify-between items-center mb-2">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
            <h2 className="text-[#04478E] text-xl font-bold flex-grow">
              איזו התרגשות לפתוח ספר חדש!
            </h2>
            <div className="w-6"></div> {/* Spacer for alignment */}
          </div>
          <p className="text-gray-700">הספר שלי הוא</p>
        </div>

        {/* Group Type Toggle */}
        <div className="px-6 pt-4 pb-2 flex justify-center">
          <div className="inline-flex rounded-lg border-2 border-blue-500 overflow-hidden">
            <button
              onClick={() => setGroupType(1)}
              className={`px-8 py-2 font-bold transition-colors ${
                groupType === 1
                  ? 'bg-[#027EC5] text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              פרטי
            </button>
            <button
              onClick={() => setGroupType(2)}
              className={`px-8 py-2 font-bold transition-colors ${
                groupType === 2
                  ? 'bg-[#027EC5] text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              כללי
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-[#E9F4FF] p-6 space-y-4">
          {/* Book Type Selection */}
          <div>
            <label className="block text-sm font-bold mb-2 text-right">
              איזה ספר תרצו לחלק?
            </label>
            <select
              value={bookType}
              onChange={(e) => setBookType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded bg-[#E9F4FF] text-right font-bold focus:outline-none focus:border-blue-500"
            >
              {booksType.map((book) => (
                <option key={book.type} value={book.type}>
                  {book.text}
                </option>
              ))}
            </select>
          </div>

          {/* Group Name */}
          <div>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="שם הספר / קבוצת קריאה"
              className={`w-full p-3 border rounded text-right bg-white focus:outline-none ${
                errors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Group Description */}
          <div>
            <input
              type="text"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="תיאור קצר על הקבוצה"
              className={`w-full p-3 border rounded text-right bg-white focus:outline-none ${
                errors.description ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Dedication Row */}
          <div className="flex gap-2">
            {/* Dedication Input */}
            <input
              type="text"
              value={groupDedication}
              onChange={(e) => setGroupDedication(e.target.value)}
              placeholder="הספר מוקדש ל"
              className={`flex-grow p-3 border rounded text-right bg-white focus:outline-none ${
                errors.dedication ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
            />

            {/* Intention Dropdown */}
            <select
              value={groupIntention}
              onChange={(e) => setGroupIntention(e.target.value)}
              className="w-32 p-3 border border-gray-300 rounded bg-[#E9F4FF] text-right font-bold focus:outline-none focus:border-blue-500"
            >
              {intentions.map((intent) => (
                <option key={intent.type} value={intent.type}>
                  {intent.text}
                </option>
              ))}
            </select>
          </div>

          {/* Book Image URL */}
          <div>
            <input
              type="url"
              value={bookImage}
              onChange={(e) => setBookImage(e.target.value)}
              placeholder="קישור לתמונת הספר (אופציונלי)"
              className="w-full p-3 border border-gray-300 rounded text-right bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-[#E9F4FF] px-6 pb-6 rounded-b-lg">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#027EC5] text-white py-3 rounded font-bold text-lg hover:bg-[#026aa6] transition"
          >
            צור קבוצה
          </button>
        </div>
      </div>
    </div>
  );
}
