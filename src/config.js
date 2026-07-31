/* ===== Content Configuration — Starlight Atelier 2027 ===== */
import img1 from './images/6BA1EB1B-281F-41C4-8637-2BB40871988B.JPG';
import img2 from './images/IMG_4418.jpg';
import img3 from './images/IMG_4514.jpg';
import img4 from './images/temp_image_CBE67ACF-875B-43C5-9B82-EEB681DC9921.JPG';
import img5 from './images/IMG_4619.JPG';
import img6 from './images/S__21004300.jpg';
import img7 from './images/S__21004311.jpg';
import img8 from './images/S__21004314.jpg';
import img9 from './images/S__21004315.jpg';
import img10 from './images/S__21004325.jpg';

import vid1 from './images/25690725_160729_419.MP4';
import vid2 from './images/806659020.703314.mp4';
import vid3 from './images/806659020.766714.mp4';

export const HER_NAME = 'พลอย';
export const BIRTHDAY_YEAR = 2027;

export const LOCK_SCREEN = {
  greeting: 'สุขสันต์วันเกิด',
  hint: 'ปัดขึ้นเพื่อฉลอง',
};

export const LETTER = {
  title: 'ถึงพลอย 💌',
  body: `สุขสันต์วันเกิดนะพลอย! 🎂💖

ปีนี้ฉันอยากสร้างจักรวาลใบเล็กๆ ให้เธอ
เพราะสำหรับฉัน เธอคือดาวที่สว่างที่สุดในท้องฟ้าทั้งใบ

ขอบคุณที่คอยเป็นรอยยิ้ม เป็นความสุข
และเป็นเหตุผลให้ทุกวันมันดีขึ้นเสมอมานะ

ขอให้ปีนี้พลอยมีความสุขมากๆ สุขภาพแข็งแรง
คิดสิ่งใดก็ขอให้สมหวังสำเร็จทุกประการ
ยิ้มสดใสในทุกๆ วัน และเปี่ยมด้วยพลังบวกแบบนี้นะ

รักเธอที่สุดในโลกเลย 💕✨`,
};

export const CAKE = {
  title: 'เป่าเทียนแล้วอธิษฐานเลย 🕯️',
  hintMic: 'เป่าไมค์เบาๆ หรือกดเทียนค้างไว้ทีละเล่ม',
  wishPrompt: 'หลับตาลง... แล้วขอพรในใจเลย ✨',
  wishDone: 'ขอให้ทุกความปรารถนาของพลอยเป็นจริงนะ 💫',
  candleCount: 5,
};

export const GAME = {
  title: 'เก็บดาวตกให้ครบ 7 ดวง',
  subtitle: 'ดาววันเกิดของพลอยร่วงหล่นจากฟ้า รีบเก็บก่อนเที่ยงคืน!',
  duration: 60,
  target: 7,
  winBanner: 'เก็บครบแล้ว! มาดูกันว่าดาวเหล่านี้ซ่อนอะไรไว้ ✨',
  failMessage: 'ดาวใจดีนะ มันรอเธอเสมอ ลองอีกครั้งเลย 💫',
  compliments: [
    'รอยยิ้มของเธอ ในรูปดาว ✨',
    'เสียงหัวเราะของเธอ สว่างกว่าดาวดวงไหนๆ',
    'ดาวดวงนี้เกิดมาเพื่อเธอเลย 🌟',
    'สว่างแบบนี้ มีแค่เธอคนเดียว 💖',
  ],
};

export const FINALE = {
  title: 'กลุ่มดาวความทรงจำของเรา',
  subtitle: 'แตะดาวแต่ละดวง เพื่อเปิดความทรงจำที่ซ่อนอยู่',
  banner: 'ทุกดวงดาวที่เธอเก็บมา คือความทรงจำของเรา 💕',
};

export const FINALE_VIDEO = { src: vid2, label: 'วิดีโอพิเศษสำหรับพลอย 🎬' };

/* 7 memory stars (matches game target) */
export const MEMORIES = [
  { img: img1, label: 'ความทรงจำสุดน่ารัก 🌸' },
  { src: vid1, type: 'video', label: 'โมเมนต์อบอุ่น 🎥' },
  { img: img3, label: 'ภาพโปรดของเรา 🌷' },
  { img: img6, label: 'รูปคู่สุดคิวท์ ✨' },
  { src: vid3, type: 'video', label: 'วิดีโอความทรงจำ 📹' },
  { img: img8, label: 'ภาพแห่งความสุข ❤️' },
  { img: img10, label: 'น่ารักที่สุด 🌟' },
];

export const GALLERY_EXTRA = [
  { img: img2 },
  { img: img4 },
  { img: img5 },
  { img: img7 },
  { img: img9 },
  { src: vid3, type: 'video' },
];

export const CHAPTERS = [
  { id: 'gift', icon: 'gift', title: 'ของขวัญ', desc: 'มีอะไรซ่อนอยู่ในกล่อง' },
  { id: 'cake', icon: 'cake', title: 'เค้กวันเกิด', desc: 'เป่าเทียน อธิษฐาน' },
  { id: 'game', icon: 'star', title: 'เก็บดาวตก', desc: 'มินิเกมสุดมัน' },
  { id: 'finale', icon: 'heart', title: 'กลุ่มดาวความทรงจำ', desc: 'ปลดล็อกด้วยการชนะเกม', locked: true },
];
