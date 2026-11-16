import { PrlQuestion, Sector } from '@/types/game';

export const PRL_QUESTIONS: PrlQuestion[] = [
  // ==========================================
  // PRINCIPIOS GENERALES / LEY 31/1995 (ALL)
  // ==========================================
  {
    id: 'q-01',
    sector: 'ALL',
    question:
      'Según el Art. 15 de la Ley 31/1995 de PRL, ¿qué prioridad debe aplicarse siempre antes de entregar Equipos de Protección Individual (EPIs)?',
    options: [
      'Anteponer la protección colectiva a la individual y combatir los riesgos en su origen.',
      'Entregar primero mascarillas y cascos para ahorrar tiempo en obra.',
      'Firmar un anexo económico sustituyendo las medidas técnicas por un plus de peligrosidad.',
      'Dejar que cada trabajador elija qué medida prefiere aplicar.',
    ],
    correctIndex: 0,
    explanation:
      'El Art. 15.1.h) establece claramente que debe anteponerse la protección colectiva a la individual, y evitar/evaluar los riesgos combatiéndolos en su origen.',
    reference: 'Ley 31/1995, Art. 15',
  },
  {
    id: 'q-02',
    sector: 'ALL',
    question:
      '¿Quién debe asumir el coste de la formación en Prevención de Riesgos Laborales y cuándo debe impartirse (Art. 19 Ley 31/1995)?',
    options: [
      'El trabajador al 50%, preferiblemente en fin de semana.',
      'La empresa íntegramente, dentro de la jornada laboral (o descontando ese tiempo de ella).',
      'La mutua colaboradora, siempre fuera del horario de trabajo.',
      'Solo es obligatoria para mandos intermedios y delegados de prevención.',
    ],
    correctIndex: 1,
    explanation:
      'La formación preventiva nunca puede recaer sobre el trabajador: su coste corre a cargo de la empresa y debe impartirse en jornada de trabajo.',
    reference: 'Ley 31/1995, Art. 19.2',
  },
  {
    id: 'q-03',
    sector: 'ALL',
    question:
      'Ante un riesgo grave e inminente para su vida o salud (Art. 21 Ley 31/1995), ¿qué derecho tiene el trabajador?',
    options: [
      'Debe continuar trabajando hasta que llegue la Inspección de Trabajo.',
      'Solo puede parar si lo autoriza por escrito la dirección financiera.',
      'Interrumpir su actividad y abandonar el lugar de trabajo de inmediato sin sufrir perjuicio.',
      'Esperar 24 horas para presentar un parte de incidencia.',
    ],
    correctIndex: 2,
    explanation:
      'El Art. 21 reconoce el derecho a paralizar la actividad y abandonar de inmediato la zona ante riesgo grave e inminente, sin que pueda derivarse sanción salvo mala fe.',
    reference: 'Ley 31/1995, Art. 21',
  },
  {
    id: 'q-04',
    sector: 'ALL',
    question:
      'En el RD 485/1997 de señalización de seguridad, ¿qué combinación de color y forma indica una señal de OBLIGACIÓN (ej. uso obligatorio de casco o gafas)?',
    options: [
      'Triángulo amarillo con borde negro.',
      'Círculo azul con pictograma blanco.',
      'Círculo rojo tachado sobre fondo blanco.',
      'Cuadrado o rectángulo verde.',
    ],
    correctIndex: 1,
    explanation:
      'Las señales de obligación son redondas, con fondo azul y pictograma blanco. Las triangulares amarillas advierten de peligro y las verdes indican salvamento.',
    reference: 'RD 485/1997, Anexo III',
  },
  {
    id: 'q-05',
    sector: 'ALL',
    question:
      '¿Qué metodología estructural sigue la norma internacional ISO 45001:2018 para el Sistema de Gestión de Seguridad y Salud en el Trabajo?',
    options: [
      'El ciclo PHVA (Planificar - Hacer - Verificar - Actuar) con liderazgo y participación.',
      'Un modelo exclusivamente punitivo basado en multas internas.',
      'La revisión única cada 10 años sin consulta a la plantilla.',
      'Un listado contable opcional sin auditorías internas.',
    ],
    correctIndex: 0,
    explanation:
      'ISO 45001 se articula en el ciclo de mejora continua PHVA (Plan-Do-Check-Act), poniendo especial énfasis en el liderazgo y la consulta a los trabajadores.',
    reference: 'ISO 45001:2018, Cláusula 0.3',
  },
  {
    id: 'q-06',
    sector: 'ALL',
    question:
      'En la vigilancia periódica de la salud (Art. 22 Ley 31/1995), ¿cuál es la regla general respecto a los resultados médicos?',
    options: [
      'El departamento de RR.HH. recibe el historial clínico completo del trabajador.',
      'Son públicos en el tablón de anuncios para fomentar la prevención.',
      'El acceso médico es confidencial y la empresa solo recibe la aptitud (Apto / Apto con limitaciones / No apto).',
      'Siempre son obligatorios incluso para riesgos administrativos inexistentes.',
    ],
    correctIndex: 2,
    explanation:
      'Los datos médicos están protegidos por secreto profesional sanitario; al empresario solo se le comunican las conclusiones sobre la aptitud para el puesto.',
    reference: 'Ley 31/1995, Art. 22.3-4',
  },
  {
    id: 'q-07',
    sector: 'ALL',
    question:
      'Según el RD 487/1997 sobre manipulación manual de cargas, ¿cuál es el peso máximo recomendado con carácter general en condiciones ideales de levantamiento?',
    options: [
      '10 kg',
      '25 kg',
      '45 kg',
      '60 kg',
    ],
    correctIndex: 1,
    explanation:
      'El límite general de referencia en condiciones ideales es 25 kg (reduciéndose a 15 kg para proteger a mujeres, jóvenes o mayores, y máximo absoluto 40 kg solo con personal entrenado).',
    reference: 'Guía Técnica INSST / RD 487/1997',
  },
  {
    id: 'q-08',
    sector: 'ALL',
    question:
      '¿Qué exige el RD 171/2004 sobre Coordinación de Actividades Empresariales (CAE) cuando varias empresas concurren en un mismo centro de trabajo?',
    options: [
      'Cada empresa trabaja aislada sin informar de sus riesgos a las demás.',
      'Cooperar, intercambiar información sobre riesgos propios/concurridos y vigilar el cumplimiento preventivo.',
      'Trasladar toda la responsabilidad legal exclusivamente al trabajador autónomo.',
      'Solo aplica a empresas de más de 500 trabajadores.',
    ],
    correctIndex: 1,
    explanation:
      'El deber de cooperación obliga a informar antes del inicio de actividades sobre los riesgos que puedan afectar a terceros y establecer medios de coordinación.',
    reference: 'Ley 31/1995 Art. 24 / RD 171/2004',
  },

  // ==========================================
  // CONSTRUCCIÓN Y ALTURA (CONSTRUCCION)
  // ==========================================
  {
    id: 'q-09',
    sector: 'CONSTRUCCION',
    question:
      'En trabajos en altura, ¿a partir de qué desnivel es obligatorio adoptar medidas de protección colectiva (barandillas, redes) o sistemas anticaídas según la normativa española?',
    options: [
      'A partir de 2 metros de altura.',
      'Únicamente a partir de 6 metros.',
      'Solo cuando el trabajador indique tener vértigo.',
      'A partir de 10 metros en fachadas exteriores.',
    ],
    correctIndex: 0,
    explanation:
      'Tanto el RD 1627/1997 como el RD 486/1997 y el RD 2177/2004 fijan los 2 metros como umbral obligatorio para proteger frente a caídas de altura.',
    reference: 'RD 1627/1997 y RD 486/1997',
  },
  {
    id: 'q-10',
    sector: 'CONSTRUCCION',
    question:
      '¿Qué componentes mínimos debe integrar una barandilla reglamentaria de protección en obra?',
    options: [
      'Solo una cinta plástica balizada de color rojo y blanco.',
      'Pasamanos rígido (mín. 90 cm), listón intermedio y rodapié (mín. 15 cm) para evitar caída de objetos.',
      'Una cuerda atada entre pilares a 70 cm del suelo.',
      'Únicamente un zócalo inferior sin pasamanos superior.',
    ],
    correctIndex: 1,
    explanation:
      'Las barandillas deben ser rígidas y resistentes, con altura mínima de 90 cm (recomendable 100 cm), protección intermedia y rodapié para impedir caída de personas y materiales.',
    reference: 'RD 1627/1997, Anexo IV',
  },
  {
    id: 'q-11',
    sector: 'CONSTRUCCION',
    question:
      'Respecto al uso de un arnés anticaídas (EPI Categoría III), ¿qué precaución es crítica tras sufrir una caída frenada por el sistema?',
    options: [
      'Lavarlo con agua y reutilizarlo inmediatamente al día siguiente.',
      'Retirarlo de servicio de inmediato para revisión/destrucción, especialmente si actuó el absorbedor de energía.',
      'Prestarlo a otro compañero de menor peso.',
      'Cortar las cintas deshilachadas con tijeras y seguir trabajando.',
    ],
    correctIndex: 1,
    explanation:
      'Un arnés o absorbedor que ha detenido una caída ha sufrido deformación y solicitación extrema; debe retirarse de inmediato según RD 773/1997 e instrucciones del fabricante.',
    reference: 'RD 773/1997 / UNE-EN 361',
  },
  {
    id: 'q-12',
    sector: 'CONSTRUCCION',
    question:
      'En excavaciones y zanjas, ¿cuál es una regla clave para prevenir sepultamientos y caídas al borde?',
    options: [
      'Acopiar la tierra excavada justo en el borde superior de la zanja.',
      'Entibar o dar talud estable según terreno y mantener acopios/maquinaria alejados del borde (mín. 1-2 m).',
      'Dejar entrar al trabajador antes de comprobar filtraciones de agua o grietas.',
      'Utilizar solo casco de obra sin verificar la estabilidad del terreno.',
    ],
    correctIndex: 1,
    explanation:
      'El acopio de tierras o paso de maquinaria cerca del borde sobrecarga el terreno y provoca derrumbes; es imprescindible entibar o taluzar y respetar la distancia de seguridad.',
    reference: 'RD 1627/1997, Anexo IV Parte C',
  },
  {
    id: 'q-13',
    sector: 'CONSTRUCCION',
    question:
      'Si un trabajador queda suspendido de un arnés tras una caída en altura, ¿por qué el rescate debe ser rápido?',
    options: [
      'Por el síndrome del arnés (trauma por suspensión), que puede comprometer la circulación en pocos minutos.',
      'Únicamente para evitar que la obra acumule retrasos.',
      'Porque el mosquetón se oxida en cuestión de segundos.',
      'No hay prisa; un trabajador suspendido puede esperar horas sin riesgo.',
    ],
    correctIndex: 0,
    explanation:
      'La inmovilidad en suspensión comprime vasos sanguíneos en las piernas y puede provocar shock ortostático mortal; todo trabajo con arnés exige plan de rescate rápido.',
    reference: 'NTP 1082 INSST',
  },
  {
    id: 'q-14',
    sector: 'CONSTRUCCION',
    question:
      'En una obra de construcción con concurrencia de varias empresas contratistas y subcontratistas, ¿quién elabora el Plan de Seguridad y Salud?',
    options: [
      'Cada contratista, adaptando el Estudio (o Estudio Básico) de Seguridad y Salud al sistema constructivo.',
      'Únicamente el proveedor de hormigón.',
      'El Ayuntamiento de la localidad de forma automática.',
      'No hace falta si todos los trabajadores llevan chaleco reflectante.',
    ],
    correctIndex: 0,
    explanation:
      'El RD 1627/1997 Art. 7 exige que cada contratista elabore su Plan de Seguridad y Salud en aplicación del Estudio redactado en fase de proyecto, aprobado por el Coordinador.',
    reference: 'RD 1627/1997, Art. 7',
  },

  // ==========================================
  // LABORATORIO QUÍMICO (QUIMICO)
  // ==========================================
  {
    id: 'q-15',
    sector: 'QUIMICO',
    question:
      '¿Qué documento obligatorio proporciona información detallada en 16 secciones sobre peligros, manipulación, primeros auxilios y EPIs de una sustancia química?',
    options: [
      'El albarán comercial de entrega.',
      'La Ficha de Datos de Seguridad (FDS).',
      'El certificado de garantía eléctrica.',
      'La nómina mensual del laboratorio.',
    ],
    correctIndex: 1,
    explanation:
      'La Ficha de Datos de Seguridad (FDS) regulada por REACH (Reglamento CE 1907/2006) debe estar en idioma oficial y accesible para todo el personal expuesto.',
    reference: 'Reglamento REACH / RD 374/2001',
  },
  {
    id: 'q-16',
    sector: 'QUIMICO',
    question:
      'En el Reglamento CLP sobre etiquetado químico, ¿qué forma geométrica y colores tienen siempre los pictogramas de peligro?',
    options: [
      'Círculo verde con símbolo amarillo.',
      'Rombo (cuadrado apoyado en un vértice) con borde rojo, fondo blanco y símbolo negro.',
      'Triángulo azul con borde blanco.',
      'Hexágono gris sin bordes.',
    ],
    correctIndex: 1,
    explanation:
      'El sistema armonizado CLP utiliza rombos con marco rojo sobre fondo blanco y pictograma negro (ej. corrosivo, inflamable, toxicidad aguda, peligro para la salud).',
    reference: 'Reglamento CLP (CE) 1272/2008',
  },
  {
    id: 'q-17',
    sector: 'QUIMICO',
    question:
      'Al trasvasar un producto químico peligroso desde un bidón grande a un frasco pequeño en laboratorio, ¿qué acción es IMPRESCINDIBLE?',
    options: [
      'Usar una botella de agua mineral vacía para reconocerlo rápido.',
      'Etiquetar de inmediato el nuevo recipiente con el nombre del producto y sus pictogramas de peligro.',
      'Realizar el trasvase junto a llamas abiertas para ver mejor.',
      'Mezclar restos de distintos disolventes para ahorrar envases.',
    ],
    correctIndex: 1,
    explanation:
      'Está terminantemente prohibido usar envases de alimentos/bebidas o mantener productos químicos sin etiquetar: genera intoxicaciones e incendios graves.',
    reference: 'RD 374/2001 y NTP 635 INSST',
  },
  {
    id: 'q-18',
    sector: 'QUIMICO',
    question:
      '¿Qué mide el VLA-ED (Valor Límite Ambiental - Exposición Diaria) publicado anualmente por el INSST?',
    options: [
      'La temperatura máxima de ebullición del agua.',
      'La concentración media ponderada para 8 h/día y 40 h/semana por debajo de la cual no se esperan efectos adversos en la mayoría de trabajadores.',
      'El volumen máximo permitido en el almacén de residuos.',
      'El nivel de ruido de las campanas extractoras.',
    ],
    correctIndex: 1,
    explanation:
      'El VLA-ED representa la concentración de referencia para exposiciones diarias de 8 horas (40 h semanales), complementado por el VLA-EC (corta duración, 15 min).',
    reference: 'RD 374/2001 / Límites INSST',
  },
  {
    id: 'q-19',
    sector: 'QUIMICO',
    question:
      'Respecto a una ducha de seguridad y fuente lavaojos en laboratorio químico, ¿cuál es el criterio de ubicación y mantenimiento correcto?',
    options: [
      'Pueden ubicarse cerradas bajo llave en el pasillo exterior.',
      'Accesibles en menos de 10 segundos (sin obstáculos) desde la zona de riesgo y probadas periódicamente.',
      'Solo se conectan si ocurre un derrame de más de 100 litros.',
      'Deben suministrar agua a más de 60 ºC para disolver ácidos.',
    ],
    correctIndex: 1,
    explanation:
      'Ante salpicadura corrosiva cada segundo cuenta para evitar ceguera o quemaduras profundas: deben estar libres de obstáculos (<10 s) y verificarse semanalmente.',
    reference: 'UNE-EN 15154 / NTP 551 INSST',
  },
  {
    id: 'q-20',
    sector: 'QUIMICO',
    question:
      '¿Cuál es la diferencia fundamental entre una mascarilla quirúrgica y una mascarilla autofiltrante FFP3 (EPI)?',
    options: [
      'Ninguna, protegen exactamente frente a los mismos aerosoles tóxicos.',
      'La quirúrgica protege al entorno de gotículas del portador; la FFP3 es un EPI con ajuste facial y filtración mínima del 99% frente a partículas/aerosoles.',
      'La FFP3 es solo para proteger del frío ambiental.',
      'La quirúrgica filtra vapores orgánicos mejor que un filtro de carbón activo.',
    ],
    correctIndex: 1,
    explanation:
      'La mascarilla FFP3 cumple la norma EN 149 como EPI de Categoría III frente a partículas muy tóxicas, mientras que una mascarilla quirúrgica es producto sanitario no EPI.',
    reference: 'RD 773/1997 / UNE-EN 149',
  },

  // ==========================================
  // PLANTA INDUSTRIAL / MAQUINARIA (INDUSTRIAL)
  // ==========================================
  {
    id: 'q-21',
    sector: 'INDUSTRIAL',
    question:
      'En trabajos sin tensión en instalaciones eléctricas (RD 614/2001), ¿cuál es la secuencia correcta de las 3 primeras Reglas de Oro?',
    options: [
      '1. Verificar ausencia de tensión, 2. Desconectar, 3. Señalizar.',
      '1. Desconectar, 2. Prevenir cualquier posible realimentación (bloquear), 3. Verificar la ausencia de tensión.',
      '1. Poner a tierra, 2. Cortocircuitar, 3. Desconectar.',
      '1. Avisar por WhatsApp, 2. Quitar guantes dieléctricos, 3. Abrir cuadro.',
    ],
    correctIndex: 1,
    explanation:
      'El orden estricto de las 5 Reglas de Oro es: 1) Desconectar, 2) Bloquear/prevenir realimentación, 3) Verificar ausencia de tensión, 4) Poner a tierra y en cortocircuito, 5) Proteger y señalizar.',
    reference: 'RD 614/2001, Anexo II',
  },
  {
    id: 'q-22',
    sector: 'INDUSTRIAL',
    question:
      '¿Para qué sirve exactamente el procedimiento LOTO (Lockout / Tagout — Bloqueo y Etiquetado) en mantenimiento industrial?',
    options: [
      'Para calcular la productividad por hora de cada máquina.',
      'Para aislar fuentes de energía (eléctrica, neumática, hidráulica) con candado personal y evitar puestas en marcha accidentales.',
      'Para acelerar las prensas retirando sus resguardos.',
      'Para registrar las vacaciones del equipo de taller.',
    ],
    correctIndex: 1,
    explanation:
      'El bloqueo LOTO garantiza energía cero y que nadie pueda rearmar un equipo mientras un operario interviene en zona peligrosa; cada trabajador coloca su propio candado.',
    reference: 'RD 1215/1997, Anexo II.1.14',
  },
  {
    id: 'q-23',
    sector: 'INDUSTRIAL',
    question:
      '¿Puede sustituirse un resguardo fijo o enclavado en una máquina peligrosa por la colocación de una seta de parada de emergencia?',
    options: [
      'Sí, si la seta es suficientemente grande y visible.',
      'No, la parada de emergencia es complementaria y nunca sustituye a los resguardos ni dispositivos de protección.',
      'Sí, en máquinas fabricadas antes del año 2005.',
      'Depende de si el operario tiene más de 5 años de antigüedad.',
    ],
    correctIndex: 1,
    explanation:
      'La parada de emergencia solo detiene la máquina tras activarse manualmente en una crisis; no previene el contacto con partes móviles como un resguardo o cortina óptica.',
    reference: 'RD 1215/1997 / UNE-EN ISO 13850',
  },
  {
    id: 'q-24',
    sector: 'INDUSTRIAL',
    question:
      'Al trabajar en las proximidades de órganos móviles giratorios (tornos, taladros, rodillos), ¿qué regla sobre vestimenta y guantes es correcta?',
    options: [
      'Usar ropa holgada, bufandas y pulseras para estar cómodo.',
      'Evitar ropa suelta, pelo largo sin recoger, anillos y guantes en ejes giratorios por riesgo grave de atrapamiento y arrastre.',
      'Usar siempre guantes muy holgados en taladros de columna.',
      'Retirar el resguardo para ver mejor el giro.',
    ],
    correctIndex: 1,
    explanation:
      'La ropa holgada, anillos, pelo suelto o guantes en elementos giratorios pueden engancharse y arrastrar al operario hacia la máquina en milisegundos.',
    reference: 'NTP 552 / RD 1215/1997',
  },
  {
    id: 'q-25',
    sector: 'INDUSTRIAL',
    question:
      'Según el RD 286/2006 sobre exposición al ruido en el trabajo, ¿a partir de qué nivel diario equivalente (LAeq,d) es OBLIGATORIO el uso de protectores auditivos?',
    options: [
      'A partir de 60 dB(A).',
      'Cuando se alcanzan o superan los 85 dB(A) (o 137 dB(C) de pico), siendo obligatorio ofrecerlos desde 80 dB(A).',
      'Únicamente a partir de 120 dB(A).',
      'Solo si el ruido molesta a los vecinos exteriores.',
    ],
    correctIndex: 1,
    explanation:
      'El RD 286/2006 fija el valor inferior de acción en 80 dB(A) (evaluación y puesta a disposición de EPIs) y el superior en 85 dB(A) (uso obligatorio de EPI y señalización).',
    reference: 'RD 286/2006, Art. 5 y 7',
  },
  {
    id: 'q-26',
    sector: 'INDUSTRIAL',
    question:
      '¿Qué indica un marcado CE en una máquina comercializada en la Unión Europea junto con su Declaración CE de Conformidad?',
    options: [
      'Que el fabricante declara que la máquina cumple los requisitos esenciales de seguridad y salud de la Directiva de Máquinas.',
      'Que la máquina se fabricó en China sin revisiones.',
      'Que nunca necesitará mantenimiento preventivo en su vida útil.',
      'Que el operario ya no necesita formación para utilizarla.',
    ],
    correctIndex: 0,
    explanation:
      'El marcado CE y el manual de instrucciones en el idioma del usuario acreditan el cumplimiento de los requisitos de seguridad de diseño, pero no eximen del mantenimiento ni formación.',
    reference: 'RD 1644/2008 / RD 1215/1997',
  },

  // ==========================================
  // OFICINA Y PVD (OFICINA)
  // ==========================================
  {
    id: 'q-27',
    sector: 'OFICINA',
    question:
      'Para evitar reflejos y deslumbramientos en puestos con Pantallas de Visualización de Datos (PVD), ¿cómo debe orientarse el monitor respecto a las ventanas?',
    options: [
      'Justo de frente a la ventana mirando al sol exterior.',
      'Justo de espaldas a la ventana para que la luz incida directamente sobre la pantalla.',
      'Perpendicular a las ventanas (luz lateral), combinando persianas o lamas regulables.',
      'Con la oficina completamente a oscuras.',
    ],
    correctIndex: 2,
    explanation:
      'La ubicación perpendicular evita tanto el deslumbramiento directo (ventana detrás del monitor) como los reflejos molestos sobre la pantalla (ventana detrás del usuario).',
    reference: 'RD 488/1997 / Guía INSST PVD',
  },
  {
    id: 'q-28',
    sector: 'OFICINA',
    question:
      'En ergonomía de oficina, ¿a qué altura debe quedar idealmente el borde superior de la pantalla del ordenador?',
    options: [
      'A la altura de los ojos o ligeramente por debajo (ángulo visual de 10° a 20° hacia abajo).',
      '25 cm por encima de la cabeza para estirar el cuello.',
      'Sobre el regazo mirando a 70° hacia abajo todo el día.',
      'Pegada a menos de 20 cm de la cara.',
    ],
    correctIndex: 0,
    explanation:
      'Mantener el borde superior a la altura ocular (a una distancia de 40-70 cm) mantiene la columna cervical neutra y reduce la fatiga visual y muscular.',
    reference: 'RD 488/1997, Anexo',
  },
  {
    id: 'q-29',
    sector: 'OFICINA',
    question:
      'Cuando se trabaja de forma continuada con ordenador portátiles durante más de 2 horas al día en oficina, ¿qué medida ergonómica recomienda la Guía del INSST?',
    options: [
      'Apoyar el portátil sobre las rodillas en el sofá.',
      'Utilizar soporte elevador de pantalla junto con teclado y ratón independientes.',
      'Reducir el brillo al 5% y encorvar la espalda.',
      'Trabajar sin silla para estar alerta.',
    ],
    correctIndex: 1,
    explanation:
      'El portátil obliga a bajar la mirada o elevar los hombros al estar teclado y pantalla unidos; un soporte elevador más teclado/ratón externos corrigen la postura.',
    reference: 'Guía Técnica PVD INSST (RD 488/1997)',
  },
  {
    id: 'q-30',
    sector: 'OFICINA',
    question:
      'Para prevenir la fatiga visual y el sedentarismo en puestos de oficina con PVD, ¿cuál es la pauta recomendada de pausas?',
    options: [
      'Trabajar 8 horas sin levantarse y compensarlo al final de la semana.',
      'Alternar tareas no informatizadas o realizar micro-pausas cortas (ej. 5 min cada hora) relajando la vista a lo lejos.',
      'Tomar 2 litros de café sin moverse del asiento.',
      'Apagar las luces generales y dejar solo el monitor.',
    ],
    correctIndex: 1,
    explanation:
      'Las pausas cortas y frecuentes previenen mucho mejor la fatiga visual y muscular que pausas largas acumuladas; mirar a >6 m relaja el músculo ciliar (regla 20-20-20).',
    reference: 'RD 488/1997, Art. 4 / NTP 602',
  },
];

/**
 * Picks a PRL question matching the target sector when possible (with fallback to ALL / any unseen).
 */
export function pickPrlQuestion(
  sector: Sector,
  recentlyAskedIds: string[] = []
): PrlQuestion {
  const sectorPool = PRL_QUESTIONS.filter(
    (q) => q.sector === sector || q.sector === 'ALL'
  );
  const unseenSector = sectorPool.filter((q) => !recentlyAskedIds.includes(q.id));
  const pool =
    unseenSector.length > 0
      ? unseenSector
      : sectorPool.length > 0
        ? sectorPool
        : PRL_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
