const MAX_EVENTS = 120;
const MAP_WIDTH = 1619;
const MAP_HEIGHT = 971;
const BUILD_GRID_LIMIT = 7;
const DEFAULT_BUILD_SLOTS = [-6, -4, -2, 0, 2, 4, 6].flatMap((z) => (
  [-6, -4, -2, 0, 2, 4, 6].map((x) => [x, z])
));

export const resourceKeys = [
  'gold',
  'food',
  'wood',
  'stone',
  'iron',
  'influence',
  'technology',
  'population',
  'army',
  'stability',
  'prosperity',
  'threat',
  'buildLimit',
];

export const buildingCatalog = {
  house: {
    label: 'Дом',
    asset: 'house',
    category: 'settlement',
    buildDays: 6,
    cost: { wood: 35, stone: 8, gold: 18 },
    effects: { population: 24, prosperity: 1 },
  },
  farm: {
    label: 'Ферма',
    asset: 'farm',
    category: 'food',
    buildDays: 5,
    cost: { wood: 26, gold: 14 },
    effects: { food: 13, prosperity: 1 },
  },
  lumberyard: {
    label: 'Лесопилка',
    asset: 'lumberyard',
    category: 'production',
    buildDays: 7,
    cost: { wood: 18, stone: 10, gold: 22 },
    effects: { wood: 10 },
  },
  quarry: {
    label: 'Каменоломня',
    asset: 'quarry',
    category: 'production',
    buildDays: 8,
    cost: { wood: 24, stone: 12, gold: 28 },
    effects: { stone: 9 },
  },
  warehouse: {
    label: 'Склад',
    asset: 'warehouse',
    category: 'logistics',
    buildDays: 7,
    cost: { wood: 34, stone: 24, gold: 30 },
    effects: { buildLimit: 1, prosperity: 1 },
  },
  market: {
    label: 'Рынок',
    asset: 'market',
    category: 'trade',
    buildDays: 9,
    cost: { wood: 28, stone: 16, gold: 42 },
    effects: { gold: 9, influence: 1, prosperity: 2 },
  },
  barracks: {
    label: 'Казармы',
    asset: 'barracks',
    category: 'military',
    buildDays: 10,
    cost: { wood: 46, stone: 30, iron: 12, gold: 52 },
    effects: { army: 18, threat: -1 },
    maintenance: { gold: 2, food: 2 },
  },
  archeryRange: {
    label: 'Стрельбище',
    asset: 'archery-range',
    category: 'military',
    buildDays: 11,
    cost: { wood: 52, stone: 20, iron: 16, gold: 58 },
    effects: { army: 24 },
    maintenance: { gold: 2, food: 2 },
  },
  watchtower: {
    label: 'Сторожевая башня',
    asset: 'watchtower',
    category: 'defense',
    buildDays: 9,
    cost: { wood: 24, stone: 48, iron: 8, gold: 46 },
    effects: { army: 10, threat: -3 },
    maintenance: { gold: 1 },
  },
};

const marketResources = ['food', 'wood', 'stone', 'iron'];

export const technologyTree = [
  {
    id: 'crop_rotation',
    name: 'Севооборот',
    branch: 'economy',
    tier: 1,
    baseDays: 8,
    cost: { gold: 40, influence: 4 },
    requires: [],
    description: 'Полевые книги и смена культур поднимают урожайность во всех землях.',
    effects: { foodYield: 0.08, prosperityDaily: 0.02 },
  },
  {
    id: 'ledger_houses',
    name: 'Счётные палаты',
    branch: 'economy',
    tier: 1,
    baseDays: 9,
    cost: { gold: 60, influence: 8 },
    requires: [],
    description: 'Единая отчётность снижает утечки казны и усиливает налоговую базу.',
    effects: { goldYield: 0.06, stabilityDaily: 0.02 },
  },
  {
    id: 'chartered_markets',
    name: 'Рыночные хартии',
    branch: 'trade',
    tier: 2,
    baseDays: 13,
    cost: { gold: 90, influence: 14, technology: 10 },
    requires: ['ledger_houses'],
    description: 'Купцы получают гарантии короны, торговые маршруты становятся прибыльнее.',
    effects: { tradeIncome: 0.18, marketDiscount: 0.04 },
  },
  {
    id: 'stone_roads',
    name: 'Каменные дороги',
    branch: 'trade',
    tier: 2,
    baseDays: 12,
    cost: { gold: 75, stone: 90, wood: 35 },
    requires: ['crop_rotation'],
    description: 'Дороги связывают владения, ускоряя караваны, контроль и снабжение.',
    effects: { marketDiscount: 0.08, controlDaily: 0.03, tradeIncome: 0.08 },
  },
  {
    id: 'standing_watch',
    name: 'Постоянная стража',
    branch: 'military',
    tier: 1,
    baseDays: 9,
    cost: { gold: 55, iron: 14 },
    requires: [],
    description: 'Регулярная стража держит дороги и снижает внутреннюю угрозу.',
    effects: { threatDaily: -0.08, moraleDaily: 0.03 },
  },
  {
    id: 'siegecraft',
    name: 'Осадное ремесло',
    branch: 'military',
    tier: 2,
    baseDays: 14,
    cost: { gold: 90, wood: 90, iron: 28, technology: 12 },
    requires: ['standing_watch'],
    description: 'Инженеры и обозы дают преимущество в долгих войнах.',
    effects: { warAttack: 0.13, enemyFortBypass: 0.12 },
  },
  {
    id: 'fortified_baileys',
    name: 'Укреплённые бейли',
    branch: 'military',
    tier: 2,
    baseDays: 13,
    cost: { stone: 115, wood: 65, gold: 70 },
    requires: ['standing_watch'],
    description: 'Новые дворы и палисады удешевляют укрепления и снижают потери.',
    effects: { warDefense: 0.13, fortifyDiscount: 0.12 },
  },
  {
    id: 'court_protocol',
    name: 'Дворцовый протокол',
    branch: 'diplomacy',
    tier: 1,
    baseDays: 8,
    cost: { influence: 16, gold: 35 },
    requires: [],
    description: 'Канцелярия отвечает быстрее, послы обходятся дешевле.',
    effects: { treatyDiscount: 0.1, diplomacyWeight: 5 },
  },
  {
    id: 'envoy_network',
    name: 'Сеть послов',
    branch: 'diplomacy',
    tier: 2,
    baseDays: 12,
    cost: { influence: 26, gold: 80, technology: 8 },
    requires: ['court_protocol'],
    description: 'Постоянные представители медленно прогревают отношения с соседями.',
    effects: { treatyDiscount: 0.08, relationDrift: 0.04, diplomacyWeight: 8 },
  },
  {
    id: 'vassal_codes',
    name: 'Кодекс вассалитета',
    branch: 'diplomacy',
    tier: 3,
    baseDays: 18,
    cost: { influence: 42, gold: 130, technology: 28 },
    requires: ['envoy_network', 'fortified_baileys'],
    description: 'Единый закон вассалов повышает дань и облегчает добровольное подчинение.',
    effects: { vassalTribute: 0.12, diplomacyWeight: 12, stabilityDaily: 0.03 },
  },
];

