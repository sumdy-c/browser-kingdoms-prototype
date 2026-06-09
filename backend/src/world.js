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

  if (type === 'diplomacy:sendResources') {
    return sendResources(world, socketId, payload);
  }

  if (type === 'diplomacy:improveRelations') {
    return improveRelations(world, socketId, payload);
  }

  if (type === 'diplomacy:proposeTreaty') {
    return proposeTreaty(world, socketId, payload);
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
  const gold = Math.ceil(price * amount);

  if (direction === 'buy') {
    if (kingdom.resources.gold < gold) {
      return { ok: false, reason: 'Недостаточно золота для сделки.' };
    }
    kingdom.resources.gold -= gold;
    kingdom.resources[resource] += amount;
    world.market.trend[resource] += 1;
    pushEvent(world, 'trade', 'Рыночная закупка', `${kingdom.name} закупает ${resource}: +${amount}, золото -${gold}.`, kingdom.id, { [resource]: amount, gold: -gold });
  } else {
    if (kingdom.resources[resource] < amount) {
      return { ok: false, reason: 'Недостаточно ресурса для продажи.' };
    }
    kingdom.resources[resource] -= amount;
    kingdom.resources.gold += Math.floor(gold * 0.82);
    world.market.trend[resource] -= 1;
    pushEvent(world, 'trade', 'Рыночная продажа', `${kingdom.name} продаёт ${resource}: -${amount}, золото +${Math.floor(gold * 0.82)}.`, kingdom.id);
  }

  world.market.volume += amount;
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

  if (from.resources.influence < 12) {
    return { ok: false, reason: 'Недостаточно влияния.' };
  }

  from.resources.influence -= 12;
  adjustRelation(world, from.id, to.id, 8);
  pushEvent(world, 'diplomacy', 'Посольство принято', `${from.name} улучшает отношения с ${to.name}.`, from.id, { influence: -12 });
  return { ok: true };
}

function proposeTreaty(world, socketId, payload) {
  const from = getActionKingdom(world, socketId, payload.fromKingdomId);
  const to = world.kingdoms.find((item) => item.id === payload.toKingdomId);
  const treatyType = ['trade', 'non_aggression', 'research'].includes(payload.treatyType) ? payload.treatyType : 'trade';
  const treatyLabels = {
    trade: 'торговое соглашение',
    non_aggression: 'пакт о ненападении',
    research: 'обмен учёными',
  };
  const relationNeeded = {
    trade: 55,
    non_aggression: 48,
    research: 64,
  };
  const cost = {
    trade: { influence: 16, gold: 40 },
    non_aggression: { influence: 18, gold: 30 },
    research: { influence: 22, gold: 55, technology: 12 },
  }[treatyType];

  if (!from || !to || from.id === to.id) {
    return { ok: false, reason: 'Неверный адресат договора.' };
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
    durationDays: 72,
  });

  adjustRelation(world, from.id, to.id, treatyType === 'non_aggression' ? 10 : 7);
  pushEvent(world, 'diplomacy', 'Договор заключён', `${from.name} и ${to.name} подписывают ${treatyLabels[treatyType]}.`, from.id, { influence: -cost.influence });
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
  const defenderPower = region.fortLevel * 45 + averageHoldingGarrison(world, region.id) + defender.resources.army * 0.35;
  const attackerPower = attacker.resources.army * (attackerArmy?.morale ?? 70) / 100 + Math.random() * 80;
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

  const cost = { wood: 45, stone: 55, gold: 35 };
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
  kingdom.resources.technology = clampResource(kingdom.resources.technology + bonus);
  kingdom.resources.prosperity = clampNumber(kingdom.resources.prosperity + 1, 0, 100);

  pushEvent(world, 'research', 'Исследования профинансированы', `${kingdom.name}: мастерские и архивы получают казённые гранты. Технологии +${bonus}.`, kingdom.id, { technology: bonus });
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

  for (const kingdom of world.kingdoms) {
    applyKingdomEconomy(world, kingdom);
    advanceConstruction(world, kingdom);
  }

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

    regionItem.prosperity = clampNumber((regionItem.prosperity ?? regionItem.development) + kingdom.resources.stability / 260 - kingdom.resources.threat / 220, 20, 100);
    regionItem.control = clampNumber(regionItem.control + kingdom.resources.stability / 280 - kingdom.resources.threat / 260, 20, 100);
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
  const tradeTreaties = treaties.filter((treaty) => treaty.type === 'trade').length;
  const peaceTreaties = treaties.filter((treaty) => treaty.type === 'non_aggression').length;
  const researchTreaties = treaties.filter((treaty) => treaty.type === 'research').length;

  delta.gold += tradeTreaties * 3;
  delta.food += tradeTreaties * 1;
  delta.influence += treaties.length * 0.15;
  delta.technology += researchTreaties * 1.2;
  delta.threat -= peaceTreaties * 0.16;
  delta.prosperity += tradeTreaties * 0.08 + researchTreaties * 0.05;
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

function syncBuildLimit(kingdom, holdings) {
  const buildLimitBonus = holdings
    .flatMap((item) => item.buildings)
    .reduce((sum, building) => sum + (buildingCatalog[building.type]?.effects?.buildLimit ?? 0), 0);
  kingdom.resources.buildLimit = clampResource((kingdom.baseBuildLimit ?? 4) + buildLimitBonus);
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

    if (kingdom.resources.threat > 44 && kingdom.resources.army > 210 && Math.random() < 0.2) {
      const possibleTargets = world.regions.filter((item) => item.kingdomId !== kingdom.id);
      const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
      raidRegionByAi(world, kingdom, target);
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
