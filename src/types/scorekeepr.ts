export type FontOption = 'KomikaTextRegular' | 'narrow' | 'sans-serif' | 'monospace';

export type BackgroundName =
  | 'Classic Maroon'
  | 'Forest Green'
  | 'Midnight Blue'
  | 'Charcoal Slate'
  | 'Royal Purple'
  | 'Espresso Brown'
  | 'Casino Felt';

export interface CellData {
  value: number;
  isDash?: boolean;
  isStruck?: boolean;
}

export interface GameState {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  players: string[];
  rows: CellData[][];
  font: FontOption;
  fontSize: number;
  background: BackgroundName;
  showRowNumbers?: boolean;
}

export interface BackgroundTheme {
  name: BackgroundName;
  label: string;
  canvasBg: string;
  activeCellBg: string;
  totalBoxBg: string;
  dividerColor: string;
  textColor: string;
}

export const BACKGROUND_THEMES: Record<BackgroundName, BackgroundTheme> = {
  'Classic Maroon': {
    name: 'Classic Maroon',
    label: 'Classic Maroon',
    canvasBg: '#3c0503',
    activeCellBg: '#8e7877',
    totalBoxBg: '#5e3736',
    dividerColor: 'rgba(255, 255, 255, 0.85)',
    textColor: '#ffffff',
  },
  'Forest Green': {
    name: 'Forest Green',
    label: 'Forest Green',
    canvasBg: '#053505',
    activeCellBg: '#748e74',
    totalBoxBg: '#385c38',
    dividerColor: 'rgba(255, 255, 255, 0.85)',
    textColor: '#ffffff',
  },
  'Midnight Blue': {
    name: 'Midnight Blue',
    label: 'Midnight Blue',
    canvasBg: '#030621',
    activeCellBg: '#4e5166',
    totalBoxBg: '#282b40',
    dividerColor: 'rgba(255, 255, 255, 0.85)',
    textColor: '#ffffff',
  },
  'Charcoal Slate': {
    name: 'Charcoal Slate',
    label: 'Charcoal Slate',
    canvasBg: '#181b20',
    activeCellBg: '#5c626d',
    totalBoxBg: '#323741',
    dividerColor: 'rgba(255, 255, 255, 0.85)',
    textColor: '#ffffff',
  },
  'Royal Purple': {
    name: 'Royal Purple',
    label: 'Royal Purple',
    canvasBg: '#23062e',
    activeCellBg: '#786082',
    totalBoxBg: '#482a54',
    dividerColor: 'rgba(255, 255, 255, 0.85)',
    textColor: '#ffffff',
  },
  'Espresso Brown': {
    name: 'Espresso Brown',
    label: 'Espresso Brown',
    canvasBg: '#2b1606',
    activeCellBg: '#827164',
    totalBoxBg: '#4f3a2b',
    dividerColor: 'rgba(255, 255, 255, 0.85)',
    textColor: '#ffffff',
  },
  'Casino Felt': {
    name: 'Casino Felt',
    label: 'Casino Felt',
    canvasBg: '#094225',
    activeCellBg: '#668f7a',
    totalBoxBg: '#2c6146',
    dividerColor: 'rgba(255, 255, 255, 0.85)',
    textColor: '#ffffff',
  },
};

export const FONT_OPTIONS: { value: FontOption; label: string; cssClass: string }[] = [
  { value: 'KomikaTextRegular', label: 'KomikaTextRegular', cssClass: 'font-komika' },
  { value: 'narrow', label: 'narrow', cssClass: 'font-narrow' },
  { value: 'sans-serif', label: 'sans-serif', cssClass: 'font-sans-clean' },
  { value: 'monospace', label: 'monospace', cssClass: 'font-mono-tabular' },
];

export function formatScoreKeepRDate(date: Date = new Date()): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = days[date.getDay()];
  const m = months[date.getMonth()];
  const dayNum = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${d} ${m} ${dayNum} ${year} ${hours}:${mins}`;
}

export function calculatePlayerTotal(rows: CellData[][], playerIndex: number): number {
  let sum = 0;
  for (let r = 0; r < rows.length; r++) {
    const cell = rows[r]?.[playerIndex];
    if (!cell || cell.isDash || cell.isStruck) continue;
    sum += Number(cell.value) || 0;
  }
  return sum;
}

/**
 * Exact Sample Game 1 from ScoreKeepR Screenshots 1 & 8:
 * Players: Han, Chewie, Luke, Leia (7 rows)
 * Totals: Han = 100, Chewie = 119, Luke = 15, Leia = 448
 */
export function createStarWarsSampleGame(): GameState {
  const now = formatScoreKeepRDate();
  return {
    id: String(Date.now()),
    name: 'ScoreKeepR',
    createdAt: now,
    updatedAt: now,
    players: ['Han', 'Chewie', 'Luke', 'Leia'],
    rows: [
      [{ value: 10 }, { value: 20 }, { value: 30 }, { value: 400 }],
      [{ value: 20 }, { value: 22 }, { value: -5 }, { value: 0, isDash: true }],
      [{ value: 30 }, { value: 33 }, { value: -10 }, { value: 44 }],
      [{ value: 40 }, { value: 44 }, { value: 10, isStruck: true }, { value: 4 }],
      [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
      [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
      [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
    ],
    font: 'KomikaTextRegular',
    fontSize: 22,
    background: 'Classic Maroon',
    showRowNumbers: false,
  };
}

/**
 * Exact Sample Game 2 from ScoreKeepR Screenshots 5, 6 & 7:
 * Players: Tara, Jane, Adam, Jacob (9 rows)
 * Totals: Tara = 68, Jane = 60, Adam = 38, Jacob = 49
 */
export function createTaraSampleGame(): GameState {
  const now = formatScoreKeepRDate();
  return {
    id: '1439177108451',
    name: 'ScoreKeepR',
    createdAt: 'Sun Aug 09 2015 20:25',
    updatedAt: now,
    players: ['Tara', 'Jane', 'Adam', 'Jacob'],
    rows: [
      [{ value: 4 }, { value: -3 }, { value: -1 }, { value: 0 }],
      [{ value: 24 }, { value: 5 }, { value: 18 }, { value: 7 }],
      [{ value: 14 }, { value: 14 }, { value: 6 }, { value: 11 }],
      [{ value: 1 }, { value: 11 }, { value: 4 }, { value: 1 }],
      [{ value: 11 }, { value: 14 }, { value: 9 }, { value: 2 }],
      [{ value: 14 }, { value: 19 }, { value: 2 }, { value: 28 }],
      [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
      [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
      [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
    ],
    font: 'KomikaTextRegular',
    fontSize: 24,
    background: 'Classic Maroon',
    showRowNumbers: false,
  };
}

export function createNewBlankGame(
  playerCount = 4,
  rowCount = 7,
  font: FontOption = 'KomikaTextRegular',
  fontSize = 22,
  background: BackgroundName = 'Classic Maroon'
): GameState {
  const now = formatScoreKeepRDate();
  const players = Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`);
  const rows: CellData[][] = Array.from({ length: rowCount }, () =>
    Array.from({ length: playerCount }, () => ({ value: 0 }))
  );

  return {
    id: String(Date.now()),
    name: 'ScoreKeepR',
    createdAt: now,
    updatedAt: now,
    players,
    rows,
    font,
    fontSize,
    background,
    showRowNumbers: false,
  };
}
