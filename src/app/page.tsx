import { Suspense } from 'react';
import { AlertaCeroApp } from '@/components/AlertaCeroApp';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center text-sm font-medium">
          Cargando Centro de Misión Alerta Cero...
        </div>
      }
    >
      <AlertaCeroApp />
    </Suspense>
  );
}
