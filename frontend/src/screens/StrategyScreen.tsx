import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type WheelEvent } from 'react';
import type { GameEvent, Holding, Kingdom, PlayerMode, Region, ResourceKey, WorldState } from '../types';
import { KINGDOM_ASSETS, RESOURCE_ICONS, RESOURCE_LABELS } from '../types';

interface StrategyScreenProps {
  world: WorldState;
  serverStatus: 'offline' | 'connecting' | 'online';
  playerMode: PlayerMode;
  selectedKingdomId?: string;
  controlledKingdomId?: string;
  selectedRegionId?: string;
  selectedHoldingId?: string;
  onSelectKingdom: (kingdomId: string) => void;
  onSelectRegion: (regionId: string) => void;
  onOpenHolding: (holdingId: string) => void;
  onSendAction: (type: string, payload?: Record<string, unknown>) => void;
  onToggleMode: () => void;
}

type MainPanel = 'diplomacy' | 'economy' | 'army' | 'technology' | 'map';
type CompactPanel = 'mail' | 'events' | 'settings';
type MapLayerKey = 'borders' | 'holdings' | 'labels';
type MarketResource = 'food' | 'wood' | 'stone' | 'iron';

interface MapViewport {
  zoom: number;
  centerX: number;
  centerY: number;
}

interface CourtChoice {
  id: string;
  label: string;
  description: string;
  icon: string;
  action?: {
    type: string;
    payload?: Record<string, unknown>;
  };
  openMainPanel?: MainPanel;
  openCompactPanel?: CompactPanel;
}

interface CourtEvent {
  id: string;
  day: number;
  title: string;
  subtitle: string;
  body: string;
  icon: string;
  accent: string;
  kingdomId?: string;
  portrait?: string;
  crest?: string;
  category: string;
  choices: CourtChoice[];
}

const topResources: ResourceKey[] = ['gold', 'food', 'wood', 'stone', 'population'];
const marketResources: MarketResource[] = ['food', 'wood', 'stone', 'iron'];
const minMapZoom = 1;
const maxMapZoom = 3.2;
const initialMapViewport: MapViewport = { zoom: 1, centerX: 0.5, centerY: 0.5 };

const layerButtons: Array<{ id: MapLayerKey; title: string; icon: string }> = [
  { id: 'borders', title: 'Границы', icon: '/assets/ui/icon-map.png' },
  { id: 'holdings', title: 'Владения', icon: '/assets/map/layer-cities.png' },
  { id: 'labels', title: 'Названия', icon: '/assets/ui/icon-scroll.png' },
];

const mainPanelMeta: Record<MainPanel, { label: string; icon: string }> = {
  diplomacy: { label: 'Дипломатия', icon: '/assets/ui/icon-diplomacy.png' },
  economy: { label: 'Экономика', icon: '/assets/ui/icon-economy.png' },
  army: { label: 'Армия', icon: '/assets/ui/icon-army.png' },
  technology: { label: 'Технологии', icon: '/assets/ui/icon-technology.png' },
  map: { label: 'Карта', icon: '/assets/ui/icon-map.png' },
};

const policyLabels: Record<string, string> = {
  balanced: 'Баланс',
  defensive: 'Оборона',
  engineering: 'Инженерия',
  levies: 'Ополчение',
  low: 'Низкие налоги',
  military: 'Военная школа',
  raiders: 'Рейды',
  stewardship: 'Управление',
  war: 'Военные налоги',
};

const holdingIcons: Record<Holding['kind'], string> = {
  capital: '/assets/map/marker-capital.png',
  castle: '/assets/map/marker-castle.png',
  city: '/assets/map/marker-city.png',
  farm: '/assets/map/marker-farm.png',
  mine: '/assets/map/marker-mine.png',
  forest: '/assets/map/marker-forest.png',
};

const holdingKindLabels: Record<Holding['kind'], string> = {
  capital: 'Столица',
  castle: 'Замок',
  city: 'Город',
  farm: 'Фермы',
  mine: 'Рудник',
  forest: 'Лес',
};

const terrainLabels: Record<string, string> = {
  coast: 'Побережье',
  farmland: 'Плодородные земли',
  forest: 'Леса',
  glacier: 'Ледники',
  highlands: 'Нагорья',
  hills: 'Холмы',
  islands: 'Острова',
  mountains: 'Горы',
  riverlands: 'Речные земли',
  volcanic: 'Пепельные склоны',
};

const kingdomCopy: Record<string, { name: string; realm: string; description: string; law: string }> = {
  riverland: {
    name: 'Риверланд',
    realm: 'Королевство',
    description: 'Плодородные долины и могучие реки делают Риверланд житницей континента. Сильная кавалерия и верные вассалы — основа нашей силы.',
    law: 'Лига Рассвета',
  },
  nordgard: {
    name: 'Нордгард',
    realm: 'Ярлство',
    description: 'Суровый север держится на лесах, железе и дружинах, привыкших сражаться в снегу.',
    law: 'Северный тинг',
  },
  caldoria: {
    name: 'Кальдория',
    realm: 'Республика',
    description: 'Мраморные города и торговые дома Кальдории превращают гавани в золото.',
    law: 'Совет домов',
  },
  velund: {
    name: 'Велунд',
    realm: 'Конкорд',
    description: 'Древние рощи Велунда скрывают дороги, лучников и старые клятвы хранителей.',
    law: 'Клятва рощ',
  },
  solaria: {
    name: 'Солария',
    realm: 'Теократия',
    description: 'Солнечный престол держит дороги, храмы и сборы под единым сияющим законом.',
    law: 'Светлый эдикт',
  },
  dragonridge: {
    name: 'Драконья гряда',
    realm: 'Горные владения',
    description: 'Крепости, кузни и пепельные перевалы делают гряду тяжёлой целью для любого врага.',
    law: 'Кодекс стали',
  },
  morven: {
    name: 'Морвен',
    realm: 'Береговая лига',
    description: 'Штормовые гавани Морвена богатеют на риске, караванах и быстрых морских ударах.',
    law: 'Чёрный устав',
  },
  frostheim: {
    name: 'Фростхейм',
    realm: 'Ледяная корона',
    description: 'Ледники и кристальные шахты питают корону, которую трудно сломить осадой.',
    law: 'Кристальный договор',
  },
};

const eventIcons: Record<string, string> = {
  army: '/assets/events/event-army.png',
  bandits: '/assets/events/event-bandits.png',
  construction: '/assets/events/event-construction.png',
  diplomacy: '/assets/events/event-diplomacy.png',
  harvest: '/assets/events/event-harvest.png',
  research: '/assets/events/event-research.png',
  scroll: '/assets/events/event-scroll.png',
  success: '/assets/events/event-success.png',
  trade: '/assets/events/event-trade.png',
  warning: '/assets/events/event-warning.png',
};

