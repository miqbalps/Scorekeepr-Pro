import React from 'react';
import {
  BACKGROUND_THEMES,
  BackgroundName,
  FONT_OPTIONS,
  FontOption,
  GameState,
  calculatePlayerTotal,
} from '../types/scorekeepr';

interface SideMenuProps {
  isOpen: boolean;
  game: GameState;
  savedGames: GameState[];
  onNewGame: () => void;
  onLoadSampleGame: (variant: 'starwars' | 'tara') => void;
  onChangePlayerCount: (delta: number) => void;
  onChangeRowCount: (delta: number) => void;
  onCycleFont: () => void;
  onSetFont: (font: FontOption) => void;
  onChangeFontSize: (delta: number) => void;
  onCycleBackground: () => void;
  onSetBackground: (bg: BackgroundName) => void;
  onToggleRowNumbers: () => void;
  onOpenLeaderboard: () => void;
  onOpenAbout: () => void;
  onLoadSavedGame: (saved: GameState) => void;
  onDeleteSavedGame: (id: string) => void;
  onCloseMenu: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  game,
  savedGames,
  onNewGame,
  onLoadSampleGame,
  onChangePlayerCount,
  onChangeRowCount,
  onCycleFont,
  onSetFont,
  onChangeFontSize,
  onCycleBackground,
  onSetBackground,
  onToggleRowNumbers,
  onOpenLeaderboard,
  onOpenAbout,
  onLoadSavedGame,
  onDeleteSavedGame,
}) => {
  const [showSavedList, setShowSavedList] = React.useState(false);
  const [confirmNewGame, setConfirmNewGame] = React.useState(false);

  return (
    <aside
      aria-label="Side Menu"
      className={`h-full bg-[#f4f4f4] text-[#222222] border-r border-black/15 shrink-0 transition-all duration-200 ease-out overflow-y-auto select-none ${
        isOpen ? 'w-[285px] sm:w-[310px] px-4 py-4' : 'w-0 px-0 py-0 overflow-hidden border-r-0'
      }`}
    >
      <div className="min-w-[250px] flex flex-col gap-4">
        {/* App Header matching Screenshot 2, 6, 9 */}
        <div className="pb-1">
          <div className="text-lg font-bold text-[#111111] leading-tight">
            ScoreKeepR
          </div>
          <div className="text-[11px] font-semibold text-[#333333]">
            v3.0.0 Ad-Free Edition
          </div>
        </div>

        {/* New Game */}
        <div>
          {!confirmNewGame ? (
            <button
              type="button"
              onClick={() => setConfirmNewGame(true)}
              className="w-full text-left py-1.5 text-[15px] text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
            >
              New Game
            </button>
          ) : (
            <div className="bg-white p-2.5 rounded-lg border border-slate-300 shadow-xs space-y-2">
              <div className="text-xs font-medium text-slate-700">
                Start a fresh game? (Current game is auto-saved)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onNewGame();
                    setConfirmNewGame(false);
                  }}
                  className="sk-blue-btn px-3 py-1 rounded text-xs font-semibold cursor-pointer"
                >
                  Start New
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmNewGame(false)}
                  className="px-2.5 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sample Game */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onLoadSampleGame('starwars')}
            className="text-left py-1.5 text-[15px] text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
          >
            Sample Game
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onLoadSampleGame('starwars')}
              title="Load Han, Chewie, Luke, Leia Sample"
              className="text-[11px] px-2 py-1 rounded bg-black/5 hover:bg-black/10 text-[#444] font-medium cursor-pointer"
            >
              Han/Leia
            </button>
            <button
              type="button"
              onClick={() => onLoadSampleGame('tara')}
              title="Load Tara, Jane, Adam, Jacob Sample"
              className="text-[11px] px-2 py-1 rounded bg-black/5 hover:bg-black/10 text-[#444] font-medium cursor-pointer"
            >
              Tara/Jane
            </button>
          </div>
        </div>

        {/* Players: N [+] [-] */}
        <div className="flex items-center justify-between py-0.5">
          <div className="text-[15px] text-[#666666]">
            Players: <strong className="text-[#333333] font-bold">{game.players.length}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangePlayerCount(1)}
              disabled={game.players.length >= 99}
              aria-label="Add player"
              className="sk-blue-btn w-12 h-8 rounded-[5px] flex items-center justify-center text-base font-bold cursor-pointer"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => onChangePlayerCount(-1)}
              disabled={game.players.length <= 1}
              aria-label="Remove player"
              className="sk-blue-btn w-12 h-8 rounded-[5px] flex items-center justify-center text-base font-bold cursor-pointer"
            >
              −
            </button>
          </div>
        </div>

        {/* Rows: N [+] [-] */}
        <div className="flex items-center justify-between py-0.5">
          <div className="text-[15px] text-[#666666]">
            Rows: <strong className="text-[#333333] font-bold">{game.rows.length}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeRowCount(1)}
              disabled={game.rows.length >= 99}
              aria-label="Add row"
              className="sk-blue-btn w-12 h-8 rounded-[5px] flex items-center justify-center text-base font-bold cursor-pointer"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => onChangeRowCount(-1)}
              disabled={game.rows.length <= 1}
              aria-label="Remove row"
              className="sk-blue-btn w-12 h-8 rounded-[5px] flex items-center justify-center text-base font-bold cursor-pointer"
            >
              −
            </button>
          </div>
        </div>

        {/* Font: [FontName] (Tap to cycle, just like ScoreKeepR) */}
        <div className="py-1">
          <button
            type="button"
            onClick={onCycleFont}
            className="w-full text-left text-[15px] text-[#666666] hover:text-[#111111] transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>
              Font: <strong className="text-[#444444] font-bold">{game.font}</strong>
            </span>
            <span className="text-[11px] text-[#888888]">tap to change</span>
          </button>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => onSetFont(f.value)}
                className={`text-[11px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  game.font === f.value
                    ? 'bg-[#246bb2] text-white font-semibold'
                    : 'bg-black/5 text-[#555] hover:bg-black/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size: N [+] [-] */}
        <div className="flex items-center justify-between py-0.5">
          <div className="text-[15px] text-[#666666]">
            Font Size: <strong className="text-[#333333] font-bold">{game.fontSize}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeFontSize(2)}
              disabled={game.fontSize >= 42}
              aria-label="Increase font size"
              className="sk-blue-btn w-12 h-8 rounded-[5px] flex items-center justify-center text-base font-bold cursor-pointer"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => onChangeFontSize(-2)}
              disabled={game.fontSize <= 12}
              aria-label="Decrease font size"
              className="sk-blue-btn w-12 h-8 rounded-[5px] flex items-center justify-center text-base font-bold cursor-pointer"
            >
              −
            </button>
          </div>
        </div>

        {/* Background: [ThemeName] */}
        <div className="py-1">
          <button
            type="button"
            onClick={onCycleBackground}
            className="w-full text-left text-[15px] text-[#666666] hover:text-[#111111] transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>
              Background: <strong className="text-[#444444] font-bold">{game.background}</strong>
            </span>
          </button>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {(Object.keys(BACKGROUND_THEMES) as BackgroundName[]).map((bgKey) => {
              const theme = BACKGROUND_THEMES[bgKey];
              const isSelected = game.background === bgKey;
              return (
                <button
                  key={bgKey}
                  type="button"
                  onClick={() => onSetBackground(bgKey)}
                  title={theme.label}
                  aria-label={`Select background ${theme.label}`}
                  style={{ backgroundColor: theme.canvasBg }}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                    isSelected
                      ? 'ring-2 ring-[#246bb2] ring-offset-2 scale-110'
                      : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Row Numbers Toggle */}
        <div className="py-0.5">
          <button
            type="button"
            onClick={onToggleRowNumbers}
            className="w-full text-left text-[15px] text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
          >
            Row Numbers:{' '}
            <strong className="text-[#444444] font-bold">
              {game.showRowNumbers ? 'Shown' : 'Hidden'}
            </strong>
          </button>
        </div>

        {/* Leaderboard / Email Scores */}
        <div className="py-0.5">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="w-full text-left text-[15px] text-[#666666] hover:text-[#111111] transition-colors cursor-pointer font-medium"
          >
            Leaderboard / Email Scores
          </button>
        </div>

        {/* Saved Games History (Unlocked BACON feature with zero ads) */}
        <div className="py-0.5">
          <button
            type="button"
            onClick={() => setShowSavedList((prev) => !prev)}
            className="w-full text-left text-[15px] text-[#666666] hover:text-[#111111] transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>
              Saved Games ({savedGames.length})
            </span>
            <span className="text-xs text-[#888]">{showSavedList ? '▲' : '▼'}</span>
          </button>

          {showSavedList && (
            <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {savedGames.length === 0 ? (
                <div className="text-xs text-[#888] italic py-1">
                  Games save automatically as you score.
                </div>
              ) : (
                savedGames.map((sg) => {
                  const isCurrent = sg.id === game.id;
                  return (
                    <div
                      key={sg.id}
                      className={`p-2 rounded border text-xs flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-blue-50/80 border-blue-300 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onLoadSavedGame(sg)}
                        className="text-left flex-1 truncate cursor-pointer"
                      >
                        <div className="font-semibold truncate">
                          {sg.name} {isCurrent && '(Active)'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {sg.players
                            .slice(0, 4)
                            .map((p, idx) => `${p}: ${calculatePlayerTotal(sg.rows, idx)}`)
                            .join(', ')}
                        </div>
                      </button>
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => onDeleteSavedGame(sg.id)}
                          title="Delete saved game"
                          className="text-slate-400 hover:text-red-600 px-1.5 py-0.5 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* About / Feedback */}
        <div className="py-0.5">
          <button
            type="button"
            onClick={onOpenAbout}
            className="w-full text-left text-[15px] text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
          >
            About / Shortcuts
          </button>
        </div>
      </div>
    </aside>
  );
};
