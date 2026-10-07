import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, Trophy } from 'lucide-react';
import {
  BACKGROUND_THEMES,
  BackgroundName,
  FONT_OPTIONS,
  FontOption,
  GameState,
  calculatePlayerTotal,
  createNewBlankGame,
  createStarWarsSampleGame,
  createTaraSampleGame,
  formatScoreKeepRDate,
} from './types/scorekeepr';
import { SideMenu } from './components/SideMenu';
import { ScoreKeypad } from './components/ScoreKeypad';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameInfoPopover } from './components/GameInfoPopover';
import { AboutModal } from './components/AboutModal';

const STORAGE_KEY_ACTIVE = 'scorekeepr_active_game_v1';
const STORAGE_KEY_SAVED = 'scorekeepr_saved_games_v1';

export default function App() {
  // Load initial game from localStorage or default to the iconic Star Wars sample game from Screenshot 1
  const [game, setGame] = useState<GameState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.players) && Array.isArray(parsed.rows)) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return createStarWarsSampleGame();
  });

  const [savedGames, setSavedGames] = useState<GameState[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // UI states
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isGameInfoOpen, setIsGameInfoOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Active selected cell: { row: number, col: number }
  // Default to row 3, col 2 (Luke's crossed-out 10 in Screenshot 1)
  const [activeCell, setActiveCell] = useState<{ row: number; col: number }>({
    row: 3,
    col: 2,
  });

  // Tracks whether the next digit pressed should overwrite the current cell value or append to it
  const [freshCellEntry, setFreshCellEntry] = useState<boolean>(true);

  // Player rename dialog state (clean custom modal instead of window.prompt)
  const [renamingPlayerIndex, setRenamingPlayerIndex] = useState<number | null>(null);
  const [playerDraftName, setPlayerDraftName] = useState<string>('');
  const playerInputRef = useRef<HTMLInputElement>(null);

  // Persist active game and update saved games list automatically
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(game));
      setSavedGames((prev) => {
        const existingIndex = prev.findIndex((g) => g.id === game.id);
        let updated: GameState[];
        if (existingIndex >= 0) {
          updated = [...prev];
          updated[existingIndex] = game;
        } else {
          updated = [game, ...prev].slice(0, 30);
        }
        localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // ignore storage quota errors
    }
  }, [game]);

  // Keep activeCell within bounds if players or rows shrink
  useEffect(() => {
    setActiveCell((prev) => ({
      row: Math.min(prev.row, Math.max(0, game.rows.length - 1)),
      col: Math.min(prev.col, Math.max(0, game.players.length - 1)),
    }));
  }, [game.rows.length, game.players.length]);

  useEffect(() => {
    if (renamingPlayerIndex !== null && playerInputRef.current) {
      playerInputRef.current.focus();
      playerInputRef.current.select();
    }
  }, [renamingPlayerIndex]);

  const selectCell = useCallback((row: number, col: number) => {
    setActiveCell({ row, col });
    setFreshCellEntry(true);
  }, []);

  // Keypad Handlers
  const handleDigit = useCallback(
    (digit: number) => {
      setGame((prev) => {
        const r = Math.min(activeCell.row, prev.rows.length - 1);
        const c = Math.min(activeCell.col, prev.players.length - 1);
        const currentCell = prev.rows[r]?.[c] || { value: 0 };

        let nextValue: number;
        if (freshCellEntry || currentCell.isDash || currentCell.isStruck) {
          nextValue = digit;
        } else {
          const isNegative = currentCell.value < 0;
          const absCurrent = Math.abs(currentCell.value);
          // Cap at 6 digits so columns stay clean
          const appended = absCurrent >= 100000 ? absCurrent : absCurrent * 10 + digit;
          nextValue = isNegative ? -appended : appended;
        }

        const newRows = prev.rows.map((rowArr, rIdx) =>
          rIdx === r
            ? rowArr.map((cell, cIdx) =>
                cIdx === c
                  ? { value: nextValue, isDash: false, isStruck: false }
                  : cell
              )
            : rowArr
        );

        return {
          ...prev,
          rows: newRows,
          updatedAt: formatScoreKeepRDate(),
        };
      });
      setFreshCellEntry(false);
    },
    [activeCell, freshCellEntry]
  );

  const handleBackspace = useCallback(() => {
    setGame((prev) => {
      const r = Math.min(activeCell.row, prev.rows.length - 1);
      const c = Math.min(activeCell.col, prev.players.length - 1);
      const currentCell = prev.rows[r]?.[c] || { value: 0 };

      let nextValue = 0;
      if (!currentCell.isDash && !currentCell.isStruck) {
        const sign = currentCell.value < 0 ? -1 : 1;
        const absVal = Math.floor(Math.abs(currentCell.value) / 10);
        nextValue = absVal === 0 ? 0 : sign * absVal;
      }

      const newRows = prev.rows.map((rowArr, rIdx) =>
        rIdx === r
          ? rowArr.map((cell, cIdx) =>
              cIdx === c
                ? { value: nextValue, isDash: false, isStruck: false }
                : cell
            )
          : rowArr
      );

      return {
        ...prev,
        rows: newRows,
        updatedAt: formatScoreKeepRDate(),
      };
    });
    setFreshCellEntry(false);
  }, [activeCell]);

  // Counter-clockwise arrow button (↺):
  // Toggles strikethrough on a non-zero number (like Luke's crossed-out 10 in Screenshot 1 & 8),
  // or resets to 0 if already struck/dash.
  const handleUndoOrStrike = useCallback(() => {
    setGame((prev) => {
      const r = Math.min(activeCell.row, prev.rows.length - 1);
      const c = Math.min(activeCell.col, prev.players.length - 1);
      const currentCell = prev.rows[r]?.[c] || { value: 0 };

      let updatedCell = { ...currentCell };
      if (currentCell.isDash) {
        updatedCell = { value: 0, isDash: false, isStruck: false };
      } else if (currentCell.value !== 0 && !currentCell.isStruck) {
        // Strike out the score so it stays visible with a line through it, excluded from total
        updatedCell = { ...currentCell, isStruck: true };
      } else if (currentCell.isStruck) {
        // Restore struck score back to active
        updatedCell = { ...currentCell, isStruck: false };
      } else {
        updatedCell = { value: 0, isDash: false, isStruck: false };
      }

      const newRows = prev.rows.map((rowArr, rIdx) =>
        rIdx === r
          ? rowArr.map((cell, cIdx) => (cIdx === c ? updatedCell : cell))
          : rowArr
      );

      return {
        ...prev,
        rows: newRows,
        updatedAt: formatScoreKeepRDate(),
      };
    });
    setFreshCellEntry(true);
  }, [activeCell]);

  const handleToggleSign = useCallback(() => {
    setGame((prev) => {
      const r = Math.min(activeCell.row, prev.rows.length - 1);
      const c = Math.min(activeCell.col, prev.players.length - 1);
      const currentCell = prev.rows[r]?.[c] || { value: 0 };

      if (currentCell.isDash || currentCell.value === 0) return prev;

      const newRows = prev.rows.map((rowArr, rIdx) =>
        rIdx === r
          ? rowArr.map((cell, cIdx) =>
              cIdx === c ? { ...cell, value: -cell.value } : cell
            )
          : rowArr
      );

      return {
        ...prev,
        rows: newRows,
        updatedAt: formatScoreKeepRDate(),
      };
    });
  }, [activeCell]);

  const handleToggleDash = useCallback(() => {
    setGame((prev) => {
      const r = Math.min(activeCell.row, prev.rows.length - 1);
      const c = Math.min(activeCell.col, prev.players.length - 1);
      const currentCell = prev.rows[r]?.[c] || { value: 0 };

      const nextIsDash = !currentCell.isDash;
      const newRows = prev.rows.map((rowArr, rIdx) =>
        rIdx === r
          ? rowArr.map((cell, cIdx) =>
              cIdx === c
                ? { value: 0, isDash: nextIsDash, isStruck: false }
                : cell
            )
          : rowArr
      );

      return {
        ...prev,
        rows: newRows,
        updatedAt: formatScoreKeepRDate(),
      };
    });
    setFreshCellEntry(true);
  }, [activeCell]);

  const handleMoveRight = useCallback(() => {
    setActiveCell((prev) => {
      const numCols = game.players.length;
      const numRows = game.rows.length;
      if (prev.col + 1 < numCols) {
        return { row: prev.row, col: prev.col + 1 };
      }
      // Wrap to first player of next row
      if (prev.row + 1 < numRows) {
        return { row: prev.row + 1, col: 0 };
      }
      return { row: 0, col: 0 };
    });
    setFreshCellEntry(true);
  }, [game.players.length, game.rows.length]);

  const handleMoveDown = useCallback(() => {
    setActiveCell((prev) => {
      const numRows = game.rows.length;
      if (prev.row + 1 < numRows) {
        return { row: prev.row + 1, col: prev.col };
      }
      return { row: 0, col: prev.col };
    });
    setFreshCellEntry(true);
  }, [game.rows.length]);

  // Physical Keyboard Support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if typing in an input or modal is open
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        renamingPlayerIndex !== null ||
        isGameInfoOpen ||
        isLeaderboardOpen ||
        isAboutOpen
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(Number(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === '-') {
        e.preventDefault();
        handleToggleSign();
      } else if (e.key === '_') {
        e.preventDefault();
        handleToggleDash();
      } else if (e.key === 's' || e.key === 'S' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        handleUndoOrStrike();
      } else if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        handleMoveRight();
      } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setActiveCell((prev) => {
          if (prev.col > 0) return { row: prev.row, col: prev.col - 1 };
          if (prev.row > 0) return { row: prev.row - 1, col: game.players.length - 1 };
          return { row: game.rows.length - 1, col: game.players.length - 1 };
        });
        setFreshCellEntry(true);
      } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        handleMoveDown();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveCell((prev) => ({
          row: prev.row > 0 ? prev.row - 1 : game.rows.length - 1,
          col: prev.col,
        }));
        setFreshCellEntry(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleDigit,
    handleBackspace,
    handleToggleSign,
    handleToggleDash,
    handleUndoOrStrike,
    handleMoveRight,
    handleMoveDown,
    renamingPlayerIndex,
    isGameInfoOpen,
    isLeaderboardOpen,
    isAboutOpen,
    game.players.length,
    game.rows.length,
  ]);

  // Menu Actions
  const handleNewGame = () => {
    const fresh = createNewBlankGame(
      game.players.length,
      game.rows.length,
      game.font,
      game.fontSize,
      game.background
    );
    setGame(fresh);
    setActiveCell({ row: 0, col: 0 });
    setFreshCellEntry(true);
  };

  const handleLoadSampleGame = (variant: 'starwars' | 'tara') => {
    const sample =
      variant === 'starwars' ? createStarWarsSampleGame() : createTaraSampleGame();
    // Preserve current background/font if user already customized, or use sample's authentic look
    setGame(sample);
    setActiveCell(variant === 'starwars' ? { row: 3, col: 2 } : { row: 5, col: 1 });
    setFreshCellEntry(true);
  };

  const handleChangePlayerCount = (delta: number) => {
    setGame((prev) => {
      const nextCount = Math.max(1, Math.min(99, prev.players.length + delta));
      if (nextCount === prev.players.length) return prev;

      let nextPlayers = [...prev.players];
      let nextRows = prev.rows.map((r) => [...r]);

      if (nextCount > prev.players.length) {
        for (let i = prev.players.length; i < nextCount; i++) {
          nextPlayers.push(`Player ${i + 1}`);
          nextRows = nextRows.map((r) => [...r, { value: 0 }]);
        }
      } else {
        nextPlayers = nextPlayers.slice(0, nextCount);
        nextRows = nextRows.map((r) => r.slice(0, nextCount));
      }

      return {
        ...prev,
        players: nextPlayers,
        rows: nextRows,
        updatedAt: formatScoreKeepRDate(),
      };
    });
  };

  const handleChangeRowCount = (delta: number) => {
    setGame((prev) => {
      const nextCount = Math.max(1, Math.min(99, prev.rows.length + delta));
      if (nextCount === prev.rows.length) return prev;

      let nextRows = [...prev.rows];
      if (nextCount > prev.rows.length) {
        for (let i = prev.rows.length; i < nextCount; i++) {
          nextRows.push(
            Array.from({ length: prev.players.length }, () => ({ value: 0 }))
          );
        }
      } else {
        nextRows = nextRows.slice(0, nextCount);
      }

      return {
        ...prev,
        rows: nextRows,
        updatedAt: formatScoreKeepRDate(),
      };
    });
  };

  const handleCycleFont = () => {
    setGame((prev) => {
      const idx = FONT_OPTIONS.findIndex((f) => f.value === prev.font);
      const nextFont = FONT_OPTIONS[(idx + 1) % FONT_OPTIONS.length].value;
      return {
        ...prev,
        font: nextFont,
        updatedAt: formatScoreKeepRDate(),
      };
    });
  };

  const handleSetFont = (font: FontOption) => {
    setGame((prev) => ({
      ...prev,
      font,
      updatedAt: formatScoreKeepRDate(),
    }));
  };

  const handleChangeFontSize = (delta: number) => {
    setGame((prev) => ({
      ...prev,
      fontSize: Math.max(12, Math.min(42, prev.fontSize + delta)),
      updatedAt: formatScoreKeepRDate(),
    }));
  };

  const handleCycleBackground = () => {
    const keys = Object.keys(BACKGROUND_THEMES) as BackgroundName[];
    setGame((prev) => {
      const idx = keys.indexOf(prev.background);
      const nextBg = keys[(idx + 1) % keys.length];
      return {
        ...prev,
        background: nextBg,
        updatedAt: formatScoreKeepRDate(),
      };
    });
  };

  const handleSetBackground = (bg: BackgroundName) => {
    setGame((prev) => ({
      ...prev,
      background: bg,
      updatedAt: formatScoreKeepRDate(),
    }));
  };

  const handleToggleRowNumbers = () => {
    setGame((prev) => ({
      ...prev,
      showRowNumbers: !prev.showRowNumbers,
    }));
  };

  const handleRenameGame = (newName: string) => {
    setGame((prev) => ({
      ...prev,
      name: newName,
      updatedAt: formatScoreKeepRDate(),
    }));
  };

  const openPlayerRenameModal = (index: number) => {
    setRenamingPlayerIndex(index);
    setPlayerDraftName(game.players[index] || '');
  };

  const handleSavePlayerName = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingPlayerIndex === null) return;
    const trimmed = playerDraftName.trim() || `Player ${renamingPlayerIndex + 1}`;
    setGame((prev) => {
      const updatedPlayers = [...prev.players];
      updatedPlayers[renamingPlayerIndex] = trimmed;
      return {
        ...prev,
        players: updatedPlayers,
        updatedAt: formatScoreKeepRDate(),
      };
    });
    setRenamingPlayerIndex(null);
  };

  const handleDeleteSavedGame = (id: string) => {
    setSavedGames((prev) => {
      const filtered = prev.filter((g) => g.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(filtered));
      } catch {
        // ignore
      }
      return filtered;
    });
  };

  const theme = BACKGROUND_THEMES[game.background] || BACKGROUND_THEMES['Classic Maroon'];
  const fontClass =
    FONT_OPTIONS.find((f) => f.value === game.font)?.cssClass || 'font-komika';

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#111111]">
      {/* Slide-out Left Menu (pushes main scoreboard to the right just like ScoreKeepR) */}
      <SideMenu
        isOpen={isMenuOpen}
        game={game}
        savedGames={savedGames}
        onNewGame={handleNewGame}
        onLoadSampleGame={handleLoadSampleGame}
        onChangePlayerCount={handleChangePlayerCount}
        onChangeRowCount={handleChangeRowCount}
        onCycleFont={handleCycleFont}
        onSetFont={handleSetFont}
        onChangeFontSize={handleChangeFontSize}
        onCycleBackground={handleCycleBackground}
        onSetBackground={handleSetBackground}
        onToggleRowNumbers={handleToggleRowNumbers}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onLoadSavedGame={(saved) => {
          setGame(saved);
          setActiveCell({ row: 0, col: 0 });
          setFreshCellEntry(true);
        }}
        onDeleteSavedGame={handleDeleteSavedGame}
        onCloseMenu={() => setIsMenuOpen(false)}
      />

      {/* Main ScoreKeepR Canvas */}
      <div
        className="flex-1 h-full flex flex-col min-w-0 transition-colors duration-200"
        style={{ backgroundColor: theme.canvasBg, color: theme.textColor }}
      >
        {/* Top White Navigation Bar (Exact 3-zone layout matching Screenshots 1, 2, 5, 7, 8) */}
        <header className="h-11 bg-[#f5f5f5] text-[#1a1a1a] border-b border-black/20 px-3 flex items-center justify-between shrink-0 select-none z-20">
          {/* Zone 1: Menu Trigger */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 text-[15px] font-medium text-[#222222] hover:text-black py-1 px-1.5 rounded hover:bg-black/5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
            <span>Menu</span>
          </button>

          {/* Zone 2: Game Title (Tap to open Game Info / Rename Popover, matching Screenshot 7) */}
          <button
            type="button"
            onClick={() => setIsGameInfoOpen((prev) => !prev)}
            title="Tap to view game info or rename game"
            className="text-[15px] sm:text-base font-bold text-[#1a1a1a] hover:text-[#246bb2] transition-colors truncate max-w-[55%] cursor-pointer px-2 py-1"
          >
            {game.name}
          </button>

          {/* Zone 3: Quick Leaderboard Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsLeaderboardOpen(true)}
              title="Open Leaderboard"
              className="flex items-center gap-1 text-xs font-semibold text-[#333333] hover:text-[#111111] py-1.5 px-2.5 rounded hover:bg-black/5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trophy className="w-4 h-4 text-[#246bb2]" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>
          </div>
        </header>

        {/* Scoreboard Scrollable Area */}
        <main
          className={`flex-1 overflow-auto px-2 sm:px-6 pt-3 pb-1 flex flex-col justify-between ${fontClass}`}
          style={{ fontSize: `${game.fontSize}px` }}
          onClick={() => {
            if (isMenuOpen && window.innerWidth < 640) {
              setIsMenuOpen(false);
            }
          }}
        >
          <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-between min-h-0">
            {/* Scrollable Table Wrapper for up to 99 players & 99 rows */}
            <div className="w-full flex-1 overflow-auto">
              <div
                className="min-w-full"
                style={{
                  minWidth:
                    game.players.length > 4
                      ? `${game.players.length * 88}px`
                      : '100%',
                }}
              >
                {/* Player Header Row */}
                <div
                  className="grid items-center text-center pb-2 sticky top-0 z-10"
                  style={{
                    backgroundColor: theme.canvasBg,
                    gridTemplateColumns: game.showRowNumbers
                      ? `36px repeat(${game.players.length}, minmax(72px, 1fr))`
                      : `repeat(${game.players.length}, minmax(72px, 1fr))`,
                  }}
                >
                  {game.showRowNumbers && (
                    <div className="text-xs opacity-50 font-sans-clean">#</div>
                  )}
                  {game.players.map((player, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => openPlayerRenameModal(pIdx)}
                      title="Tap to change player name"
                      className="px-1 py-1 font-bold truncate hover:opacity-80 transition-opacity cursor-pointer text-center"
                    >
                      {player}
                    </button>
                  ))}
                </div>

                {/* Score Rows */}
                <div className="space-y-1.5 py-1">
                  {game.rows.map((rowCells, rIdx) => (
                    <div
                      key={rIdx}
                      className="grid items-center text-center"
                      style={{
                        gridTemplateColumns: game.showRowNumbers
                          ? `36px repeat(${game.players.length}, minmax(72px, 1fr))`
                          : `repeat(${game.players.length}, minmax(72px, 1fr))`,
                      }}
                    >
                      {game.showRowNumbers && (
                        <div className="text-xs opacity-45 font-sans-clean select-none">
                          {rIdx + 1}
                        </div>
                      )}

                      {game.players.map((_, cIdx) => {
                        const cell = rowCells[cIdx] || { value: 0 };
                        const isSelected =
                          activeCell.row === rIdx && activeCell.col === cIdx;

                        return (
                          <div key={cIdx} className="px-1 sm:px-2 flex justify-center">
                            <button
                              type="button"
                              onClick={() => selectCell(rIdx, cIdx)}
                              style={{
                                backgroundColor: isSelected
                                  ? theme.activeCellBg
                                  : 'transparent',
                              }}
                              className={`w-full max-w-[160px] py-1 px-2 rounded-[10px] transition-colors duration-100 flex items-center justify-center cursor-pointer tabular-nums ${
                                isSelected ? 'shadow-inner font-bold' : 'hover:bg-white/5'
                              }`}
                            >
                              {cell.isDash ? (
                                <span>—</span>
                              ) : (
                                <span
                                  className={`relative inline-block ${
                                    cell.isStruck ? 'opacity-95' : ''
                                  }`}
                                >
                                  {cell.value}
                                  {cell.isStruck && (
                                    <span
                                      aria-label="struck out"
                                      className="absolute left-[-18%] right-[-18%] top-1/2 h-[2.5px] bg-white -translate-y-1/2 pointer-events-none"
                                    />
                                  )}
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Totals Bar (Pinned below the horizontal white line, matching Screenshots 1, 5, 7, 8) */}
            <div className="w-full pt-2 shrink-0 overflow-x-auto">
              <div
                style={{
                  minWidth:
                    game.players.length > 4
                      ? `${game.players.length * 88}px`
                      : '100%',
                }}
              >
                {/* Crisp horizontal line */}
                <div
                  className="w-full h-[2px] mb-2"
                  style={{ backgroundColor: theme.dividerColor }}
                />

                {/* Player Total Boxes */}
                <div
                  className="grid items-center text-center gap-1.5 sm:gap-2.5 pb-1"
                  style={{
                    gridTemplateColumns: game.showRowNumbers
                      ? `36px repeat(${game.players.length}, minmax(72px, 1fr))`
                      : `repeat(${game.players.length}, minmax(72px, 1fr))`,
                  }}
                >
                  {game.showRowNumbers && <div />}
                  {game.players.map((player, pIdx) => {
                    const total = calculatePlayerTotal(game.rows, pIdx);
                    return (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setIsLeaderboardOpen(true)}
                        title={`${player}'s Total: ${total} (Tap for Leaderboard)`}
                        style={{ backgroundColor: theme.totalBoxBg }}
                        className="w-full py-1.5 px-2 rounded-[11px] font-bold tabular-nums truncate cursor-pointer hover:brightness-110 transition-all shadow-xs"
                      >
                        {total}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Signature 2x8 Blue Glossy Keypad (Zero Ads underneath!) */}
        <ScoreKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onUndoOrStrike={handleUndoOrStrike}
          onMoveRight={handleMoveRight}
          onToggleSign={handleToggleSign}
          onToggleDash={handleToggleDash}
          onMoveDown={handleMoveDown}
        />
      </div>

      {/* Speech Bubble Game Info & Rename Popover (Screenshot 7) */}
      <GameInfoPopover
        isOpen={isGameInfoOpen}
        game={game}
        onRenameGame={handleRenameGame}
        onClose={() => setIsGameInfoOpen(false)}
      />

      {/* Leaderboard Modal (Screenshot 3) */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        gameName={game.name}
        players={game.players}
        rows={game.rows}
      />

      {/* About & Keyboard Shortcuts Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Rename Player Modal */}
      {renamingPlayerIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setRenamingPlayerIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Rename player"
        >
          <div
            className="bg-[#f4f4f4] text-[#1a1a1a] rounded-2xl max-w-xs w-full p-4 shadow-2xl border border-black/15"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-[#111111] mb-2 text-center">
              Change Player {renamingPlayerIndex + 1} Name
            </h3>
            <form onSubmit={handleSavePlayerName} className="space-y-3">
              <input
                ref={playerInputRef}
                type="text"
                value={playerDraftName}
                onChange={(e) => setPlayerDraftName(e.target.value)}
                placeholder={`Player ${renamingPlayerIndex + 1}`}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base font-semibold text-slate-900 focus:outline-none focus:border-[#246bb2]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingPlayerIndex(null)}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sk-blue-btn px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
