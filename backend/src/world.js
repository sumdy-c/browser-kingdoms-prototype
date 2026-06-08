export const buildingCosts = {
  house: { wood: 18, stone: 4, gold: 8 },
  farm: { wood: 12, gold: 6 },
  warehouse: { wood: 20, stone: 10, gold: 10 },
  lumberyard: { wood: 8, stone: 4, gold: 12 },
  quarry: { wood: 14, stone: 6, gold: 14 },
  barracks: { wood: 28, stone: 18, gold: 30 },
  tower: { wood: 12, stone: 28, gold: 24 },
};

export const buildingEffects = {
  house: { populationCap: 8 },
  farm: { food: 5 },
  warehouse: { storage: 50 },
  lumberyard: { wood: 4 },
  quarry: { stone: 3 },
  barracks: { gold: -1 },
  tower: { gold: -1 },
};

export function createInitialWorld(tickMs) {
  const countries = [
    createCountry('elvaria', 'Эльвария', 'Серебряный Клык', '#4b79a1', ['elv-silverfang'], 150, 130, 95, 55, 74),
    createCountry('nordheim', 'Нордхейм', 'Хладный Шпиль', '#6c7a89', ['nor-frostspire'], 135, 105, 115, 75, 62),
    createCountry('varanta', 'Варанта', 'Каменный Порт', '#b77946', ['var-stoneport'], 170, 120, 70, 60, 86),
    createCountry('morven', 'Морвен', 'Красный Вал', '#9f4636', ['mor-redwall'], 120, 100, 80, 95, 64),
    createCountry('sudmark', 'Судмарк', 'Южные Врата', '#4f8f4d', ['sud-southgate'], 110, 150, 90, 45, 91),
    createCountry('aurelia', 'Аурелия', 'Золотая Башня', '#c8a34a', ['aur-goldtower'], 195, 115, 65, 55, 78),
    createCountry('fenria', 'Фенрия', 'Волчий Мост', '#446b62', ['fen-wolfbridge'], 125, 125, 130, 50, 69),
    createCountry('drakonia', 'Дракония', 'Пепельная Корона', '#7c3f58', ['dra-ashcrown'], 140, 90, 85, 110, 58),
  ];

  const castles = [
    createCastle('elv-silverfang', 'elvaria', 'Серебряный Клык', [
      createBuilding('elv-silverfang', 'house', -2, 1),
      createBuilding('elv-silverfang', 'farm', 2, 2),
    ]),
    createCastle('nor-frostspire', 'nordheim', 'Хладный Шпиль', [createBuilding('nor-frostspire', 'tower', 0, 0)]),
    createCastle('var-stoneport', 'varanta', 'Каменный Порт', [createBuilding('var-stoneport', 'warehouse', -1, -1)]),
    createCastle('mor-redwall', 'morven', 'Красный Вал', [createBuilding('mor-redwall', 'barracks', 1, 0)]),
    createCastle('sud-southgate', 'sudmark', 'Южные Врата', [createBuilding('sud-southgate', 'farm', 0, 2)]),
    createCastle('aur-goldtower', 'aurelia', 'Золотая Башня', [createBuilding('aur-goldtower', 'house', 0, 0)]),
    createCastle('fen-wolfbridge', 'fenria', 'Волчий Мост', [createBuilding('fen-wolfbridge', 'lumberyard', -1, 1)]),
    createCastle('dra-ashcrown', 'drakonia', 'Пепельная Корона', [createBuilding('dra-ashcrown', 'quarry', 1, -1)]),
  ];

  return {
    time: {
      day: 1,
      season: 'Весна',
      year: 1,
      tickMs,
    },
    countries,
    castles,
    events: [],
    players: new Map(),
  };
}

function createCountry(id, name, capital, color, castles, gold, food, wood, stone, population) {
  return {
    id,
    name,
    capital,
    color,
    castles,
    resources: { gold, food, wood, stone, population },
    ownerSlots: [
      { role: 'king', playerId: null },
      { role: 'duke', regionId: `${id}-heartland`, playerId: null },
      { role: 'count', castleId: castles[0], playerId: null },
    ],
  };
}

function createCastle(id, countryId, name, buildings = []) {
  return { id, countryId, name, buildings };
}

export function createBuilding(castleId, type, x, z, rotation = 0) {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    castleId,
    type,
    x,
    z,
    rotation,
  };
}

export function getPublicSnapshot(world) {
  return {
    time: world.time,
    countries: world.countries,
    castles: world.castles,
    events: world.events,
    onlinePlayers: world.players.size,
  };
}

export function selectCountry(world, socketId, countryId) {
  const player = world.players.get(socketId);
  const country = world.countries.find((item) => item.id === countryId);

  if (!player || !country) {
    return false;
  }

  player.selectedCountryId = countryId;
  return true;
}

