import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="About ScoreKeepR"
    >
      <div
        className="bg-white text-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">ScoreKeepR — Ad-Free Edition</h2>
            <p className="text-xs text-slate-500">
              Clean score tracking — because pencil and paper can’t add them up for you!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">How to Use</h3>
            <ul className="space-y-1 text-xs text-slate-600 list-disc pl-4">
              <li>
                <strong>Rename Players:</strong> Tap any player’s name at the top of a column to change their name.
              </li>
              <li>
                <strong>Rename Game:</strong> Tap the game title in the top bar to see game timestamps and rename the game.
              </li>
              <li>
                <strong>Enter Scores:</strong> Tap any score cell and use the blue keypad (or your physical keyboard).
              </li>
              <li>
                <strong>Strikeout / Ignore Score (↺):</strong> Tap the circular undo/strikeout button on a number to cross it out (e.g., <span className="line-through">10</span>) so it stays visible in history without adding to the player’s total.
              </li>
              <li>
                <strong>Skipped Turn (—):</strong> Tap the dash button to record a skipped round (<code className="font-mono">—</code>).
              </li>
              <li>
                <strong>Up to 99 Players & 99 Rows:</strong> Add or remove players and rows anytime from the left menu without losing scores.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div><kbd className="font-mono font-semibold text-slate-800">0–9</kbd> Enter digits</div>
              <div><kbd className="font-mono font-semibold text-slate-800">- / ±</kbd> Toggle negative</div>
              <div><kbd className="font-mono font-semibold text-slate-800">Backspace</kbd> Delete digit</div>
              <div><kbd className="font-mono font-semibold text-slate-800">S / Z</kbd> Strikeout score</div>
              <div><kbd className="font-mono font-semibold text-slate-800">Arrows</kbd> Move cell</div>
              <div><kbd className="font-mono font-semibold text-slate-800">Tab / Enter</kbd> Next cell</div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="sk-blue-btn px-5 py-2 rounded-md text-sm font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