function formatNumber(value: number) {
  return Math.floor(value).toLocaleString('ru-RU');
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampMapCenter(value: number, zoom: number) {
  const edge = 1 / (zoom * 2);
  return clamp(value, edge, 1 - edge);
}

function normalizeMapViewport(viewport: MapViewport): MapViewport {
  const zoom = clamp(viewport.zoom, minMapZoom, maxMapZoom);
  return {
    zoom,
    centerX: clampMapCenter(viewport.centerX, zoom),
    centerY: clampMapCenter(viewport.centerY, zoom),
  };
}

function zoomMapViewport(viewport: MapViewport, factor: number): MapViewport {
  return normalizeMapViewport({
    ...viewport,
    zoom: viewport.zoom * factor,
  });
}

function displayKingdom(kingdom?: Kingdom) {
  if (!kingdom) {
    return { name: 'Неизвестно', realm: 'Держава', description: '', law: '' };
  }

  return kingdomCopy[kingdom.id] ?? {
    name: kingdom.name,
    realm: kingdom.title,
    description: kingdom.motto,
    law: kingdom.traits[0] ?? kingdom.title,
  };
}

function displayTerrain(terrain: string) {
  return terrainLabels[terrain] ?? terrain;
}

function kingdomAssets(kingdom?: Kingdom) {
  if (!kingdom) {
    return undefined;
  }

  return KINGDOM_ASSETS[kingdom.id as keyof typeof KINGDOM_ASSETS];
}

function pointStyle(point: [number, number], width: number, height: number): CSSProperties {
  return {
    left: `${(point[0] / width) * 100}%`,
    top: `${(point[1] / height) * 100}%`,
  };
}

function regionPoints(region: Region) {
  return region.mapPolygon.map((point) => `${point[0]},${point[1]}`).join(' ');
}

function kingdomCenter(kingdomId: string, regions: Region[]): [number, number] {
  const ownRegions = regions.filter((region) => region.kingdomId === kingdomId);
  if (!ownRegions.length) {
    return [0, 0];
  }

  const total = ownRegions.reduce(
    (sum, region) => [sum[0] + region.mapPoint[0], sum[1] + region.mapPoint[1]] as [number, number],
    [0, 0] as [number, number],
  );

  return [total[0] / ownRegions.length, total[1] / ownRegions.length];
}

function estimateIncome(world: WorldState, kingdom: Kingdom | undefined, resource: ResourceKey) {
  if (!kingdom) {
    return 0;
  }

  return world.holdings
    .filter((holding) => holding.kingdomId === kingdom.id)
    .flatMap((holding) => holding.buildings)
    .filter((building) => building.status === 'active')
    .reduce((sum, building) => {
      const catalog = world.buildingCatalog[building.type];
      const gain = catalog.effects[resource] ?? 0;
      const upkeep = catalog.maintenance?.[resource] ?? 0;
      return sum + gain - upkeep;
    }, 0);
}

function visibleEventsFor(world: WorldState, kingdom?: Kingdom) {
  return world.events
    .filter((event) => !kingdom || event.scope === 'world' || !event.kingdomId || event.kingdomId === kingdom.id)
    .slice(-12)
    .reverse();
}

function relationLabel(value: number) {
  if (value >= 72) {
    return 'союзники';
  }

  if (value >= 55) {
    return 'ровные отношения';
  }

  if (value >= 36) {
    return 'настороженность';
  }

  return 'опасная граница';
}

function treatyLabel(type: string) {
  const labels: Record<string, string> = {
    non_aggression: 'Пакт о ненападении',
    research: 'Обмен учёными',
    trade: 'Торговый договор',
  };

  return labels[type] ?? 'Договор';
}

function treatyEffect(type: string) {
  const effects: Record<string, string> = {
    non_aggression: 'угроза снижается каждый день',
    research: '+технологии и престиж архивов',
    trade: '+золото, еда и процветание',
  };

  return effects[type] ?? 'дипломатический бонус';
}

function hasTreaty(world: WorldState, fromId: string, toId: string, type: string) {
  return world.diplomacy.treaties.some((treaty) => (
    treaty.type === type
    && [treaty.fromKingdomId, treaty.toKingdomId].includes(fromId)
    && [treaty.fromKingdomId, treaty.toKingdomId].includes(toId)
  ));
}

function eventCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    army: 'Военная сводка',
    bandits: 'Угроза на дорогах',
    construction: 'Строительство',
    diplomacy: 'Дипломатия',
    harvest: 'Урожай',
    research: 'Исследования',
    scroll: 'Хроника',
    success: 'Успех',
    trade: 'Торговля',
    warning: 'Тревога',
  };

  return labels[category] ?? 'Событие';
}

function createDiplomaticCourtEvent(world: WorldState, from: Kingdom, controlled: Kingdom): CourtEvent {
  const relation = world.diplomacy.relations[controlled.id]?.[from.id] ?? 50;
  const fromCopy = displayKingdom(from);
  const controlledCopy = displayKingdom(controlled);
  const assets = kingdomAssets(from);
  const isWarm = relation >= 60;
  const isHostile = relation < 36;
  const tone = isWarm ? 'дружественное послание' : isHostile ? 'жёсткое письмо' : 'осторожное послание';
  const body = isWarm
    ? `${from.ruler} напоминает о взаимной выгоде между ${fromCopy.name} и ${controlledCopy.name}. Двор готов принять посольство и обсудить новые торговые гарантии.`
    : isHostile
      ? `${from.ruler} требует объяснений по поводу ваших людей у границы. При дворе ${fromCopy.name} ждут ясного ответа: мирный жест, демонстрация силы или молчание.`
      : `${from.ruler} прислал письмо с осторожным предложением. ${fromCopy.name} следит за вашими решениями и готов проверить, насколько надёжны ваши обещания.`;
  const choices: CourtChoice[] = [
    {
      id: 'embassy',
      label: 'Принять посольство',
      description: 'Потратить влияние и улучшить отношения.',
      icon: eventIcons.diplomacy,
      action: {
        type: 'diplomacy:improveRelations',
        payload: { fromKingdomId: controlled.id, toKingdomId: from.id },
      },
      openMainPanel: 'diplomacy',
    },
    {
      id: 'caravan',
      label: 'Отправить караван',
      description: 'Передать 50 еды и смягчить тон переговоров.',
      icon: eventIcons.trade,
      action: {
        type: 'diplomacy:sendResources',
        payload: { fromKingdomId: controlled.id, toKingdomId: from.id, resource: 'food', amount: 50 },
      },
      openMainPanel: 'diplomacy',
    },
  ];

  if (!isHostile) {
    choices.push({
      id: 'treaty',
      label: 'Предложить договор',
      description: 'Оформить торговое соглашение с ежедневным бонусом.',
      icon: eventIcons.scroll,
      action: {
        type: 'diplomacy:proposeTreaty',
        payload: { fromKingdomId: controlled.id, toKingdomId: from.id, treatyType: 'trade' },
      },
      openMainPanel: 'diplomacy',
    });
  }

  choices.push({
    id: isHostile ? 'war-room' : 'archive',
    label: isHostile ? 'Созвать военный совет' : 'Ответить позже',
    description: isHostile ? 'Перейти к армии и выбрать возможную цель.' : 'Оставить письмо в почте без немедленного ответа.',
    icon: isHostile ? eventIcons.army : eventIcons.scroll,
    openMainPanel: isHostile ? 'army' : undefined,
  });

  return {
    id: `letter-${controlled.id}-${from.id}-${world.time.day}`,
    day: world.time.day,
    title: isHostile ? 'Напряжённая аудиенция' : 'Письмо от правителя',
    subtitle: `${from.ruler} · ${fromCopy.name} · ${tone}`,
    body,
    icon: isHostile ? eventIcons.warning : eventIcons.diplomacy,
    accent: from.accent,
    kingdomId: from.id,
    portrait: assets?.ruler,
    crest: assets?.crest,
    category: 'diplomacy',
    choices,
  };
}

function createWorldCourtEvent(event: GameEvent, kingdoms: Kingdom[]): CourtEvent {
  const kingdom = kingdoms.find((item) => item.id === event.kingdomId);
  const copy = displayKingdom(kingdom);
  const assets = kingdomAssets(kingdom);
  const openMainPanel: MainPanel = event.category === 'army' || event.category === 'warning' || event.category === 'bandits'
    ? 'army'
    : event.category === 'trade' || event.category === 'harvest'
      ? 'economy'
      : event.category === 'research'
        ? 'technology'
        : event.category === 'diplomacy'
          ? 'diplomacy'
          : 'map';

  return {
    id: `event-${event.id}`,
    day: event.day,
    title: event.title,
    subtitle: kingdom ? `${copy.name} · ${eventCategoryLabel(event.category)}` : eventCategoryLabel(event.category),
    body: event.description,
    icon: eventIcons[event.category] ?? eventIcons.scroll,
    accent: kingdom?.accent ?? '#d9b86c',
    kingdomId: kingdom?.id,
    portrait: assets?.ruler,
    crest: assets?.crest,
    category: event.category,
    choices: [
      {
        id: 'inspect',
        label: openMainPanel === 'map' ? 'Открыть карту' : `Открыть ${mainPanelMeta[openMainPanel].label.toLowerCase()}`,
        description: 'Перейти к разделу, где это событие можно обработать.',
        icon: mainPanelMeta[openMainPanel].icon,
        openMainPanel,
      },
      {
        id: 'mail',
        label: 'В почту',
        description: 'Оставить запись в архиве писем и событий.',
        icon: '/assets/ui/icon-mail.png',
        openCompactPanel: 'mail',
      },
      {
        id: 'close',
        label: 'Принято',
        description: 'Закрыть событие и вернуться к кампании.',
        icon: eventIcons.success,
      },
    ],
  };
}

