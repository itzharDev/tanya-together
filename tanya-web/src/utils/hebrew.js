export const getHebrewGematria = (number) => {
    if (number <= 0) return '';
    if (number === 15) return 'טו';
    if (number === 16) return 'טז';

    const units = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    // const tens = ['י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ']; // Not explicitly needed if we map manually or via math

    if (number <= 9) return units[number - 1];
    if (number === 10) return 'י';
    if (number < 20) return `י${units[number - 11]}`;
    if (number === 20) return 'כ';
    if (number < 30) return `כ${units[number - 21]}`;
    if (number === 30) return 'ל';
    if (number < 40) return `ל${units[number - 31]}`;
    if (number === 40) return 'מ';
    if (number < 50) return `מ${units[number - 41]}`;
    if (number === 50) return 'נ';
    if (number < 60) return `נ${units[number - 51]}`;
    if (number === 60) return 'ס';
    if (number < 70) return `ס${units[number - 61]}`;
    if (number === 70) return 'ע';
    if (number < 80) return `ע${units[number - 71]}`;
    if (number === 80) return 'פ';
    if (number < 90) return `פ${units[number - 81]}`;
    if (number === 90) return 'צ';
    if (number < 100) return `צ${units[number - 91]}`;
    if (number === 100) return 'ק';
    
    // Extend as needed based on Flutter logic up to 150
    const tensMap = {
        10: 'י', 20: 'כ', 30: 'ל', 40: 'מ', 50: 'נ', 
        60: 'ס', 70: 'ע', 80: 'פ', 90: 'צ', 100: 'ק'
    };
    
    if (number > 100 && number < 110) return `ק${units[number - 101]}`;
    if (number === 110) return 'קי';
    if (number < 120) return `קי${units[number - 111]}`;
    if (number === 120) return 'קכ';
    if (number < 130) return `קכ${units[number - 121]}`;
    if (number === 130) return 'קל';
    if (number < 140) return `קל${units[number - 131]}`;
    if (number === 140) return 'קמ';
    if (number < 150) return `קמ${units[number - 141]}`;
    if (number === 150) return 'קנ';

    return number.toString();
};