const kingdomSeeds = [
  {
    id: 'riverland',
    name: 'Riverland',
    title: 'The Crownwater Marches',
    ruler: 'Queen Elayne of Crownwater',
    color: '#2f74c0',
    accent: '#89c9ff',
    motto: 'Rivers bind what swords divide.',
    traits: ['River Trade', 'Fertile Banks', 'Open Ports'],
    aiFocus: ['farm', 'market', 'warehouse'],
    capitalRegionId: 'riverland-crownwater',
    resources: { gold: 420, food: 520, wood: 360, stone: 230, iron: 90, influence: 65, technology: 38, population: 860, army: 150, stability: 74, prosperity: 72, threat: 18, buildLimit: 5 },
    regions: [
      region('riverland-crownwater', 'Riverland', 'Crownwater', 'riverlands', 72, 78, 2, [[285, 365], [488, 338], [590, 420], [535, 540], [370, 565], [270, 485]], [430, 455], [
        holding('riverland-capital', 'Crownwater Keep', 'capital', [440, 430], ['house', 'market', 'warehouse'], 85),
        holding('riverland-docks', 'Blueford Docks', 'city', [500, 500], ['market', 'farm'], 52),
      ]),
      region('riverland-greenbank', 'Riverland', 'Greenbank', 'farmland', 64, 72, 1, [[210, 438], [330, 520], [328, 660], [210, 660], [130, 560]], [245, 560], [
        holding('riverland-greenbank-farms', 'Greenbank Farms', 'farm', [240, 575], ['farm', 'farm'], 34),
      ]),
      region('riverland-stoneford', 'Riverland', 'Stoneford', 'hills', 54, 66, 2, [[470, 540], [610, 460], [705, 555], [660, 650], [500, 670]], [590, 590], [
        holding('riverland-stoneford', 'Stoneford Castle', 'castle', [590, 590], ['watchtower', 'quarry'], 72),
      ]),
    ],
  },
  {
    id: 'nordgard',
    name: 'Nordgard',
    title: 'Wolf Coast Jarldom',
    ruler: 'Jarl Hakon Greywolf',
    color: '#7f2434',
    accent: '#d8dce4',
    motto: 'By ice, by blood, we stand.',
    traits: ['Hardy Levies', 'Fjord Harbors', 'Winter Resolve'],
    aiFocus: ['barracks', 'watchtower', 'lumberyard'],
    capitalRegionId: 'nordgard-wolfharbor',
    resources: { gold: 330, food: 330, wood: 430, stone: 360, iron: 160, influence: 56, technology: 34, population: 650, army: 210, stability: 68, prosperity: 48, threat: 26, buildLimit: 4 },
    regions: [
      region('nordgard-wolfharbor', 'Nordgard', 'Wolfharbor', 'coast', 52, 67, 3, [[120, 95], [315, 60], [430, 155], [390, 300], [205, 320], [85, 220]], [250, 205], [
        holding('nordgard-wolfharbor', 'Wolfharbor', 'capital', [260, 205], ['barracks', 'market'], 98),
      ]),
      region('nordgard-frostpine', 'Nordgard', 'Frostpine', 'forest', 46, 62, 2, [[330, 85], [525, 82], [602, 220], [495, 340], [390, 300], [430, 155]], [480, 220], [
        holding('nordgard-frostpine', 'Frostpine Watch', 'forest', [480, 225], ['lumberyard', 'watchtower'], 70),
      ]),
      region('nordgard-ironfjord', 'Nordgard', 'Ironfjord', 'mountains', 42, 58, 3, [[95, 220], [205, 320], [245, 430], [150, 505], [60, 410]], [150, 365], [
        holding('nordgard-ironfjord', 'Ironfjord Mine', 'mine', [155, 360], ['quarry', 'watchtower'], 76),
      ]),
    ],
  },
  {
    id: 'caldoria',
    name: 'Caldoria',
    title: 'Marble Crown Republic',
    ruler: 'Doge Aurelio Valcrest',
    color: '#b64235',
    accent: '#f7c46a',
    motto: 'Coin, law and harbor.',
    traits: ['Banking Houses', 'Marble Cities', 'Trade Fleets'],
    aiFocus: ['market', 'warehouse', 'quarry'],
    capitalRegionId: 'caldoria-grandport',
    resources: { gold: 620, food: 400, wood: 250, stone: 340, iron: 110, influence: 84, technology: 52, population: 980, army: 130, stability: 70, prosperity: 86, threat: 21, buildLimit: 5 },
    regions: [
      region('caldoria-grandport', 'Caldoria', 'Grandport', 'coast', 80, 76, 2, [[465, 670], [650, 640], [785, 745], [730, 900], [540, 885]], [625, 760], [
        holding('caldoria-grandport', 'Grandport', 'capital', [640, 775], ['market', 'warehouse', 'house'], 78),
      ]),
      region('caldoria-sunwine', 'Caldoria', 'Sunwine Hills', 'farmland', 62, 70, 1, [[330, 650], [465, 670], [540, 885], [380, 870], [292, 760]], [405, 755], [
        holding('caldoria-sunwine', 'Sunwine Estates', 'farm', [405, 760], ['farm', 'farm', 'market'], 38),
      ]),
      region('caldoria-marblegate', 'Caldoria', 'Marblegate', 'hills', 58, 68, 2, [[650, 640], [785, 615], [885, 700], [785, 745]], [780, 690], [
        holding('caldoria-marblegate', 'Marblegate', 'castle', [785, 690], ['quarry', 'watchtower'], 72),
      ]),
    ],
  },
  {
    id: 'velund',
    name: 'Velund',
    title: 'Verdant Concord',
    ruler: 'High Warden Maera Vel',
    color: '#23704c',
    accent: '#b1e7a9',
    motto: 'The forest remembers.',
    traits: ['Ancient Groves', 'Skilled Bowyers', 'Hidden Roads'],
    aiFocus: ['lumberyard', 'archeryRange', 'farm'],
    capitalRegionId: 'velund-deepgrove',
    resources: { gold: 360, food: 460, wood: 560, stone: 210, iron: 95, influence: 70, technology: 46, population: 720, army: 165, stability: 78, prosperity: 68, threat: 15, buildLimit: 5 },
    regions: [
      region('velund-deepgrove', 'Velund', 'Deepgrove', 'forest', 64, 80, 2, [[1055, 390], [1275, 350], [1450, 430], [1415, 590], [1220, 640], [1045, 540]], [1235, 505], [
        holding('velund-deepgrove', 'Deepgrove Spires', 'capital', [1235, 500], ['lumberyard', 'archeryRange'], 88),
      ]),
      region('velund-mistfall', 'Velund', 'Mistfall', 'riverlands', 58, 74, 1, [[935, 510], [1045, 540], [1220, 640], [1110, 735], [935, 680]], [1030, 625], [
        holding('velund-mistfall', 'Mistfall Bridges', 'city', [1035, 620], ['farm', 'market'], 52),
      ]),
      region('velund-starwood', 'Velund', 'Starwood', 'forest', 52, 68, 2, [[1325, 615], [1515, 555], [1560, 710], [1430, 820], [1280, 750]], [1430, 690], [
        holding('velund-starwood', 'Starwood Camp', 'forest', [1430, 695], ['lumberyard', 'watchtower'], 64),
      ]),
    ],
  },
  {
    id: 'solaria',
    name: 'Solaria',
    title: 'Sun Throne Theocracy',
    ruler: 'Hierarch Cassian Sol',
    color: '#d08a2c',
    accent: '#ffe08a',
    motto: 'Light makes law.',
    traits: ['Temple Tithes', 'Zealous Levies', 'Bright Roads'],
    aiFocus: ['market', 'barracks', 'farm'],
    capitalRegionId: 'solaria-sunspire',
    resources: { gold: 540, food: 420, wood: 260, stone: 360, iron: 130, influence: 92, technology: 48, population: 850, army: 175, stability: 76, prosperity: 78, threat: 19, buildLimit: 5 },
    regions: [
      region('solaria-sunspire', 'Solaria', 'Sunspire', 'highlands', 70, 78, 2, [[935, 660], [1080, 610], [1215, 700], [1185, 835], [990, 870], [890, 770]], [1050, 740], [
        holding('solaria-sunspire', 'Sunspire', 'capital', [1055, 735], ['market', 'house', 'watchtower'], 86),
      ]),
      region('solaria-brightcoast', 'Solaria', 'Brightcoast', 'coast', 58, 70, 1, [[1185, 835], [1340, 805], [1430, 900], [1230, 940], [990, 870]], [1235, 865], [
        holding('solaria-brightcoast', 'Brightcoast Harbor', 'city', [1240, 865], ['market', 'farm'], 46),
      ]),
      region('solaria-goldroad', 'Solaria', 'Goldroad', 'farmland', 60, 72, 1, [[830, 610], [935, 660], [890, 770], [760, 765], [715, 650]], [815, 695], [
        holding('solaria-goldroad', 'Goldroad Abbey', 'farm', [815, 695], ['farm', 'warehouse'], 42),
      ]),
    ],
  },
  {
    id: 'dragonridge',
    name: 'Dragonridge',
    title: 'Ashen Crown Holds',
    ruler: 'Lord Marshal Kael Draven',
    color: '#8f2f2d',
    accent: '#ff7a45',
    motto: 'Forge, conquer, endure.',
    traits: ['Mountain Forges', 'Black Keeps', 'Hard Discipline'],
    aiFocus: ['quarry', 'barracks', 'watchtower'],
    capitalRegionId: 'dragonridge-ashcrown',
    resources: { gold: 380, food: 300, wood: 240, stone: 520, iron: 240, influence: 62, technology: 42, population: 690, army: 245, stability: 63, prosperity: 54, threat: 34, buildLimit: 4 },
    regions: [
      region('dragonridge-ashcrown', 'Dragonridge', 'Ashcrown', 'mountains', 58, 66, 4, [[650, 315], [825, 290], [980, 365], [955, 520], [790, 560], [620, 470]], [805, 430], [
        holding('dragonridge-ashcrown', 'Ashcrown Citadel', 'capital', [805, 425], ['quarry', 'barracks', 'watchtower'], 118),
      ]),
      region('dragonridge-cinderpass', 'Dragonridge', 'Cinderpass', 'volcanic', 44, 58, 3, [[790, 560], [955, 520], [1040, 620], [945, 700], [785, 615]], [915, 610], [
        holding('dragonridge-cinderpass', 'Cinderpass', 'mine', [915, 610], ['quarry', 'watchtower'], 90),
      ]),
      region('dragonridge-blackstairs', 'Dragonridge', 'Blackstairs', 'hills', 50, 62, 3, [[565, 445], [620, 470], [790, 560], [705, 650], [560, 605]], [660, 565], [
        holding('dragonridge-blackstairs', 'Blackstairs Fort', 'castle', [660, 565], ['barracks', 'warehouse'], 92),
      ]),
    ],
  },
  {
    id: 'morven',
    name: 'Morven',
    title: 'Storm Coast League',
    ruler: 'Admiral Rhosyn Vale',
    color: '#12515f',
    accent: '#70d6e5',
    motto: 'A crown can drown.',
    traits: ['Privateer Ports', 'Storm Sailors', 'Black Markets'],
    aiFocus: ['market', 'barracks', 'warehouse'],
    capitalRegionId: 'morven-blackharbor',
    resources: { gold: 430, food: 340, wood: 350, stone: 260, iron: 120, influence: 58, technology: 40, population: 700, army: 185, stability: 58, prosperity: 62, threat: 38, buildLimit: 4 },
    regions: [
      region('morven-blackharbor', 'Morven', 'Blackharbor', 'coast', 60, 58, 3, [[70, 575], [210, 560], [292, 760], [210, 860], [65, 790]], [170, 710], [
        holding('morven-blackharbor', 'Blackharbor', 'capital', [170, 715], ['market', 'barracks'], 96),
      ]),
      region('morven-greyhook', 'Morven', 'Greyhook', 'islands', 44, 54, 2, [[10, 665], [70, 575], [65, 790], [15, 835]], [55, 710], [
        holding('morven-greyhook', 'Greyhook Anchorage', 'city', [60, 715], ['market', 'warehouse'], 56),
      ]),
      region('morven-stormcrag', 'Morven', 'Stormcrag', 'hills', 46, 56, 3, [[210, 560], [330, 650], [292, 760], [210, 860]], [270, 690], [
        holding('morven-stormcrag', 'Stormcrag', 'castle', [270, 690], ['watchtower', 'quarry'], 84),
      ]),
    ],
  },
  {
    id: 'frostheim',
    name: 'Frostheim',
    title: 'Glacier Crown',
    ruler: 'Queen Isolde Frostveil',
    color: '#4a9ed1',
    accent: '#d7f4ff',
    motto: 'Where ice forms crown and destiny.',
    traits: ['Glacier Walls', 'Crystal Mines', 'Cold Discipline'],
    aiFocus: ['quarry', 'watchtower', 'warehouse'],
    capitalRegionId: 'frostheim-crystalhold',
    resources: { gold: 350, food: 270, wood: 210, stone: 430, iron: 190, influence: 66, technology: 50, population: 560, army: 205, stability: 72, prosperity: 50, threat: 24, buildLimit: 4 },
    regions: [
      region('frostheim-crystalhold', 'Frostheim', 'Crystalhold', 'glacier', 52, 74, 4, [[1000, 95], [1215, 65], [1395, 150], [1340, 330], [1110, 335], [960, 230]], [1175, 210], [
        holding('frostheim-crystalhold', 'Crystalhold', 'capital', [1175, 215], ['watchtower', 'quarry', 'warehouse'], 124),
      ]),
      region('frostheim-whitebay', 'Frostheim', 'Whitebay', 'coast', 42, 62, 2, [[1340, 330], [1515, 270], [1590, 420], [1450, 430]], [1465, 355], [
        holding('frostheim-whitebay', 'Whitebay', 'city', [1465, 355], ['market', 'warehouse'], 60),
      ]),
      region('frostheim-icefang', 'Frostheim', 'Icefang', 'mountains', 40, 60, 3, [[865, 115], [1000, 95], [960, 230], [850, 310], [760, 225]], [880, 220], [
        holding('frostheim-icefang', 'Icefang Mine', 'mine', [880, 220], ['quarry', 'watchtower'], 82),
      ]),
    ],
  },
];

export function createInitialWorld(tickMs) {
  const kingdoms = kingdomSeeds.map(createKingdom);
  const regions = kingdomSeeds.flatMap((kingdom) => kingdom.regions.map((item) => createRegion(kingdom, item)));
  const holdings = regions.flatMap((item) => item.holdings);
  const armies = kingdoms.map((kingdom) => ({
    id: `${kingdom.id}-host`,
    kingdomId: kingdom.id,
    name: `${kingdom.name} Host`,
    strength: kingdom.resources.army,
    morale: 72,
    regionId: kingdom.capitalRegionId,
    status: 'guarding',
  }));

  return {
    time: {
      day: 1,
      year: 1,
      season: 'Spring',
      tickMs,
      speed: 1,
      paused: false,
    },
    map: {
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      image: '/assets/map/world-map-painted.png?v=20260609',
      borders: '/assets/map/world-map-borders.png?v=20260609',
      labels: '/assets/map/world-map-labels.png?v=20260609',
      minimap: '/assets/map/world-map-minimap.png?v=20260609',
    },
    kingdoms,
    regions,
    holdings,
    armies,
    market: createMarket(),
    diplomacy: createDiplomacy(kingdoms),
    technology: createTechnologyState(kingdoms),
    wars: [],
    victory: {
      objective: 'vassalize_all',
      completed: false,
      winnerKingdomId: null,
    },
    events: [
      createEvent(1, 'scroll', 'The Island Wakes', 'Eight crowns watch the same horizon. No victory is promised, only survival.', undefined, 'world'),
    ],
    players: new Map(),
    ai: {
      nextDecisionDay: 4,
    },
  };
}

function createKingdom(seed) {
  return {
    id: seed.id,
    name: seed.name,
    title: seed.title,
    ruler: seed.ruler,
    color: seed.color,
    accent: seed.accent,
    motto: seed.motto,
    traits: seed.traits,
    aiFocus: seed.aiFocus,
    capitalRegionId: seed.capitalRegionId,
    baseBuildLimit: seed.resources.buildLimit,
    overlordId: null,
    vassals: [],
    resources: { ...seed.resources },
    policies: {
      taxation: 'balanced',
      military: 'defensive',
      research: 'stewardship',
    },
    cooldowns: {},
  };
}

function createRegion(kingdom, item) {
  const holdings = item.holdings.map((holdingItem) => ({
    ...holdingItem,
    kingdomId: kingdom.id,
    regionId: item.id,
  }));

  return {
    id: item.id,
    kingdomId: kingdom.id,
    kingdomName: kingdom.name,
    name: item.name,
    terrain: item.terrain,
    development: item.development,
    control: item.control,
    fortLevel: item.fortLevel,
    mapPolygon: item.mapPolygon,
    mapPoint: item.mapPoint,
    holdingIds: holdings.map((holding) => holding.id),
    holdings,
  };
}

function region(id, kingdomName, name, terrain, development, control, fortLevel, mapPolygon, mapPoint, holdings) {
  return { id, kingdomName, name, terrain, development, control, fortLevel, mapPolygon, mapPoint, holdings };
}

function holding(id, name, kind, mapPoint, buildings, garrison) {
  return {
    id,
    name,
    kind,
    mapPoint,
    garrison,
    buildings: buildings.map((type, index) => createCompletedBuilding(id, type, index)),
    constructionQueue: [],
  };
}

function createCompletedBuilding(holdingId, type, index = 0) {
  const placement = defaultBuildSlot(index);
  return {
    id: `${holdingId}-${type}-${index}`,
    holdingId,
    type,
    status: 'active',
    remainingDays: 0,
    ...placement,
  };
}