export function StrategyScreen({
  world,
  serverStatus,
  playerMode,
  selectedKingdomId,
  controlledKingdomId,
  selectedRegionId,
  selectedHoldingId,
  onSelectKingdom,
  onSelectRegion,
  onOpenHolding,
  onSendAction,
  onToggleMode,
}: StrategyScreenProps) {
  const [activeMainPanel, setActiveMainPanel] = useState<MainPanel>('map');
  const [compactPanel, setCompactPanel] = useState<CompactPanel | null>(null);
  const [layers, setLayers] = useState<Record<MapLayerKey, boolean>>({
    borders: true,
    holdings: true,
    labels: true,
  });
  const [mapViewport, setMapViewport] = useState<MapViewport>(initialMapViewport);
  const [courtEvent, setCourtEvent] = useState<CourtEvent | null>(null);
  const [seenCourtEventKeys, setSeenCourtEventKeys] = useState<Set<string>>(() => new Set());
  const [mailArchive, setMailArchive] = useState<CourtEvent[]>([]);

  const updateMapViewport = (viewport: MapViewport) => {
    setMapViewport(normalizeMapViewport(viewport));
  };

  const selectedKingdom = world.kingdoms.find((kingdom) => kingdom.id === selectedKingdomId) ?? world.kingdoms[0];
  const controlledKingdom = world.kingdoms.find((kingdom) => kingdom.id === controlledKingdomId) ?? selectedKingdom;
  const selectedRegion = world.regions.find((region) => region.id === selectedRegionId)
    ?? world.regions.find((region) => region.id === selectedKingdom?.capitalRegionId)
    ?? world.regions[0];
  const selectedHolding = world.holdings.find((holding) => holding.id === selectedHoldingId);
  const controlledHoldings = controlledKingdom
    ? world.holdings.filter((holding) => holding.kingdomId === controlledKingdom.id)
    : [];
  const controlledArmy = world.armies.find((army) => army.kingdomId === controlledKingdom?.id);

  const topIncome = useMemo(() => {
    const result: Partial<Record<ResourceKey, number>> = {};
    topResources.forEach((resource) => {
      result[resource] = estimateIncome(world, controlledKingdom, resource);
    });
    return result;
  }, [controlledKingdom, world]);

  useEffect(() => {
    if (!controlledKingdom || !selectedKingdom || controlledKingdom.id === selectedKingdom.id || courtEvent) {
      return;
    }

    const key = `letter-${controlledKingdom.id}-${selectedKingdom.id}`;
    if (seenCourtEventKeys.has(key)) {
      return;
    }

    const nextEvent = createDiplomaticCourtEvent(world, selectedKingdom, controlledKingdom);
    setCourtEvent(nextEvent);
    setMailArchive((current) => [nextEvent, ...current].slice(0, 12));
    setSeenCourtEventKeys((current) => {
      const next = new Set(current);
      next.add(key);
      return next;
    });
  }, [controlledKingdom, courtEvent, seenCourtEventKeys, selectedKingdom, world]);

  useEffect(() => {
    if (!controlledKingdom || courtEvent || selectedKingdom?.id !== controlledKingdom.id) {
      return;
    }

    const visibleEvents = visibleEventsFor(world, controlledKingdom);
    const nextWorldEvent = visibleEvents.find((event) => !seenCourtEventKeys.has(`event-${event.id}`));
    if (!nextWorldEvent) {
      return;
    }

    const nextEvent = createWorldCourtEvent(nextWorldEvent, world.kingdoms);
    setCourtEvent(nextEvent);
    setMailArchive((current) => [nextEvent, ...current].slice(0, 12));
    setSeenCourtEventKeys((current) => {
      const next = new Set(current);
      visibleEvents.forEach((event) => next.add(`event-${event.id}`));
      return next;
    });
  }, [controlledKingdom, courtEvent, seenCourtEventKeys, selectedKingdom?.id, world, world.events, world.kingdoms]);

  const resolveCourtChoice = (choice: CourtChoice) => {
    if (choice.action) {
      onSendAction(choice.action.type, choice.action.payload);
    }

    if (choice.openMainPanel) {
      setActiveMainPanel(choice.openMainPanel);
    }

    if (choice.openCompactPanel) {
      setCompactPanel(choice.openCompactPanel);
    }

    setCourtEvent(null);
  };

  return (
    <main className="rebuild-game">
      <TopBar
        world={world}
        kingdom={controlledKingdom}
        income={topIncome}
        serverStatus={serverStatus}
        playerMode={playerMode}
        compactPanel={compactPanel}
        onOpenCompactPanel={setCompactPanel}
        onSendAction={onSendAction}
        onToggleMode={onToggleMode}
      />

      <KingdomSidebar
        kingdom={selectedKingdom}
        controlledKingdom={controlledKingdom}
        regions={world.regions}
        holdings={world.holdings}
        armyStrength={controlledArmy?.strength ?? selectedKingdom?.resources.army ?? 0}
        onSelectKingdom={onSelectKingdom}
        onOpenMainPanel={setActiveMainPanel}
      />

      {activeMainPanel === 'map' ? (
        <CampaignMap
          world={world}
          layers={layers}
          selectedKingdomId={selectedKingdom?.id}
          controlledKingdomId={controlledKingdom?.id}
          selectedHoldingId={selectedHolding?.id}
          viewport={mapViewport}
          onSelectKingdom={onSelectKingdom}
          onSelectRegion={onSelectRegion}
          onOpenHolding={onOpenHolding}
          onViewportChange={updateMapViewport}
        />
      ) : (
        <MainWorkspace
          key={activeMainPanel}
          panel={activeMainPanel}
          world={world}
          kingdom={controlledKingdom}
          selectedRegion={selectedRegion}
          army={controlledArmy}
          income={topIncome}
          onSendAction={onSendAction}
          onOpenMainPanel={setActiveMainPanel}
        />
      )}

      <RightColumn
        events={world.events}
        kingdoms={world.kingdoms}
        controlledKingdom={controlledKingdom}
        holdings={controlledHoldings}
        regions={world.regions}
        selectedHoldingId={selectedHolding?.id}
        onOpenHolding={onOpenHolding}
        onOpenEvents={() => setCompactPanel('events')}
      />

      <TimeDock world={world} onSendAction={onSendAction} />

      <CommandDock activePanel={activeMainPanel} onOpenPanel={setActiveMainPanel} />

      <MapDock
        mapImage={world.map.minimap || world.map.image}
        layers={layers}
        viewport={mapViewport}
        onToggleLayer={(layer) => setLayers((current) => ({ ...current, [layer]: !current[layer] }))}
        onOpenMap={() => setActiveMainPanel('map')}
        onViewportChange={updateMapViewport}
      />

      {compactPanel && (
        <CompactWindow
          panel={compactPanel}
          world={world}
          kingdom={controlledKingdom}
          mailArchive={mailArchive}
          layers={layers}
          playerMode={playerMode}
          onClose={() => setCompactPanel(null)}
          onOpenCompactPanel={setCompactPanel}
          onToggleLayer={(layer) => setLayers((current) => ({ ...current, [layer]: !current[layer] }))}
          onSendAction={onSendAction}
          onToggleMode={onToggleMode}
        />
      )}

      {courtEvent && (
        <CourtEventOverlay event={courtEvent} onChoose={resolveCourtChoice} />
      )}
    </main>
  );
}

