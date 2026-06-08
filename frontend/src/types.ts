export type ResourceKey =
  | 'gold'
  | 'food'
  | 'wood'
  | 'stone'
  | 'iron'
  | 'influence'
  | 'technology'
  | 'population'
  | 'army'
  | 'stability'
  | 'prosperity'
  | 'threat'
  | 'buildLimit';

export type CoreResourceKey = 'gold' | 'food' | 'wood' | 'stone' | 'iron' | 'influence' | 'technology';

export type Resources = Record<ResourceKey, number>;

export type BuildingType =
  | 'house'
  | 'farm'
  | 'warehouse'
  | 'lumberyard'
  | 'quarry'
  | 'market'
  | 'barracks'
  | 'archeryRange'
  | 'watchtower';

export type PlayerRole = 'ruler' | 'admin';
export type PlayerMode = 'player' | 'admin';

export interface PlayerProfile {
  id: string;
  nickname: string;
  selectedKingdomId?: string;
  selectedCountryId?: string;
  role: PlayerRole;
  mode: PlayerMode;
}

export interface BuildingCatalogItem {
  label: string;
  asset: string;
  category: string;
  buildDays: number;
  cost: Partial<Record<CoreResourceKey, number>>;
  effects: Partial<Record<ResourceKey, number>>;
  maintenance?: Partial<Record<ResourceKey, number>>;
}

export interface Building {
  id: string;
  holdingId: string;
  castleId?: string;
  type: BuildingType;
  status: 'active' | 'queued';
  remainingDays: number;
  x?: number;
  z?: number;
  rotation?: number;
}

export interface Holding {
  id: string;
  kingdomId: string;
  countryId?: string;
  regionId: string;
  name: string;
  kind: 'capital' | 'castle' | 'city' | 'farm' | 'mine' | 'forest';
  mapPoint: [number, number];
  garrison: number;
  buildings: Building[];
  constructionQueue: Building[];
}

export interface Region {
  id: string;
  kingdomId: string;
  kingdomName: string;
  name: string;
  terrain: string;
  development: number;
  control: number;
  fortLevel: number;
  prosperity?: number;
  mapPolygon: Array<[number, number]>;
  mapPoint: [number, number];
  holdingIds: string[];
}

export interface Kingdom {
  id: string;
  name: string;
  title: string;
  ruler: string;
  color: string;
  accent: string;
  motto: string;
  traits: string[];
  aiFocus: BuildingType[];
  capitalRegionId: string;
  resources: Resources;
  policies: {
    taxation: 'low' | 'balanced' | 'war';
    military: 'defensive' | 'levies' | 'raiders';
    research: 'stewardship' | 'engineering' | 'military';
  };
}

export type Country = Kingdom;
export type Castle = Holding;

export interface Army {
  id: string;
  kingdomId: string;
  name: string;
  strength: number;
  morale: number;
  regionId: string;
  status: string;
}

export interface GameEvent {
  id: string;
  day: number;
  category: string;
  title: string;
  description: string;
  kingdomId?: string;
  scope: 'kingdom' | 'world';
  resourceDelta?: Partial<Resources>;
}

export interface GameTime {
  day: number;
  season: string;
  year: number;
  tickMs: number;
  speed: 1 | 2 | 3;
  paused: boolean;
}

export interface MarketState {
  prices: Record<'food' | 'wood' | 'stone' | 'iron', number>;
  trend: Record<'food' | 'wood' | 'stone' | 'iron', number>;
  open: boolean;
  volume: number;
}

export interface DiplomacyState {
  relations: Record<string, Record<string, number>>;
  treaties: Array<{
    id: string;
    fromKingdomId: string;
    toKingdomId: string;
    type: string;
  }>;
}

export interface WorldMapState {
  width: number;
  height: number;
  image: string;
  borders: string;
  labels: string;
  minimap: string;
}

export interface WorldState {
  time: GameTime;
  map: WorldMapState;
  kingdoms: Kingdom[];
  countries?: Kingdom[];
  regions: Region[];
  holdings: Holding[];
  castles?: Holding[];
  armies: Army[];
  market: MarketState;
  diplomacy: DiplomacyState;
  events: GameEvent[];
  buildingCatalog: Record<BuildingType, BuildingCatalogItem>;
  onlinePlayers: number;
}

export interface BuildRequest {
  castleId?: string;
  holdingId: string;
  type: BuildingType;
  x?: number;
  z?: number;
  rotation?: number;
}

