'use client';

import { motion } from 'framer-motion';

export function InstructionBookButton({
  onClick,
  compact = false,
}: {
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.07, rotate: -3 }}
      whileTap={{ scale: 0.94 }}
      title="Abrir hoja de instrucciones y cómo se juega"
      className="group inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-slate-900 px-2.5 py-1.5 shadow-md hover:border-amber-400 transition-colors"
    >
      {/* Mini illustrated book SVG */}
      <svg
        viewBox="0 0 40 40"
        className="w-7 h-7 shrink-0 drop-shadow"
        aria-hidden="true"
      >
        {/* Book pages thickness */}
        <rect
          x="7"
          y="6"
          width="27"
          height="29"
          rx="3"
          fill="#fef3c7"
          stroke="#d97706"
          strokeWidth="1.5"
        />
        {/* Hardcover front */}
        <rect
          x="6"
          y="4"
          width="26"
          height="28"
          rx="3"
          fill="#1e293b"
          stroke="#f59e0b"
          strokeWidth="1.6"
        />
        {/* Spine */}
        <rect x="6" y="4" width="5" height="28" rx="1.5" fill="#b45309" />
        {/* Golden bookmark ribbon */}
        <path d="M23 32 L23 38 L25.5 35.5 L28 38 L28 32 Z" fill="#ef4444" />
        {/* Cover emblem & lines */}
        <circle
          cx="21"
          cy="14"
          r="5"
          fill="#f59e0b"
          fillOpacity="0.22"
          stroke="#fbbf24"
          strokeWidth="1.3"
        />
        <path
          d="M19 14 L20.5 15.6 L23.4 12.4"
          fill="none"
          stroke="#fde68a"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="15"
          y1="23"
          x2="27"
          y2="23"
          stroke="#94a3b8"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="17"
          y1="26.5"
          x2="25"
          y2="26.5"
          stroke="#64748b"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>

      {!compact && (
        <span className="text-xs font-bold text-amber-200 group-hover:text-amber-100 hidden sm:inline">
          Cómo jugar
        </span>
      )}
    </motion.button>
  );
}
