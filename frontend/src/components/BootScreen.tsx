import { useMemo, useState } from 'react';
import type { PlayerProfile } from '../types';
import { KINGDOM_ASSETS } from '../types';

interface BootScreenProps {
  onComplete: (profile: PlayerProfile) => void;
}

const startingKingdoms = [
  { id: 'riverland', name: 'Riverland', note: 'торговля, еда, стабильный старт' },
  { id: 'nordgard', name: 'Nordgard', note: 'армия, лес, суровый север' },
  { id: 'caldoria', name: 'Caldoria', note: 'золото, рынок, богатые города' },
  { id: 'velund', name: 'Velund', note: 'леса, луки, сильная оборона' },
  { id: 'solaria', name: 'Solaria', note: 'влияние, вера, развитые земли' },
  { id: 'dragonridge', name: 'Dragonridge', note: 'железо, крепости, рейды' },
  { id: 'morven', name: 'Morven', note: 'порты, риск, быстрые налёты' },
  { id: 'frostheim', name: 'Frostheim', note: 'камень, лёд, прочная защита' },
] as const;

export function BootScreen({ onComplete }: BootScreenProps) {
  const [selectedKingdomId, setSelectedKingdomId] = useState<(typeof startingKingdoms)[number]['id']>('riverland');
  const nickname = useMemo(() => `Founder${Math.floor(1000 + Math.random() * 8999)}`, []);

  const selectedKingdom = startingKingdoms.find((kingdom) => kingdom.id === selectedKingdomId) ?? startingKingdoms[0];

  return (
    <main className="boot-screen">
      <div className="boot-background" />
      <section className="boot-hero">
        <img className="boot-logo-image" src="/assets/branding/logo-full.png" alt="MF.Game" />
        <div className="boot-copy">
          <strong>Single-player survival strategy MVP</strong>
          <span>Выбери державу. Мир будет жить, строиться, торговать и нападать даже без мультиплеера.</span>
        </div>
      </section>

      <section className="kingdom-picker">
        {startingKingdoms.map((kingdom) => {
          const assets = KINGDOM_ASSETS[kingdom.id];
          const selected = kingdom.id === selectedKingdomId;

          return (
            <button
              className={selected ? 'kingdom-pick kingdom-pick-active' : 'kingdom-pick'}
              key={kingdom.id}
              onClick={() => setSelectedKingdomId(kingdom.id)}
            >
              <img className="kingdom-pick-card" src={assets.card} alt="" />
              <span className="kingdom-pick-shade" />
              <img className="kingdom-pick-crest" src={assets.crest} alt="" />
              <strong>{kingdom.name}</strong>
              <small>{kingdom.note}</small>
            </button>
          );
        })}
      </section>

      <footer className="boot-footer">
        <div>
          <span>Профиль</span>
          <strong>{nickname}</strong>
        </div>
        <button
          className="gold-button"
          onClick={() =>
            onComplete({
              id: crypto.randomUUID(),
              nickname,
              role: 'ruler',
              mode: 'player',
              selectedKingdomId: selectedKingdom.id,
              selectedCountryId: selectedKingdom.id,
            })
          }
        >
          Начать за {selectedKingdom.name}
        </button>
      </footer>
    </main>
  );
}