function TopBar({
  world,
  kingdom,
  income,
  serverStatus,
  playerMode,
  compactPanel,
  onOpenCompactPanel,
  onSendAction,
  onToggleMode,
}: {
  world: WorldState;
  kingdom?: Kingdom;
  income: Partial<Record<ResourceKey, number>>;
  serverStatus: 'offline' | 'connecting' | 'online';
  playerMode: PlayerMode;
  compactPanel: CompactPanel | null;
  onOpenCompactPanel: (panel: CompactPanel) => void;
  onSendAction: (type: string, payload?: Record<string, unknown>) => void;
  onToggleMode: () => void;
}) {
  return (
    <header className="rebuild-topbar">
      <div className="rebuild-brand">
        <img src="/assets/branding/logo-small.png" alt="MF.Game" />
        <span>{serverStatus === 'online' ? 'мир синхронизирован' : 'нет связи'}</span>
      </div>

      <div className="rebuild-date">
        <img src="/assets/ui/icon-calendar.png" alt="" />
        <strong>День {world.time.day}</strong>
        <span>{world.time.season}, год {world.time.year}</span>
      </div>

      <div className="rebuild-resources">
        {kingdom && topResources.map((resource) => {
          const delta = income[resource] ?? 0;
          return (
            <div className="rebuild-resource" key={resource} title={RESOURCE_LABELS[resource]}>
              <img src={RESOURCE_ICONS[resource]} alt="" />
              <strong>{formatNumber(kingdom.resources[resource])}</strong>
              <span>{delta >= 0 ? '+' : ''}{formatNumber(delta)}/день</span>
            </div>
          );
        })}
      </div>

      <div className="rebuild-actions">
        <button
          className={compactPanel === 'mail' ? 'rebuild-icon-button rebuild-top-action-active' : 'rebuild-icon-button'}
          onClick={() => onOpenCompactPanel('mail')}
          title="Почта"
        >
          <img src="/assets/ui/icon-mail.png" alt="" />
        </button>
        <button
          className={compactPanel === 'events' ? 'rebuild-icon-button rebuild-top-action-active' : 'rebuild-icon-button'}
          onClick={() => onOpenCompactPanel('events')}
          title="События"
        >
          <img src="/assets/ui/icon-bell.png" alt="" />
        </button>
        <button
          className="rebuild-icon-button"
          onClick={() => onSendAction('time:set', { paused: !world.time.paused })}
          title={world.time.paused ? 'Продолжить' : 'Пауза'}
        >
          <img src={world.time.paused ? '/assets/ui/icon-play.png' : '/assets/ui/icon-pause.png'} alt="" />
        </button>
        <button
          className={compactPanel === 'settings' ? 'rebuild-icon-button rebuild-top-action-active' : 'rebuild-icon-button'}
          onClick={() => onOpenCompactPanel('settings')}
          title="Настройки"
        >
          <img src="/assets/ui/icon-settings.png" alt="" />
        </button>
        <button className="rebuild-mode-button" onClick={onToggleMode}>
          {playerMode === 'admin' ? 'Admin' : 'Player'}
        </button>
      </div>
    </header>
  );
}

function KingdomSidebar({
  kingdom,
  controlledKingdom,
  regions,
  holdings,
  armyStrength,
  onSelectKingdom,
  onOpenMainPanel,
}: {
  kingdom?: Kingdom;
  controlledKingdom?: Kingdom;
  regions: Region[];
  holdings: Holding[];
  armyStrength: number;
  onSelectKingdom: (kingdomId: string) => void;
  onOpenMainPanel: (panel: MainPanel) => void;
}) {
  const copy = displayKingdom(kingdom);
  const controlledCopy = displayKingdom(controlledKingdom);
  const assets = kingdomAssets(kingdom);
  const kingdomRegions = kingdom ? regions.filter((region) => region.kingdomId === kingdom.id) : [];
  const kingdomHoldings = kingdom ? holdings.filter((holding) => holding.kingdomId === kingdom.id) : [];
  const capitalRegion = kingdomRegions.find((region) => region.id === kingdom?.capitalRegionId) ?? kingdomRegions[0];
  const capitalHolding = kingdomHoldings.find((holding) => holding.kind === 'capital') ?? kingdomHoldings[0];
  const cities = kingdomHoldings.filter((holding) => holding.kind === 'city').length;
  const castles = kingdomHoldings.filter((holding) => holding.kind === 'capital' || holding.kind === 'castle').length;
  const inspecting = kingdom && controlledKingdom && kingdom.id !== controlledKingdom.id;

  return (
    <aside className="rebuild-left-panel">
      <div className="rebuild-panel-title">
        <span>Выбор страны</span>
        <button
          disabled={!controlledKingdom}
          onClick={() => controlledKingdom && onSelectKingdom(controlledKingdom.id)}
          title="Вернуться к своей державе"
        >
          <img src="/assets/ui/icon-dropdown.png" alt="" />
        </button>
      </div>

      {kingdom && assets && (
        <section className="rebuild-kingdom-card">
          <div className="rebuild-kingdom-head">
            <img className="rebuild-crest" src={assets.crest} alt="" />
            <div>
              <strong>{copy.name}</strong>
              <span>{copy.realm}</span>
              {inspecting && <small>Вы правите: {controlledCopy.name}</small>}
            </div>
          </div>

          <div className="rebuild-ruler-block">
            <img src={assets.ruler} alt="" />
            <div>
              <strong>{kingdom.ruler}</strong>
              <span>Лидер</span>
              <small>{kingdom.title}</small>
              <button onClick={() => onSelectKingdom(kingdom.id)}>
                <img src="/assets/ui/icon-check.png" alt="" />
                Осматривать
              </button>
              <button onClick={() => onOpenMainPanel('diplomacy')}>
                <img src="/assets/ui/icon-diplomacy.png" alt="" />
                Дипломатия
              </button>
            </div>
          </div>

          <p>{copy.description}</p>
        </section>
      )}

      {kingdom && (
        <section className="rebuild-stats-card">
          <h2>Ключевые показатели</h2>
          <div className="rebuild-stat-grid">
            <Metric icon="/assets/map/marker-capital.png" label="Столица" value={capitalHolding?.name ?? 'нет'} />
            <Metric icon="/assets/ui/icon-regions.png" label="Регион" value={capitalRegion?.name ?? 'нет'} />
            <Metric icon="/assets/map/marker-city.png" label="Города" value={String(cities)} />
            <Metric icon="/assets/map/marker-castle.png" label="Замки" value={String(castles)} />
            <Metric icon={RESOURCE_ICONS.population} label="Население" value={formatNumber(kingdom.resources.population)} />
            <Metric icon={RESOURCE_ICONS.army} label="Армия" value={formatNumber(armyStrength)} />
            <Metric icon={RESOURCE_ICONS.gold} label="Казна" value={formatNumber(kingdom.resources.gold)} />
            <Metric icon={RESOURCE_ICONS.prosperity} label="Процветание" value={`${Math.floor(kingdom.resources.prosperity)}%`} />
            <Metric icon={RESOURCE_ICONS.threat} label="Угроза" value={`${Math.floor(kingdom.resources.threat)}%`} />
            <Metric icon="/assets/ui/icon-laws.png" label="Союз" value={copy.law} />
          </div>
        </section>
      )}

      <button className="rebuild-wide-action" onClick={() => onOpenMainPanel('diplomacy')}>
        <img src="/assets/ui/icon-diplomacy.png" alt="" />
        Дипломатия
        <img src="/assets/ui/icon-forward.png" alt="" />
      </button>
    </aside>
  );
}

