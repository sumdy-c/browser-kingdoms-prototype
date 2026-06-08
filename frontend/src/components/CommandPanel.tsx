import { useMemo, useState } from 'react';
import type { BuildingType, Holding, Kingdom, Region, WorldState } from '../types';
import {
  BUILDING_ASSETS,
  BUILDING_LABELS,
  BUILDING_PREVIEWS,
  RESOURCE_ICONS,
  RESOURCE_LABELS,
  type CoreResourceKey,
} from '../types';

interface CommandPanelProps {
  world: WorldState;
  selectedKingdom?: Kingdom;
  selectedRegion?: Region;
  selectedHolding?: Holding;
  adminMode: boolean;
  onAction: (type: string, payload?: Record<string, unknown>) => void;
  onOpenCastle: (holdingId: string) => void;
}

type TabId = 'summary' | 'buildings' | 'market' | 'diplomacy' | 'army' | 'laws';
type MarketResource = 'food' | 'wood' | 'stone' | 'iron';

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'summary', label: 'Сводка', icon: '/assets/ui/icon-summary.png' },
  { id: 'buildings', label: 'Стройка', icon: '/assets/ui/icon-buildings.png' },
  { id: 'market', label: 'Рынок', icon: '/assets/ui/icon-economy.png' },
  { id: 'diplomacy', label: 'Дипломатия', icon: '/assets/ui/icon-diplomacy.png' },
  { id: 'army', label: 'Армия', icon: '/assets/ui/icon-army.png' },
  { id: 'laws', label: 'Законы', icon: '/assets/ui/icon-laws.png' },
];

const marketResources: MarketResource[] = ['food', 'wood', 'stone', 'iron'];
const buildOrder: BuildingType[] = ['house', 'farm', 'lumberyard', 'quarry', 'warehouse', 'market', 'barracks', 'archeryRange', 'watchtower'];

function formatNumber(value: number) {
  return Math.floor(value).toLocaleString('ru-RU');
}

function canAfford(kingdom: Kingdom | undefined, cost: Partial<Record<CoreResourceKey, number>>) {
  if (!kingdom) {
    return false;
  }

  return Object.entries(cost).every(([key, value]) => kingdom.resources[key as CoreResourceKey] >= (value ?? 0));
}

function formatCost(cost: Partial<Record<CoreResourceKey, number>>) {
  return Object.entries(cost)
    .map(([key, value]) => `${RESOURCE_LABELS[key as CoreResourceKey]} ${value}`)
    .join(' · ');
}

