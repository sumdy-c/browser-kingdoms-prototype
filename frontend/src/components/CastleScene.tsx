import { useMemo, useState } from 'react';
import type { BuildRequest, BuildingCatalogItem, BuildingType, Castle, CoreResourceKey, Country, ResourceKey, Resources } from '../types';
import {
  BUILDING_ASSETS,
  BUILDING_LABELS,
  BUILDING_PREVIEWS,
  RESOURCE_ICONS,
  RESOURCE_LABELS,
} from '../types';

interface CastleSceneProps {
  castle: Castle;
  country?: Country;
  buildingCatalog: Record<BuildingType, BuildingCatalogItem>;
  onBack: () => void;
  onBuild: (request: BuildRequest) => void;
}

const buildingOrder: BuildingType[] = [
  'house',
  'farm',
  'lumberyard',
  'quarry',
  'warehouse',
  'market',
  'barracks',
  'archeryRange',
  'watchtower',
];

const resourceOrder: ResourceKey[] = ['gold', 'food', 'wood', 'stone', 'iron', 'influence', 'population', 'army'];

const categoryLabels: Record<string, string> = {
  defense: 'Оборона',
  food: 'Еда',
  logistics: 'Логистика',
  military: 'Армия',
  production: 'Производство',
  settlement: 'Поселение',
  trade: 'Торговля',
};

const buildingDescriptions: Record<BuildingType, string> = {
  house: 'Увеличивает население и даёт основу для роста владения.',
  farm: 'Кормит людей, поддерживает гарнизон и стабилизирует провинцию.',
  lumberyard: 'Даёт дерево для дальнейшей стройки и ремонта укреплений.',
  quarry: 'Добывает камень для стен, складов и тяжёлой инфраструктуры.',
  warehouse: 'Расширяет строительный лимит и повышает устойчивость запасов.',
  market: 'Усиливает денежный поток и торговое влияние владения.',
  barracks: 'Готовит пехоту и укрепляет военное присутствие.',
  archeryRange: 'Усиливает армию лучниками и подготовленными ополченцами.',
  watchtower: 'Снижает угрозу, повышает контроль и помогает пережить набеги.',
};

const holdingKindLabels: Record<Castle['kind'], string> = {
  capital: 'Столица',
  castle: 'Замок',
  city: 'Город',
  farm: 'Фермы',
  mine: 'Рудники',
  forest: 'Леса',
};

function formatNumber(value: number) {
  return Math.floor(value).toLocaleString('ru-RU');
}

function canAfford(resources: Resources | undefined, cost: Partial<Record<CoreResourceKey, number>>) {
  if (!resources) {
    return false;
  }

  return Object.entries(cost).every(([key, value]) => resources[key as CoreResourceKey] >= (value ?? 0));
}

function formatSigned(value: number) {
  return `${value > 0 ? '+' : ''}${value}`;
}

function formatList<T extends string>(
  values: Partial<Record<T, number>> | undefined,
  labels: Record<T, string>,
  icons?: Partial<Record<T, string>>,
) {
  if (!values) {
    return [];
  }

  return Object.entries(values)
    .filter(([, value]) => typeof value === 'number' && value !== 0)
    .map(([key, value]) => ({
      key,
      label: labels[key as T],
      icon: icons?.[key as T],
      value: value as number,
    }));
}

function getBuildingCount(castle: Castle, type: BuildingType) {
  return castle.buildings.filter((building) => building.type === type).length;
}