function Metric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rebuild-metric">
      <img src={icon} alt="" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CampaignMap({
  world,
  layers,
  selectedKingdomId,
  controlledKingdomId,
  selectedHoldingId,
  viewport,
  onSelectKingdom,
  onSelectRegion,
  onOpenHolding,
  onViewportChange,
}: {
  world: WorldState;
  layers: Record<MapLayerKey, boolean>;
  selectedKingdomId?: string;
  controlledKingdomId?: string;
  selectedHoldingId?: string;
  viewport: MapViewport;
  onSelectKingdom: (kingdomId: string) => void;
  onSelectRegion: (regionId: string) => void;
  onOpenHolding: (holdingId: string) => void;
  onViewportChange: (viewport: MapViewport) => void;
}) {
  const map = world.map;
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    centerX: number;
    centerY: number;
    zoom: number;
    width: number;
    height: number;
  } | null>(null);
  const dragMovedRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const mapContentStyle = {
    backgroundImage: `url(${map.image})`,
    height: `${viewport.zoom * 100}%`,
    left: `${50 - viewport.centerX * viewport.zoom * 100}%`,
    top: `${50 - viewport.centerY * viewport.zoom * 100}%`,
    width: `${viewport.zoom * 100}%`,
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const pointerY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    const nextZoom = clamp(viewport.zoom * (event.deltaY < 0 ? 1.14 : 0.88), minMapZoom, maxMapZoom);
    const currentLeft = viewport.centerX - 1 / (viewport.zoom * 2);
    const currentTop = viewport.centerY - 1 / (viewport.zoom * 2);
    const mapXUnderPointer = currentLeft + pointerX / viewport.zoom;
    const mapYUnderPointer = currentTop + pointerY / viewport.zoom;

    onViewportChange({
      zoom: nextZoom,
      centerX: mapXUnderPointer - pointerX / nextZoom + 1 / (nextZoom * 2),
      centerY: mapYUnderPointer - pointerY / nextZoom + 1 / (nextZoom * 2),
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragMovedRef.current = false;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      centerX: viewport.centerX,
      centerY: viewport.centerY,
      zoom: viewport.zoom,
      width: rect.width,
      height: rect.height,
    };
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) {
      dragMovedRef.current = true;
    }

    onViewportChange({
      zoom: dragState.zoom,
      centerX: dragState.centerX - deltaX / (dragState.width * dragState.zoom),
      centerY: dragState.centerY - deltaY / (dragState.height * dragState.zoom),
    });
  };

  const finishDrag = (event: PointerEvent<HTMLElement>) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      setDragging(false);
    }
  };

  const stopMapDrag = (event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const zoomIn = () => onViewportChange(zoomMapViewport(viewport, 1.22));
  const zoomOut = () => onViewportChange(zoomMapViewport(viewport, 0.82));
  const resetViewport = () => onViewportChange(initialMapViewport);

  return (
    <section className="rebuild-map-panel">
      <div
        className={dragging ? 'rebuild-map-canvas rebuild-map-canvas-dragging' : 'rebuild-map-canvas'}
        onPointerCancel={finishDrag}
        onPointerDown={handlePointerDown}
        onPointerLeave={finishDrag}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onWheel={handleWheel}
      >
        <div className="rebuild-map-content" style={mapContentStyle}>
          <svg className="rebuild-region-hit-layer" viewBox={`0 0 ${map.width} ${map.height}`} preserveAspectRatio="none">
            {world.regions.map((region) => (
              <polygon
                key={region.id}
                points={regionPoints(region)}
                onClick={() => {
                  if (dragMovedRef.current) {
                    return;
                  }
                  onSelectKingdom(region.kingdomId);
                  onSelectRegion(region.id);
                }}
              />
            ))}
          </svg>

          {layers.borders && map.borders && (
            <img className="rebuild-map-overlay rebuild-map-borders" src={map.borders} alt="" />
          )}

          {layers.labels && world.kingdoms.map((kingdom) => {
            const copy = displayKingdom(kingdom);
            const center = kingdomCenter(kingdom.id, world.regions);
            const selected = kingdom.id === selectedKingdomId;
            const controlled = kingdom.id === controlledKingdomId;

            return (
              <button
                className={[
                  'rebuild-map-label',
                  selected ? 'rebuild-map-label-selected' : '',
                  controlled ? 'rebuild-map-label-controlled' : '',
                ].filter(Boolean).join(' ')}
                key={kingdom.id}
                onPointerDown={stopMapDrag}
                style={{
                  ...pointStyle(center, map.width, map.height),
                  '--kingdom-accent': kingdom.accent,
                } as CSSProperties}
                onClick={() => onSelectKingdom(kingdom.id)}
              >
                <span>{copy.name}</span>
              </button>
            );
          })}

          {layers.holdings && world.holdings.map((holding) => {
            const kingdom = world.kingdoms.find((item) => item.id === holding.kingdomId);
            const selected = holding.id === selectedHoldingId;
            const controlled = holding.kingdomId === controlledKingdomId;

            return (
              <button
                className={[
                  'rebuild-holding-marker',
                  selected ? 'rebuild-holding-marker-selected' : '',
                  controlled ? 'rebuild-holding-marker-controlled' : '',
                ].filter(Boolean).join(' ')}
                key={holding.id}
                onPointerDown={stopMapDrag}
                style={{
                  ...pointStyle(holding.mapPoint, map.width, map.height),
                  '--kingdom-accent': kingdom?.accent ?? '#f2d18b',
                } as CSSProperties}
                onClick={() => {
                  onSelectKingdom(holding.kingdomId);
                  onSelectRegion(holding.regionId);
                  onOpenHolding(holding.id);
                }}
                title={holding.name}
              >
                {selected && <img className="rebuild-marker-ring" src="/assets/map/marker-selected.png" alt="" />}
                <img src={holdingIcons[holding.kind]} alt="" />
              </button>
            );
          })}
        </div>

        <div className="rebuild-map-tools" onPointerDown={stopMapDrag}>
          <button onClick={zoomOut} title="Отдалить">−</button>
          <button onClick={resetViewport} title="Сбросить масштаб">1:1</button>
          <button onClick={zoomIn} title="Приблизить">+</button>
        </div>
      </div>
    </section>
  );
}

