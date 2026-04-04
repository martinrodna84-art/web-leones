export const socialLinks = [
  { href: "https://www.youtube.com/c/LosLeonesdelTrail/", label: "YouTube", symbol: "▶" },
  { href: "https://www.instagram.com/losleonesdeltrail/", label: "Instagram", symbol: "◎" },
  { href: "https://www.facebook.com/LosLeonesdelTrail/", label: "Facebook", symbol: "f" },
  { href: "", label: "X", symbol: "X" },
  { href: "https://www.strava.com/clubs/459274", label: "Strava", symbol: "S" },
];

export const socialBarLinks = [
  { href: "https://www.youtube.com/c/LosLeonesdelTrail/", label: "YouTube" },
  { href: "https://www.instagram.com/losleonesdeltrail/", label: "Instagram" },
  { href: "https://www.facebook.com/LosLeonesdelTrail/", label: "Facebook" },
  { href: "", label: "X" },
  { href: "https://www.strava.com/clubs/459274", label: "Strava" },
];

export const footerSocialLinks = [
  { href: "https://www.youtube.com/c/LosLeonesdelTrail/", label: "YouTube" },
  { href: "https://www.instagram.com/losleonesdeltrail/", label: "Instagram" },
  { href: "https://www.facebook.com/LosLeonesdelTrail/", label: "Facebook" },
  { href: "", label: "X" },
  { href: "https://www.strava.com/clubs/459274", label: "Strava" },
];

export const footerPrimaryLinks = [
  { href: "/", label: "Inicio" },
  { href: "/liga-felina", label: "Liga Felina" },
  { href: "/bases", label: "Bases" },
  { href: "/liga-felina/registro", label: "Hazte socio" },
  { href: "/liga-felina/acceso", label: "Zona de socio" },
  { href: "/contacto", label: "Contacto" },
];

export const footerColumns = [
  {
    title: "El club",
    links: [
      { href: "/#informacion", label: "Quienes somos" },
      { href: "/#planes", label: "Entrenamientos" },
      { href: "/liga-felina/registro", label: "Alta de socios" },
    ],
  },
  {
    title: "Liga Felina",
    links: [
      { href: "/liga-felina", label: "Clasificacion" },
      { href: "/bases", label: "Sistema de puntos" },
      { href: "/liga-felina/perfil", label: "Mi panel personal" },
    ],
  },
  {
    title: "Legal y privacidad",
    links: [
      { href: "/legal/aviso-legal", label: "Aviso legal" },
      { href: "/legal/politica-privacidad", label: "Politica de privacidad" },
      { href: "/legal/politica-cookies", label: "Politica de cookies" },
    ],
  },
];

export const footerLegalLinks = [
  { href: "/legal/aviso-legal", label: "Aviso legal" },
  { href: "/legal/politica-privacidad", label: "Politica de privacidad" },
  { href: "/legal/politica-cookies", label: "Politica de cookies" },
];

export const landingStorySections = [
  {
    anchorIds: ["informacion", "unete"],
    eyebrow: "El club",
    title: "Una manada hecha para entrenar, compartir y crecer en serio.",
    body:
      "Los Leones del Trail nacen para quienes quieren una comunidad activa, salidas con sentido y un entorno donde la montana se vive con compromiso, respeto y ambicion deportiva.",
    bullets: [
      "Comunidad real para entrenar y progresar",
      "Salidas, rutas y objetivos compartidos",
      "Espiritu competitivo sin perder el sentido de equipo",
    ],
    href: "/liga-felina/registro",
    hrefLabel: "Hazte socio",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=80",
    imagePosition: "center center",
    icon: "mountain",
  },
  {
    anchorIds: ["inscripcion", "federarse"],
    eyebrow: "Altas y licencias",
    title: "Una entrada clara para darte de alta y preparar tu siguiente temporada.",
    body:
      "Hemos separado el acceso de socios, el contacto y el alta para que cada paso sea mas simple: registrarte, resolver dudas y preparar la parte federativa sin mezclarlo todo en la portada.",
    bullets: [
      "Registro de socio en una pagina especifica",
      "Contacto publico separado para consultas",
      "Base lista para explicar licencias y cobertura",
    ],
    href: "/contacto",
    hrefLabel: "Hablar con el club",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80",
    imagePosition: "center center",
    icon: "shield",
  },
  {
    anchorIds: ["liga-felina", "tablon"],
    eyebrow: "Retos",
    title: "Liga Felina, retos de temporada y actividad competitiva con identidad propia.",
    body:
      "La liga del club ya tiene su propio espacio para clasificaciones, km, desnivel y carreras validadas. La landing ahora actua como puerta de entrada clara a toda esa experiencia.",
    bullets: [
      "Clasificacion general y rankings especificos",
      "Conexion con Strava para enriquecer perfiles",
      "Carreras y objetivos pensados para enganchar a la manada",
    ],
    href: "/liga-felina",
    hrefLabel: "Abrir Liga Felina",
    image:
      "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1600&q=80",
    imagePosition: "center center",
    icon: "trophy",
  },
  {
    anchorIds: ["planes", "rutas", "sesiones"],
    eyebrow: "Entrenamientos",
    title: "Planes, rutas y sesiones para que cada semana tenga direccion.",
    body:
      "Queremos que la web no solo cuente quienes somos, sino que sirva de soporte para organizar rutas, publicar sesiones y construir una estructura deportiva mas util para el club.",
    bullets: [
      "Espacio listo para publicar planes de entrenamiento",
      "Rutas destacadas con contexto y dificultad",
      "Sesiones del club para coordinar la actividad semanal",
    ],
    href: "/contacto",
    hrefLabel: "Pedir informacion",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    imagePosition: "center center",
    icon: "route",
  },
] as const;

