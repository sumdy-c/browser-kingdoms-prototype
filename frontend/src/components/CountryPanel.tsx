import { BUILDING_COSTS, BUILDING_LABELS, type BuildingType, type Castle, type Country, type GameTime } from '../types';

interface CountryPanelProps {
  countries: Country[];
  castles: Castle[];
  selectedCountryId?: string;
  time?: GameTime;
  onSelectCountry: (countryId: string) => void;
  onOpenCastle: (castleId: string) => void;
}

const resourceLabels = {
  gold: 'Золото',
  food: 'Еда',
  wood: 'Дерево',
  stone: 'Камень',
  population: 'Население',
};

const buildingTypes = Object.keys(BUILDING_LABELS) as BuildingType[];

export function CountryPanel({ countries, castles, selectedCountryId, time, onSelectCountry, onOpenCastle }: CountryPanelProps) {
  const selectedCountry = countries.find((country) => country.id === selectedCountryId);
  const selectedCastles = selectedCountry ? castles.filter((castle) => castle.countryId === selectedCountry.id) : [];

  return (
    <aside className="left-column">
      <section className="panel">
        <div className="panel-title">Время</div>
        <div className="time-box">
          <strong>День {time?.day ?? 1}</strong>
          <span>{time?.season ?? 'Весна'}, {time?.year ?? 1} год</span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Выбор страны</div>
        <div className="country-list">
          {countries.map((country) => (
            <button
              className={country.id === selectedCountryId ? 'country-button country-button-active' : 'country-button'}
              key={country.id}
              onClick={() => onSelectCountry(country.id)}
            >
              <span className="country-dot" style={{ backgroundColor: country.color }} />
              <span>{country.name}</span>
            </button>
          ))}
        </div>
      </section>

      {selectedCountry ? (
        <section className="panel country-card-large">
          <div className="panel-title">{selectedCountry.name}</div>
          <div className="country-capital">Столица: {selectedCountry.capital}</div>

          <div className="resource-grid">
            {Object.entries(selectedCountry.resources).map(([key, value]) => (
              <div className="resource-cell" key={key}>
                <span>{resourceLabels[key as keyof typeof resourceLabels]}</span>
                <strong>{Math.floor(value)}</strong>
              </div>
            ))}
          </div>

          <div className="sub-title">Замки</div>
          <div className="castle-list">
            {selectedCastles.map((castle) => (
              <button className="castle-button" key={castle.id} onClick={() => onOpenCastle(castle.id)}>
                <span>{castle.name}</span>
                <small>{castle.buildings.length} построек</small>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="panel muted-panel">
          Выбери страну на карте или в списке. Сейчас доступна любая страна, без блокировки слотов.
        </section>
      )}

      <section className="panel">
        <div className="panel-title">Стоимость построек</div>
        <div className="cost-list">
          {buildingTypes.map((type) => (
            <div className="cost-row" key={type}>
              <strong>{BUILDING_LABELS[type]}</strong>
              <span>
                {Object.entries(BUILDING_COSTS[type])
                  .map(([key, value]) => `${resourceLabels[key as keyof typeof resourceLabels]} ${value}`)
                  .join(' · ')}
              </span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
