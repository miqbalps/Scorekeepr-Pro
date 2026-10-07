import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types/scorekeepr';

interface GameInfoPopoverProps {
  isOpen: boolean;
  game: GameState;
  onRenameGame: (newName: string) => void;
  onClose: () => void;
}

export const GameInfoPopover: React.FC<GameInfoPopoverProps> = ({
  isOpen,
  game,
  onRenameGame,
  onClose,
}) => {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(game.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftName(game.name);
    setEditing(false);
  }, [game.name, isOpen]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftName.trim();
    if (trimmed) {
      onRenameGame(trimmed);
    }
    setEditing(false);
  };

  return (
    <>
      {/* Transparent click-outside backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Speech Bubble Popover anchored below top bar center, matching Screenshot 7 */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 w-[320px] sm:w-[350px] flex flex-col items-center">
        {/* Upward triangle pointer */}
        <div
          className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-[#f2f2f2] drop-shadow-xs"
          aria-hidden="true"
        />

        <div className="w-full bg-[#f2f2f2] text-[#1a1a1a] rounded-2xl shadow-2xl px-4 py-3.5 text-center border border-black/10">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="w-full font-bold text-sm text-[#111111] hover:text-[#246bb2] transition-colors cursor-pointer mb-1"
            >
              Tap to change name of game
            </button>
          ) : (
            <form onSubmit={handleSave} className="mb-2 flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Enter game name..."
                className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#246bb2]"
              />
              <button
                type="submit"
                className="sk-blue-btn px-3 py-1 rounded text-xs font-semibold cursor-pointer"
              >
                Save
              </button>
            </form>
          )}

          <div className="text-[13px] text-[#222222] leading-snug space-y-0.5 select-text">
            <div>Game started at {game.createdAt}</div>
            <div>Game last changed: {game.updatedAt}</div>
            <div>Game ID: {game.id}</div>
          </div>
        </div>
      </div>
    </>
  );
};