export function buildInCastle(world, socketId, request) {
  const player = world.players.get(socketId);
  if (!player?.selectedCountryId) {
    return { ok: false, reason: 'Сначала выбери страну.' };
  }

  const castle = world.castles.find((item) => item.id === request.castleId);
  if (!castle) {
    return { ok: false, reason: 'Замок не найден.' };
  }

  if (castle.countryId !== player.selectedCountryId) {
    return { ok: false, reason: 'Этот замок принадлежит другой стране.' };
  }

  if (!buildingCosts[request.type]) {
    return { ok: false, reason: 'Неизвестный тип постройки.' };
  }

  const x = Number(request.x);
  const z = Number(request.z);

  if (!Number.isFinite(x) || !Number.isFinite(z) || Math.abs(x) > 7 || Math.abs(z) > 7) {
    return { ok: false, reason: 'Постройка должна находиться внутри стен.' };
  }

  const occupied = castle.buildings.some((building) => building.x === x && building.z === z);
  if (occupied) {
    return { ok: false, reason: 'Эта клетка уже занята.' };
  }

  const country = world.countries.find((item) => item.id === castle.countryId);
  if (!country) {
    return { ok: false, reason: 'Страна не найдена.' };
  }

  const cost = buildingCosts[request.type];
  const canAfford = Object.entries(cost).every(([key, value]) => country.resources[key] >= value);

  if (!canAfford) {
    return { ok: false, reason: 'Недостаточно ресурсов.' };
  }

  Object.entries(cost).forEach(([key, value]) => {
    country.resources[key] -= value;
  });

  const building = createBuilding(castle.id, request.type, x, z, request.rotation ?? 0);
  castle.buildings.push(building);

  pushEvent(world, country.id, 'Новая постройка', `${country.name}: в замке «${castle.name}» построено здание типа ${request.type}.`);

  return { ok: true, building };
}

export function advanceWorld(world) {
  world.time.day += 1;

  if (world.time.day > 360) {
    world.time.day = 1;
    world.time.year += 1;
  }

  world.time.season = getSeason(world.time.day);

  for (const country of world.countries) {
    applyEconomy(world, country);
  }

  if (Math.random() < 0.45) {
    applyRandomEvent(world);
  }
}

function getSeason(day) {
  if (day <= 90) return 'Весна';
  if (day <= 180) return 'Лето';
  if (day <= 270) return 'Осень';
  return 'Зима';
}

function applyEconomy(world, country) {
  const buildings = world.castles
    .filter((castle) => castle.countryId === country.id)
    .flatMap((castle) => castle.buildings);

  const delta = {
    gold: Math.max(1, Math.floor(country.resources.population / 28)),
    food: 4,
    wood: 2,
    stone: 1,
  };

  for (const building of buildings) {
    const effect = buildingEffects[building.type] ?? {};
    for (const [key, value] of Object.entries(effect)) {
      if (key === 'populationCap' || key === 'storage') {
        continue;
      }
      delta[key] = (delta[key] ?? 0) + value;
    }
  }

  const foodConsumption = Math.ceil(country.resources.population / 22);
  delta.food -= foodConsumption;

  country.resources.gold = clampResource(country.resources.gold + delta.gold);
  country.resources.food = clampResource(country.resources.food + delta.food);
  country.resources.wood = clampResource(country.resources.wood + delta.wood);
  country.resources.stone = clampResource(country.resources.stone + delta.stone);

  const houseCount = buildings.filter((building) => building.type === 'house').length;
  const populationCap = 80 + houseCount * 8;

  if (country.resources.food > 80 && country.resources.population < populationCap) {
    country.resources.population += 1;
  }

  if (country.resources.food <= 0) {
    country.resources.population = Math.max(20, country.resources.population - 1);
  }
}

function clampResource(value) {
  return Math.max(0, Math.min(9999, Math.floor(value)));
}

function applyRandomEvent(world) {
  const country = world.countries[Math.floor(Math.random() * world.countries.length)];
  const eventType = Math.floor(Math.random() * 3);

  if (eventType === 0) {
    country.resources.food += 25;
    pushEvent(world, country.id, 'Хороший урожай', `${country.name}: крестьяне собрали богатый урожай. Еда +25.`, { food: 25 });
    return;
  }

  if (eventType === 1) {
    country.resources.gold += 22;
    pushEvent(world, country.id, 'Торговый караван', `${country.name}: в столицу прибыл караван купцов. Золото +22.`, { gold: 22 });
    return;
  }

  country.resources.wood = Math.max(0, country.resources.wood - 18);
  country.resources.gold = Math.max(0, country.resources.gold - 8);
  pushEvent(world, country.id, 'Пожар в замке', `${country.name}: пожар уничтожил часть запасов. Дерево -18, золото -8.`, { wood: -18, gold: -8 });
}

function pushEvent(world, countryId, title, description, resourceDelta = undefined) {
  world.events.push({
    id: `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    day: world.time.day,
    countryId,
    title,
    description,
    resourceDelta,
  });

  if (world.events.length > 80) {
    world.events.splice(0, world.events.length - 80);
  }
}
