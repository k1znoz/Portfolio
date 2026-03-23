export const themes = [
  {
    id: 'editorial',
    name: 'Editorial Grid',
    mood: 'Clean contrast',
    level: 'Clair',
    colors: ['#a86550', '#b89567'],
  },
  {
    id: 'sunset',
    name: 'Sunset Pulse',
    mood: 'Warm and electric',
    level: 'Moyen',
    colors: ['#bea176', '#b66f59'],
  },
  {
    id: 'neon',
    name: 'Neon Circuit',
    mood: 'Futuristic dark',
    level: 'Sombre',
    colors: ['#ffad86', '#c7ab92'],
  },
]

export const layoutThemes = [
  {
    id: 'editorial',
    name: 'Editorial Core',
    description: 'Version editoriale equilibree pour la lecture longue et les transitions fluides.',
    sourceFiles: ['stitch.html', 'Stitch-2.html'],
  },
  {
    id: 'cyber-brute',
    name: 'Cyber Brute',
    description:
      'Interface terminale cyber: top bar fixe, side nav desktop, stats bento et sections style system monitor.',
    sourceFiles: ['Stitch-3.html', 'Stitch-3-Mobile.html'],
  },
  {
    id: 'iron-code',
    name: 'Iron Code',
    description:
      'The Digital Blacksmith: UI industrielle forgée, typographie massive, palette charbon & métal en fusion.',
    sourceFiles: ['IronCode/code.html'],
  },
  {
    id: 'glass-morphism',
    name: 'Glass Morphism',
    description:
      'The Obsidian Lens: couches de verre translucides, halos cyan/violet et mise en page editoriale contrastee.',
    sourceFiles: ['GlassMorphism/code.html'],
  },
]

export const metrics = [
  { value: '2025', label: 'Diplome DWWM obtenu' },
  { value: '6+', label: 'Experiences professionnelles' },
  { value: 'C1', label: 'Anglais bilingue' },
]

export const projects = [
  {
    date: '03/2026',
    name: 'Lane Defender',
    type: 'Tower Defense - Svelte Canvas',
    summary:
      'Prototype Tower Defense en lane unique: placement de tours, vagues progressives, economie et gestion des vies.',
    links: {
      live: null,
      source: 'https://github.com/k1znoz/Portfolio',
    },
    demo: {
      mode: 'internal',
      game: 'tower-defense',
      path: '/tower-defense',
    },
  },
  {
    date: '03/2026',
    name: 'Reflex Shot',
    type: 'Mini jeu integre',
    summary:
      'Mini jeu de reflexes integre directement dans la section projets: 30 secondes pour faire le meilleur score.',
    links: {
      live: null,
      source: 'https://github.com/k1znoz/Portfolio',
    },
    demo: {
      mode: 'internal',
      game: 'mini-reflex',
      path: '/game',
    },
  },
  {
    date: '01/2026',
    name: 'LivingSoils',
    type: 'Svelte',
    summary:
      "Projet web autour de l'univers Living Soils avec un design immersif et une presentation produit soignee.",
    image: '/images/projects/LivingSoils.png',
    links: {
      live: null,
      source: 'https://github.com/k1znoz/LivingSoils',
    },
    demo: {
      mode: 'sandbox',
      url: 'https://stackblitz.com/github/k1znoz/LivingSoils?embed=1&hideExplorer=1&hideNavigation=1&view=preview',
    },
  },
  {
    date: '03/2026',
    name: 'GrainesDeJardin',
    type: 'Svelte',
    summary:
      'Application web orientee jardinage avec parcours utilisateur fluide et interface responsive.',
    image: '/images/projects/GrainesDeJardin.png',
    links: {
      live: 'https://graines-de-jardin.vercel.app',
      source: 'https://github.com/k1znoz/GrainesDeJardin',
    },
    demo: {
      mode: 'live',
      url: 'https://graines-de-jardin.vercel.app',
    },
  },
  {
    date: '03/2026',
    name: 'MariageLV',
    type: 'Svelte',
    summary:
      'Site evenementiel avec identite visuelle sur mesure, navigation claire et deploiement Vercel.',
    image: '/images/projects/MariageLV.png',
    links: {
      live: 'https://mariage-lv.vercel.app',
      source: 'https://github.com/k1znoz/MariageLV',
    },
    demo: {
      mode: 'live',
      url: 'https://mariage-lv.vercel.app',
    },
  },
  {
    date: '03/2026',
    name: 'Coutellerie-svelte-laravel',
    type: 'Svelte + Laravel',
    summary:
      'Projet fullstack combinant frontend Svelte et backend Laravel pour un site de coutellerie.',
    image: '/images/projects/Coutellerie-Svelte-Sanity.png',
    links: {
      live: 'https://coutellerie-frontend.vercel.app',
      source: 'https://github.com/k1znoz/Coutellerie-svelte-laravel',
    },
    demo: {
      mode: 'live',
      url: 'https://coutellerie-frontend.vercel.app',
    },
  },
]