function createQueuedBuilding(holdingId, type, placement = {}) {
  return {
    id: `${holdingId}-${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    holdingId,
    type,
    status: 'queued',
    remainingDays: buildingCatalog[type].buildDays,
    ...placement,
  };
}

function defaultBuildSlot(index) {
  const slot = DEFAULT_BUILD_SLOTS[index % DEFAULT_BUILD_SLOTS.length];
  return { x: slot[0], z: slot[1], rotation: 0 };
}

function normalizeRotation(value) {
  const rotation = Number(value);
  return Number.isFinite(rotation) ? rotation : 0;
}

function isBuildSlotTaken(holding, x, z) {
  return [...holding.buildings, ...holding.constructionQueue].some((building) => (
    typeof building.x === 'number'
    && typeof building.z === 'number'
    && building.x === x
    && building.z === z
  ));
}

function findOpenBuildSlot(holding, fallbackIndex) {
  for (let offset = 0; offset < DEFAULT_BUILD_SLOTS.length; offset += 1) {
    const placement = defaultBuildSlot(fallbackIndex + offset);
    if (!isBuildSlotTaken(holding, placement.x, placement.z)) {
      return placement;
    }
  }

  return null;
}

function resolveBuildPlacement(holding, payload, fallbackIndex) {
  const hasRequestedSlot = Number.isFinite(Number(payload.x)) && Number.isFinite(Number(payload.z));
  const placement = hasRequestedSlot
    ? { x: Math.round(Number(payload.x)), z: Math.round(Number(payload.z)), rotation: normalizeRotation(payload.rotation) }
    : findOpenBuildSlot(holding, fallbackIndex);

  if (!placement) {
    return { ok: false, reason: 'Внутри стен нет свободной клетки.' };
  }

  if (Math.abs(placement.x) > BUILD_GRID_LIMIT || Math.abs(placement.z) > BUILD_GRID_LIMIT) {
    return { ok: false, reason: 'Клетка за пределами замка.' };
  }

  if (isBuildSlotTaken(holding, placement.x, placement.z)) {
    return { ok: false, reason: hasRequestedSlot ? 'Клетка уже занята.' : 'Внутри стен нет свободной клетки.' };
  }

  return { ok: true, placement };
}

function createMarket() {
  return {
    prices: {
      food: 2.2,
      wood: 2.8,
      stone: 3.4,
      iron: 5.6,
    },
    trend: {
      food: 0,
      wood: 0,
      stone: 0,
      iron: 0,
    },
    open: true,
    volume: 0,
    routes: [],
  };
}

function createTechnologyState(kingdoms) {
  const completed = {};
  const active = {};

  for (const kingdom of kingdoms) {
    completed[kingdom.id] = [];
    active[kingdom.id] = null;
  }

  return {
    tree: technologyTree,
    completed,
    active,
  };
}

function createDiplomacy(kingdoms) {
  const relations = {};

  for (const source of kingdoms) {
    relations[source.id] = {};
    for (const target of kingdoms) {
      if (source.id !== target.id) {
        relations[source.id][target.id] = 45 + Math.floor(Math.random() * 18);
      }
    }
  }

  relations.riverland.caldoria = 72;
  relations.caldoria.riverland = 72;
  relations.nordgard.frostheim = 66;
  relations.frostheim.nordgard = 66;
  relations.dragonridge.frostheim = 24;
  relations.frostheim.dragonridge = 24;
  relations.morven.caldoria = 30;
  relations.caldoria.morven = 30;

  return {
    relations,
    treaties: [],
    vassals: {},
  };
}

export function getPublicSnapshot(world) {
  return {
    time: world.time,
    map: world.map,
    kingdoms: world.kingdoms,
    countries: world.kingdoms,
    regions: world.regions.map(({ holdings, ...regionData }) => regionData),
    holdings: world.holdings,
    castles: world.holdings,
    armies: world.armies,
    market: world.market,
    diplomacy: world.diplomacy,
    technology: world.technology,
    wars: world.wars,
    victory: world.victory,
    events: world.events,
    buildingCatalog,
    onlinePlayers: world.players.size,
  };
}

export function selectKingdom(world, socketId, kingdomId) {
  const player = world.players.get(socketId);
  const kingdom = world.kingdoms.find((item) => item.id === kingdomId);

  if (!player || !kingdom) {
    return false;
  }

  player.selectedKingdomId = kingdomId;
  player.selectedCountryId = kingdomId;
  return true;
}

export const selectCountry = selectKingdom;

export function setPlayerMode(world, socketId, mode) {
  const player = world.players.get(socketId);
  if (!player) {
    return false;
  }

  player.mode = mode === 'admin' ? 'admin' : 'player';
  return true;
}

export function dispatchWorldAction(world, socketId, action = {}) {
  const type = action.type;
  const payload = action.payload ?? {};

  if (type === 'time:set') {
    return setTimeControls(world, socketId, payload);
  }

  if (type === 'player:setMode') {
    const ok = setPlayerMode(world, socketId, payload.mode);
    return ok ? { ok: true } : { ok: false, reason: 'Профиль игрока не найден.' };
  }

  if (type === 'kingdom:select') {
    const ok = selectKingdom(world, socketId, payload.kingdomId);
    return ok ? { ok: true } : { ok: false, reason: 'Держава не найдена.' };
  }

  if (type === 'holding:build') {
    return queueBuilding(world, socketId, payload);
  }

  if (type === 'market:trade') {
    return tradeMarket(world, socketId, payload);
  }

  if (type === 'market:createRoute') {
    return createTradeRoute(world, socketId, payload);
  }

  if (type === 'diplomacy:sendResources') {
    return sendResources(world, socketId, payload);
  }

  if (type === 'diplomacy:improveRelations') {
    return improveRelations(world, socketId, payload);
  }

  if (type === 'diplomacy:proposeTreaty') {
    return proposeTreaty(world, socketId, payload);
  }

  if (type === 'diplomacy:demandVassalage') {
    return demandVassalage(world, socketId, payload);
  }

  if (type === 'war:declare') {
    return declareWar(world, socketId, payload);
  }

  if (type === 'army:recruit') {
    return recruitArmy(world, socketId, payload);
  }

  if (type === 'army:raid') {
    return raidRegion(world, socketId, payload);
  }

  if (type === 'army:patrol') {
    return patrolRegion(world, socketId, payload);
  }

  if (type === 'army:fortify') {
    return fortifyRegion(world, socketId, payload);
  }

  if (type === 'kingdom:emergencyLevy') {
    return emergencyLevy(world, socketId, payload);
  }

  if (type === 'kingdom:holdFestival') {
    return holdFestival(world, socketId, payload);
  }

  if (type === 'technology:fundResearch') {
    return fundResearch(world, socketId, payload);
  }

  if (type === 'technology:startResearch') {
    return startResearch(world, socketId, payload);
  }

  if (type === 'policy:set') {
    return setPolicy(world, socketId, payload);
  }

  return { ok: false, reason: 'Неизвестное действие.' };
}

export function buildInCastle(world, socketId, request = {}) {
  return queueBuilding(world, socketId, {
    holdingId: request.holdingId ?? request.castleId,
    type: request.type,
    x: request.x,
    z: request.z,
    rotation: request.rotation,
  });
}

function setTimeControls(world, socketId, payload) {
  const player = world.players.get(socketId);
  if (!player) {
    return { ok: false, reason: 'Профиль игрока не найден.' };
  }

  if (typeof payload.paused === 'boolean') {
    world.time.paused = payload.paused;
  }

  if (payload.speed !== undefined) {
    const speed = Number(payload.speed);
    if ([1, 2, 3].includes(speed)) {
      world.time.speed = speed;
    }
  }

  return { ok: true };
}

function queueBuilding(world, socketId, payload = {}) {
  const holding = world.holdings.find((item) => item.id === payload.holdingId);
  const type = payload.type;

  if (!holding) {
    return { ok: false, reason: 'Владение не найдено.' };
  }

  if (!buildingCatalog[type]) {
    return { ok: false, reason: 'Неизвестная постройка.' };
  }

  const permission = canControlKingdom(world, socketId, holding.kingdomId);
  if (!permission.ok) {
    return permission;
  }

  const kingdom = world.kingdoms.find((item) => item.id === holding.kingdomId);
  const catalog = buildingCatalog[type];
  const activeAndQueued = holding.buildings.length + holding.constructionQueue.length;

  if (activeAndQueued >= kingdom.resources.buildLimit) {
    return { ok: false, reason: 'Достигнут лимит построек во владении.' };
  }

  if (!canAfford(kingdom.resources, catalog.cost)) {
    return { ok: false, reason: 'Недостаточно ресурсов.' };
  }

  const placementResult = resolveBuildPlacement(holding, payload, activeAndQueued);
  if (!placementResult.ok) {
    return placementResult;
  }

  payCost(kingdom.resources, catalog.cost);
  holding.constructionQueue.push(createQueuedBuilding(holding.id, type, placementResult.placement));
  pushEvent(world, 'construction', 'Строительство начато', `${kingdom.name}: ${catalog.label} поставлено в очередь во владении ${holding.name}.`, kingdom.id);

  return { ok: true };
}

function tradeMarket(world, socketId, payload) {
  const kingdom = getActionKingdom(world, socketId, payload.kingdomId);
  const resource = payload.resource;
  const amount = clampNumber(Number(payload.amount ?? 50), 10, 250);
  const direction = payload.direction === 'sell' ? 'sell' : 'buy';

  if (!kingdom) {
    return { ok: false, reason: 'Держава недоступна.' };
  }

  if (!marketResources.includes(resource)) {
    return { ok: false, reason: 'Этот ресурс не торгуется на рынке.' };
  }

  const price = world.market.prices[resource];
  const effects = getTechEffects(world, kingdom);
  const buyGold = Math.ceil(price * amount * (1 - Math.min(0.32, effects.marketDiscount)));
  const sellGold = Math.floor(price * amount * (0.82 + Math.min(0.2, effects.tradeIncome * 0.35)));

  if (direction === 'buy') {
    if (kingdom.resources.gold < buyGold) {
      return { ok: false, reason: 'Недостаточно золота для сделки.' };
    }
    kingdom.resources.gold -= buyGold;
    kingdom.resources[resource] += amount;
    world.market.trend[resource] += 1;
    pushEvent(world, 'trade', 'Рыночная закупка', `${kingdom.name} закупает ${resource}: +${amount}, золото -${buyGold}.`, kingdom.id, { [resource]: amount, gold: -buyGold });
  } else {
    if (kingdom.resources[resource] < amount) {
      return { ok: false, reason: 'Недостаточно ресурса для продажи.' };
    }
    kingdom.resources[resource] -= amount;
    kingdom.resources.gold += sellGold;
    world.market.trend[resource] -= 1;
    pushEvent(world, 'trade', 'Рыночная продажа', `${kingdom.name} продаёт ${resource}: -${amount}, золото +${sellGold}.`, kingdom.id);
  }

  world.market.volume += amount;
  return { ok: true };
}

function createTradeRoute(world, socketId, payload) {
  const from = getActionKingdom(world, socketId, payload.kingdomId ?? payload.fromKingdomId);
  const to = world.kingdoms.find((item) => item.id === payload.partnerKingdomId || item.id === payload.toKingdomId);
  const resource = payload.resource;
  const direction = payload.direction === 'export' ? 'export' : 'import';
  const amount = clampNumber(Number(payload.amount ?? 18), 6, 45);

  if (!from || !to || from.id === to.id) {
    return { ok: false, reason: 'Неверный торговый партнёр.' };
  }

  if (!marketResources.includes(resource)) {
    return { ok: false, reason: 'Этот ресурс нельзя пустить по маршруту.' };
  }

  if (isAtWar(world, from.id, to.id)) {
    return { ok: false, reason: 'Во время войны торговые маршруты закрыты.' };
  }

  const relation = world.diplomacy.relations[from.id]?.[to.id] ?? 45;
  const hasTrade = hasDiplomaticTreaty(world, from.id, to.id, 'trade');
  if (relation < 42 && !hasTrade) {
    return { ok: false, reason: 'Отношения слишком слабые для стабильного маршрута.' };
  }

  const duplicate = (world.market.routes ?? []).some((route) => (
    route.status !== 'expired'
    && route.fromKingdomId === from.id
    && route.toKingdomId === to.id
    && route.resource === resource
    && route.direction === direction
  ));
  if (duplicate) {
    return { ok: false, reason: 'Такой торговый маршрут уже действует.' };
  }

  const cost = hasTrade
    ? { gold: 24, influence: 4 }
    : { gold: 42, influence: 8 };
  if (!canAfford(from.resources, cost)) {
    return { ok: false, reason: 'Недостаточно ресурсов для открытия маршрута.' };
  }

  payCost(from.resources, cost);
  world.market.routes ??= [];
  world.market.routes.push({
    id: `route-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    fromKingdomId: from.id,
    toKingdomId: to.id,
    resource,
    direction,
    amount,
    startedDay: world.time.day,
    startedYear: world.time.year,
    remainingDays: hasTrade ? 62 : 45,
    status: 'active',
    volume: 0,
    pausedDays: 0,
  });
  adjustRelation(world, from.id, to.id, 2);
  pushEvent(world, 'trade', 'Торговый маршрут открыт', `${from.name} открывает ${direction === 'export' ? 'экспорт' : 'импорт'} ${resource} с ${to.name}.`, from.id, { gold: -cost.gold, influence: -cost.influence });
  return { ok: true };
}

