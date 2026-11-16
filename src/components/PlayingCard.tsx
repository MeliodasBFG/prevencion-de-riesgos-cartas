'use client';

import { useState } from 'react';
import {
  Building2,
  Flame,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion, PanInfo } from 'framer-motion';
import { SECTOR_META } from '@/data/cardTemplates';
import { CardCategory, CardInstance } from '@/types/game';
import { SectorIcon } from './SectorIcon';

interface PlayingCardProps {
  card: CardInstance;
  faceDown?: boolean;
  fanAngle?: number;
  fanOffsetY?: number;
  dealIndex?: number;
  selected?: boolean;
  blocked?: boolean;
  playable?: boolean;
  draggable?: boolean;
  compact?: boolean;
  stampLabel?: string;
  stampColor?: string;
  onClick?: () => void;
  onDragStartCard?: (card: CardInstance) => void;
  onDragMoveCard?: (card: CardInstance, clientX: number, clientY: number) => void;
  onDragEndCard?: (card: CardInstance, clientX: number, clientY: number) => void;
}

const CARD_THEMES: Record<
  CardCategory,
  {
    badge: string;
    frame: string;
    artBg: string;
    ribbon: string;
    glow: string;
    CatIcon: typeof ShieldCheck;
  }
> = {
  WORKSTATION: {
    badge: 'PUESTO',
    frame:
      'border-sky-400/70 bg-gradient-to-b from-slate-900 via-sky-950/60 to-slate-950',
    artBg:
      'bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.28),rgba(15,23,42,0.95))] border-sky-400/35',
    ribbon: 'bg-sky-500 text-slate-950',
    glow: 'shadow-sky-500/25',
    CatIcon: Building2,
  },
  HAZARD: {
    badge: 'RIESGO',
    frame:
      'border-red-500/80 bg-gradient-to-b from-slate-900 via-red-950/65 to-slate-950',
    artBg:
      'bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.34),rgba(15,23,42,0.95))] border-red-500/40',
    ribbon: 'bg-red-500 text-white',
    glow: 'shadow-red-500/30',
    CatIcon: Flame,
  },
  PREVENTION: {
    badge: 'PREVENCIÓN',
    frame:
      'border-emerald-400/80 bg-gradient-to-b from-slate-900 via-emerald-950/60 to-slate-950',
    artBg:
      'bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.32),rgba(15,23,42,0.95))] border-emerald-400/35',
    ribbon: 'bg-emerald-500 text-slate-950',
    glow: 'shadow-emerald-500/25',
    CatIcon: ShieldCheck,
  },
  ACTION: {
    badge: 'ACCIÓN',
    frame:
      'border-amber-400/85 bg-gradient-to-b from-slate-900 via-amber-950/55 to-slate-950',
    artBg:
      'bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.32),rgba(15,23,42,0.95))] border-amber-400/40',
    ribbon: 'bg-amber-400 text-slate-950',
    glow: 'shadow-amber-500/30',
    CatIcon: Zap,
  },
};

export function CardBackVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div className="w-full h-full rounded-[14px] border-2 border-amber-400/70 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 p-1.5 shadow-xl relative overflow-hidden select-none">
      <div className="w-full h-full rounded-[10px] border border-amber-400/35 bg-[repeating-linear-gradient(45deg,rgba(245,158,11,0.06)_0px,rgba(245,158,11,0.06)_4px,transparent_4px,transparent_12px)] flex flex-col items-center justify-center p-2">
        <div
          className={`rounded-full border border-amber-400/60 bg-slate-950/90 flex items-center justify-center shadow-inner ${
            compact ? 'w-9 h-9' : 'w-14 h-14'
          }`}
        >
          <ShieldCheck
            className={`${compact ? 'w-5 h-5' : 'w-7 h-7'} text-amber-400`}
          />
        </div>
        <span
          className={`mt-1.5 font-black uppercase tracking-widest text-amber-300 text-center leading-tight ${
            compact ? 'text-[7px]' : 'text-[10px]'
          }`}
        >
          Alerta Cero
        </span>
        {!compact && (
          <span className="text-[8px] font-mono tracking-wider text-amber-200/70 mt-0.5">
            ISO 45001
          </span>
        )}
      </div>
    </div>
  );
}

