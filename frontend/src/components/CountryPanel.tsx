import type { Army, Holding, Kingdom, Region } from '../types';
import { KINGDOM_ASSETS, RESOURCE_ICONS, RESOURCE_LABELS, type ResourceKey } from '../types';

interface CountryPanelProps {
  kingdoms: Kingdom[];
  regions: Region[];
  holdings: Holding[];
  armies: Army[];
  selectedKingdomId?: string;
  selectedRegionId?: string;
  controlledKingdomId?: string;
  onSelectKingdom: (kingdomId: string) => void;
  onSelectRegion: (regionId: string) => void;
  onOpenHolding: (holdingId: string) => void;
}

const primaryResources: ResourceKey[] = ['gold', 'food', 'wood', 'stone', 'iron', 'influence'];
const statusResources: ResourceKey[] = ['population', 'army', 'stability', 'prosperity', 'threat', 'technology'];

function formatNumber(value: number) {
  return Math.floor(value).toLocaleString('ru-RU');
}

export function CountryPanel({
  kingdoms,
  regions,
  holdings,
  armies,
  selectedKingdomId,
  selectedRegionId,
  controlledKingdomId,
  onSelectKingdom,
  onSelectRegion,
  onOpenHolding,
}: CountryPanelProps) {
  const selectedKingdom = kingdoms.find((kingdom) => kingdom.id === selectedKingdomId) ?? kingdoms[0];
  const controlledKingdom = kingdoms.find((kingdom) => kingdom.id === controlledKingdomId) ?? selectedKingdom;
  const selectedAssets = selectedKingdom ? KINGDOM_ASSETS[selectedKingdom.id as keyof typeof KINGDOM_ASSETS] : undefined;
  const selectedRegions = selectedKingdom ? regions.filter((region) => region.kingdomId === selectedKingdom.id) : [];
  const selectedRegion = regions.find((region) => region.id === selectedRegionId) ?? selectedRegions[0];
  const selectedRegionHoldings = selectedRegion ? holdings.filter((holding) => holding.regionId === selectedRegion.id) : [];
  const army = armies.find((item) => item.kingdomId === selectedKingdom?.id);

  return (
    <aside className="left-column">
      <section className="ornate-panel kingdom-card-panel">
        {selectedKingdom && selectedAssets && (
          <>
            <div className="rule-banner">
              <span>{selectedKingdom.id === controlledKingdom?.id ? 'Вы правите' : 'Осмотр державы'}</span>
              <strong>{selectedKingdom.id === controlledKingdom?.id ? selectedKingdom.name : controlledKingdom?.name}</strong>
            </div>
            <div className="kingdom-card-art" style={{ backgroundImage: `url(${selectedAssets.card})` }}>
              <span />
              <img src={selectedAssets.crest} alt="" />
            </div>
            <div className="kingdom-title-row">
              <div>
                <strong>{selectedKingdom.name}</strong>
                <span>{selectedKingdom.title}</span>
              </div>
              <img src={selectedAssets.ruler} alt="" />
            </div>
            <div className="ruler-card">
              <img src={selectedAssets.ruler} alt="" />
              <div>
                <span>Правитель</span>
                <strong>{selectedKingdom.ruler}</strong>
                <small>{selectedKingdom.policies.taxation} taxes · {selectedKingdom.policies.military} doctrine</small>
              </div>
            </div>
            <p className="motto">"{selectedKingdom.motto}"</p>
            <div className="trait-row">
              {selectedKingdom.traits.map((trait) => (
                <span key={trait}>{trait}</span>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="ornate-panel">
        <div className="panel-heading compact">
          <img src="/assets/ui/icon-summary.png" alt="" />
          <strong>Державы</strong>
        </div>
        <div className="kingdom-list">
          {kingdoms.map((kingdom) => {
            const assets = KINGDOM_ASSETS[kingdom.id as keyof typeof KINGDOM_ASSETS];
            return (
              <button
                className={kingdom.id === selectedKingdom?.id ? 'kingdom-row kingdom-row-active' : 'kingdom-row'}
                key={kingdom.id}
                onClick={() => onSelectKingdom(kingdom.id)}
              >
                <img src={assets.crest} alt="" />
                <span>
                  <strong>{kingdom.name}</strong>
                  <small>{kingdom.id === controlledKingdom?.id ? 'ваша держава' : kingdom.ruler}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {selectedKingdom && (
        <section className="ornate-panel">
          <div className="panel-heading compact">
            <img src="/assets/ui/icon-economy.png" alt="" />
            <strong>Казна и запас</strong>
          </div>
          <div className="resource-grid dense">
            {primaryResources.map((resource) => (
              <div className="resource-cell" key={resource}>
                <img src={RESOURCE_ICONS[resource]} alt="" />
                <span>{RESOURCE_LABELS[resource]}</span>
                <strong>{formatNumber(selectedKingdom.resources[resource])}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedKingdom && (
        <section className="ornate-panel">
          <div className="panel-heading compact">
            <img src="/assets/ui/icon-regions.png" alt="" />
            <strong>Домены</strong>
          </div>
          <div className="domain-list">
            {selectedRegions.map((region) => (
              <button
                className={region.id === selectedRegion?.id ? 'domain-row domain-row-active' : 'domain-row'}
                key={region.id}
                onClick={() => onSelectRegion(region.id)}
              >
                <span>
                  <strong>{region.name}</strong>
                  <small>{region.terrain} · контроль {Math.floor(region.control)}%</small>
                </span>
                <b>{region.fortLevel}</b>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedRegion && (
        <section className="ornate-panel">
          <div className="panel-heading compact">
            <img src="/assets/ui/icon-buildings.png" alt="" />
            <strong>{selectedRegion.name}</strong>
          </div>
          <div className="region-stats">
            <span>Развитие <b>{Math.floor(selectedRegion.development)}</b></span>
            <span>Контроль <b>{Math.floor(selectedRegion.control)}%</b></span>
            <span>Форт <b>{selectedRegion.fortLevel}</b></span>
          </div>
          <div className="holding-list">
            {selectedRegionHoldings.map((holding) => (
              <button className="holding-row" key={holding.id} onClick={() => onOpenHolding(holding.id)}>
                <strong>{holding.name}</strong>
                <span>{holding.kind} · {holding.buildings.length} построек · гарнизон {holding.garrison}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedKingdom && (
        <section className="ornate-panel">
          <div className="panel-heading compact">
            <img src="/assets/ui/icon-army.png" alt="" />
            <strong>Состояние державы</strong>
          </div>
          <div className="resource-grid dense">
            {statusResources.map((resource) => (
              <div className="resource-cell" key={resource}>
                <img src={RESOURCE_ICONS[resource]} alt="" />
                <span>{RESOURCE_LABELS[resource]}</span>
                <strong>{formatNumber(selectedKingdom.resources[resource])}</strong>
              </div>
            ))}
          </div>
          {army && (
            <div className="army-strip">
              <span>{army.name}</span>
              <b>{Math.floor(army.strength)} / мораль {Math.floor(army.morale)}%</b>
            </div>
          )}
        </section>
      )}
    </aside>
  );
}