function sendResources(world, socketId, payload) {
  const from = getActionKingdom(world, socketId, payload.fromKingdomId);
  const to = world.kingdoms.find((item) => item.id === payload.toKingdomId);
  const resource = payload.resource;
  const amount = clampNumber(Number(payload.amount ?? 50), 10, 200);

  if (!from || !to || from.id === to.id) {
    return { ok: false, reason: 'Неверный адресат отправки.' };
  }

  if (!['gold', 'food', 'wood', 'stone', 'iron'].includes(resource)) {
    return { ok: false, reason: 'Этот ресурс нельзя отправить.' };
  }

  if (from.resources[resource] < amount) {
    return { ok: false, reason: 'Недостаточно ресурсов для отправки.' };
  }

  from.resources[resource] -= amount;
  to.resources[resource] += amount;
  adjustRelation(world, from.id, to.id, 5);
  pushEvent(world, 'diplomacy', 'Караван отправлен', `${from.name} отправляет ${amount} ${resource} в ${to.name}. Отношения улучшаются.`, from.id);
  return { ok: true };
}

function improveRelations(world, socketId, payload) {
  const from = getActionKingdom(world, socketId, payload.fromKingdomId);
  const to = world.kingdoms.find((item) => item.id === payload.toKingdomId);

  if (!from || !to || from.id === to.id) {
    return { ok: false, reason: 'Неверная дипломатическая цель.' };
  }

  const cost = Math.ceil(12 * (1 - Math.min(0.3, getTechEffects(world, from).treatyDiscount)));
  if (from.resources.influence < cost) {
    return { ok: false, reason: 'Недостаточно влияния.' };
  }

  from.resources.influence -= cost;
  adjustRelation(world, from.id, to.id, 8 + Math.floor(getTechEffects(world, from).diplomacyWeight / 8));
  pushEvent(world, 'diplomacy', 'Посольство принято', `${from.name} улучшает отношения с ${to.name}.`, from.id, { influence: -cost });
  return { ok: true };
}

function proposeTreaty(world, socketId, payload) {
  const from = getActionKingdom(world, socketId, payload.fromKingdomId);
  const to = world.kingdoms.find((item) => item.id === payload.toKingdomId);
  const treatyType = ['trade', 'non_aggression', 'research', 'alliance', 'tribute'].includes(payload.treatyType) ? payload.treatyType : 'trade';
  const treatyLabels = {
    alliance: 'оборонительный союз',
    trade: 'торговое соглашение',
    non_aggression: 'пакт о ненападении',
    research: 'обмен учёными',
    tribute: 'договор о пошлинах',
  };
  const relationNeeded = {
    alliance: 78,
    trade: 55,
    non_aggression: 48,
    research: 64,
    tribute: 62,
  };
  const baseCost = {
    alliance: { influence: 34, gold: 90, iron: 14 },
    trade: { influence: 16, gold: 40 },
    non_aggression: { influence: 18, gold: 30 },
    research: { influence: 22, gold: 55, technology: 12 },
    tribute: { influence: 24, gold: 70 },
  }[treatyType];

  if (!from || !to || from.id === to.id) {
    return { ok: false, reason: 'Неверный адресат договора.' };
  }

  if (isAtWar(world, from.id, to.id)) {
    return { ok: false, reason: 'Сначала нужно завершить войну.' };
  }

  const relation = world.diplomacy.relations[from.id]?.[to.id] ?? 45;
  if (relation < relationNeeded[treatyType]) {
    return { ok: false, reason: 'Отношения слишком слабые для договора.' };
  }

  const duplicate = world.diplomacy.treaties.some((treaty) => (
    treaty.type === treatyType
    && [treaty.fromKingdomId, treaty.toKingdomId].includes(from.id)
    && [treaty.fromKingdomId, treaty.toKingdomId].includes(to.id)
  ));
  if (duplicate) {
    return { ok: false, reason: 'Такой договор уже действует.' };
  }

  const discount = Math.min(0.35, getTechEffects(world, from).treatyDiscount);
  const cost = scaleCost(baseCost, 1 - discount);
  if (!canAfford(from.resources, cost)) {
    return { ok: false, reason: 'Недостаточно ресурсов для договора.' };
  }

  payCost(from.resources, cost);
  world.diplomacy.treaties.push({
    id: `treaty-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    fromKingdomId: from.id,
    toKingdomId: to.id,
    type: treatyType,
    signedDay: world.time.day,
    signedYear: world.time.year,
    durationDays: treatyType === 'alliance' ? 110 : treatyType === 'tribute' ? 88 : 72,
  });

  adjustRelation(world, from.id, to.id, treatyType === 'alliance' ? 14 : treatyType === 'non_aggression' ? 10 : 7);
  pushEvent(world, 'diplomacy', 'Договор заключён', `${from.name} и ${to.name} подписывают ${treatyLabels[treatyType]}.`, from.id, { influence: -cost.influence });
  return { ok: true };
}

function demandVassalage(world, socketId, payload) {
  const from = getActionKingdom(world, socketId, payload.fromKingdomId ?? payload.kingdomId);
  const to = world.kingdoms.find((item) => item.id === payload.toKingdomId || item.id === payload.targetKingdomId);

  if (!from || !to || from.id === to.id) {
    return { ok: false, reason: 'Неверная цель вассалитета.' };
  }

  if (world.diplomacy.vassals?.[to.id] === from.id) {
    return { ok: false, reason: 'Эта держава уже ваш вассал.' };
  }

  if (wouldCreateVassalCycle(world, from.id, to.id)) {
    return { ok: false, reason: 'Такой договор создаст конфликт клятв.' };
  }

  if (isAtWar(world, from.id, to.id)) {
    return { ok: false, reason: 'Во время войны вассалитет навязывается победой.' };
  }

  const relation = world.diplomacy.relations[from.id]?.[to.id] ?? 45;
  const effects = getTechEffects(world, from);
  const pressure = relation
    + (from.resources.army - to.resources.army) / 5
    + (from.resources.stability - to.resources.stability) / 2
    + (to.resources.stability < 35 ? 20 : 0)
    + (to.resources.army < 90 ? 14 : 0)
    + effects.diplomacyWeight;

  if (pressure < 92) {
    return { ok: false, reason: 'Держава ещё не готова принять вассальную клятву.' };
  }

  const cost = scaleCost({ influence: 36, gold: 80 }, 1 - Math.min(0.28, effects.treatyDiscount));
  if (!canAfford(from.resources, cost)) {
    return { ok: false, reason: 'Недостаточно золота и влияния для вассальной грамоты.' };
  }

  payCost(from.resources, cost);
  vassalizeKingdom(world, from.id, to.id, 'diplomacy');
  pushEvent(world, 'diplomacy', 'Вассальная клятва', `${to.name} признаёт сюзеренитет ${from.name}.`, from.id, { influence: -cost.influence, gold: -cost.gold });
  updateVictory(world);
  return { ok: true };
}

function declareWar(world, socketId, payload) {
  const attacker = getActionKingdom(world, socketId, payload.attackerKingdomId ?? payload.kingdomId);
  const defender = world.kingdoms.find((item) => item.id === payload.defenderKingdomId || item.id === payload.targetKingdomId);

  if (!attacker || !defender || attacker.id === defender.id) {
    return { ok: false, reason: 'Неверная цель войны.' };
  }

  if (world.diplomacy.vassals?.[defender.id] === attacker.id) {
    return { ok: false, reason: 'Нельзя объявить войну собственному вассалу.' };
  }

  if (world.diplomacy.vassals?.[attacker.id] === defender.id) {
    return { ok: false, reason: 'Вассал не может объявить войну сюзерену.' };
  }

  if (isAtWar(world, attacker.id, defender.id)) {
    return { ok: false, reason: 'Война уже идёт.' };
  }

  const cost = { gold: 55, influence: 10 };
  if (!canAfford(attacker.resources, cost)) {
    return { ok: false, reason: 'Недостаточно ресурсов для мобилизации.' };
  }

  payCost(attacker.resources, cost);
  breakTreatiesBetween(world, attacker.id, defender.id);
  adjustRelation(world, attacker.id, defender.id, -42);
  attacker.resources.threat = clampNumber(attacker.resources.threat + 8, 0, 100);
  defender.resources.threat = clampNumber(defender.resources.threat + 6, 0, 100);

  const attackerArmy = world.armies.find((item) => item.kingdomId === attacker.id);
  const defenderArmy = world.armies.find((item) => item.kingdomId === defender.id);
  if (attackerArmy) {
    attackerArmy.status = 'campaigning';
    attackerArmy.morale = clampNumber(attackerArmy.morale + 2, 20, 100);
  }
  if (defenderArmy) {
    defenderArmy.status = 'defending';
  }

  world.wars.push({
    id: `war-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    attackerKingdomId: attacker.id,
    defenderKingdomId: defender.id,
    startedDay: world.time.day,
    startedYear: world.time.year,
    days: 0,
    status: 'active',
    attackerWarScore: 0,
    defenderWarScore: 0,
    lastReportDay: world.time.day,
    winnerKingdomId: null,
    loserKingdomId: null,
  });

  pushEvent(world, 'war', 'Война объявлена', `${attacker.name} начинает войну против ${defender.name}. Побеждённый станет вассалом.`, attacker.id, { gold: -cost.gold, influence: -cost.influence });
  return { ok: true };
}

function recruitArmy(world, socketId, payload) {
  const kingdom = getActionKingdom(world, socketId, payload.kingdomId);

  if (!kingdom) {
    return { ok: false, reason: 'Держава недоступна.' };
  }

  const cost = { gold: 65, food: 45, iron: 18 };
  if (!canAfford(kingdom.resources, cost)) {
    return { ok: false, reason: 'Недостаточно ресурсов для набора войск.' };
  }

  payCost(kingdom.resources, cost);
  kingdom.resources.army += 45;

  const army = world.armies.find((item) => item.kingdomId === kingdom.id);
  if (army) {
    army.strength += 45;
    army.morale = clampNumber(army.morale + 4, 0, 100);
  }

  pushEvent(world, 'army', 'Набор войск', `${kingdom.name}: к армии присоединились новые отряды. Сила +45.`, kingdom.id);
  return { ok: true };
}

function raidRegion(world, socketId, payload) {
  const attacker = getActionKingdom(world, socketId, payload.kingdomId);
  const region = world.regions.find((item) => item.id === payload.targetRegionId);

  if (!attacker || !region || region.kingdomId === attacker.id) {
    return { ok: false, reason: 'Неверная цель рейда.' };
  }

  if (attacker.resources.army < 80) {
    return { ok: false, reason: 'Армия слишком мала для рейда.' };
  }

  const defender = world.kingdoms.find((item) => item.id === region.kingdomId);
  const attackerArmy = world.armies.find((item) => item.kingdomId === attacker.id);
  const attackerEffects = getTechEffects(world, attacker);
  const defenderEffects = getTechEffects(world, defender);
  const defenderPower = region.fortLevel * 45 * (1 - Math.min(0.45, attackerEffects.enemyFortBypass)) + averageHoldingGarrison(world, region.id) + defender.resources.army * 0.35 * (1 + defenderEffects.warDefense);
  const attackerPower = attacker.resources.army * (attackerArmy?.morale ?? 70) / 100 * (1 + attackerEffects.warAttack) + Math.random() * 80;
  const success = attackerPower > defenderPower;

  const attackerLosses = success ? randomInt(16, 38) : randomInt(34, 72);
  const defenderLosses = success ? randomInt(28, 70) : randomInt(12, 34);
  attacker.resources.army = Math.max(20, attacker.resources.army - attackerLosses);
  defender.resources.army = Math.max(20, defender.resources.army - defenderLosses);

  if (attackerArmy) {
    attackerArmy.strength = attacker.resources.army;
    attackerArmy.morale = clampNumber(attackerArmy.morale + (success ? 5 : -12), 25, 100);
    attackerArmy.regionId = region.id;
    attackerArmy.status = success ? 'raiding' : 'retreating';
  }

  adjustRelation(world, attacker.id, defender.id, success ? -16 : -10);
  region.control = clampNumber(region.control + (success ? -8 : -3), 20, 100);
  attacker.resources.threat = clampResource(attacker.resources.threat + 4);
  defender.resources.threat = clampResource(defender.resources.threat + (success ? 9 : 3));

  if (success) {
    const lootGold = Math.min(defender.resources.gold, randomInt(35, 90));
    const lootFood = Math.min(defender.resources.food, randomInt(20, 70));
    defender.resources.gold -= lootGold;
    defender.resources.food -= lootFood;
    attacker.resources.gold += lootGold;
    attacker.resources.food += lootFood;
    pushEvent(world, 'army', 'Рейд успешен', `${attacker.name} разоряет ${region.name}: добыча ${lootGold} золота и ${lootFood} еды.`, attacker.id, { gold: lootGold, food: lootFood });
  } else {
    pushEvent(world, 'warning', 'Рейд отбит', `${defender.name} удерживает ${region.name}. ${attacker.name} отступает с потерями.`, defender.id);
  }

  return { ok: true };
}

