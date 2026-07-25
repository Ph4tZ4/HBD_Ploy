/* ===== Configuration ===== */
import img1 from './images/6BA1EB1B-281F-41C4-8637-2BB40871988B.JPG';
import img2 from './images/CB93F466-5FE2-4B50-AAB9-3DA139A62621.JPG';
import img3 from './images/IMG_3371.jpg';
import img4 from './images/IMG_4418.jpg';
import img5 from './images/IMG_4514.jpg';
import img6 from './images/temp_image_CBE67ACF-875B-43C5-9B82-EEB681DC9921.JPG';

export const BIRTHDAY_MONTH = 6; // กรกฎาคม (0-indexed: ม.ค.=0)
export const BIRTHDAY_DAY = 25;

export const WISH_TEXT = `สุขสันต์วันเกิดนะพลอย! 🎂💖

วันนี้เป็นวันพิเศษที่สุดของคนพิเศษที่สุด
ขอบคุณที่คอยเป็นรอยยิ้ม
และเป็นความสุขให้กันเสมอมานะ

ขอให้ปีนี้พลอยมีความสุขมากๆ สุขภาพแข็งแรง 
คิดสิ่งใดก็ขอให้สมหวังสำเร็จทุกประการ 
ยิ้มสดใสในทุกๆ วัน
และเปี่ยมด้วยพลังบวกแบบนี้นะ!

ขอให้มีความสุขที่สุดในโลกเลยนะ 💕✨`;

export const GIFT_SURPRISE = {
  title: '🎁 ของขวัญสุดพิเศษสำหรับพลอย!',
  subtitle: 'ยินดีด้วยนะ! เธอได้รับคูปองสุดพิเศษแล้ว 💖',
  vouchers: [
    '🎫 คูปองกอดฟรีตลอดชีวิต 3,000 ครั้ง',
    '🍦 คูปองตามใจ 1 วันเต็ม (กินอะไรก็เลี้ยงหมดเลย!)',
    '🎬 คูปองดูหนัง + พาไปเที่ยวไหนก็ได้ตามใจพลอย',
  ],
  message: 'อยากใช้คูปองใบไหนเมื่อไหร่ แค่สะกิดได้เลยนะจ๊ะ 🥰✨',
};

export const GAME_DURATION = 30;

export const TIMELINE_EVENTS = [
  {
    side: 'left',
    icon: '💑',
    date: '📅 วันแรกที่เราได้เจอกัน',
    title: 'จุดเริ่มต้นความทรงจำแสนหวาน',
    text: 'วันที่โลกเหวี่ยงคนน่ารักอย่างพลอยมาเจอ ขอบคุณความโชคดีในวันนั้นจริงๆ ❤️',
  },
  {
    side: 'right',
    icon: '🎬',
    date: '📅 เดทแรกของเรา',
    title: 'รอยยิ้มแรกที่ทำให้เขินสุดๆ',
    text: 'วันที่ออกไปเที่ยวด้วยกันครั้งแรก ตื่นเต้นมากแต่มีความสุขสุดๆ ไปเลย 🥰',
  },
  {
    side: 'left',
    icon: '🌸',
    date: '📅 ทริปพิเศษร่วมกัน',
    title: 'ทุกที่ที่มีพลอยคือที่ที่ดีที่สุด',
    text: 'ไม่ว่าจะไปไหน แค่มีพลอยอยู่ข้างๆ ก็กลายเป็นความทรงจำสุดประทับใจเสมอ 💫',
  },
  {
    side: 'right',
    icon: '🎂',
    date: '📅 วันนี้! วันเกิดพลอย',
    title: 'สุขสันต์วันเกิดนะคนเก่ง!',
    text: 'ขอให้วันนี้และทุกๆ วันต่อจากนี้มีแต่รอยยิ้ม ความรัก และความอบอุ่นล้อมรอบนะ 💕🎉',
  },
];

export const GALLERY_ITEMS = [
  { hue: 340, label: 'ความทรงจำสุดน่ารัก 1', wide: true, emoji: '🌸', img: img1 },
  { hue: 320, label: 'รอยยิ้มของพลอย 2', wide: false, emoji: '✨', img: img2 },
  { hue: 300, label: 'ทริปแสนสนุก 3', wide: false, emoji: '🎀', img: img3 },
  { hue: 280, label: 'โมเมนต์อบอุ่น 4', wide: false, emoji: '💖', img: img4 },
  { hue: 350, label: 'ภาพโปรดของเรา 5', wide: true, emoji: '🌷', img: img5 },
  { hue: 310, label: 'วันสบายๆ 6', wide: false, tall: true, emoji: '🍰', img: img6 },
];