export const landingSponsorCards = [
  {
    name: "Patrocinador principal",
    role: "Espacio disponible",
    body: "Reservado para una marca que quiera crecer junto al club y ganar presencia en carreras, contenidos y acciones de temporada.",
    icon: "spark",
  },
  {
    name: "Marca tecnica",
    role: "Colaboracion abierta",
    body: "Pensado para equipamiento, textil o material tecnico alineado con el lenguaje visual y deportivo de Los Leones del Trail.",
    icon: "flag",
  },
  {
    name: "Nutricion y recovery",
    role: "Partner de rendimiento",
    body: "Un bloque para colaboradores orientados a rendimiento, salud deportiva, recuperacion y apoyo al entrenamiento de la manada.",
    icon: "heart",
  },
  {
    name: "Aliado local",
    role: "Comunidad y territorio",
    body: "Espacio para negocios, eventos o entidades locales que quieran asociarse al club y reforzar su presencia en la zona.",
    icon: "handshake",
  },
] as const;

export const quickCards = [
  {
    eyebrow: "Club",
    title: "Informacion, inscripcion y tablon",
    body: "Una entrada clara para nuevos miembros, socios y corredores que quieren formar parte del equipo.",
    href: "#informacion",
  },
  {
    eyebrow: "Retos",
    title: "Liga Felina y objetivos de temporada",
    body: "Un espacio pensado para dinamizar el club con metas, rankings y desafios que enganchan.",
    href: "/liga-felina",
    accent: true,
  },
  {
    eyebrow: "Entrenamientos",
    title: "Planes, rutas y sesiones del equipo",
    body: "Zona preparada para publicar calendarios, recorridos, entrenos y materiales para el grupo.",
    href: "#planes",
  },
];

export const clubCards = [
  {
    id: "unete",
    title: "Unete al equipo",
    body: "Presenta el club, que tipo de ambiente hay y por que merece la pena formar parte de Los Leones del Trail.",
  },
  {
    id: "inscripcion",
    title: "Formulario de inscripcion",
    body: "Bloque preparado para enlazar o incrustar el alta de nuevos miembros.",
  },
  {
    id: "federarse",
    title: "Federarse con nosotros",
    body: "Espacio para explicar licencias, ventajas, cobertura y proceso de alta.",
  },
  {
    id: "tablon",
    title: "Tablon del club",
    body: "Ideal para avisos, salidas, comunicados internos y novedades del calendario.",
  },
];

export const spotlightCards = [
  {
    tag: "Liga Felina",
    title: "Clasificacion y pruebas por fases",
    body: "Perfecto para publicar pruebas internas, reglamento y resultados.",
  },
  {
    tag: "Temporada",
    title: "Retos que mantienen al club enchufado",
    body: "Mesas de objetivos, kilometros, desnivel, asistencia o retos especiales.",
  },
  {
    tag: "Gran desafio",
    title: "Una meta compartida para toda la manada",
    body: "Ultra, maraton de montana o travesia emblematica para preparar entre todos.",
  },
];

export const trainingCards = [
  {
    id: "planes",
    title: "Planes de entrenamiento",
    body: "Preparacion para trail corto, media distancia, ultras o mejora general.",
  },
  {
    id: "rutas",
    title: "Rutas destacadas",
    body: "Recorridos por montana con distancia, desnivel, dificultad y puntos clave.",
  },
  {
    id: "sesiones",
    title: "Sesiones del club",
    body: "Entrenos semanales, trabajos de cuestas, tecnica, fuerza y salidas largas.",
  },
];

export const rulesCards = [
  {
    title: "Clasificacion general",
    body: "Suma todos los puntos obtenidos por kilometros, desnivel positivo y carreras validadas.",
  },
  {
    title: "DevoraKm",
    body: "Se otorga 1 punto por cada kilometro entero acumulado en el ano en curso.",
  },
  {
    title: "Devora+",
    body: "Se otorgan 10 puntos por cada bloque entero de 100 metros positivos acumulados.",
  },
  {
    title: "DevoraCarreras",
    body: "Cada modalidad validada suma sus puntos a la general segun distancia y desnivel de la prueba.",
  },
  {
    title: "Categorias",
    body: "Las tablas se separan entre hombres y mujeres mediante el selector superior.",
  },
  {
    title: "Validacion",
    body: "La actividad de Strava debe coincidir en fecha con la modalidad declarada para poder sumar puntos.",
  },
  {
    title: "Bloqueo por evento",
    body: "Una vez validada una modalidad de un evento, ese evento completo queda bloqueado para ese socio.",
  },
  {
    title: "Strava obligatorio",
    body: "Sin cuenta de Strava conectada no se puede participar en la Liga Felina ni aparecer en clasificaciones.",
  },
];
