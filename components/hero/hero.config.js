/** ثابت‌ها و کپی هیرو — بدون منطق اجرایی */
export const FRAME_COUNT = 70;
export const FRAME_PATH = (i) =>
  `/hero-frames/frame-${String(i).padStart(3, '0')}.jpg`;

export const HERO_POSTER = '/hero-poster.webp';
export const HERO_VIDEO = '/hero.mp4';

export const HERO_COPY = {
  title: 'پیراهن مردانه',
  url: 'WWW.PIRAHANMARDANE.IR',
  shop: 'فروشگاه',
  body1Line1: 'مرکز فروش',
  body1Line2: 'پیراهن مردانه',
  body2Line1: 'تنوع',
  body2Line2: 'در قیمت و کیفیت',
  scrollCue: 'Scroll',
  alt: 'پیراهن مردانه',
};