export function PlayingCard({
  card,
  faceDown = false,
  fanAngle = 0,
  fanOffsetY = 0,
  dealIndex = 0,
  selected = false,
  blocked = false,
  playable = true,
  draggable = false,
  compact = false,
  stampLabel,
  stampColor,
  onClick,
  onDragStartCard,
  onDragMoveCard,
  onDragEndCard,
}: PlayingCardProps) {
  const [showTip, setShowTip] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const theme = CARD_THEMES[card.category];
  const CatIcon = theme.CatIcon;
  const sectorMeta = SECTOR_META[card.sector];

  const getViewportPoint = (info: PanInfo) => ({
    x: info.point.x - (typeof window !== 'undefined' ? window.scrollX : 0),
    y: info.point.y - (typeof window !== 'undefined' ? window.scrollY : 0),
  });

  const sizeClass = compact
    ? 'w-[106px] h-[152px]'
    : 'w-[152px] sm:w-[168px] h-[222px] sm:h-[244px]';

  return (
    <motion.div
      style={{
        perspective: 1000,
        zIndex: isDragging ? 90 : selected ? 40 : 10 + dealIndex,
      }}
      initial={{
        y: -85,
        opacity: 0,
        scale: 0.72,
        rotate: 0,
      }}
      animate={{
        y: selected ? -18 : fanOffsetY,
        opacity: 1,
        scale: selected ? 1.05 : 1,
        rotate: selected ? 0 : fanAngle,
      }}
      whileHover={
        !blocked && !isDragging && !compact
          ? { y: -18, rotate: 0, scale: 1.05, zIndex: 50 }
          : undefined
      }
      whileDrag={{
        scale: 1.09,
        rotate: 0,
        zIndex: 95,
      }}
      drag={draggable && !blocked}
      dragSnapToOrigin
      dragElastic={0.18}
      dragMomentum={false}
      onDragStart={() => {
        setIsDragging(true);
        onDragStartCard?.(card);
      }}
      onDrag={(_e, info) => {
        const pt = getViewportPoint(info);
        onDragMoveCard?.(card, pt.x, pt.y);
      }}
      onDragEnd={(_e, info) => {
        setIsDragging(false);
        const pt = getViewportPoint(info);
        onDragEndCard?.(card, pt.x, pt.y);
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 22,
        delay: Math.min(dealIndex * 0.06, 0.35),
      }}
      onClick={() => {
        if (!isDragging && !blocked) onClick?.();
      }}
      className={`relative shrink-0 select-none ${sizeClass} ${
        blocked
          ? 'cursor-not-allowed opacity-60 grayscale'
          : draggable
            ? 'cursor-grab active:cursor-grabbing'
            : onClick
              ? 'cursor-pointer'
              : ''
      }`}
    >
      {/* 3D Inner Flip Container */}
      <motion.div
        animate={{ rotateY: faceDown ? 180 : 0 }}
        transition={{ duration: 0.55, type: 'spring', stiffness: 180, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full relative"
      >
        {/* FRONT FACE */}
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className={`absolute inset-0 rounded-[14px] border-2 p-2 flex flex-col justify-between shadow-xl overflow-hidden ${
            theme.frame
          } ${theme.glow} ${
            selected
              ? 'ring-2 ring-yellow-300 border-yellow-300 shadow-yellow-400/35'
              : playable
                ? ''
                : 'opacity-75'
          }`}
        >
          {/* Top Card Header Bar */}
          <div className="flex items-center justify-between gap-1">
            <span
              className={`rounded-md px-1.5 py-0.5 font-black uppercase tracking-wider leading-none ${
                theme.ribbon
              } ${compact ? 'text-[7px]' : 'text-[9px]'}`}
            >
              {theme.badge}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 font-bold leading-none ${
                sectorMeta.badgeClass
              } ${compact ? 'text-[7px]' : 'text-[9px]'}`}
            >
              <SectorIcon
                sector={card.sector}
                className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}
              />
              {sectorMeta.shortLabel}
            </span>
          </div>

          {/* Center Artwork Window */}
          <div
            className={`my-1 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden ${
              theme.artBg
            } ${compact ? 'h-12' : 'h-20'}`}
          >
            {/* Subtle decorative ring */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:10px_10px]" />
            <div className="relative flex items-center gap-1.5">
              <CatIcon
                className={`${
                  compact ? 'w-6 h-6' : 'w-9 h-9'
                } text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]`}
              />
              <SectorIcon
                sector={card.sector}
                className={`${
                  compact ? 'w-4 h-4' : 'w-5 h-5'
                } text-amber-200/90 drop-shadow`}
              />
            </div>
            {card.sector === 'ALL' && !compact && (
              <span className="mt-1 inline-flex items-center gap-0.5 text-[8px] font-black uppercase tracking-widest text-yellow-200">
                <Sparkles className="w-2.5 h-2.5" /> Comodín
              </span>
            )}
          </div>

          {/* Card Title & Rule Text */}
          <div className="flex-1 flex flex-col justify-between min-h-0">
            <div>
              <h3
                className={`font-black text-white leading-tight line-clamp-2 ${
                  compact ? 'text-[9px]' : 'text-xs'
                }`}
              >
                {card.title}
              </h3>
              {!compact && (
                <p className="mt-1 text-[10px] text-slate-300 leading-snug line-clamp-3">
                  {card.description}
                </p>
              )}
            </div>

            {/* Bottom Corner Footer + PRL Tip Toggle */}
            {!compact && (
              <div className="mt-1 pt-1 border-t border-white/10 flex items-center justify-between gap-1">
                <span className="text-[9px] font-mono text-slate-400">
                  {playable ? 'Arrastra o pulsa' : 'Solo descarte'}
                </span>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTip((v) => !v);
                  }}
                  className="inline-flex items-center gap-0.5 rounded bg-slate-950/90 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 transition-colors"
                  title="Ver nota técnica de Ley 31/1995"
                >
                  <Info className="w-2.5 h-2.5" /> PRL
                </button>
              </div>
            )}
          </div>

          {/* PRL Technical Note Overlay */}
          {showTip && !compact && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setShowTip(false);
              }}
              className="absolute inset-0 bg-slate-950/95 p-3 flex flex-col justify-between text-left z-20 cursor-pointer"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Norma Técnica PRL
                </span>
                <p className="mt-1.5 text-[11px] text-slate-200 leading-relaxed">
                  {card.prlTip}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 text-center">
                Toca para volver a la carta
              </span>
            </div>
          )}

          {/* Blocked Stamp */}
          {blocked && (
            <div className="absolute inset-0 bg-red-950/75 flex flex-col items-center justify-center p-2 text-center z-20">
              <Lock className="w-7 h-7 text-red-300 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-wider text-red-200">
                Bloqueada por Inspección
              </span>
            </div>
          )}

          {/* Resolution Stamp */}
          {stampLabel && (
            <div
              className={`mt-1 rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase text-center truncate ${
                stampColor || 'bg-slate-800 text-white'
              }`}
            >
              {stampLabel}
            </div>
          )}
        </div>

        {/* BACK FACE */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0"
        >
          <CardBackVisual compact={compact} />
        </div>
      </motion.div>
    </motion.div>
  );
}
