import {
  CardInstance,
  CardTemplate,
  ConcreteSector,
  CONCRETE_SECTORS,
  Sector,
} from '@/types/game';

export const SECTOR_META: Record<
  Sector,
  {
    label: string;
    shortLabel: string;
    workstationTitle: string;
    accentClass: string;
    badgeClass: string;
  }
> = {
  CONSTRUCCION: {
    label: 'Construcción y Altura',
    shortLabel: 'Obra',
    workstationTitle: 'Obra en Altura',
    accentClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  QUIMICO: {
    label: 'Laboratorio Químico',
    shortLabel: 'Químico',
    workstationTitle: 'Laboratorio Químico',
    accentClass: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  INDUSTRIAL: {
    label: 'Planta Industrial',
    shortLabel: 'Planta',
    workstationTitle: 'Planta de Maquinaria',
    accentClass: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
  OFICINA: {
    label: 'Oficina y PVD',
    shortLabel: 'Oficina',
    workstationTitle: 'Oficina y PVD',
    accentClass: 'text-teal-400 border-teal-500/40 bg-teal-500/10',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  },
  ALL: {
    label: 'Multisectorial (Comodín)',
    shortLabel: 'Comodín',
    workstationTitle: 'Todos los sectores',
    accentClass: 'text-yellow-300 border-yellow-400/50 bg-yellow-500/10',
    badgeClass: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40',
  },
};

export const CARD_TEMPLATES: CardTemplate[] = [
  // ==========================================
  // 1. PUESTOS DE TRABAJO (WORKSTATION)
  // ==========================================
  {
    templateId: 'ws-construccion',
    title: 'Obra en Altura',
    category: 'WORKSTATION',
    sector: 'CONSTRUCCION',
    description:
      'Despliega un puesto de trabajos en altura, andamios o excavaciones en tu empresa.',
    prlTip:
      'RD 1627/1997: En obras de construcción es obligatorio elaborar un Estudio y Plan de Seguridad y Salud antes de iniciar trabajos por encima de 2 metros.',
    weight: 7,
  },
  {
    templateId: 'ws-quimico',
    title: 'Laboratorio Químico',
    category: 'WORKSTATION',
    sector: 'QUIMICO',
    description:
      'Abre un laboratorio o planta de manipulación de agentes químicos peligrosos.',
    prlTip:
      'RD 374/2001: Todo puesto con agentes químicos debe evaluar el riesgo por inhalación o contacto dérmico y disponer de Fichas de Datos de Seguridad (FDS).',
    weight: 7,
  },
  {
    templateId: 'ws-industrial',
    title: 'Planta de Maquinaria',
    category: 'WORKSTATION',
    sector: 'INDUSTRIAL',
    description:
      'Instala una línea de producción industrial con equipos de trabajo y cuadros eléctricos.',
    prlTip:
      'RD 1215/1997: Todos los equipos de trabajo deben contar con marcado CE, manual en castellano y mantenimiento preventivo documentado.',
    weight: 7,
  },
  {
    templateId: 'ws-oficina',
    title: 'Oficina y PVD',
    category: 'WORKSTATION',
    sector: 'OFICINA',
    description:
      'Habilita un área administrativa con Pantallas de Visualización de Datos (PVD).',
    prlTip:
      'RD 488/1997: Se considera usuario de PVD a quien supera 4 h/día o 20 h/semana frente a pantalla, requiriendo diseño ergonómico del puesto.',
    weight: 7,
  },

  // ==========================================
  // 2. RIESGOS LABORALES (HAZARD - ROJAS)
  // ==========================================
  {
    templateId: 'haz-caida-altura',
    title: 'Caída a distinto nivel',
    category: 'HAZARD',
    sector: 'CONSTRUCCION',
    description:
      'Fallo en borde de forjado o andamio sin barandilla ni sistema anticaídas en un rival.',
    prlTip:
      'RD 2177/2004: Toda superficie de trabajo a más de 2 metros de altura exige barandillas resistentes (90 cm mínimo, listón intermedio y rodapié).',
    weight: 3,
  },
  {
    templateId: 'haz-sepultamiento',
    title: 'Sepultamiento en zanja',
    category: 'HAZARD',
    sector: 'CONSTRUCCION',
    description:
      'Desprendimiento de tierras por ausencia de entibación o talud seguro en excavación.',
    prlTip:
      'Ley 31/1995 Art. 21: Ante riesgo grave e inminente de derrumbe en zanjas >1,3 m sin entibar, los trabajadores deben detener la actividad.',
    weight: 3,
  },
  {
    templateId: 'haz-vapores-toxicos',
    title: 'Inhalación de vapores tóxicos',
    category: 'HAZARD',
    sector: 'QUIMICO',
    description:
      'Exposición a disolventes o gases por encima del Valor Límite Ambiental (VLA).',
    prlTip:
      'RD 374/2001 y Límites INSST: Debe sustituirse el agente peligroso o actuar primero en el foco con extracción localizada antes de recurrir a EPIs.',
    weight: 3,
  },
  {
    templateId: 'haz-contacto-corrosivo',
    title: 'Contacto dérmico corrosivo',
    category: 'HAZARD',
    sector: 'QUIMICO',
    description:
      'Salpicadura de ácidos o bases fuertes por trasvase sin envase homologado ni protección.',
    prlTip:
      'Reglamento CLP (CE 1272/2008): El etiquetado con pictogramas de peligro H314 obliga a disponer de medios de lavado inmediato y guantes químicos EN 374.',
    weight: 3,
  },
  {
    templateId: 'haz-atrapamiento',
    title: 'Atrapamiento mecánico',
    category: 'HAZARD',
    sector: 'INDUSTRIAL',
    description:
      'Órganos móviles, rodillos o prensas accesibles por retirada indebida de protecciones.',
    prlTip:
      'RD 1215/1997 Anexo I: Las partes móviles con riesgo de atrapamiento deben impedir el acceso o detenerse antes de alcanzar la zona peligrosa.',
    weight: 3,
  },
  {
    templateId: 'haz-electrico',
    title: 'Contacto eléctrico directo',
    category: 'HAZARD',
    sector: 'INDUSTRIAL',
    description:
      'Intervención en cuadro eléctrico en tensión sin aplicar las 5 Reglas de Oro.',
    prlTip:
      'RD 614/2001: Antes de trabajar sin tensión hay que desconectar, bloquear, verificar ausencia de tensión, poner a tierra/cortocircuito y señalizar.',
    weight: 3,
  },
  {
    templateId: 'haz-fatiga-visual',
    title: 'Fatiga visual por deslumbramiento',
    category: 'HAZARD',
    sector: 'OFICINA',
    description:
      'Reflejos directos sobre monitores, luminancia inadecuada y parpadeo de pantalla.',
    prlTip:
      'RD 486/1997 y RD 488/1997: La pantalla debe colocarse perpendicular a las ventanas, con nivel de iluminación en oficina entre 300 y 500 lux.',
    weight: 3,
  },
  {
    templateId: 'haz-tme-lumbar',
    title: 'Trastorno musculoesquelético dorso-lumbar',
    category: 'HAZARD',
    sector: 'OFICINA',
    description:
      'Posturas forzadas mantenidas, mobiliario rígido y ausencia de micro-pausas.',
    prlTip:
      'Ley 31/1995 Art. 15.1.d): Adaptar el trabajo a la persona, especialmente en el diseño de puestos y elección de equipos ergonómicos.',
    weight: 3,
  },
  {
    templateId: 'haz-burnout',
    title: 'Síndrome de Burnout / Carga mental',
    category: 'HAZARD',
    sector: 'ALL',
    description:
      'COMODÍN: Sobrecarga de trabajo, estrés crónico y riesgos psicosociales en cualquier puesto.',
    prlTip:
      'Ley 31/1995 Art. 4.7 y NTP 704: Los riesgos psicosociales (ritmo, autonomía, carga mental) deben evaluarse igual que los riesgos físicos o químicos.',
    weight: 3,
  },
  {
    templateId: 'haz-estres-termico',
    title: 'Estrés térmico',
    category: 'HAZARD',
    sector: 'ALL',
    description:
      'COMODÍN: Exposición a temperaturas extremas por calor o frío intenso en cualquier sector.',
    prlTip:
      'RD 486/1997 (modificado por RDL 4/2023): En locales cerrados sedentarios 17-27 ºC; en trabajos al aire libre con alerta naranja/roja AEMET hay que adaptar o suspender jornada.',
    weight: 3,
  },

  // ==========================================
  // 3. MEDIDAS PREVENTIVAS, EPC Y EPIS (PREVENTION)
  // ==========================================
  {
    templateId: 'prev-arnes',
    title: 'Arnés anticaídas y línea de vida',
    category: 'PREVENTION',
    sector: 'CONSTRUCCION',
    description:
      'Sistema de sujeción certificado EN 361 conectado a punto de anclaje resistente.',
    prlTip:
      'RD 773/1997: Los EPIs anticaídas son de Categoría III (riesgo mortal) y requieren revisión periódica anual por persona competente y formación práctica.',
    weight: 3,
  },
  {
    templateId: 'prev-redes',
    title: 'Redes perimetrales (Protección Colectiva)',
    category: 'PREVENTION',
    sector: 'CONSTRUCCION',
    description:
      'Instalación de redes de seguridad tipo V/S y barandillas rígidas en todo el perímetro.',
    prlTip:
      'Ley 31/1995 Art. 15.1.h): Principio de acción preventiva fundamental: anteponer siempre la Protección Colectiva (redes, barandillas) a la Protección Individual.',
    weight: 3,
  },
  {
    templateId: 'prev-campana-ffp3',
    title: 'Campana extractora de gases y mascarilla FFP3',
    category: 'PREVENTION',
    sector: 'QUIMICO',
    description:
      'Extracción localizada en cabina de laboratorio combinada con protección respiratoria EN 149.',
    prlTip:
      'RD 374/2001: La campana extractora reduce la concentración ambiental en origen; la mascarilla FFP3 protege frente a aerosoles tóxicos de alta toxicidad.',
    weight: 3,
  },
  {
    templateId: 'prev-lavaojos-fds',
    title: 'Ducha lavaojos y Fichas FDS',
    category: 'PREVENTION',
    sector: 'QUIMICO',
    description:
      'Estación de descontaminación a menos de 10 segundos y registro accesible de FDS.',
    prlTip:
      'Reglamento REACH / RD 374/2001: La Ficha de Datos de Seguridad (16 secciones) indica los primeros auxilios específicos y los EPIs exigidos por cada sustancia.',
    weight: 3,
  },
  {
    templateId: 'prev-loto',
    title: 'Bloqueo y Etiquetado (Sistema LOTO)',
    category: 'PREVENTION',
    sector: 'INDUSTRIAL',
    description:
      'Consignación física con candado personal y tarjeta de bloqueo antes de intervenir máquinas.',
    prlTip:
      'RD 1215/1997 y RD 614/2001: El sistema Lockout/Tagout impide la puesta en marcha intempestiva durante tareas de mantenimiento o reparación.',
    weight: 3,
  },
  {
    templateId: 'prev-resguardo',
    title: 'Resguardo fijo y parada de emergencia',
    category: 'PREVENTION',
    sector: 'INDUSTRIAL',
    description:
      'Barrera física enclavada y seta de paro rojo sobre fondo amarillo de acceso inmediato.',
    prlTip:
      'ISO 13850 / RD 1215/1997: La seta de parada de emergencia es una medida complementaria y nunca sustituye a los resguardos ni enclavamientos de seguridad.',
    weight: 3,
  },
  {
    templateId: 'prev-silla-pausas',
    title: 'Silla ergonómica y pausas activas',
    category: 'PREVENTION',
    sector: 'OFICINA',
    description:
      'Asiento regulable con apoyo lumbar, reposapiés y pausas de 5 minutos cada hora.',
    prlTip:
      'RD 488/1997 y Guía Técnica INSST: El asiento debe tener 5 apoyos con ruedas, altura y respaldo regulables, promoviendo alternar posturas y pausas visuales.',
    weight: 3,
  },
  {
    templateId: 'prev-pantalla-luz',
    title: 'Pantalla antirreflejo y ergonomía visual',
    category: 'PREVENTION',
    sector: 'OFICINA',
    description:
      'Monitor regulable en altura a distancia brazo, luminarias apantalladas y sin reflejos.',
    prlTip:
      'RD 488/1997: El borde superior de la pantalla debe quedar a la altura de los ojos o ligeramente por debajo (10-20°) para evitar sobrecarga cervical.',
    weight: 3,
  },
  {
    templateId: 'prev-evaluacion-formacion',
    title: 'Evaluación de Riesgos y Formación PRL',
    category: 'PREVENTION',
    sector: 'ALL',
    description:
      'COMODÍN: Evaluación inicial actualizada y formación teórica y práctica suficiente y adecuada.',
    prlTip:
      'Ley 31/1995 Art. 16 y Art. 19: La formación en PRL es gratuita para el trabajador, se realiza en jornada laboral y se repite si cambian equipos o funciones.',
    weight: 4,
  },
  {
    templateId: 'prev-vigilancia-salud',
    title: 'Vigilancia de la Salud y Señalización',
    category: 'PREVENTION',
    sector: 'ALL',
    description:
      'COMODÍN: Reconocimientos médicos específicos (Art. 22) y señalización normalizada RD 485/1997.',
    prlTip:
      'Ley 31/1995 Art. 22: La vigilancia de la salud es voluntaria con consentimiento, confidencial, y obligatoria solo cuando es imprescindible para evaluar riesgos o proteger a terceros.',
    weight: 3,
  },

  // ==========================================
  // 4. CARTAS DE INSPECCIÓN Y GESTIÓN (ACTION)
  // ==========================================
  {
    templateId: 'act-inspeccion-sorpresa',
    title: 'Inspección Sorpresa',
    category: 'ACTION',
    sector: 'ALL',
    actionEffect: 'INSPECTION_SURPRISE',
    description:
      'Eliges a un rival; si tiene riesgos activos, le bloqueas 1 carta al azar en la siguiente ronda y ganas +100 pts.',
    prlTip:
      'Ley 23/2015 (ITSS): La Inspección de Trabajo y Seguridad Social puede requerir paralización o levantar acta de infracción por deficiencias preventivas activas.',
    weight: 4,
  },
  {
    templateId: 'act-benchmarking',
    title: 'Benchmarking de Seguridad',
    category: 'ACTION',
    sector: 'ALL',
    actionEffect: 'BENCHMARKING',
    description:
      'Copias una medida preventiva activa de cualquier rival y la aplicas en un puesto de tu empresa.',
    prlTip:
      'ISO 45001:2018 Cláusula 10.3 (Mejora Continua): Compartir buenas prácticas preventivas entre organizaciones impulsa la cultura preventiva.',
    weight: 4,
  },
  {
    templateId: 'act-plan-emergencia',
    title: 'Plan de Emergencia y Evacuación',
    category: 'ACTION',
    sector: 'ALL',
    actionEffect: 'EMERGENCY_PLAN',
    description:
      'Limpia todos los riesgos activos de tu propia empresa de golpe mediante respuesta coordinada.',
    prlTip:
      'Ley 31/1995 Art. 20: Toda empresa debe analizar posibles situaciones de emergencia, designar personal encargado de primeros auxilios/evacuación y hacer simulacros.',
    weight: 4,
  },
  {
    templateId: 'act-subcontratacion',
    title: 'Subcontratación Segura',
    category: 'ACTION',
    sector: 'ALL',
    actionEffect: 'SAFE_SUBCONTRACT',
    description:
      'Robas un puesto de trabajo no certificado de un rival que aún no tengas en tu empresa.',
    prlTip:
      'RD 171/2004 (Coordinación de Actividades Empresariales): La empresa titular y contratistas deben intercambiar evaluación de riesgos y vigilar el cumplimiento preventivo.',
    weight: 4,
  },
];

let cardInstanceSeq = 0;

export function createCardInstance(template: CardTemplate): CardInstance {
  cardInstanceSeq += 1;
  return {
    id: `card-${template.templateId}-${Date.now().toString(36)}-${cardInstanceSeq}-${Math.random()
      .toString(36)
      .slice(2, 6)}`,
    templateId: template.templateId,
    title: template.title,
    category: template.category,
    sector: template.sector,
    actionEffect: template.actionEffect,
    description: template.description,
    prlTip: template.prlTip,
  };
}

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates an auto-scaled deck proportional to connected players (totalPlayers * 12 cards).
 */
export function generateScaledDeck(totalPlayers: number): CardInstance[] {
  const safePlayers = Math.max(2, Math.min(20, totalPlayers));
  const targetSize = safePlayers * 12;

  const totalWeight = CARD_TEMPLATES.reduce((sum, t) => sum + t.weight, 0);
  const deck: CardInstance[] = [];

  // Allocate proportionally by template weight
  const remainders: { template: CardTemplate; frac: number }[] = [];
  for (const template of CARD_TEMPLATES) {
    const exact = (template.weight / totalWeight) * targetSize;
    const count = Math.floor(exact);
    for (let i = 0; i < count; i++) {
      deck.push(createCardInstance(template));
    }
    remainders.push({ template, frac: exact - count });
  }

  // Distribute remaining slots by largest fractional remainder
  remainders.sort((a, b) => b.frac - a.frac);
  let idx = 0;
  while (deck.length < targetSize) {
    const item = remainders[idx % remainders.length];
    deck.push(createCardInstance(item.template));
    idx++;
  }

  return shuffleArray(deck);
}

/**
 * Draws `count` cards from `deck`, automatically reshuffling `discardPile` if needed.
 * If both are somehow exhausted (extreme edge case), generates a small emergency refill batch.
 */
export function drawCards(
  deck: CardInstance[],
  discardPile: CardInstance[],
  count: number,
  totalPlayers: number
): { drawn: CardInstance[]; deck: CardInstance[]; discardPile: CardInstance[] } {
  const nextDeck = [...deck];
  let nextDiscard = [...discardPile];
  const drawn: CardInstance[] = [];

  for (let i = 0; i < count; i++) {
    if (nextDeck.length === 0) {
      if (nextDiscard.length > 0) {
        nextDeck.push(...shuffleArray(nextDiscard));
        nextDiscard = [];
      } else {
        // Emergency refill batch scaled safely
        nextDeck.push(...generateScaledDeck(Math.max(2, Math.ceil(totalPlayers / 2))));
      }
    }
    const card = nextDeck.shift();
    if (card) {
      drawn.push(card);
    }
  }

  return { drawn, deck: nextDeck, discardPile: nextDiscard };
}

export function getWorkstationTitle(sector: ConcreteSector): string {
  return SECTOR_META[sector].workstationTitle;
}

export function getConcreteSectors(): ConcreteSector[] {
  return CONCRETE_SECTORS;
}
