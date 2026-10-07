import React, { useState } from 'react';
import { CellData, calculatePlayerTotal } from '../types/scorekeepr';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameName: string;
  players: string[];
  rows: CellData[][];
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  gameName,
  players,
  rows,
}) => {
  // In Screenshot 3, Luke (15), Han (100), Chewie (119), Leia (448) is sorted ascending,
  // and "Reverse Sort" flips between ascending and descending!
  const [sortAscending, setSortAscending] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const standings = players.map((name, idx) => ({
    name,
    score: calculatePlayerTotal(rows, idx),
    originalIndex: idx,
  }));

  standings.sort((a, b) => {
    if (sortAscending) {
      return a.score - b.score;
    }
    return b.score - a.score;
  });

  const buildPlainTextSummary = () => {
    const header = `${gameName.toUpperCase()} — LEADERBOARD`;
    const lines = standings.map((entry, idx) => `${idx + 1}. ${entry.name}: ${entry.score}`);
    const roundLines = rows.map(
      (r, rIdx) =>
        `Round ${rIdx + 1}: ` +
        players
          .map((p, pIdx) => {
            const c = r[pIdx];
            if (!c) return `${p}: 0`;
            if (c.isDash) return `${p}: —`;
            if (c.isStruck) return `${p}: ~${c.value}~ (ignored)`;
            return `${p}: ${c.value}`;
          })
          .join(' | ')
    );
    return `${header}\n\n${lines.join('\n')}\n\n--- Round Breakdown ---\n${roundLines.join('\n')}`;
  };

  const handleEmailScores = () => {
    const subject = encodeURIComponent(`${gameName} Scores — ScoreKeepR`);
    const body = encodeURIComponent(buildPlainTextSummary());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setCopiedFeedback('Opened Email client');
    setTimeout(() => setCopiedFeedback(null), 2500);
  };

  const handleCopyScores = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainTextSummary());
      setCopiedFeedback('Scores copied to clipboard!');
      setTimeout(() => setCopiedFeedback(null), 2500);
    } catch {
      setCopiedFeedback('Ready to share');
      setTimeout(() => setCopiedFeedback(null), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-start pt-12 px-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Leaderboard"
    >
      <div className="w-full max-w-lg flex flex-col items-center text-center pb-12">
        <h2 className="font-leaderboard text-4xl sm:text-5xl text-[#6b6b6b] tracking-wider uppercase mb-6 select-text">
          LEADERBOARD
        </h2>

        <div className="w-full space-y-2 mb-8">
          {standings.map((item, idx) => (
            <div
              key={`${item.name}-${item.originalIndex}`}
              className="font-leaderboard text-2xl sm:text-3xl text-[#6b6b6b] uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <span>
                {item.name}: {item.score}
              </span>
              {idx === 0 && standings.length > 1 && (
                <span className="text-xs font-sans-clean font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  #1
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Exact 3-button segmented blue control from Screenshot 3 */}
        <div className="inline-flex rounded-md overflow-hidden shadow-md border border-[#092c54]">
          <button
            type="button"
            onClick={handleEmailScores}
            className="sk-blue-btn px-4 sm:px-6 py-2.5 text-sm sm:text-base font-medium border-r border-[#092c54] whitespace-nowrap cursor-pointer"
          >
            Email Scores
          </button>
          <button
            type="button"
            onClick={() => setSortAscending((prev) => !prev)}
            className="sk-blue-btn px-4 sm:px-6 py-2.5 text-sm sm:text-base font-medium border-r border-[#092c54] whitespace-nowrap cursor-pointer"
          >
            Reverse Sort
          </button>
          <button
            type="button"
            onClick={onClose}
            className="sk-blue-btn px-4 sm:px-6 py-2.5 text-sm sm:text-base font-medium whitespace-nowrap cursor-pointer"
          >
            Close me
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyScores}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 underline cursor-pointer py-1 px-2"
          >
            Copy scores to clipboard
          </button>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500">
            Order: {sortAscending ? 'Lowest to Highest' : 'Highest to Lowest'}
          </span>
        </div>

        {copiedFeedback && (
          <div className="mt-3 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
            {copiedFeedback}
          </div>
        )}
      </div>
    </div>
  );
};
