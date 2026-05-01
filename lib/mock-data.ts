import type { Manga, Chapter } from '@/types';

const now = new Date().toISOString();

export const MOCK_MANGAS: Manga[] = [
  {
    id: 'mock-1',
    slug: 'crimson-blade',
    title: 'Crimson Blade',
    description: 'A wandering swordsman seeks revenge across a land scarred by war.',
    cover_url: 'https://picsum.photos/seed/crimson/600/900',
    status: 'ongoing',
    genres: ['Action', 'Adventure', 'Drama'],
    author: 'Hiroshi Tanaka',
    created_at: now
  },
  {
    id: 'mock-2',
    slug: 'star-runner',
    title: 'Star Runner',
    description: 'In the neon outskirts of a dying galaxy, a courier carries a secret that could unmake empires.',
    cover_url: 'https://picsum.photos/seed/starrunner/600/900',
    status: 'ongoing',
    genres: ['Sci-Fi', 'Cyberpunk', 'Thriller'],
    author: 'Yuki Hoshino',
    created_at: now
  },
  {
    id: 'mock-3',
    slug: 'midnight-garden',
    title: 'Midnight Garden',
    description: 'Each night a forgotten garden blooms — and only those who grieve may find it.',
    cover_url: 'https://picsum.photos/seed/midnight/600/900',
    status: 'completed',
    genres: ['Slice of Life', 'Supernatural', 'Romance'],
    author: 'Aiko Mori',
    created_at: now
  },
  {
    id: 'mock-4',
    slug: 'ironclad-hearts',
    title: 'Ironclad Hearts',
    description: 'Two pilots, one mecha, and a war neither of them started.',
    cover_url: 'https://picsum.photos/seed/ironclad/600/900',
    status: 'ongoing',
    genres: ['Mecha', 'Action', 'Romance'],
    author: 'Ren Sato',
    created_at: now
  },
  {
    id: 'mock-5',
    slug: 'paper-tiger',
    title: 'Paper Tiger',
    description: 'A folded origami tiger comes alive at the edge of an ancient empire.',
    cover_url: 'https://picsum.photos/seed/papertiger/600/900',
    status: 'hiatus',
    genres: ['Fantasy', 'Historical'],
    author: 'Liang Wei',
    created_at: now
  },
  {
    id: 'mock-6',
    slug: 'cafe-noctura',
    title: 'Café Nocturna',
    description: 'A 24-hour café in Tokyo where every customer carries an impossible request.',
    cover_url: 'https://picsum.photos/seed/cafe/600/900',
    status: 'ongoing',
    genres: ['Slice of Life', 'Mystery'],
    author: 'Sakura Endo',
    created_at: now
  }
];

export const MOCK_CHAPTERS: Record<string, Chapter[]> = Object.fromEntries(
  MOCK_MANGAS.map((m) => [
    m.slug,
    Array.from({ length: 8 }).map((_, i) => ({
      id: `${m.id}-ch-${i + 1}`,
      manga_id: m.id,
      number: i + 1,
      title: `Chapter ${i + 1}`,
      created_at: now
    }))
  ])
);