function patrolRegion(world, socketId, payload) {
  const kingdom = getActionKingdom(world, socketId, payload.kingdomId);
  const region = world.regions.find((item) => item.id === payload.regionId)
    ?? world.regions.find((item) => item.id === kingdom?.capitalRegionId);

  if (!kingdom || !region || region.kingdomId !== kingdom.id) {
    return { ok: false, reason: 'Можно патрулировать только свой регион.' };
  }

  const cost = { gold: 22, food: 24 };
  if (!canAfford(kingdom.resources, cost)) {
    return { ok: false, reason: 'Недостаточно припасов для патруля.' };
  }

  payCost(kingdom.resources, cost);
  region.control = clampNumber(region.control + 6, 20, 100);
  region.prosperity = clampNumber((region.prosperity ?? region.development) + 1, 20, 100);
  kingdom.resources.threat = clampNumber(kingdom.resources.threat - 7, 0, 100);
  kingdom.resources.stability = clampNumber(kingdom.resources.stability + 1, 0, 100);

  const army = world.armies.find((item) => item.kingdomId === kingdom.id);
  if (army) {
    army.regionId = region.id;
    army.status = 'patrolling';
    army.morale = clampNumber(army.morale + 3, 20, 100);
  }

  pushEvent(world, 'army', 'Патруль дорог', `${kingdom.name}: отряды прочёсывают ${region.name}. Контроль растёт, угроза снижается.`, kingdom.id);
  return { ok: true };
}

function fortifyRegion(world, socketId, payload) {
  const kingdom = getActionKingdom(world, socketId, payload.kingdomId);
  const region = world.regions.find((item) => item.id === payload.regionId)
    ?? world.regions.find((item) => item.id === kingdom?.capitalRegionId);

  if (!kingdom || !region || region.kingdomId !== kingdom.id) {
    return { ok: false, reason: 'Можно укреплять только свой регион.' };
  }

  if (region.fortLevel >= 6) {
    return { ok: false, reason: 'Этот регион уже максимально укреплён.' };
  }

  const cost = scaleCost({ wood: 45, stone: 55, gold: 35 }, 1 - Math.min(0.35, getTechEffects(world, kingdom).fortifyDiscount));
  if (!canAfford(kingdom.resources, cost)) {
    return { ok: false, reason: 'Недостаточно ресурсов для укреплений.' };
  }

  payCost(kingdom.resources, cost);
  region.fortLevel += 1;
  region.control = clampNumber(region.control + 3, 20, 100);

  for (const holdingItem of world.holdings.filter((item) => item.regionId === region.id)) {
    holdingItem.garrison = clampResource(holdingItem.garrison + 8);
  }

  pushEvent(world, 'construction', 'Регион укреплён', `${kingdom.name}: ${region.name} получает новый уровень укреплений.`, kingdom.id);
  return { ok: true };
}

function emergencyLevy(world, socketId, payload) {
  const kingdom = getActionKingdom(world, socketId, payload.kingdomId);

  if (!kingdom) {
    return { ok: false, reason: 'Держава недоступна.' };
  }

  const cost = { gold: 45, food: 60 };
  if (!canAfford(kingdom.resources, cost)) {
    return { ok: false, reason: 'Недостаточно припасов для чрезвычайного набора.' };
  }

  payCost(kingdom.resources, cost);
  kingdom.resources.army = clampResource(kingdom.resources.army + 70);
  kingdom.resources.population = Math.max(220, kingdom.resources.population - 24);
  kingdom.resources.stability = clampNumber(kingdom.resources.stability - 5, 0, 100);
  kingdom.resources.prosperity = clampNumber(kingdom.resources.prosperity - 3, 0, 100);
  kingdom.resources.threat = clampNumber(kingdom.resources.threat + 2, 0, 100);

  const army = world.armies.find((item) => item.kingdomId === kingdom.id);
  if (army) {
    army.strength = kingdom.resources.army;
    army.morale = clampNumber(army.morale - 4, 20, 100);
    army.status = 'levying';
  }

  pushEvent(world, 'army', 'Чрезвычайный набор', `${kingdom.name}: деревни выставляют ополчение. Армия растёт, но народ устал.`, kingdom.id);
  return { ok: true };
}

function holdFestival(world, socketId, payload) {
  const kingdom = getActionKingdom(world, socketId, payload.kingdomId);

  if (!kingdom) {
    return { ok: false, reason: 'Держава недоступна.' };
  }

  const cost = { gold: 80, food: 90, influence: 6 };
  if (!canAfford(kingdom.resources, cost)) {
    return { ok: false, reason: 'Недостаточно ресурсов для праздника.' };
  }

  payCost(kingdom.resources, cost);
  kingdom.resources.stability = clampNumber(kingdom.resources.stability + 6, 0, 100);
  kingdom.resources.prosperity = clampNumber(kingdom.resources.prosperity + 5, 0, 100);
  kingdom.resources.threat = clampNumber(kingdom.resources.threat - 3, 0, 100);
  kingdom.resources.influence = clampResource(kingdom.resources.influence + 2);

  pushEvent(world, 'success', 'Праздник короны', `${kingdom.name}: площади полны огней, слухи стихают, доверие к власти растёт.`, kingdom.id);
  return { ok: true };
}

function fundResearch(world, socketId, payload) {
  const kingdom = getActionKingdom(world, socketId, payload.kingdomId);

  if (!kingdom) {
    return { ok: false, reason: 'Держава недоступна.' };
  }

  const cost = { gold: 75, influence: 10 };
  if (!canAfford(kingdom.resources, cost)) {
    return { ok: false, reason: 'Недостаточно золота и влияния для исследований.' };
  }

  payCost(kingdom.resources, cost);
  const bonus = kingdom.policies.research === 'engineering' ? 28 : kingdom.policies.research === 'military' ? 24 : 22;
  ensureTechnologyState(world);
  const active = world.technology.active[kingdom.id];
  if (active) {
    active.progress = clampNumber(active.progress + bonus / 3, 0, active.required);
    active.power = calculateResearchPower(world, kingdom);
  } else {
    kingdom.resources.technology = clampResource(kingdom.resources.technology + bonus);
  }
  kingdom.resources.prosperity = clampNumber(kingdom.resources.prosperity + 1, 0, 100);

  pushEvent(world, 'research', 'Исследования профинансированы', active
    ? `${kingdom.name}: гранты ускоряют текущий проект. Прогресс +${Math.floor(bonus / 3)}.`
    : `${kingdom.name}: мастерские и архивы получают казённые гранты. Технологии +${bonus}.`, kingdom.id, { technology: active ? 0 : bonus });
  return { ok: true };
}

function startResearch(world, socketId, payload) {
  const kingdom = getActionKingdom(world, socketId, payload.kingdomId);
  const tech = technologyTree.find((item) => item.id === payload.techId);

  if (!kingdom || !tech) {
    return { ok: false, reason: 'Исследование недоступно.' };
  }

  ensureTechnologyState(world);
  if (world.technology.active[kingdom.id]) {
    return { ok: false, reason: 'Учёные уже заняты текущим проектом.' };
  }

  const completed = new Set(world.technology.completed[kingdom.id] ?? []);
  if (completed.has(tech.id)) {
    return { ok: false, reason: 'Эта технология уже изучена.' };
  }

  const missing = tech.requires.filter((requirement) => !completed.has(requirement));
  if (missing.length) {
    return { ok: false, reason: 'Не выполнены требования технологии.' };
  }

  if (!canAfford(kingdom.resources, tech.cost)) {
    return { ok: false, reason: 'Недостаточно ресурсов для начала исследования.' };
  }

  payCost(kingdom.resources, tech.cost);
  world.technology.active[kingdom.id] = {
    techId: tech.id,
    progress: 0,
    required: tech.baseDays,
    startedDay: world.time.day,
    startedYear: world.time.year,
    power: calculateResearchPower(world, kingdom),
  };
  pushEvent(world, 'research', 'Исследование начато', `${kingdom.name}: архивы начинают проект "${tech.name}".`, kingdom.id);
  return { ok: true };
}

function setPolicy(world, socketId, payload) {
  const kingdom = getActionKingdom(world, socketId, payload.kingdomId);
  const policy = payload.policy;
  const value = payload.value;

  if (!kingdom) {
    return { ok: false, reason: 'Держава недоступна.' };
  }

  const options = {
    taxation: ['low', 'balanced', 'war'],
    military: ['defensive', 'levies', 'raiders'],
    research: ['stewardship', 'engineering', 'military'],
  };

  if (!options[policy]?.includes(value)) {
    return { ok: false, reason: 'Неверная политика.' };
  }

  kingdom.policies[policy] = value;
  pushEvent(world, 'scroll', 'Указ принят', `${kingdom.name}: политика "${policy}" изменена на "${value}".`, kingdom.id);
  return { ok: true };
}

export function advanceWorld(world) {
  if (world.time.paused) {
    return;
  }

  for (let i = 0; i < world.time.speed; i += 1) {
    advanceOneDay(world);
  }
}

function advanceOneDay(world) {
  world.time.day += 1;

  if (world.time.day > 360) {
    world.time.day = 1;
    world.time.year += 1;
  }

  world.time.season = getSeason(world.time.day);
  expireDiplomaticTreaties(world);
  advanceTradeRoutes(world);

  for (const kingdom of world.kingdoms) {
    applyKingdomEconomy(world, kingdom);
    advanceConstruction(world, kingdom);
    advanceResearch(world, kingdom);
  }

  advanceWars(world);
  collectVassalTributes(world);
  advanceDiplomaticDrift(world);
  updateVictory(world);
  updateMarket(world);

  if (world.time.day >= world.ai.nextDecisionDay) {
    runAi(world);
    world.ai.nextDecisionDay = world.time.day + randomInt(4, 8);
  }

  if (Math.random() < 0.23) {
    applyRandomEvent(world);
  }
}

function getSeason(day) {
  if (day <= 90) return 'Spring';
  if (day <= 180) return 'Summer';
  if (day <= 270) return 'Autumn';
  return 'Winter';
}

function expireDiplomaticTreaties(world) {
  const active = [];

  for (const treaty of world.diplomacy.treaties) {
    const signedDay = treaty.signedDay ?? world.time.day;
    const signedYear = treaty.signedYear ?? world.time.year;
    const age = (world.time.year - signedYear) * 360 + world.time.day - signedDay;
    if (age <= (treaty.durationDays ?? 72)) {
      active.push(treaty);
      continue;
    }

    const from = world.kingdoms.find((item) => item.id === treaty.fromKingdomId);
    const to = world.kingdoms.find((item) => item.id === treaty.toKingdomId);
    if (from && to) {
      pushEvent(world, 'diplomacy', 'Договор истёк', `${from.name} и ${to.name} должны заново подтвердить условия договора.`, from.id);
    }
  }

  world.diplomacy.treaties = active;
}