export function CastleScene({ castle, country, buildingCatalog, onBack, onBuild }: CastleSceneProps) {
  const [selectedType, setSelectedType] = useState<BuildingType>('house');
  const selectedCatalog = buildingCatalog[selectedType];
  const activeAndQueued = castle.buildings.length + castle.constructionQueue.length;
  const buildLimit = country?.resources.buildLimit ?? 0;
  const slotsLeft = Math.max(0, buildLimit - activeAndQueued);
  const selectedAffordable = canAfford(country?.resources, selectedCatalog.cost);
  const canQueueSelected = selectedAffordable && slotsLeft > 0;

  const activeByType = useMemo(() => (
    buildingOrder
      .map((type) => ({ type, count: getBuildingCount(castle, type), catalog: buildingCatalog[type] }))
      .filter((item) => item.count > 0)
  ), [buildingCatalog, castle]);

  const queueByType = useMemo(() => (
    castle.constructionQueue.map((building) => ({
      ...building,
      catalog: buildingCatalog[building.type],
    }))
  ), [buildingCatalog, castle.constructionQueue]);

  const buildSelected = () => {
    if (!canQueueSelected) {
      return;
    }

    onBuild({
      holdingId: castle.id,
      castleId: castle.id,
      type: selectedType,
    });
  };

  return (
    <div className="castle-2d-screen">
      <header className="castle-2d-topbar">
        <button className="castle-back-button" onClick={onBack}>
          <img src="/assets/ui/icon-back.png" alt="" />
          На карту
        </button>

        <div className="castle-title-block">
          <span>{country?.name ?? 'Нейтральное владение'}</span>
          <strong>{castle.name}</strong>
          <small>{holdingKindLabels[castle.kind]} · гарнизон {formatNumber(castle.garrison)}</small>
        </div>

        <div className="castle-capacity">
          <span>Строительный лимит</span>
          <strong>{activeAndQueued} / {buildLimit}</strong>
          <small>{slotsLeft > 0 ? `свободно ${slotsLeft}` : 'лимит достигнут'}</small>
        </div>
      </header>

      <section className="castle-resource-strip">
        {country && resourceOrder.map((resource) => (
          <div className="castle-resource-chip" key={resource}>
            <img src={RESOURCE_ICONS[resource]} alt="" />
            <span>{RESOURCE_LABELS[resource]}</span>
            <strong>{formatNumber(country.resources[resource])}</strong>
          </div>
        ))}
      </section>

      <main className="castle-2d-layout">
        <aside className="castle-status-panel">
          <section className="castle-focus-card">
            <img src={BUILDING_PREVIEWS[selectedType]} alt="" />
            <span className="castle-focus-shade" />
            <div className="castle-focus-content">
              <img src={BUILDING_ASSETS[selectedType]} alt="" />
              <div>
                <span>{categoryLabels[selectedCatalog.category] ?? selectedCatalog.category}</span>
                <strong>{BUILDING_LABELS[selectedType]}</strong>
                <small>{selectedCatalog.buildDays} дн. строительства</small>
              </div>
            </div>
          </section>

          <section className="castle-detail-card">
            <p>{buildingDescriptions[selectedType]}</p>

            <div className="castle-detail-group">
              <strong>Стоимость</strong>
              <ResourcePills values={selectedCatalog.cost} signed={false} />
            </div>

            <div className="castle-detail-group">
              <strong>Эффект</strong>
              <ResourcePills values={selectedCatalog.effects} signed />
            </div>

            {selectedCatalog.maintenance && (
              <div className="castle-detail-group">
                <strong>Содержание</strong>
                <ResourcePills values={selectedCatalog.maintenance} signed />
              </div>
            )}

            <button
              className="castle-build-now"
              disabled={!canQueueSelected}
              onClick={buildSelected}
            >
              <img src="/assets/ui/icon-buildings.png" alt="" />
              {slotsLeft <= 0 ? 'Лимит построек' : selectedAffordable ? 'Поставить в очередь' : 'Недостаточно ресурсов'}
            </button>
          </section>

          <section className="castle-queue-panel">
            <div className="castle-section-heading">
              <strong>Очередь строительства</strong>
              <span>{castle.constructionQueue.length}</span>
            </div>

            <div className="castle-queue-list">
              {queueByType.length === 0 ? (
                <div className="castle-empty-state">Очередь свободна</div>
              ) : (
                queueByType.map((building) => (
                  <div className="castle-queue-row" key={building.id}>
                    <img src={BUILDING_ASSETS[building.type]} alt="" />
                    <span>
                      <strong>{BUILDING_LABELS[building.type]}</strong>
                      <small>
                        {categoryLabels[building.catalog.category] ?? building.catalog.category}
                        {' · осталось '}
                        {building.remainingDays} дн.
                      </small>
                    </span>
                    <b>{building.remainingDays}</b>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>

        <section className="castle-catalog-panel">
          <div className="castle-section-heading catalog-heading">
            <div>
              <strong>Постройки владения</strong>
              <span>Выберите карточку и поставьте здание в очередь</span>
            </div>
            <b>{castle.buildings.length} активно</b>
          </div>

          <div className="castle-building-grid">
            {buildingOrder.map((type) => {
              const catalog = buildingCatalog[type];
              const affordable = canAfford(country?.resources, catalog.cost);
              const selected = selectedType === type;
              const count = getBuildingCount(castle, type);
              const blocked = !affordable || slotsLeft <= 0;

              return (
                <button
                  className={[
                    'castle-building-card',
                    selected ? 'castle-building-card-selected' : '',
                    blocked ? 'castle-building-card-blocked' : '',
                  ].filter(Boolean).join(' ')}
                  key={type}
                  onClick={() => setSelectedType(type)}
                >
                  <img className="castle-building-preview" src={BUILDING_PREVIEWS[type]} alt="" />
                  <span className="castle-building-shade" />
                  <span className="castle-building-count">{count > 0 ? `x${count}` : 'новое'}</span>

                  <span className="castle-building-info">
                    <img src={BUILDING_ASSETS[type]} alt="" />
                    <span>
                      <small>{categoryLabels[catalog.category] ?? catalog.category}</small>
                      <strong>{BUILDING_LABELS[type]}</strong>
                    </span>
                  </span>

                  <span className="castle-building-meta">
                    <span>{catalog.buildDays} дн.</span>
                    <span>{affordable ? 'доступно' : 'мало ресурсов'}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="castle-built-panel">
          <div className="castle-section-heading">
            <strong>Уже построено</strong>
            <span>{castle.buildings.length}</span>
          </div>

          <div className="castle-built-list">
            {activeByType.length === 0 ? (
              <div className="castle-empty-state">Построек пока нет</div>
            ) : (
              activeByType.map(({ type, count, catalog }) => (
                <article className="castle-built-row" key={type}>
                  <img src={BUILDING_ASSETS[type]} alt="" />
                  <div>
                    <strong>{BUILDING_LABELS[type]}</strong>
                    <span>{categoryLabels[catalog.category] ?? catalog.category} · x{count}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function ResourcePills({
  values,
  signed,
}: {
  values: Partial<Record<ResourceKey | CoreResourceKey, number>>;
  signed: boolean;
}) {
  const pills = formatList(values, RESOURCE_LABELS, RESOURCE_ICONS);

  if (!pills.length) {
    return <span className="castle-muted">нет</span>;
  }

  return (
    <div className="castle-resource-pills">
      {pills.map((item) => (
        <span className={item.value < 0 ? 'castle-pill castle-pill-negative' : 'castle-pill'} key={item.key}>
          {item.icon && <img src={item.icon} alt="" />}
          {item.label} {signed ? formatSigned(item.value) : item.value}
        </span>
      ))}
    </div>
  );
}
