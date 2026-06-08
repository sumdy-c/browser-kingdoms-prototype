export type ResourceKey = 'gold' | 'food' | 'wood' | 'stone' | 'population';

export type Resources = Record<ResourceKey, number>;

export type BuildingType = 'house' | 'farm' | 'warehouse' | 'lumberyard' | 'quarry' | 'barracks' | 'tower';

export type PlayerRole = 'king' | 'duke' | 'count';

export interface PlayerProfile {
  id: string;
  nickname: string;
  selectedCountryId?: string;
  role: PlayerRole;
}

export interface Building {
  id: string;
  castleId: string;
  type: BuildingType;
  x: number;
  z: number;
  rotation: number;
}

export interface Castle {
  id: string;
  countryId: string;
  name: string;
  buildings: Building[];
}

export interface Country {
  id: string;
  name: string;
  capital: string;
  color: string;
  resources: Resources;
  castles: string[];
  ownerSlots: Array<{
    role: PlayerRole;
    regionId?: string;
    castleId?: string;
    playerId: string | null;
  }>;
}

export interface GameEvent {
  id: string;
  day: number;
  countryId: string;
  title: string;
  description: string;
  resourceDelta?: Partial<Resources>;
}

export interface GameTime {
  day: number;
  season: string;
  year: number;
  tickMs: number;
}

export interface WorldState {
  time: GameTime;
  countries: Country[];
  castles: Castle[];
  events: GameEvent[];
  onlinePlayers: number;
}

export interface BuildRequest {
  castleId: string;
  type: BuildingType;
  x: number;
  z: number;
  rotation?: number;
}

export const BUILDING_LABELS: Record<BuildingType, string> = {
  house: 'Дом',
  farm: 'Ферма',
  warehouse: 'Склад',
  lumberyard: 'Лесопилка',
  quarry: 'Каменоломня',
  barracks: 'Казарма',
  tower: 'Башня',
};

export const BUILDING_COSTS: Record<BuildingType, Partial<Resources>> = {
  house: { wood: 18, stone: 4, gold: 8 },
  farm: { wood: 12, gold: 6 },
  warehouse: { wood: 20, stone: 10, gold: 10 },
  lumberyard: { wood: 8, stone: 4, gold: 12 },
  quarry: { wood: 14, stone: 6, gold: 14 },
  barracks: { wood: 28, stone: 18, gold: 30 },
  tower: { wood: 12, stone: 28, gold: 24 },
};