function applyKingdomEconomy(world, kingdom) {
  const regions = world.regions.filter((item) => item.kingdomId === kingdom.id);
  const holdings = world.holdings.filter((item) => item.kingdomId === kingdom.id);
  const techEffects = getTechEffects(world, kingdom);
  const delta = {
    gold: 0,
    food: 0,
    wood: 0,
    stone: 0,
    iron: 0,
    influence: 0,
    technology: 0,
    population: 0,
    army: 0,
    stability: 0,
    prosperity: 0,
    threat: 0,
    buildLimit: 0,
  };

  for (const regionItem of regions) {
    const terrain = terrainYield(regionItem.terrain);
    const multiplier = (0.65 + regionItem.control / 180 + regionItem.development / 220 + kingdom.resources.stability / 400);

    for (const [key, value] of Object.entries(terrain)) {
      delta[key] = (delta[key] ?? 0) + value * multiplier;
    }

    regionItem.prosperity = clampNumber((regionItem.prosperity ?? regionItem.development) + kingdom.resources.stability / 260 - kingdom.resources.threat / 220 + techEffects.prosperityDaily, 20, 100);
    regionItem.control = clampNumber(regionItem.control + kingdom.resources.stability / 280 - kingdom.resources.threat / 260 + techEffects.controlDaily, 20, 100);
  }

  for (const holdingItem of holdings) {
    for (const building of holdingItem.buildings) {
      const catalog = buildingCatalog[building.type];
      if (!catalog) continue;

      for (const [key, value] of Object.entries(catalog.effects ?? {})) {
        delta[key] = (delta[key] ?? 0) + value;
      }

      for (const [key, value] of Object.entries(catalog.maintenance ?? {})) {
        delta[key] = (delta[key] ?? 0) - value;
      }
    }
  }

  syncBuildLimit(kingdom, holdings);

  const taxMultiplier = kingdom.policies.taxation === 'war' ? 1.25 : kingdom.policies.taxation === 'low' ? 0.72 : 1;
  const militaryMultiplier = kingdom.policies.military === 'levies' ? 1.18 : kingdom.policies.military === 'raiders' ? 1.08 : 0.92;
  const researchBonus = kingdom.policies.research === 'engineering' ? 2 : kingdom.policies.research === 'military' ? 1 : 1;
  const population = kingdom.resources.population;
  const taxes = Math.max(3, Math.floor((population / 42 + average(regions.map((item) => item.development)) / 5) * taxMultiplier));
  const foodConsumption = Math.ceil(population / 58);
  const armyUpkeep = Math.ceil(kingdom.resources.army / 90);

  delta.gold += taxes - armyUpkeep;
  delta.food -= foodConsumption;
  delta.influence += kingdom.resources.stability > 65 ? 1 : 0;
  delta.technology += researchBonus;
  delta.army += kingdom.policies.military === 'levies' ? 1.1 : 0.35;
  delta.stability += kingdom.resources.food > 90 ? 0.12 : -0.35;
  delta.stability += kingdom.policies.taxation === 'war' ? -0.28 : kingdom.policies.taxation === 'low' ? 0.2 : 0;
  delta.threat += kingdom.policies.military === 'raiders' ? 0.18 : -0.08;
  delta.prosperity += delta.food > 0 && delta.gold > 0 ? 0.12 : -0.12;

  if (kingdom.policies.research === 'military') {
    delta.army += 0.75 * militaryMultiplier;
  }

  applyTreatyEconomy(world, kingdom, delta);

  if (delta.food > 0) {
    delta.food *= 1 + techEffects.foodYield;
  }
  if (delta.gold > 0) {
    delta.gold *= 1 + techEffects.goldYield;
  }
  delta.gold += techEffects.tradeIncome * 2.5;
  delta.technology += techEffects.researchPower * 0.35;
  delta.stability += techEffects.stabilityDaily;
  delta.prosperity += techEffects.prosperityDaily;
  delta.threat += techEffects.threatDaily;

  for (const key of ['gold', 'food', 'wood', 'stone', 'iron', 'influence', 'technology']) {
    kingdom.resources[key] = clampResource(kingdom.resources[key] + (delta[key] ?? 0));
  }

  kingdom.resources.army = clampResource(kingdom.resources.army + (delta.army ?? 0));
  kingdom.resources.stability = clampNumber(kingdom.resources.stability + delta.stability, 0, 100);
  kingdom.resources.prosperity = clampNumber(kingdom.resources.prosperity + delta.prosperity, 0, 100);
  kingdom.resources.threat = clampNumber(kingdom.resources.threat + delta.threat, 0, 100);

  const populationCapacity = 650 + holdings.flatMap((item) => item.buildings).filter((item) => item.type === 'house').length * 42;
  if (kingdom.resources.food > 120 && kingdom.resources.population < populationCapacity) {
    kingdom.resources.population = clampResource(kingdom.resources.population + 1);
  }

  if (kingdom.resources.food <= 0) {
    kingdom.resources.population = Math.max(220, kingdom.resources.population - 3);
    kingdom.resources.stability = Math.max(0, kingdom.resources.stability - 1.4);
  }

  const army = world.armies.find((item) => item.kingdomId === kingdom.id);
  if (army) {
    army.strength = kingdom.resources.army;
    army.morale = clampNumber(army.morale + kingdom.resources.stability / 320 - kingdom.resources.threat / 360, 20, 100);
  }
}

function applyTreatyEconomy(world, kingdom, delta) {
  const treaties = world.diplomacy.treaties.filter((treaty) => treaty.fromKingdomId === kingdom.id || treaty.toKingdomId === kingdom.id);
  const allianceTreaties = treaties.filter((treaty) => treaty.type === 'alliance').length;
  const tradeTreaties = treaties.filter((treaty) => treaty.type === 'trade').length;
  const peaceTreaties = treaties.filter((treaty) => treaty.type === 'non_aggression').length;
  const researchTreaties = treaties.filter((treaty) => treaty.type === 'research').length;
  const tributeTreaties = treaties.filter((treaty) => treaty.type === 'tribute').length;

  delta.gold += tradeTreaties * 3;
  delta.gold += tributeTreaties * 2;
  delta.food += tradeTreaties * 1;
  delta.influence += treaties.length * 0.15;
  delta.technology += researchTreaties * 1.2;
  delta.army += allianceTreaties * 0.35;
  delta.stability += allianceTreaties * 0.08;
  delta.threat -= peaceTreaties * 0.16 + allianceTreaties * 0.08;
  delta.prosperity += tradeTreaties * 0.08 + researchTreaties * 0.05 + tributeTreaties * 0.05;
}

function advanceConstruction(world, kingdom) {
  const holdings = world.holdings.filter((item) => item.kingdomId === kingdom.id);

  for (const holdingItem of holdings) {
    const activeBuild = holdingItem.constructionQueue[0];
    if (!activeBuild) {
      continue;
    }

    activeBuild.remainingDays -= 1;

    if (activeBuild.remainingDays <= 0) {
      activeBuild.status = 'active';
      activeBuild.remainingDays = 0;
      holdingItem.buildings.push(activeBuild);
      holdingItem.constructionQueue.shift();
      syncBuildLimit(kingdom, holdings);
      pushEvent(world, 'construction', 'Постройка завершена', `${kingdom.name}: ${buildingCatalog[activeBuild.type].label} завершена во владении ${holdingItem.name}.`, kingdom.id);
    }
  }
}

function advanceResearch(world, kingdom) {
  ensureTechnologyState(world);
  const active = world.technology.active[kingdom.id];
  if (!active) {
    return;
  }

  const tech = technologyTree.find((item) => item.id === active.techId);
  if (!tech) {
    world.technology.active[kingdom.id] = null;
    return;
  }

  const power = calculateResearchPower(world, kingdom);
  active.power = power;
  active.progress = clampNumber((active.progress ?? 0) + power, 0, active.required ?? tech.baseDays);

  if (active.progress < (active.required ?? tech.baseDays)) {
    return;
  }

  if (!world.technology.completed[kingdom.id].includes(tech.id)) {
    world.technology.completed[kingdom.id].push(tech.id);
  }
  world.technology.active[kingdom.id] = null;
  kingdom.resources.technology = clampResource(kingdom.resources.technology + Math.max(4, tech.tier * 3));
  kingdom.resources.prosperity = clampNumber(kingdom.resources.prosperity + 1 + tech.tier, 0, 100);
  pushEvent(world, 'research', 'Технология изучена', `${kingdom.name} завершает "${tech.name}". ${tech.description}`, kingdom.id, { technology: tech.tier * 3 });
}

function advanceTradeRoutes(world) {
  if (!world.market.routes?.length) {
    return;
  }

  const activeRoutes = [];
  for (const route of world.market.routes) {
    if (route.status === 'expired') {
      continue;
    }

    const from = world.kingdoms.find((item) => item.id === route.fromKingdomId);
    const to = world.kingdoms.find((item) => item.id === route.toKingdomId);
    if (!from || !to || isAtWar(world, from.id, to.id)) {
      route.status = 'expired';
      continue;
    }

    const exporter = route.direction === 'export' ? from : to;
    const importer = route.direction === 'export' ? to : from;
    const exporterEffects = getTechEffects(world, exporter);
    const importerEffects = getTechEffects(world, importer);
    const price = world.market.prices[route.resource] ?? 3;
    const amount = clampNumber(Number(route.amount ?? 12), 4, 60);
    const importerCost = Math.ceil(price * amount * (0.48 - Math.min(0.22, importerEffects.marketDiscount * 0.7)));
    const exporterGain = Math.ceil(price * amount * (0.52 + Math.min(0.3, exporterEffects.tradeIncome)));

    if (exporter.resources[route.resource] < amount || importer.resources.gold < importerCost) {
      route.status = 'strained';
      route.pausedDays = (route.pausedDays ?? 0) + 1;
      if (route.pausedDays === 1) {
        pushEvent(world, 'trade', 'Маршрут буксует', `${from.name} и ${to.name}: торговый маршрут по ${route.resource} ждёт запасов.`, from.id);
      }
      if (route.pausedDays > 5) {
        route.status = 'expired';
        pushEvent(world, 'warning', 'Маршрут закрыт', `${from.name} и ${to.name}: торговый маршрут по ${route.resource} закрыт из-за срыва поставок.`, from.id);
        continue;
      }
      activeRoutes.push(route);
      continue;
    }

    route.status = 'active';
    route.pausedDays = 0;
    exporter.resources[route.resource] = clampResource(exporter.resources[route.resource] - amount);
    importer.resources[route.resource] = clampResource(importer.resources[route.resource] + amount);
    exporter.resources.gold = clampResource(exporter.resources.gold + exporterGain);
    importer.resources.gold = clampResource(importer.resources.gold - importerCost);
    route.volume = (route.volume ?? 0) + amount;
    route.remainingDays -= 1;
    world.market.volume += amount;
    world.market.trend[route.resource] = (world.market.trend[route.resource] ?? 0) + (route.direction === 'import' ? 0.05 : -0.05);
    adjustRelation(world, from.id, to.id, 0.06);

    if (route.remainingDays <= 0) {
      route.status = 'expired';
      pushEvent(world, 'trade', 'Маршрут завершён', `${from.name} и ${to.name}: торговый маршрут по ${route.resource} выполнил контракт.`, from.id);
      continue;
    }

    activeRoutes.push(route);
  }

  world.market.routes = activeRoutes.slice(-18);
}

function advanceWars(world) {
  const keptWars = [];

  for (const war of world.wars ?? []) {
    if (war.status !== 'active') {
      const age = (world.time.year - (war.endedYear ?? war.startedYear ?? world.time.year)) * 360 + world.time.day - (war.endedDay ?? war.startedDay ?? world.time.day);
      if (age < 35) {
        keptWars.push(war);
      }
      continue;
    }

    const attacker = world.kingdoms.find((item) => item.id === war.attackerKingdomId);
    const defender = world.kingdoms.find((item) => item.id === war.defenderKingdomId);
    if (!attacker || !defender) {
      war.status = 'resolved';
      continue;
    }

    war.days = (war.days ?? 0) + 1;
    const attackerArmy = world.armies.find((item) => item.kingdomId === attacker.id);
    const defenderArmy = world.armies.find((item) => item.kingdomId === defender.id);
    const attackerEffects = getTechEffects(world, attacker);
    const defenderEffects = getTechEffects(world, defender);
    const defenderFort = average(world.regions.filter((item) => item.kingdomId === defender.id).map((item) => item.fortLevel));
    const attackerMorale = (attackerArmy?.morale ?? 68) / 100;
    const defenderMorale = (defenderArmy?.morale ?? 70) / 100;
    const attackerPower = attacker.resources.army * attackerMorale * (1 + attackerEffects.warAttack) + randomInt(8, 34);
    const defenderPower = defender.resources.army * defenderMorale * (1 + defenderEffects.warDefense) + defenderFort * 18 * (1 - Math.min(0.45, attackerEffects.enemyFortBypass)) + randomInt(8, 34);
    const attackerLosses = Math.ceil(clampNumber(5 + defenderPower / 42, 4, 42) * (1 - Math.min(0.32, attackerEffects.warDefense * 0.6)));
    const defenderLosses = Math.ceil(clampNumber(5 + attackerPower / 40, 4, 48) * (1 - Math.min(0.32, defenderEffects.warDefense * 0.65)));
    const attackerFoodUse = Math.ceil(8 + attacker.resources.army / 35);
    const defenderFoodUse = Math.ceil(7 + defender.resources.army / 38);

    attacker.resources.army = clampResource(attacker.resources.army - attackerLosses);
    defender.resources.army = clampResource(defender.resources.army - defenderLosses);
    attacker.resources.food = clampResource(attacker.resources.food - attackerFoodUse);
    defender.resources.food = clampResource(defender.resources.food - defenderFoodUse);
    attacker.resources.threat = clampNumber(attacker.resources.threat + 0.35, 0, 100);
    defender.resources.threat = clampNumber(defender.resources.threat + 0.45, 0, 100);

    if (attackerPower > defenderPower) {
      war.attackerWarScore = clampNumber((war.attackerWarScore ?? 0) + 3, -100, 100);
    } else {
      war.attackerWarScore = clampNumber((war.attackerWarScore ?? 0) - 2, -100, 100);
    }
    war.defenderWarScore = -war.attackerWarScore;

    if (attacker.resources.food <= 0) {
      attacker.resources.stability = clampNumber(attacker.resources.stability - 2.2, 0, 100);
      war.attackerWarScore = clampNumber(war.attackerWarScore - 3, -100, 100);
    }
    if (defender.resources.food <= 0) {
      defender.resources.stability = clampNumber(defender.resources.stability - 2.2, 0, 100);
      war.attackerWarScore = clampNumber(war.attackerWarScore + 3, -100, 100);
    }
    if (attacker.resources.army <= 0) {
      attacker.resources.stability = clampNumber(attacker.resources.stability - 8.5, 0, 100);
      war.attackerWarScore = clampNumber(war.attackerWarScore - 7, -100, 100);
    }
    if (defender.resources.army <= 0) {
      defender.resources.stability = clampNumber(defender.resources.stability - 8.5, 0, 100);
      war.attackerWarScore = clampNumber(war.attackerWarScore + 7, -100, 100);
    }

    syncArmyFromKingdom(world, attacker);
    syncArmyFromKingdom(world, defender);
    if (attackerArmy) {
      attackerArmy.status = 'campaigning';
      attackerArmy.morale = clampNumber(attackerArmy.morale + (attackerPower > defenderPower ? 0.3 : -0.5), 8, 100);
    }
    if (defenderArmy) {
      defenderArmy.status = 'defending';
      defenderArmy.morale = clampNumber(defenderArmy.morale + (defenderPower >= attackerPower ? 0.2 : -0.6), 8, 100);
    }

    if (war.days % 5 === 0 || attacker.resources.army <= 0 || defender.resources.army <= 0) {
      pushEvent(world, 'war', 'Военная сводка', `${attacker.name} против ${defender.name}: потери ${attackerLosses}/${defenderLosses}, счёт ${Math.floor(war.attackerWarScore)}.`, attacker.id);
    }

    if (attacker.resources.stability <= 0) {
      finishWar(world, war, defender.id, attacker.id);
    } else if (defender.resources.stability <= 0) {
      finishWar(world, war, attacker.id, defender.id);
    }

    keptWars.push(war);
  }

  world.wars = keptWars.slice(-12);
}