function RightColumn({
  events,
  kingdoms,
  controlledKingdom,
  holdings,
  regions,
  selectedHoldingId,
  onOpenHolding,
  onOpenEvents,
}: {
  events: GameEvent[];
  kingdoms: Kingdom[];
  controlledKingdom?: Kingdom;
  holdings: Holding[];
  regions: Region[];
  selectedHoldingId?: string;
  onOpenHolding: (holdingId: string) => void;
  onOpenEvents: () => void;
}) {
  const visibleEvents = events
    .filter((event) => !controlledKingdom || event.scope === 'world' || !event.kingdomId || event.kingdomId === controlledKingdom.id)
    .slice(-5)
    .reverse();
  const selectedHolding = holdings.find((holding) => holding.id === selectedHoldingId) ?? holdings[0];

  return (
    <aside className="rebuild-right-panel">
      <section className="rebuild-events-panel">
        <div className="rebuild-panel-title">
          <span>Журнал событий</span>
          <button onClick={onOpenEvents} title="Открыть события">
            <img src="/assets/ui/icon-filter.png" alt="" />
          </button>
        </div>

        <div className="rebuild-event-list">
          {visibleEvents.map((event) => {
            const kingdom = kingdoms.find((item) => item.id === event.kingdomId);

            return (
              <article className="rebuild-event-row" key={event.id}>
                <img src={eventIcons[event.category] ?? eventIcons.scroll} alt="" />
                <div>
                  <small>
                    <span>День {event.day}</span>
                    {kingdom && <span style={{ color: kingdom.accent }}>{displayKingdom(kingdom).name}</span>}
                  </small>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rebuild-castles-panel">
        <div className="rebuild-castles-head">
          <div>
            <strong>Замки</strong>
            <span>{controlledKingdom ? displayKingdom(controlledKingdom).name : 'Держава'}</span>
          </div>
          <b>{holdings.length} / {holdings.length}</b>
        </div>

        <div className="rebuild-castle-list">
          {holdings.map((holding) => {
            const region = regions.find((item) => item.id === holding.regionId);
            const selected = holding.id === selectedHolding?.id;

            return (
              <button
                className={selected ? 'rebuild-castle-row rebuild-castle-row-active' : 'rebuild-castle-row'}
                key={holding.id}
                onClick={() => onOpenHolding(holding.id)}
              >
                <img src={holdingIcons[holding.kind]} alt="" />
                <span>
                  <strong>{holding.name}</strong>
                  <small>{holdingKindLabels[holding.kind]} · {region?.name ?? 'регион'}</small>
                </span>
                <b>{Math.floor(holding.garrison)}</b>
              </button>
            );
          })}
        </div>

        <button
          className="rebuild-enter-castle"
          disabled={!selectedHolding}
          onClick={() => selectedHolding && onOpenHolding(selectedHolding.id)}
        >
          Войти в замок
        </button>
      </section>
    </aside>
  );
}

function MainWorkspace({
  panel,
  world,
  kingdom,
  selectedRegion,
  army,
  income,
  onSendAction,
  onOpenMainPanel,
}: {
  panel: Exclude<MainPanel, 'map'>;
  world: WorldState;
  kingdom?: Kingdom;
  selectedRegion?: Region;
  army?: WorldState['armies'][number];
  income: Partial<Record<ResourceKey, number>>;
  onSendAction: (type: string, payload?: Record<string, unknown>) => void;
  onOpenMainPanel: (panel: MainPanel) => void;
}) {
  const enemyRegions = useMemo(() => (
    kingdom ? world.regions.filter((region) => region.kingdomId !== kingdom.id) : []
  ), [kingdom, world.regions]);
  const targetRegions = useMemo(() => {
    if (!kingdom) {
      return [];
    }

    if (selectedRegion && selectedRegion.kingdomId !== kingdom.id) {
      return [selectedRegion, ...enemyRegions.filter((region) => region.id !== selectedRegion.id)].slice(0, 6);
    }

    return enemyRegions.slice(0, 6);
  }, [enemyRegions, kingdom, selectedRegion]);
  const ownRegions = useMemo(() => (
    kingdom ? world.regions.filter((region) => region.kingdomId === kingdom.id) : []
  ), [kingdom, world.regions]);
  const selectedOwnRegion = useMemo(() => {
    if (!kingdom) {
      return undefined;
    }

    if (selectedRegion?.kingdomId === kingdom.id) {
      return selectedRegion;
    }

    return ownRegions.find((region) => region.id === kingdom.capitalRegionId) ?? ownRegions[0];
  }, [kingdom, ownRegions, selectedRegion]);
  const activeTreaties = useMemo(() => (
    kingdom ? world.diplomacy.treaties.filter((treaty) => treaty.fromKingdomId === kingdom.id || treaty.toKingdomId === kingdom.id) : []
  ), [kingdom, world.diplomacy.treaties]);

  if (!kingdom) {
    return (
      <section className="rebuild-workspace-panel">
        <div className="rebuild-empty-workspace">Выберите державу, чтобы открыть раздел.</div>
      </section>
    );
  }

  const copy = displayKingdom(kingdom);
  const panelMeta = mainPanelMeta[panel];

  return (
    <section className="rebuild-workspace-panel">
      <header className="rebuild-workspace-head">
        <div>
          <img src={panelMeta.icon} alt="" />
          <span>{copy.name}</span>
          <strong>{panelMeta.label}</strong>
        </div>
        <button onClick={() => onOpenMainPanel('map')}>
          <img src="/assets/ui/icon-map.png" alt="" />
          На карту
        </button>
      </header>

      {panel === 'economy' && (
        <div className="rebuild-workspace-grid economy-workspace">
          <section className="rebuild-workspace-card">
            <div className="rebuild-card-title">
              <strong>Казна и поток ресурсов</strong>
              <span>доход считается по активным постройкам</span>
            </div>
            <div className="rebuild-resource-board">
              {(['gold', 'food', 'wood', 'stone', 'iron', 'influence', 'population', 'prosperity'] as ResourceKey[]).map((resource) => {
                const delta = income[resource] ?? estimateIncome(world, kingdom, resource);
                return (
                  <div className="rebuild-resource-tile" key={resource}>
                    <img src={RESOURCE_ICONS[resource]} alt="" />
                    <span>{RESOURCE_LABELS[resource]}</span>
                    <strong>{formatNumber(kingdom.resources[resource])}</strong>
                    {resource !== 'population' && resource !== 'prosperity' && (
                      <small>{delta >= 0 ? '+' : ''}{formatNumber(delta)} / день</small>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rebuild-workspace-card">
            <div className="rebuild-card-title">
              <strong>Королевский рынок</strong>
              <span>объём торгов: {formatNumber(world.market.volume)}</span>
            </div>
            <div className="rebuild-market-board">
              {marketResources.map((resource) => (
                <article className="rebuild-market-row" key={resource}>
                  <img src={RESOURCE_ICONS[resource]} alt="" />
                  <div>
                    <strong>{RESOURCE_LABELS[resource]}</strong>
                    <span>цена {world.market.prices[resource].toFixed(1)} золота · запас {formatNumber(kingdom.resources[resource])}</span>
                  </div>
                  <button onClick={() => onSendAction('market:trade', { kingdomId: kingdom.id, resource, direction: 'buy', amount: 50 })}>
                    Купить 50
                  </button>
                  <button onClick={() => onSendAction('market:trade', { kingdomId: kingdom.id, resource, direction: 'sell', amount: 50 })}>
                    Продать 50
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="rebuild-workspace-card">
            <div className="rebuild-card-title">
              <strong>Решения двора</strong>
              <span>быстрые меры правителя</span>
            </div>
            <div className="rebuild-decision-stack">
              <button className="rebuild-large-action" onClick={() => onSendAction('kingdom:holdFestival', { kingdomId: kingdom.id })}>
                <img src="/assets/events/event-success.png" alt="" />
                <span>
                  <strong>Праздник короны</strong>
                  <small>80 золота · 90 еды · стабильность и процветание растут</small>
                </span>
              </button>
              <button className="rebuild-large-action" onClick={() => onSendAction('technology:fundResearch', { kingdomId: kingdom.id })}>
                <img src={RESOURCE_ICONS.technology} alt="" />
                <span>
                  <strong>Финансировать мастерские</strong>
                  <small>75 золота · 10 влияния · быстрый прирост технологий</small>
                </span>
              </button>
              <button className="rebuild-large-action" onClick={() => onSendAction('policy:set', { kingdomId: kingdom.id, policy: 'taxation', value: kingdom.policies.taxation === 'war' ? 'balanced' : 'war' })}>
                <img src={RESOURCE_ICONS.gold} alt="" />
                <span>
                  <strong>{kingdom.policies.taxation === 'war' ? 'Вернуть баланс налогов' : 'Ввести военные налоги'}</strong>
                  <small>{kingdom.policies.taxation === 'war' ? 'стабильность перестанет проседать' : 'больше золота, ниже спокойствие'}</small>
                </span>
              </button>
            </div>
          </section>
        </div>
      )}

      {panel === 'diplomacy' && (
        <div className="rebuild-workspace-grid diplomacy-workspace">
          <section className="rebuild-workspace-card">
            <div className="rebuild-card-title">
              <strong>Дипломатическая карта</strong>
              <span>посольства, караваны и торговые договоры</span>
            </div>
            <div className="rebuild-relation-board">
              {world.kingdoms.filter((target) => target.id !== kingdom.id).map((target) => {
                const relation = world.diplomacy.relations[kingdom.id]?.[target.id] ?? 50;
                const tradeTreatyActive = hasTreaty(world, kingdom.id, target.id, 'trade');
                return (
                  <article className="rebuild-relation-row" key={target.id}>
                    <div>
                      <strong>{displayKingdom(target).name}</strong>
                      <span>{relationLabel(relation)} · {Math.floor(relation)}</span>
                    </div>
                    <meter min={0} max={100} value={relation} />
                    <button onClick={() => onSendAction('diplomacy:improveRelations', { fromKingdomId: kingdom.id, toKingdomId: target.id })}>
                      Посольство
                    </button>
                    <button onClick={() => onSendAction('diplomacy:sendResources', { fromKingdomId: kingdom.id, toKingdomId: target.id, resource: 'food', amount: 50 })}>
                      Караван
                    </button>
                    <button
                      disabled={tradeTreatyActive}
                      onClick={() => onSendAction('diplomacy:proposeTreaty', { fromKingdomId: kingdom.id, toKingdomId: target.id, treatyType: 'trade' })}
                    >
                      {tradeTreatyActive ? 'Действует' : 'Договор'}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rebuild-workspace-card">
            <div className="rebuild-card-title">
              <strong>Договоры</strong>
              <span>{activeTreaties.length ? `${activeTreaties.length} активн.` : 'нет активных'}</span>
            </div>
            <div className="rebuild-treaty-board">
              {activeTreaties.map((treaty) => {
                const partnerId = treaty.fromKingdomId === kingdom.id ? treaty.toKingdomId : treaty.fromKingdomId;
                const partner = world.kingdoms.find((item) => item.id === partnerId);
                return (
                  <article className="rebuild-treaty-row" key={treaty.id}>
                    <img src={kingdomAssets(partner)?.crest ?? eventIcons.diplomacy} alt="" />
                    <div>
                      <strong>{treatyLabel(treaty.type)}</strong>
                      <span>{displayKingdom(partner).name} · {treatyEffect(treaty.type)}</span>
                    </div>
                  </article>
                );
              })}
              {!activeTreaties.length && (
                <article className="rebuild-treaty-empty">
                  <img src="/assets/ui/icon-diplomacy.png" alt="" />
                  <div>
                    <strong>Нет подписанных договоров</strong>
                    <span>Улучшайте отношения и открывайте торговые соглашения.</span>
                  </div>
                </article>
              )}
              <button className="rebuild-large-action" onClick={() => onOpenMainPanel('map')}>
                <img src="/assets/ui/icon-map.png" alt="" />
                <span>
                  <strong>Оценить границы</strong>
                  <small>вернуться к карте и выбрать соседнюю державу</small>
                </span>
              </button>
            </div>
          </section>
        </div>
      )}

      {panel === 'army' && (
        <div className="rebuild-workspace-grid army-workspace">
          <section className="rebuild-workspace-card rebuild-army-command">
            <div className="rebuild-card-title">
              <strong>Военный совет</strong>
              <span>{army?.name ?? 'Главное войско'}</span>
            </div>
            <div className="rebuild-army-summary">
              <Metric icon={RESOURCE_ICONS.army} label="Сила армии" value={formatNumber(kingdom.resources.army)} />
              <Metric icon={RESOURCE_ICONS.stability} label="Мораль" value={`${Math.floor(army?.morale ?? 70)}%`} />
              <Metric icon={RESOURCE_ICONS.threat} label="Угроза" value={`${Math.floor(kingdom.resources.threat)}%`} />
              <Metric icon={RESOURCE_ICONS.iron} label="Железо" value={formatNumber(kingdom.resources.iron)} />
            </div>
            <button className="rebuild-large-action" onClick={() => onSendAction('army:recruit', { kingdomId: kingdom.id })}>
              <img src="/assets/ui/icon-army.png" alt="" />
              <span>
                <strong>Набрать войска</strong>
                <small>65 золота · 45 еды · 18 железа</small>
              </span>
            </button>
            <button className="rebuild-large-action" onClick={() => onSendAction('kingdom:emergencyLevy', { kingdomId: kingdom.id })}>
              <img src="/assets/events/event-army.png" alt="" />
              <span>
                <strong>Созвать ополчение</strong>
                <small>быстро +70 армии, но стабильность и население проседают</small>
              </span>
            </button>
            <button
              className="rebuild-large-action"
              disabled={!selectedOwnRegion}
              onClick={() => selectedOwnRegion && onSendAction('army:patrol', { kingdomId: kingdom.id, regionId: selectedOwnRegion.id })}
            >
              <img src="/assets/ui/icon-speed-1.png" alt="" />
              <span>
                <strong>Патруль региона</strong>
                <small>{selectedOwnRegion ? `${selectedOwnRegion.name}: контроль +, угроза -` : 'выберите свой регион'}</small>
              </span>
            </button>
            <button
              className="rebuild-large-action"
              disabled={!selectedOwnRegion}
              onClick={() => selectedOwnRegion && onSendAction('army:fortify', { kingdomId: kingdom.id, regionId: selectedOwnRegion.id })}
            >
              <img src="/assets/ui/icon-buildings.png" alt="" />
              <span>
                <strong>Укрепить регион</strong>
                <small>{selectedOwnRegion ? `${selectedOwnRegion.name}: форт +1, гарнизоны +` : 'выберите свой регион'}</small>
              </span>
            </button>
          </section>

          <section className="rebuild-workspace-card">
            <div className="rebuild-card-title">
              <strong>Оборона державы</strong>
              <span>свои регионы</span>
            </div>
            <div className="rebuild-region-command-board">
              {ownRegions.map((region) => (
                <article className="rebuild-region-command-row" key={region.id}>
                  <div>
                    <strong>{region.name}</strong>
                    <span>контроль {Math.floor(region.control)}% · форт {region.fortLevel} · {displayTerrain(region.terrain)}</span>
                  </div>
                  <button onClick={() => onSendAction('army:patrol', { kingdomId: kingdom.id, regionId: region.id })}>
                    Патруль
                  </button>
                  <button onClick={() => onSendAction('army:fortify', { kingdomId: kingdom.id, regionId: region.id })}>
                    Укрепить
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="rebuild-workspace-card">
            <div className="rebuild-card-title">
              <strong>Цели для рейда</strong>
              <span>выберите чужой регион</span>
            </div>
            <div className="rebuild-target-board">
              {targetRegions.map((region) => {
                const owner = world.kingdoms.find((item) => item.id === region.kingdomId);
                return (
                  <article className="rebuild-target-row" key={region.id}>
                    <div>
                      <strong>{region.name}</strong>
                      <span>{displayKingdom(owner).name} · {displayTerrain(region.terrain)} · форт {region.fortLevel}</span>
                    </div>
                    <b>{Math.floor(region.control)}%</b>
                    <button onClick={() => onSendAction('army:raid', { kingdomId: kingdom.id, targetRegionId: region.id })}>
                      Рейд
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {panel === 'technology' && (
        <div className="rebuild-workspace-grid technology-workspace">
          <section className="rebuild-workspace-card">
            <div className="rebuild-card-title">
              <strong>Исследовательский фокус</strong>
              <span>текущий прогресс: {formatNumber(kingdom.resources.technology)}</span>
            </div>
            <div className="rebuild-tech-focus">
              {(['stewardship', 'engineering', 'military'] as Kingdom['policies']['research'][]).map((value) => (
                <button
                  className={kingdom.policies.research === value ? 'rebuild-policy-option rebuild-policy-option-active' : 'rebuild-policy-option'}
                  key={value}
                  onClick={() => onSendAction('policy:set', { kingdomId: kingdom.id, policy: 'research', value })}
                >
                  <img src={value === 'military' ? '/assets/ui/icon-army.png' : value === 'engineering' ? '/assets/ui/icon-buildings.png' : '/assets/ui/icon-summary.png'} alt="" />
                  <span>
                    <strong>{policyLabels[value]}</strong>
                    <small>{value === 'engineering' ? '+2 технологии в день' : value === 'military' ? 'бонус к росту армии' : 'стабильное управление'}</small>
                  </span>
                </button>
              ))}
              <button className="rebuild-large-action" onClick={() => onSendAction('technology:fundResearch', { kingdomId: kingdom.id })}>
                <img src={RESOURCE_ICONS.technology} alt="" />
                <span>
                  <strong>Грант исследователям</strong>
                  <small>75 золота · 10 влияния · мгновенный прогресс</small>
                </span>
              </button>
            </div>
          </section>

          <section className="rebuild-workspace-card">
            <div className="rebuild-card-title">
              <strong>Законы короны</strong>
              <span>налоги и военная доктрина</span>
            </div>
            <div className="rebuild-policy-groups">
              <div className="rebuild-policy-readout">
                <Metric icon={RESOURCE_ICONS.gold} label="Налоги" value={policyLabels[kingdom.policies.taxation]} />
                <Metric icon={RESOURCE_ICONS.army} label="Доктрина" value={policyLabels[kingdom.policies.military]} />
                <Metric icon={RESOURCE_ICONS.technology} label="Исследования" value={policyLabels[kingdom.policies.research]} />
                <Metric icon={RESOURCE_ICONS.prosperity} label="Процветание" value={`${Math.floor(kingdom.resources.prosperity)}%`} />
              </div>

              <section className="rebuild-policy-group">
                <strong>Налоги</strong>
                <div>
                  {(['low', 'balanced', 'war'] as Kingdom['policies']['taxation'][]).map((value) => (
                    <button
                      className={kingdom.policies.taxation === value ? 'rebuild-setting-active' : ''}
                      key={value}
                      onClick={() => onSendAction('policy:set', { kingdomId: kingdom.id, policy: 'taxation', value })}
                    >
                      {policyLabels[value]}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rebuild-policy-group">
                <strong>Доктрина</strong>
                <div>
                  {(['defensive', 'levies', 'raiders'] as Kingdom['policies']['military'][]).map((value) => (
                    <button
                      className={kingdom.policies.military === value ? 'rebuild-setting-active' : ''}
                      key={value}
                      onClick={() => onSendAction('policy:set', { kingdomId: kingdom.id, policy: 'military', value })}
                    >
                      {policyLabels[value]}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function CourtEventOverlay({ event, onChoose }: { event: CourtEvent; onChoose: (choice: CourtChoice) => void }) {
  return (
    <section
      className="rebuild-court-event"
      style={{ '--court-accent': event.accent } as CSSProperties}
    >
      <div className="rebuild-court-portrait">
        <img className="rebuild-court-ruler" src={event.portrait ?? event.icon} alt="" />
        {event.crest && <img className="rebuild-court-crest" src={event.crest} alt="" />}
      </div>

      <div className="rebuild-court-body">
        <div className="rebuild-court-kicker">
          <img src={event.icon} alt="" />
          <span>День {event.day} · {eventCategoryLabel(event.category)}</span>
        </div>

        <h2>{event.title}</h2>
        <strong>{event.subtitle}</strong>
        <p>{event.body}</p>

        <div className="rebuild-court-actions">
          {event.choices.map((choice) => (
            <button key={choice.id} onClick={() => onChoose(choice)}>
              <img src={choice.icon} alt="" />
              <span>
                <strong>{choice.label}</strong>
                <small>{choice.description}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompactWindow({
  panel,
  world,
  kingdom,
  mailArchive,
  layers,
  playerMode,
  onClose,
  onOpenCompactPanel,
  onToggleLayer,
  onSendAction,
  onToggleMode,
}: {
  panel: CompactPanel;
  world: WorldState;
  kingdom?: Kingdom;
  mailArchive: CourtEvent[];
  layers: Record<MapLayerKey, boolean>;
  playerMode: PlayerMode;
  onClose: () => void;
  onOpenCompactPanel: (panel: CompactPanel) => void;
  onToggleLayer: (layer: MapLayerKey) => void;
  onSendAction: (type: string, payload?: Record<string, unknown>) => void;
  onToggleMode: () => void;
}) {
  const visibleEvents = visibleEventsFor(world, kingdom);
  const title = panel === 'mail' ? 'Почта' : panel === 'events' ? 'События' : 'Настройки';
  const icon = panel === 'mail'
    ? '/assets/ui/icon-mail.png'
    : panel === 'events'
      ? '/assets/ui/icon-bell.png'
      : '/assets/ui/icon-settings.png';

  return (
    <section className="rebuild-compact-window">
      <header className="rebuild-compact-head">
        <div>
          <img src={icon} alt="" />
          <strong>{title}</strong>
        </div>
        <button onClick={onClose} title="Закрыть">×</button>
      </header>

      {panel === 'mail' && (
        <div className="rebuild-mail-list">
          <article className="rebuild-mail-row">
            <img src="/assets/events/event-scroll.png" alt="" />
            <div>
              <strong>Королевская канцелярия</strong>
              <span>{kingdom ? `${displayKingdom(kingdom).name}: отчёты обновляются каждый день.` : 'Выберите державу для личной почты.'}</span>
            </div>
          </article>
          <article className="rebuild-mail-row">
            <img src="/assets/events/event-diplomacy.png" alt="" />
            <div>
              <strong>Посольские письма</strong>
              <span>Дипломатические ответы появляются в журнале после посольств и караванов.</span>
            </div>
          </article>
          {mailArchive.map((message) => (
            <article className="rebuild-mail-row" key={message.id}>
              <img src={message.portrait ?? message.icon} alt="" />
              <div>
                <strong>{message.title}</strong>
                <span>День {message.day} · {message.subtitle}</span>
              </div>
            </article>
          ))}
          {visibleEvents.slice(0, 3).map((event) => (
            <article className="rebuild-mail-row" key={event.id}>
              <img src={eventIcons[event.category] ?? eventIcons.scroll} alt="" />
              <div>
                <strong>{event.title}</strong>
                <span>День {event.day} · {event.description}</span>
              </div>
            </article>
          ))}
          <button className="rebuild-compact-action" onClick={() => onOpenCompactPanel('events')}>
            Открыть журнал событий
          </button>
        </div>
      )}

      {panel === 'events' && (
        <div className="rebuild-compact-event-list">
          {visibleEvents.map((event) => {
            const eventKingdom = world.kingdoms.find((item) => item.id === event.kingdomId);
            return (
              <article className="rebuild-event-row" key={event.id}>
                <img src={eventIcons[event.category] ?? eventIcons.scroll} alt="" />
                <div>
                  <small>
                    <span>День {event.day}</span>
                    {eventKingdom && <span style={{ color: eventKingdom.accent }}>{displayKingdom(eventKingdom).name}</span>}
                  </small>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {panel === 'settings' && (
        <div className="rebuild-settings-list">
          <section>
            <strong>Время</strong>
            <div className="rebuild-settings-actions">
              <button onClick={() => onSendAction('time:set', { paused: !world.time.paused })}>
                {world.time.paused ? 'Продолжить' : 'Пауза'}
              </button>
              {[1, 2, 3].map((speed) => (
                <button
                  className={world.time.speed === speed ? 'rebuild-setting-active' : ''}
                  key={speed}
                  onClick={() => onSendAction('time:set', { speed })}
                >
                  x{speed}
                </button>
              ))}
            </div>
          </section>

          <section>
            <strong>Слои карты</strong>
            <div className="rebuild-settings-actions">
              {layerButtons.map((layer) => (
                <button
                  className={layers[layer.id] ? 'rebuild-setting-active' : ''}
                  key={layer.id}
                  onClick={() => onToggleLayer(layer.id)}
                >
                  {layer.title}
                </button>
              ))}
            </div>
          </section>

          <section>
            <strong>Режим игрока</strong>
            <div className="rebuild-settings-actions">
              <button className="rebuild-setting-active" onClick={onToggleMode}>
                {playerMode === 'admin' ? 'Admin' : 'Player'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function TimeDock({ world, onSendAction }: { world: WorldState; onSendAction: (type: string, payload?: Record<string, unknown>) => void }) {
  return (
    <section className="rebuild-time-dock">
      <button onClick={() => onSendAction('time:set', { paused: !world.time.paused })} title={world.time.paused ? 'Продолжить' : 'Пауза'}>
        <img src={world.time.paused ? '/assets/ui/icon-play.png' : '/assets/ui/icon-pause.png'} alt="" />
      </button>
      {[1, 2, 3].map((speed) => (
        <button
          className={world.time.speed === speed ? 'rebuild-dock-button-active' : ''}
          key={speed}
          onClick={() => onSendAction('time:set', { speed })}
          title={`Скорость ${speed}`}
        >
          <img src={`/assets/ui/icon-speed-${speed}.png`} alt="" />
        </button>
      ))}
      <strong>x{world.time.speed}</strong>
    </section>
  );
}

function CommandDock({ activePanel, onOpenPanel }: { activePanel: MainPanel; onOpenPanel: (panel: MainPanel) => void }) {
  return (
    <nav className="rebuild-command-dock">
      {(Object.keys(mainPanelMeta) as MainPanel[]).map((panel) => (
        <button
          className={activePanel === panel ? 'rebuild-command-active' : ''}
          key={panel}
          onClick={() => onOpenPanel(panel)}
        >
          <img src={mainPanelMeta[panel].icon} alt="" />
          <span>{mainPanelMeta[panel].label}</span>
        </button>
      ))}
    </nav>
  );
}

function MapDock({
  mapImage,
  layers,
  viewport,
  onToggleLayer,
  onOpenMap,
  onViewportChange,
}: {
  mapImage: string;
  layers: Record<MapLayerKey, boolean>;
  viewport: MapViewport;
  onToggleLayer: (layer: MapLayerKey) => void;
  onOpenMap: () => void;
  onViewportChange: (viewport: MapViewport) => void;
}) {
  const selectorStyle: CSSProperties = {
    height: `${100 / viewport.zoom}%`,
    left: `${(viewport.centerX - 1 / (viewport.zoom * 2)) * 100}%`,
    top: `${(viewport.centerY - 1 / (viewport.zoom * 2)) * 100}%`,
    width: `${100 / viewport.zoom}%`,
  };

  const handleMinimapClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onViewportChange({
      zoom: viewport.zoom,
      centerX: (event.clientX - rect.left) / rect.width,
      centerY: (event.clientY - rect.top) / rect.height,
    });
    onOpenMap();
  };

  return (
    <section className="rebuild-map-dock">
      <div>
        <span>Слои карты</span>
        <div className="rebuild-layer-buttons">
          {layerButtons.map((layer) => (
            <button
              className={layers[layer.id] ? 'rebuild-layer-active' : ''}
              key={layer.id}
              onClick={() => onToggleLayer(layer.id)}
              title={layer.title}
            >
              <img src={layer.icon} alt="" />
            </button>
          ))}
        </div>
      </div>
      <button className="rebuild-minimap-button" onClick={handleMinimapClick} title="Открыть карту">
        <img className="rebuild-minimap" src={mapImage} alt="" />
        <span className="rebuild-minimap-selector" style={selectorStyle} />
      </button>
    </section>
  );
}
