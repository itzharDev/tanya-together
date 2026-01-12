// Group intention types mapping imported from Flutter project
// Reference: ../lib/core/ioc.dart lines 32-39

import zhitIcon from '../assets/icons/vi.png';
import dedicationIcon from '../assets/icons/dedication.png';
import hazlahaIcon from '../assets/icons/hazlaha.png';
import zarakayamaIcon from '../assets/icons/zarakayama.png';
import refuaIcon from '../assets/icons/refua.png';
import otherIcon from '../assets/icons/other.png';

export const intentions = [
  { text: 'זכות', icon: zhitIcon, type: '1' },
  { text: 'ע״נ', icon: dedicationIcon, type: '2' },
  { text: 'הצלחה', icon: hazlahaIcon, type: '3' },
  { text: 'זחו״ק', icon: zarakayamaIcon, type: '4' },
  { text: 'רפואה', icon: refuaIcon, type: '5' },
  { text: 'אחר', icon: otherIcon, type: '7' },
];

// Helper function to get intention icon by type
export const getIntentionIcon = (type) => {
  const intention = intentions.find(i => i.type === type);
  return intention ? intention.icon : otherIcon;
};

// Helper function to get intention text by type
export const getIntentionText = (type) => {
  const intention = intentions.find(i => i.type === type);
  return intention ? intention.text : 'אחר';
};
