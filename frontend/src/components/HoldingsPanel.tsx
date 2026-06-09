import type { Holding, Kingdom, Region } from '../types';

interface HoldingsPanelProps {
  kingdoms: Kingdom[];
  regions: Region[];
  holdings: Holding[];
  controlledKingdomId?: string;
  selectedHoldingId?: string;
  onOpenHolding: (holdingId: string) => void;
}

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

function formatNumber(value: number) {
  return Math.floor(value).toLocaleString('ru-RU');
}

export function HoldingsPanel({
  kingdoms,
  regions,
  holdings,
  controlledKingdomId,
  selectedHoldingId,
  onOpenHolding,
}: HoldingsPanelProps) {
  const controlledKingdom = kingdoms.find((kingdom) => kingdom.id === controlledKingdomId) ?? kingdoms[0];
  const controlledHoldings = controlledKingdom
    ? holdings.filter((holding) => holding.kingdomId === controlledKingdom.id)
    : [];
  const selectedOwnHolding = controlledHoldings.find((holding) => holding.id === selectedHoldingId) ?? controlledHoldings[0];

  return (
    <section className="ornate-panel holdings-panel">
      <div className="holdings-panel-header">
        <div>
          <strong>Замки</strong>
          <span>{controlledKingdom?.name ?? 'Держава'}</span>
        </div>
        <b>{controlledHoldings.length} / {controlledHoldings.length}</b>
      </div>

      <div className="castle-list">
        {controlledHoldings.map((holding) => {
          const region = regions.find((item) => item.id === holding.regionId);
          const selected = holding.id === selectedOwnHolding?.id;
          const activeBuildings = holding.buildings.length;
          const queuedBuildings = holding.constructionQueue.length;

          return (
            <button
              className={selected ? 'castle-row castle-row-active' : 'castle-row'}
              key={holding.id}
              onClick={() => onOpenHolding(holding.id)}
            >
              <img className="castle-row-icon" src={holdingIcons[holding.kind]} alt="" />
              <span className="castle-row-main">
                <strong>{holding.name}</strong>
                <small>{holdingKindLabels[holding.kind]} · {region?.name ?? 'регион'}</small>
              </span>
              <span className="castle-row-metrics">
                <small title="Гарнизон">
                  <img src="/assets/resources/army.png" alt="" />
                  {formatNumber(holding.garrison)}
                </small>
                <small title="Постройки">
                  <img src="/assets/ui/icon-buildings.png" alt="" />
                  {activeBuildings}{queuedBuildings > 0 ? `+${queuedBuildings}` : ''}
                </small>
              </span>
            </button>
          );
        })}
      </div>

      <button
        className="gold-button castle-panel-action"
        disabled={!selectedOwnHolding}
        onClick={() => selectedOwnHolding && onOpenHolding(selectedOwnHolding.id)}
      >
        Войти в замок
      </button>
    </section>
  );
}
