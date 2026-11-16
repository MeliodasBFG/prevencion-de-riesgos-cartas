'use client';

import {
  Award,
  Cog,
  FlaskConical,
  HardHat,
  Monitor,
  Shield,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { SECTOR_META } from '@/data/cardTemplates';
import { Sector, WorkstationSlot } from '@/types/game';

export function SectorIcon({
  sector,
  className = 'w-4 h-4',
}: {
  sector: Sector;
  className?: string;
}) {
  switch (sector) {
    case 'CONSTRUCCION':
      return <HardHat className={className} />;
    case 'QUIMICO':
      return <FlaskConical className={className} />;
    case 'INDUSTRIAL':
      return <Cog className={className} />;
    case 'OFICINA':
      return <Monitor className={className} />;
    case 'ALL':
      return <Sparkles className={className} />;
  }
}

export function getWorkstationVisualStatus(slot: WorkstationSlot): {
  label: string;
  dotClass: string;
  statusKey: 'EMPTY' | 'RISK' | 'CERTIFIED' | 'PROTECTED' | 'HEALTHY';
} {
  if (!slot.occupied) {
    return {
      label: 'Vacío',
      dotClass: 'bg-slate-800/80 text-slate-500 border-slate-700/80',
      statusKey: 'EMPTY',
    };
  }
  if (slot.certified) {
    return {
      label: 'ISO 45001',
      dotClass:
        'bg-amber-400/25 text-amber-200 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.55)]',
      statusKey: 'CERTIFIED',
    };
  }
  if (slot.inRisk) {
    return {
      label: 'En Riesgo',
      dotClass:
        'bg-red-500/30 text-red-200 border-red-400 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.55)]',
      statusKey: 'RISK',
    };
  }
  if (slot.shields >= 1) {
    return {
      label: 'Protegido x1',
      dotClass:
        'bg-emerald-500/25 text-emerald-300 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
      statusKey: 'PROTECTED',
    };
  }
  return {
    label: 'Sano',
    dotClass: 'bg-sky-500/20 text-sky-300 border-sky-400/60',
    statusKey: 'HEALTHY',
  };
}

export function WorkstationMiniBadge({
  slot,
  highlighted = false,
  onClick,
}: {
  slot: WorkstationSlot;
  highlighted?: boolean;
  onClick?: () => void;
}) {
  const visual = getWorkstationVisualStatus(slot);
  const meta = SECTOR_META[slot.sector];

  const content = (
    <div
      title={`${meta.workstationTitle}: ${visual.label}`}
      className={`relative flex items-center justify-center w-7 h-7 rounded-lg border transition-all ${
        visual.dotClass
      } ${
        highlighted
          ? 'ring-2 ring-yellow-300 scale-110 cursor-pointer hover:brightness-125'
          : ''
      }`}
    >
      <SectorIcon sector={slot.sector} className="w-3.5 h-3.5" />
      {visual.statusKey === 'CERTIFIED' && (
        <Award className="w-2.5 h-2.5 text-amber-200 absolute -top-1 -right-1 drop-shadow" />
      )}
      {visual.statusKey === 'PROTECTED' && (
        <Shield className="w-2.5 h-2.5 text-emerald-200 absolute -top-1 -right-1" />
      )}
      {visual.statusKey === 'RISK' && (
        <AlertTriangle className="w-2.5 h-2.5 text-red-200 absolute -top-1 -right-1" />
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="focus:outline-none"
      >
        {content}
      </button>
    );
  }

  return content;
}
