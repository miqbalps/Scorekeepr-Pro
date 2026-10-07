import React from 'react';
import { Delete, RotateCcw, ArrowRight, ArrowDown } from 'lucide-react';

interface ScoreKeypadProps {
  onDigit: (digit: number) => void;
  onBackspace: () => void;
  onUndoOrStrike: () => void;
  onMoveRight: () => void;
  onToggleSign: () => void;
  onToggleDash: () => void;
  onMoveDown: () => void;
}

export const ScoreKeypad: React.FC<ScoreKeypadProps> = ({
  onDigit,
  onBackspace,
  onUndoOrStrike,
  onMoveRight,
  onToggleSign,
  onToggleDash,
  onMoveDown,
}) => {
  return (
    <div className="w-full flex justify-center px-1.5 sm:px-3 pt-1.5 pb-2 sm:pb-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] shrink-0 z-10 select-none">
      <div
        className="w-full max-w-[480px] rounded-[8px] overflow-hidden shadow-md border border-[#072242]"
        role="group"
        aria-label="Score entry keypad"
      >
        {/* Top Row: 1 2 3 4 5 [Backspace] [Undo/Strike] [Right Arrow] */}
        <div className="grid grid-cols-8">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onDigit(num)}
              className="sk-blue-btn h-10 xs:h-11 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-medium cursor-pointer select-none"
            >
              {num}
            </button>
          ))}

          {/* Backspace */}
          <button
            type="button"
            onClick={onBackspace}
            title="Backspace (Delete last digit)"
            aria-label="Backspace"
            className="sk-blue-btn h-10 xs:h-11 sm:h-12 flex items-center justify-center cursor-pointer select-none"
          >
            <Delete className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </button>

          {/* Undo / Strikeout Toggle */}
          <button
            type="button"
            onClick={onUndoOrStrike}
            title="Strikeout / Reset score (Excludes score from total like crossed-out 10)"
            aria-label="Strikeout or reset cell"
            className="sk-blue-btn h-10 xs:h-11 sm:h-12 flex items-center justify-center cursor-pointer select-none"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.3]" />
          </button>

          {/* Move Right (Next Player) */}
          <button
            type="button"
            onClick={onMoveRight}
            title="Next Player (Right Arrow / Tab)"
            aria-label="Next player"
            className="sk-blue-btn h-10 xs:h-11 sm:h-12 flex items-center justify-center cursor-pointer select-none"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Bottom Row: 6 7 8 9 0 [±] [—] [Down Arrow] */}
        <div className="grid grid-cols-8">
          {[6, 7, 8, 9, 0].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onDigit(num)}
              className="sk-blue-btn h-10 xs:h-11 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-medium cursor-pointer select-none"
            >
              {num}
            </button>
          ))}

          {/* Plus / Minus Sign Toggle */}
          <button
            type="button"
            onClick={onToggleSign}
            title="Toggle Positive / Negative (±)"
            aria-label="Toggle positive or negative"
            className="sk-blue-btn h-10 xs:h-11 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-medium cursor-pointer select-none"
          >
            ±
          </button>

          {/* Dash (Skipped Turn) */}
          <button
            type="button"
            onClick={onToggleDash}
            title="Mark as Dash / Skipped Turn (—)"
            aria-label="Mark as dash"
            className="sk-blue-btn h-10 xs:h-11 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold cursor-pointer select-none"
          >
            —
          </button>

          {/* Move Down (Next Round/Row) */}
          <button
            type="button"
            onClick={onMoveDown}
            title="Next Row Down (Down Arrow / Enter)"
            aria-label="Next row down"
            className="sk-blue-btn h-10 xs:h-11 sm:h-12 flex items-center justify-center cursor-pointer select-none"
          >
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