export const stack = [
  'HTML',
  'CSS',
  'SCSS',
  'JavaScript',
  'TypeScript',
  'Svelte',
  'PHP',
  'Laravel',
  'MySQL',
  'Java',
]

export const cvProfile = {
  fileName: 'CV-DEV-25.pdf',
  fileUrl: '/files/CV-DEV-25.pdf',
}

export const cvWeb = {
  fullName: 'Alois Sautet',
  title: 'Developpeur Web & Web Mobile',
  subtitle: 'Diplome en octobre 2025 · Attire par des interfaces utiles, rapides et maintenables',
  pitch:
    "Attire par le monde du web depuis longtemps, je cherche toujours a acquerir de nouvelles competences. Mon objectif est d'exercer durablement en tant que developpeur web apres l'obtention du titre professionnel DWWM en octobre 2025.",
  media: {
    portrait: '/images/retoucheNB.jpg',
    knife: '/images/ElassaStyle-2.jpg',
  },
  contact: [
    '19 Imp. des Hirondelles, 19130 Voutezac',
    'alois.sautet@gmail.com',
    '+33 6 38 67 58 86',
    'Permis B, vehicule',
  ],
  skills: [
    'HTML',
    'CSS',
    'SCSS',
    'JavaScript',
    'TypeScript',
    'PHP',
    'Laravel',
    'Svelte',
    'MySQL',
    'Java',
    'NoSQL',
    'Responsive design',
    'Visual Studio Code',
    'Cursor',
  ],
  experiences: [
    {
      period: 'Depuis 2023',
      company: 'Grauw - Paris',
      role: 'Stage (1 mois)',
      points: [
        "Creation d'interfaces web responsives, du maquettage au developpement dynamique.",
        'Mise en place et integration de bases de donnees relationnelles et NoSQL.',
        'Developpement back-end securise avec gestion des donnees et logique metier.',
        "Configuration, deploiement et documentation d'applications web completes.",
      ],
    },
    {
      period: '2019-2023',
      company: 'Call and Co - Evry-Courcouronnes',
      role: 'Secretaire (4 ans)',
      points: [
        "Gestion simultanee des demandes pour plus d'une centaine d'entreprises.",
        'Communication claire et adaptee a des interlocuteurs varies.',
        'Organisation rigoureuse pour assurer la continuite des services.',
        'Priorisation rapide et resolution de situations urgentes.',
      ],
    },
    {
      period: '2014-2019',
      company: 'Country Club / Bricomarche / DGFIP / Orange',
      role: 'Saisonnier et vacataire polyvalent',
      points: [
        'Service en salle et au bar, accueil et relation client.',
        'Vente, mise en rayon, gestion de stock et conseil.',
        'Saisie, classement, archivage et support administratif.',
        'Argumentation commerciale et traitement de demandes clients.',
      ],
    },
  ],
  education: [
    {
      period: '2023/2025',
      title: 'Formation Developpeur Web et Web Mobile (titre professionnel)',
    },
    {
      period: '2016/2025',
      title: 'Formation personnelle en coutellerie (forge, conception, polissage)',
    },
    {
      period: '2014/2015',
      title: 'DUT Techniques de Commercialisation',
    },
    {
      period: '2014',
      title: 'Baccalaureat Scientifique',
    },
  ],
  interests: [
    'Forgeron coutelier autodidacte et createur de couteaux en acier damasse',
    'Maitrise complete du processus: conception, forge et polissage',
    'Precision, creativite et recherche constante de qualite',
  ],
}

export const services = [
  {
    title: 'Developpement web et mobile',
    description:
      'Conception et integration d\'interfaces responsives, du maquettage au developpement dynamique.',
  },
  {
    title: 'Rigueur et adaptation',
    description:
      'Organisation, priorisation et communication claire acquises sur des contextes de production exigeants.',
  },
  {
    title: 'Culture qualite',
    description:
      'Approche orientee detail et finition, inspiree par la coutellerie: precision, constance et exigence.',
  },
]

export const contactLinks = [
  { label: 'Email', href: 'mailto:alois.sautet@gmail.com' },
  { label: 'Telephone', href: 'tel:+33638675886' },
  { label: 'GitHub', href: 'https://github.com/k1znoz' },
  { label: 'Tous les depots', href: 'https://github.com/k1znoz?tab=repositories' },
  { label: 'CV (PDF)', href: '/files/CV-DEV-25.pdf' },
  { label: 'Adresse', href: 'https://maps.google.com/?q=Voutezac' },
]