export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  gold: 'Золото',
  food: 'Еда',
  wood: 'Дерево',
  stone: 'Камень',
  iron: 'Железо',
  influence: 'Влияние',
  technology: 'Технологии',
  population: 'Население',
  army: 'Армия',
  stability: 'Стабильность',
  prosperity: 'Процветание',
  threat: 'Угроза',
  buildLimit: 'Лимит',
};

export const RESOURCE_ICONS: Record<ResourceKey, string> = {
  gold: '/assets/resources/gold.png',
  food: '/assets/resources/food.png',
  wood: '/assets/resources/wood.png',
  stone: '/assets/resources/stone.png',
  iron: '/assets/resources/iron.png',
  influence: '/assets/resources/influence.png',
  technology: '/assets/resources/technology.png',
  population: '/assets/resources/population.png',
  army: '/assets/resources/army.png',
  stability: '/assets/resources/stability.png',
  prosperity: '/assets/resources/prosperity.png',
  threat: '/assets/resources/threat.png',
  buildLimit: '/assets/resources/build-limit.png',
};

export const KINGDOM_ASSETS = {
  riverland: {
    crest: '/assets/kingdoms/riverland-crest.png',
    card: '/assets/kingdoms/riverland-card.png',
    ruler: '/assets/kingdoms/riverland-ruler.png',
  },
  nordgard: {
    crest: '/assets/kingdoms/nordgard-crest.png',
    card: '/assets/kingdoms/nordgard-card.png',
    ruler: '/assets/kingdoms/nordgard-ruler.png',
  },
  caldoria: {
    crest: '/assets/kingdoms/caldoria-crest.png',
    card: '/assets/kingdoms/caldoria-card.png',
    ruler: '/assets/kingdoms/caldoria-ruler.png',
  },
  velund: {
    crest: '/assets/kingdoms/velund-crest.png',
    card: '/assets/kingdoms/velund-card.png',
    ruler: '/assets/kingdoms/velund-ruler.png',
  },
  solaria: {
    crest: '/assets/kingdoms/solaria-crest.png',
    card: '/assets/kingdoms/solaria-card.png',
    ruler: '/assets/kingdoms/solaria-ruler.png',
  },
  dragonridge: {
    crest: '/assets/kingdoms/dragonridge-crest.png',
    card: '/assets/kingdoms/dragonridge-card.png',
    ruler: '/assets/kingdoms/dragonridge-ruler.png',
  },
  morven: {
    crest: '/assets/kingdoms/morven-crest.png',
    card: '/assets/kingdoms/morven-card.png',
    ruler: '/assets/kingdoms/morven-ruler.png',
  },
  frostheim: {
    crest: '/assets/kingdoms/frostheim-crest.png',
    card: '/assets/kingdoms/frostheim-card.png',
    ruler: '/assets/kingdoms/frostheim-ruler.png',
  },
} as const;

export const BUILDING_LABELS: Record<BuildingType, string> = {
  house: 'Дом',
  farm: 'Ферма',
  warehouse: 'Склад',
  lumberyard: 'Лесопилка',
  quarry: 'Каменоломня',
  market: 'Рынок',
  barracks: 'Казармы',
  archeryRange: 'Стрельбище',
  watchtower: 'Сторожевая башня',
};

export const BUILDING_ASSETS: Record<BuildingType, string> = {
  house: '/assets/buildings/house-icon.png',
  farm: '/assets/buildings/farm-icon.png',
  warehouse: '/assets/buildings/warehouse-icon.png',
  lumberyard: '/assets/buildings/lumberyard-icon.png',
  quarry: '/assets/buildings/quarry-icon.png',
  market: '/assets/buildings/market-icon.png',
  barracks: '/assets/buildings/barracks-icon.png',
  archeryRange: '/assets/buildings/archery-range-icon.png',
  watchtower: '/assets/buildings/watchtower-icon.png',
};

export const BUILDING_PREVIEWS: Record<BuildingType, string> = {
  house: '/assets/buildings/house-preview.png',
  farm: '/assets/buildings/farm-preview.png',
  warehouse: '/assets/buildings/warehouse-preview.png',
  lumberyard: '/assets/buildings/lumberyard-preview.png',
  quarry: '/assets/buildings/quarry-preview.png',
  market: '/assets/buildings/market-preview.png',
  barracks: '/assets/buildings/barracks-preview.png',
  archeryRange: '/assets/buildings/archery-range-preview.png',
  watchtower: '/assets/buildings/watchtower-preview.png',
};