export function CommandPanel({ world, selectedKingdom, selectedRegion, selectedHolding, adminMode, onAction, onOpenCastle }: CommandPanelProps) {
  const [tab, setTab] = useState<TabId>('summary');
  const enemyRegions = useMemo(
    () => world.regions.filter((region) => selectedKingdom && region.kingdomId !== selectedKingdom.id),
    [selectedKingdom, world.regions],
  );
  const targetRegion = selectedRegion && selectedKingdom && selectedRegion.kingdomId !== selectedKingdom.id
    ? selectedRegion
    : enemyRegions[0];

  return (
    <aside className="right-column">
      <section className="ornate-panel command-panel">
        <div className="tab-bar">
          {tabs.map((item) => (
            <button className={tab === item.id ? 'tab-button tab-button-active' : 'tab-button'} key={item.id} onClick={() => setTab(item.id)}>
              <img src={item.icon} alt="" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {!selectedKingdom ? (
          <div className="empty-state">Выберите державу на карте или слева.</div>
        ) : (
          <>
            {tab === 'summary' && (
              <div className="command-section">
                <div className="section-title">Оперативная сводка</div>
                <div className="summary-metrics">
                  <Metric icon="/assets/resources/income.png" label="Казна" value={formatNumber(selectedKingdom.resources.gold)} />
                  <Metric icon="/assets/resources/stability.png" label="Стабильность" value={`${Math.floor(selectedKingdom.resources.stability)}%`} />
                  <Metric icon="/assets/resources/threat.png" label="Угроза" value={`${Math.floor(selectedKingdom.resources.threat)}%`} />
                  <Metric icon="/assets/resources/army.png" label="Армия" value={formatNumber(selectedKingdom.resources.army)} />
                </div>
                {selectedRegion && (
                  <div className="selected-card">
                    <strong>{selectedRegion.name}</strong>
                    <span>{selectedRegion.terrain} · развитие {Math.floor(selectedRegion.development)} · контроль {Math.floor(selectedRegion.control)}%</span>
                  </div>
                )}
                {selectedHolding && (
                  <div className="selected-card selected-card-art">
                    <div>
                      <strong>{selectedHolding.name}</strong>
                      <span>{selectedHolding.kind} · гарнизон {selectedHolding.garrison}</span>
                    </div>
                    <button className="dark-button" onClick={() => onOpenCastle(selectedHolding.id)}>Открыть замок</button>
                  </div>
                )}
                <div className="future-actions">
                  <button className="ghost-action">
                    <img src="/assets/ui/icon-mail.png" alt="" />
                    <span>Почта</span>
                  </button>
                  <button className="ghost-action">
                    <img src="/assets/resources/trade.png" alt="" />
                    <span>Отправить ресурсы</span>
                  </button>
                  <button className="ghost-action">
                    <img src="/assets/ui/icon-settings.png" alt="" />
                    <span>{adminMode ? 'Admin mode' : 'Player mode'}</span>
                  </button>
                </div>
              </div>
            )}

            {tab === 'buildings' && (
              <div className="command-section">
                <div className="section-title">Строительство</div>
                {!selectedHolding ? (
                  <div className="empty-state">Выберите владение на карте или в списке доменов.</div>
                ) : (
                  <>
                    <div className="selected-card">
                      <strong>{selectedHolding.name}</strong>
                      <span>
                        Активно {selectedHolding.buildings.length}, очередь {selectedHolding.constructionQueue.length}, лимит {selectedKingdom.resources.buildLimit}
                      </span>
                    </div>
                    <div className="build-grid">
                      {buildOrder.map((type) => {
                        const item = world.buildingCatalog[type];
                        const affordable = canAfford(selectedKingdom, item.cost);
                        return (
                          <button
                            className={affordable ? 'build-card' : 'build-card build-card-disabled'}
                            key={type}
                            onClick={() => onAction('holding:build', { holdingId: selectedHolding.id, type })}
                          >
                            <img className="build-card-preview" src={BUILDING_PREVIEWS[type]} alt="" />
                            <span className="build-card-shade" />
                            <img className="build-card-icon" src={BUILDING_ASSETS[type]} alt="" />
                            <strong>{BUILDING_LABELS[type]}</strong>
                            <small>{formatCost(item.cost)}</small>
                            {!affordable && <b>мало ресурсов</b>}
                          </button>
                        );
                      })}
                    </div>
                    {selectedHolding.constructionQueue.length > 0 && (
                      <div className="queue-list">
                        {selectedHolding.constructionQueue.map((building) => (
                          <div className="queue-row" key={building.id}>
                            <span>{BUILDING_LABELS[building.type]}</span>
                            <b>{building.remainingDays} дн.</b>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {tab === 'market' && (
              <div className="command-section">
                <div className="section-title">Королевский рынок</div>
                <div className="market-list">
                  {marketResources.map((resource) => (
                    <div className="market-row" key={resource}>
                      <img src={RESOURCE_ICONS[resource]} alt="" />
                      <div>
                        <strong>{RESOURCE_LABELS[resource]}</strong>
                        <span>Цена: {world.market.prices[resource].toFixed(1)} золота · запас {formatNumber(selectedKingdom.resources[resource])}</span>
                      </div>
                      <button onClick={() => onAction('market:trade', { kingdomId: selectedKingdom.id, resource, direction: 'buy', amount: 50 })}>Купить</button>
                      <button onClick={() => onAction('market:trade', { kingdomId: selectedKingdom.id, resource, direction: 'sell', amount: 50 })}>Продать</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'diplomacy' && (
              <div className="command-section">
                <div className="section-title">Дипломатия</div>
                <div className="relation-list">
                  {world.kingdoms.filter((kingdom) => kingdom.id !== selectedKingdom.id).map((kingdom) => {
                    const relation = world.diplomacy.relations[selectedKingdom.id]?.[kingdom.id] ?? 50;
                    return (
                      <div className="relation-row" key={kingdom.id}>
                        <span>
                          <strong>{kingdom.name}</strong>
                          <small>отношения {Math.floor(relation)}</small>
                        </span>
                        <meter min={0} max={100} value={relation} />
                        <button onClick={() => onAction('diplomacy:improveRelations', { fromKingdomId: selectedKingdom.id, toKingdomId: kingdom.id })}>Посольство</button>
                        <button onClick={() => onAction('diplomacy:sendResources', { fromKingdomId: selectedKingdom.id, toKingdomId: kingdom.id, resource: 'food', amount: 50 })}>Караван</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === 'army' && (
              <div className="command-section">
                <div className="section-title">Военный совет</div>
                <div className="army-action-grid">
                  <button className="large-action" onClick={() => onAction('army:recruit', { kingdomId: selectedKingdom.id })}>
                    <img src="/assets/ui/icon-army.png" alt="" />
                    <span>
                      <strong>Набрать войска</strong>
                      <small>65 золота · 45 еды · 18 железа</small>
                    </span>
                  </button>
                  {targetRegion && (
                    <button className="large-action danger-action" onClick={() => onAction('army:raid', { kingdomId: selectedKingdom.id, targetRegionId: targetRegion.id })}>
                      <img src="/assets/events/event-army.png" alt="" />
                      <span>
                        <strong>Рейд на {targetRegion.name}</strong>
                        <small>{world.kingdoms.find((kingdom) => kingdom.id === targetRegion.kingdomId)?.name}</small>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {tab === 'laws' && (
              <div className="command-section">
                <div className="section-title">Законы и фокусы</div>
                <PolicyGroup
                  title="Налоги"
                  policy="taxation"
                  value={selectedKingdom.policies.taxation}
                  options={[
                    ['low', 'Низкие'],
                    ['balanced', 'Баланс'],
                    ['war', 'Военные'],
                  ]}
                  onAction={(value) => onAction('policy:set', { kingdomId: selectedKingdom.id, policy: 'taxation', value })}
                />
                <PolicyGroup
                  title="Военная доктрина"
                  policy="military"
                  value={selectedKingdom.policies.military}
                  options={[
                    ['defensive', 'Оборона'],
                    ['levies', 'Ополчение'],
                    ['raiders', 'Рейды'],
                  ]}
                  onAction={(value) => onAction('policy:set', { kingdomId: selectedKingdom.id, policy: 'military', value })}
                />
                <PolicyGroup
                  title="Исследования"
                  policy="research"
                  value={selectedKingdom.policies.research}
                  options={[
                    ['stewardship', 'Управление'],
                    ['engineering', 'Инженерия'],
                    ['military', 'Война'],
                  ]}
                  onAction={(value) => onAction('policy:set', { kingdomId: selectedKingdom.id, policy: 'research', value })}
                />
              </div>
            )}
          </>
        )}
      </section>
    </aside>
  );
}

function Metric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="metric-card">
      <img src={icon} alt="" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PolicyGroup({
  title,
  value,
  options,
  onAction,
}: {
  title: string;
  policy: string;
  value: string;
  options: Array<[string, string]>;
  onAction: (value: string) => void;
}) {
  return (
    <div className="policy-group">
      <strong>{title}</strong>
      <div className="policy-options">
        {options.map(([optionValue, label]) => (
          <button className={value === optionValue ? 'policy-button policy-button-active' : 'policy-button'} key={optionValue} onClick={() => onAction(optionValue)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