function syncBuildLimit(kingdom, holdings) {
  const buildLimitBonus = holdings
    .flatMap((item) => item.buildings)
    .reduce((sum, building) => sum + (buildingCatalog[building.type]?.effects?.buildLimit ?? 0), 0);
  kingdom.resources.buildLimit = clampResource((kingdom.baseBuildLimit ?? 4) + buildLimitBonus);
}

function collectVassalTributes(world) {
  const vassals = world.diplomacy.vassals ?? {};

  for (const [subjectId, overlordId] of Object.entries(vassals)) {
    const subject = world.kingdoms.find((item) => item.id === subjectId);
    const overlord = world.kingdoms.find((item) => item.id === overlordId);
    if (!subject || !overlord || isAtWar(world, subject.id, overlord.id)) {
      continue;
    }

    const effects = getTechEffects(world, overlord);
    const multiplier = 1 + Math.min(0.35, effects.vassalTribute);
    const gold = Math.min(subject.resources.gold, Math.ceil((2 + subject.resources.prosperity / 45) * multiplier));
    const food = Math.min(subject.resources.food, Math.ceil((1 + subject.resources.population / 520) * multiplier));
    subject.resources.gold = clampResource(subject.resources.gold - gold);
    subject.resources.food = clampResource(subject.resources.food - food);
    overlord.resources.gold = clampResource(overlord.resources.gold + gold);
    overlord.resources.food = clampResource(overlord.resources.food + food);
    if (world.time.day % 3 === 0) {
      overlord.resources.influence = clampResource(overlord.resources.influence + Math.max(1, Math.floor(multiplier)));
    }
    subject.resources.stability = clampNumber(subject.resources.stability - 0.03, 0, 100);

    if (world.time.day % 30 === 0) {
      pushEvent(world, 'diplomacy', 'Вассальная дань', `${subject.name} отправляет дань сюзерену ${overlord.name}.`, overlord.id, { gold, food });
    }
  }
}

function advanceDiplomaticDrift(world) {
  for (const source of world.kingdoms) {
    const sourceEffects = getTechEffects(world, source);
    for (const target of world.kingdoms) {
      if (source.id === target.id || source.id > target.id) {
        continue;
      }

      let drift = 0;
      if (hasDiplomaticTreaty(world, source.id, target.id, 'trade')) drift += 0.035;
      if (hasDiplomaticTreaty(world, source.id, target.id, 'research')) drift += 0.03;
      if (hasDiplomaticTreaty(world, source.id, target.id, 'alliance')) drift += 0.05;
      if (isAtWar(world, source.id, target.id)) drift -= 0.32;
      if (world.diplomacy.vassals?.[source.id] === target.id || world.diplomacy.vassals?.[target.id] === source.id) drift += 0.025;

      drift += sourceEffects.relationDrift + getTechEffects(world, target).relationDrift;
      if (Math.abs(drift) > 0) {
        adjustRelation(world, source.id, target.id, drift);
      }
    }
  }
}

function updateMarket(world) {
  for (const resource of marketResources) {
    const trend = world.market.trend[resource] ?? 0;
    const drift = (Math.random() - 0.48) * 0.08 + trend * 0.025;
    world.market.prices[resource] = clampNumber(world.market.prices[resource] + drift, 1.4, 8.5);
    world.market.trend[resource] = trend * 0.75;
  }
}

function runAi(world) {
  for (const kingdom of world.kingdoms) {
    const playerControls = [...world.players.values()].some((player) => player.selectedKingdomId === kingdom.id && player.mode !== 'admin');
    if (playerControls) {
      continue;
    }

    const holdings = world.holdings.filter((item) => item.kingdomId === kingdom.id);
    const focus = kingdom.aiFocus;
    const preferred = focus.find((type) => canAfford(kingdom.resources, buildingCatalog[type].cost));
    const holdingItem = holdings
      .filter((item) => item.buildings.length + item.constructionQueue.length < kingdom.resources.buildLimit)
      .sort((a, b) => a.constructionQueue.length - b.constructionQueue.length)[0];

    if (preferred && holdingItem && Math.random() < 0.72) {
      const placementResult = resolveBuildPlacement(holdingItem, {}, holdingItem.buildings.length + holdingItem.constructionQueue.length);
      if (!placementResult.ok) {
        continue;
      }

      payCost(kingdom.resources, buildingCatalog[preferred].cost);
      holdingItem.constructionQueue.push(createQueuedBuilding(holdingItem.id, preferred, placementResult.placement));
      pushEvent(world, 'construction', 'AI строит', `${kingdom.name} начинает строительство: ${buildingCatalog[preferred].label}.`, kingdom.id);
    }

    if (kingdom.resources.gold > 220 && kingdom.resources.army < 190 && Math.random() < 0.45) {
      kingdom.resources.gold -= 45;
      kingdom.resources.food = Math.max(0, kingdom.resources.food - 28);
      kingdom.resources.army += 28;
      pushEvent(world, 'army', 'Набор войск', `${kingdom.name} усиливает гарнизоны.`, kingdom.id);
    }

    const ownRegions = world.regions.filter((item) => item.kingdomId === kingdom.id);
    const weakestRegion = ownRegions.sort((a, b) => (a.control + a.fortLevel * 8) - (b.control + b.fortLevel * 8))[0];
    if (weakestRegion && kingdom.resources.threat > 30 && Math.random() < 0.34) {
      performAiAction(world, kingdom, 'army:patrol', { kingdomId: kingdom.id, regionId: weakestRegion.id });
    }

    if (weakestRegion && weakestRegion.fortLevel < 5 && kingdom.resources.stone > 180 && kingdom.resources.wood > 140 && Math.random() < 0.18) {
      performAiAction(world, kingdom, 'army:fortify', { kingdomId: kingdom.id, regionId: weakestRegion.id });
    }

    if (kingdom.resources.stability < 62 && kingdom.resources.gold > 180 && kingdom.resources.food > 150 && Math.random() < 0.22) {
      performAiAction(world, kingdom, 'kingdom:holdFestival', { kingdomId: kingdom.id });
    }

    if (kingdom.resources.gold > 250 && kingdom.resources.influence > 45 && Math.random() < 0.18) {
      performAiAction(world, kingdom, 'technology:fundResearch', { kingdomId: kingdom.id });
    }

    if (!world.technology?.active?.[kingdom.id] && kingdom.resources.gold > 95 && Math.random() < 0.28) {
      const tech = chooseAiTechnology(world, kingdom);
      if (tech) {
        performAiAction(world, kingdom, 'technology:startResearch', { kingdomId: kingdom.id, techId: tech.id });
      }
    }

    if (kingdom.resources.influence > 50 && Math.random() < 0.14) {
      const friendly = world.kingdoms
        .filter((target) => target.id !== kingdom.id)
        .filter((target) => (world.diplomacy.relations[kingdom.id]?.[target.id] ?? 0) > 68)
        .find((target) => !world.diplomacy.treaties.some((treaty) => (
          treaty.type === 'trade'
          && [treaty.fromKingdomId, treaty.toKingdomId].includes(kingdom.id)
          && [treaty.fromKingdomId, treaty.toKingdomId].includes(target.id)
        )));
      if (friendly) {
        performAiAction(world, kingdom, 'diplomacy:proposeTreaty', { fromKingdomId: kingdom.id, toKingdomId: friendly.id, treatyType: 'trade' });
      }
    }

    if (kingdom.resources.gold > 120 && kingdom.resources.influence > 22 && Math.random() < 0.16) {
      const partner = world.kingdoms
        .filter((target) => target.id !== kingdom.id && !isAtWar(world, kingdom.id, target.id))
        .filter((target) => (world.diplomacy.relations[kingdom.id]?.[target.id] ?? 0) > 54)
        .find((target) => !(world.market.routes ?? []).some((route) => (
          route.status !== 'expired'
          && route.fromKingdomId === kingdom.id
          && route.toKingdomId === target.id
        )));
      if (partner) {
        performAiAction(world, kingdom, 'market:createRoute', {
          kingdomId: kingdom.id,
          partnerKingdomId: partner.id,
          resource: kingdom.resources.food > kingdom.resources.wood ? 'food' : 'wood',
          direction: 'export',
          amount: 12,
        });
      }
    }

    if (kingdom.resources.influence > 80 && Math.random() < 0.07) {
      const weakFriend = world.kingdoms
        .filter((target) => target.id !== kingdom.id && !world.diplomacy.vassals?.[target.id])
        .filter((target) => (world.diplomacy.relations[kingdom.id]?.[target.id] ?? 0) > 72)
        .find((target) => kingdom.resources.army > target.resources.army * 1.35 || target.resources.stability < 38);
      if (weakFriend) {
        performAiAction(world, kingdom, 'diplomacy:demandVassalage', { fromKingdomId: kingdom.id, toKingdomId: weakFriend.id });
      }
    }

    if (kingdom.resources.threat > 44 && kingdom.resources.army > 210 && Math.random() < 0.2) {
      const possibleTargets = world.regions.filter((item) => item.kingdomId !== kingdom.id);
      const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
      raidRegionByAi(world, kingdom, target);
    }

    if (kingdom.resources.army > 260 && kingdom.resources.food > 180 && Math.random() < 0.08) {
      const target = world.kingdoms
        .filter((item) => item.id !== kingdom.id)
        .filter((item) => !isAtWar(world, kingdom.id, item.id))
        .filter((item) => world.diplomacy.vassals?.[item.id] !== kingdom.id)
        .filter((item) => (world.diplomacy.relations[kingdom.id]?.[item.id] ?? 50) < 34)
        .sort((a, b) => a.resources.army - b.resources.army)[0];
      if (target && kingdom.resources.army > target.resources.army * 1.18) {
        performAiAction(world, kingdom, 'war:declare', { attackerKingdomId: kingdom.id, defenderKingdomId: target.id });
      }
    }
  }
}

function performAiAction(world, kingdom, type, payload) {
  const pseudoSocket = `ai-${kingdom.id}`;
  world.players.set(pseudoSocket, {
    id: pseudoSocket,
    nickname: kingdom.name,
    mode: 'admin',
    selectedKingdomId: kingdom.id,
  });
  const result = dispatchWorldAction(world, pseudoSocket, { type, payload });
  world.players.delete(pseudoSocket);
  return result;
}

function raidRegionByAi(world, kingdom, target) {
  performAiAction(world, kingdom, 'army:raid', { kingdomId: kingdom.id, targetRegionId: target.id });
}

function applyRandomEvent(world) {
  const kingdom = world.kingdoms[Math.floor(Math.random() * world.kingdoms.length)];
  const roll = Math.random();

  if (roll < 0.22) {
    kingdom.resources.food += 70;
    kingdom.resources.prosperity = clampNumber(kingdom.resources.prosperity + 2, 0, 100);
    pushEvent(world, 'harvest', 'Good Harvest', `${kingdom.name}: амбары полны, еда +70.`, kingdom.id, { food: 70 });
    return;
  }

  if (roll < 0.4) {
    kingdom.resources.gold += 55;
    pushEvent(world, 'trade', 'Merchant Caravan', `${kingdom.name}: купеческий караван приносит золото +55.`, kingdom.id, { gold: 55 });
    return;
  }

  if (roll < 0.58) {
    kingdom.resources.technology += 10;
    pushEvent(world, 'research', 'Scholar Breakthrough', `${kingdom.name}: исследователи ускоряют прогресс, технология +10.`, kingdom.id, { technology: 10 });
    return;
  }

  if (roll < 0.76) {
    kingdom.resources.threat = clampNumber(kingdom.resources.threat + 8, 0, 100);
    kingdom.resources.stability = clampNumber(kingdom.resources.stability - 3, 0, 100);
    pushEvent(world, 'bandits', 'Border Bandits', `${kingdom.name}: бандиты тревожат дороги. Угроза +8, стабильность -3.`, kingdom.id);
    return;
  }

  kingdom.resources.wood = Math.max(0, kingdom.resources.wood - 45);
  kingdom.resources.gold = Math.max(0, kingdom.resources.gold - 25);
  pushEvent(world, 'warning', 'Castle Fire', `${kingdom.name}: пожар уничтожил часть запасов.`, kingdom.id, { wood: -45, gold: -25 });
}

