// Image mapping for chapters
// Maps chapter order to image files in public/images

export const getChapterImage = (order: number): string => {
  const imageMap: Record<number, string> = {
    0: '/images/00_kv.webp', // Introduction
    1: '/images/01_kv.webp', // Chapter 1
    2: '/images/02_kv.webp', // Chapter 2
    3: '/images/03_kv.webp', // Chapter 3
    4: '/images/04_kv.webp', // Chapter 4
    5: '/images/05_kv.webp', // Chapter 5
    6: '/images/06_kv.webp', // Chapter 6
    7: '/images/07_kv.webp', // Chapter 7
    8: '/images/08_kv.webp', // Chapter 8
  };

  return imageMap[order] || '/images/00_kv.webp'; // Default to introduction image
};

export const getProfileImage = (): string => {
  return '/images/book_cover.webp'; // Using book cover as placeholder instead of personal photo
};