function terrainYield(terrain) {
  const yields = {
    riverlands: { food: 7, gold: 4, wood: 2 },
    farmland: { food: 10, gold: 2, wood: 1 },
    hills: { stone: 5, iron: 2, food: 2 },
    coast: { gold: 6, food: 4, wood: 1 },
    forest: { wood: 8, food: 3 },
    mountains: { stone: 7, iron: 5 },
    highlands: { stone: 4, gold: 3, food: 3 },
    volcanic: { stone: 6, iron: 6, threat: 0.2 },
    islands: { gold: 4, food: 3, wood: 2 },
    glacier: { stone: 5, iron: 4, technology: 0.2 },
  };

  return yields[terrain] ?? { food: 3, wood: 2, stone: 1 };
}

function ensureTechnologyState(world) {
  if (!world.technology) {
    world.technology = createTechnologyState(world.kingdoms);
  }

  world.technology.completed ??= {};
  world.technology.active ??= {};
  world.technology.tree = technologyTree;
  for (const kingdom of world.kingdoms) {
    if (!world.technology.completed[kingdom.id]) {
      world.technology.completed[kingdom.id] = [];
    }
    if (!Object.prototype.hasOwnProperty.call(world.technology.active, kingdom.id)) {
      world.technology.active[kingdom.id] = null;
    }
  }
}

function calculateResearchPower(world, kingdom) {
  const holdings = world.holdings.filter((item) => item.kingdomId === kingdom.id);
  const buildings = holdings.flatMap((item) => item.buildings).filter((building) => building.status === 'active');
  let power = 1;

  power += holdings.filter((item) => item.kind === 'capital').length * 0.35;
  power += buildings.filter((item) => item.type === 'market').length * 0.22;
  power += buildings.filter((item) => item.type === 'warehouse').length * 0.2;
  power += buildings.filter((item) => item.type === 'house').length * 0.1;
  power += buildings.filter((item) => ['quarry', 'lumberyard', 'farm'].includes(item.type)).length * 0.05;
  power += buildings.filter((item) => ['barracks', 'archeryRange', 'watchtower'].includes(item.type)).length * (kingdom.policies.research === 'military' ? 0.11 : 0.05);
  power += kingdom.policies.research === 'engineering' ? 0.55 : kingdom.policies.research === 'military' ? 0.28 : 0.18;
  power += getTechEffects(world, kingdom).researchPower;
  power += world.diplomacy.treaties
    .filter((treaty) => treaty.type === 'research' && [treaty.fromKingdomId, treaty.toKingdomId].includes(kingdom.id))
    .length * 0.22;

  return Math.round(power * 100) / 100;
}

function getTechEffects(world, kingdomOrId) {
  ensureTechnologyState(world);
  const kingdomId = typeof kingdomOrId === 'string' ? kingdomOrId : kingdomOrId?.id;
  const effects = {
    controlDaily: 0,
    diplomacyWeight: 0,
    enemyFortBypass: 0,
    foodYield: 0,
    fortifyDiscount: 0,
    goldYield: 0,
    marketDiscount: 0,
    moraleDaily: 0,
    prosperityDaily: 0,
    relationDrift: 0,
    researchPower: 0,
    stabilityDaily: 0,
    threatDaily: 0,
    tradeIncome: 0,
    treatyDiscount: 0,
    vassalTribute: 0,
    warAttack: 0,
    warDefense: 0,
  };

  if (!kingdomId) {
    return effects;
  }

  for (const techId of world.technology.completed[kingdomId] ?? []) {
    const tech = technologyTree.find((item) => item.id === techId);
    if (!tech) continue;
    for (const [key, value] of Object.entries(tech.effects ?? {})) {
      effects[key] = (effects[key] ?? 0) + value;
    }
  }

  return effects;
}

function chooseAiTechnology(world, kingdom) {
  ensureTechnologyState(world);
  const completed = new Set(world.technology.completed[kingdom.id] ?? []);
  const branchPreference = kingdom.aiFocus.includes('barracks') || kingdom.aiFocus.includes('watchtower')
    ? ['military', 'economy', 'trade', 'diplomacy']
    : kingdom.aiFocus.includes('market')
      ? ['trade', 'economy', 'diplomacy', 'military']
      : ['economy', 'military', 'trade', 'diplomacy'];

  return technologyTree
    .filter((tech) => !completed.has(tech.id))
    .filter((tech) => tech.requires.every((requirement) => completed.has(requirement)))
    .filter((tech) => canAfford(kingdom.resources, tech.cost))
    .sort((a, b) => branchPreference.indexOf(a.branch) - branchPreference.indexOf(b.branch) || a.tier - b.tier)[0];
}

function scaleCost(cost, multiplier) {
  return Object.fromEntries(Object.entries(cost).map(([key, value]) => [
    key,
    Math.max(1, Math.ceil(value * multiplier)),
  ]));
}

function hasDiplomaticTreaty(world, firstId, secondId, type) {
  return world.diplomacy.treaties.some((treaty) => (
    treaty.type === type
    && [treaty.fromKingdomId, treaty.toKingdomId].includes(firstId)
    && [treaty.fromKingdomId, treaty.toKingdomId].includes(secondId)
  ));
}

function breakTreatiesBetween(world, firstId, secondId) {
  world.diplomacy.treaties = world.diplomacy.treaties.filter((treaty) => !(
    [treaty.fromKingdomId, treaty.toKingdomId].includes(firstId)
    && [treaty.fromKingdomId, treaty.toKingdomId].includes(secondId)
  ));
}

function isAtWar(world, firstId, secondId) {
  return (world.wars ?? []).some((war) => (
    war.status === 'active'
    && [war.attackerKingdomId, war.defenderKingdomId].includes(firstId)
    && [war.attackerKingdomId, war.defenderKingdomId].includes(secondId)
  ));
}

function syncArmyFromKingdom(world, kingdom) {
  const army = world.armies.find((item) => item.kingdomId === kingdom.id);
  if (army) {
    army.strength = kingdom.resources.army;
  }
}

function finishWar(world, war, winnerId, loserId) {
  const winner = world.kingdoms.find((item) => item.id === winnerId);
  const loser = world.kingdoms.find((item) => item.id === loserId);
  if (!winner || !loser) {
    war.status = 'resolved';
    return;
  }

  war.status = 'resolved';
  war.endedDay = world.time.day;
  war.endedYear = world.time.year;
  war.winnerKingdomId = winner.id;
  war.loserKingdomId = loser.id;
  loser.resources.stability = clampNumber(Math.max(loser.resources.stability, 18), 0, 100);
  loser.resources.threat = clampNumber(loser.resources.threat - 8, 0, 100);
  winner.resources.influence = clampResource(winner.resources.influence + 14);
  vassalizeKingdom(world, winner.id, loser.id, 'war');
  pushEvent(world, 'war', 'Война окончена', `${winner.name} побеждает. ${loser.name} приносит вассальную клятву.`, winner.id, { influence: 14 });
}

function vassalizeKingdom(world, overlordId, subjectId, source = 'diplomacy') {
  if (overlordId === subjectId) {
    return false;
  }

  world.diplomacy.vassals ??= {};
  const overlord = world.kingdoms.find((item) => item.id === overlordId);
  const subject = world.kingdoms.find((item) => item.id === subjectId);
  if (!overlord || !subject || wouldCreateVassalCycle(world, overlordId, subjectId)) {
    return false;
  }

  const previousOverlordId = world.diplomacy.vassals[subjectId];
  if (previousOverlordId) {
    const previousOverlord = world.kingdoms.find((item) => item.id === previousOverlordId);
    if (previousOverlord) {
      previousOverlord.vassals = (previousOverlord.vassals ?? []).filter((id) => id !== subjectId);
    }
  }

  world.diplomacy.vassals[subjectId] = overlordId;
  subject.overlordId = overlordId;
  subject.vassals ??= [];
  overlord.vassals = [...new Set([...(overlord.vassals ?? []), subjectId])];
  adjustRelation(world, overlordId, subjectId, source === 'war' ? 4 : 12);
  breakTreatiesBetween(world, overlordId, subjectId);

  for (const otherWar of world.wars ?? []) {
    if (otherWar.status === 'active' && [otherWar.attackerKingdomId, otherWar.defenderKingdomId].includes(subjectId) && [otherWar.attackerKingdomId, otherWar.defenderKingdomId].includes(overlordId)) {
      otherWar.status = 'resolved';
      otherWar.endedDay = world.time.day;
      otherWar.endedYear = world.time.year;
      otherWar.winnerKingdomId = overlordId;
      otherWar.loserKingdomId = subjectId;
    }
  }

  updateVictory(world);
  return true;
}

function wouldCreateVassalCycle(world, overlordId, subjectId) {
  let current = overlordId;
  const seen = new Set();
  while (current) {
    if (current === subjectId) {
      return true;
    }
    if (seen.has(current)) {
      return true;
    }
    seen.add(current);
    current = world.diplomacy.vassals?.[current];
  }
  return false;
}

function controlsThroughVassals(world, overlordId, subjectId) {
  let current = world.diplomacy.vassals?.[subjectId];
  const seen = new Set();
  while (current) {
    if (current === overlordId) {
      return true;
    }
    if (seen.has(current)) {
      return false;
    }
    seen.add(current);
    current = world.diplomacy.vassals?.[current];
  }
  return false;
}

function updateVictory(world) {
  world.victory ??= {
    objective: 'vassalize_all',
    completed: false,
    winnerKingdomId: null,
  };

  if (world.victory.completed) {
    return;
  }

  const winner = world.kingdoms.find((kingdom) => world.kingdoms.every((target) => (
    target.id === kingdom.id || controlsThroughVassals(world, kingdom.id, target.id)
  )));

  if (!winner) {
    return;
  }

  world.victory.completed = true;
  world.victory.winnerKingdomId = winner.id;
  pushEvent(world, 'success', 'Континент подчинён', `${winner.name} вассализирует все державы и становится верховной короной острова.`, winner.id, { influence: 25 });
}

function canControlKingdom(world, socketId, kingdomId) {
  const player = world.players.get(socketId);
  if (!player) {
    return { ok: false, reason: 'Профиль игрока не найден.' };
  }

  if (player.mode === 'admin' || player.selectedKingdomId === kingdomId || player.selectedCountryId === kingdomId) {
    return { ok: true };
  }

  return { ok: false, reason: 'Эта держава не под вашим управлением.' };
}

function getActionKingdom(world, socketId, requestedKingdomId) {
  const player = world.players.get(socketId);
  const kingdomId = requestedKingdomId ?? player?.selectedKingdomId ?? player?.selectedCountryId;

  if (!kingdomId) {
    return null;
  }

  const permission = canControlKingdom(world, socketId, kingdomId);
  if (!permission.ok) {
    return null;
  }

  return world.kingdoms.find((item) => item.id === kingdomId) ?? null;
}

function canAfford(resources, cost) {
  return Object.entries(cost).every(([key, value]) => (resources[key] ?? 0) >= value);
}

function payCost(resources, cost) {
  for (const [key, value] of Object.entries(cost)) {
    resources[key] -= value;
  }
}

function adjustRelation(world, fromId, toId, delta) {
  if (!world.diplomacy.relations[fromId]) {
    world.diplomacy.relations[fromId] = {};
  }
  if (!world.diplomacy.relations[toId]) {
    world.diplomacy.relations[toId] = {};
  }

  world.diplomacy.relations[fromId][toId] = clampNumber((world.diplomacy.relations[fromId][toId] ?? 45) + delta, 0, 100);
  world.diplomacy.relations[toId][fromId] = clampNumber((world.diplomacy.relations[toId][fromId] ?? 45) + delta, 0, 100);
}

function averageHoldingGarrison(world, regionId) {
  const holdings = world.holdings.filter((item) => item.regionId === regionId);
  return average(holdings.map((item) => item.garrison));
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function clampResource(value) {
  return Math.max(0, Math.min(99999, Math.floor(value)));
}

function createEvent(day, category, title, description, kingdomId = undefined, scope = 'kingdom', resourceDelta = undefined) {
  return {
    id: `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    day,
    category,
    title,
    description,
    kingdomId,
    scope,
    resourceDelta,
  };
}

function pushEvent(world, category, title, description, kingdomId = undefined, resourceDelta = undefined) {
  world.events.push(createEvent(world.time.day, category, title, description, kingdomId, 'kingdom', resourceDelta));

  if (world.events.length > MAX_EVENTS) {
    world.events.splice(0, world.events.length - MAX_EVENTS);
  }
}
