import { useCallback, useEffect, useMemo, useState } from 'react';
import { BootScreen } from './components/BootScreen';
import { CastleScene } from './components/CastleScene';
import { CommandPanel } from './components/CommandPanel';
import { CountryPanel } from './components/CountryPanel';
import { EventLog } from './components/EventLog';
import { WorldMap } from './components/WorldMap';
import { socket } from './services/socket';
import type { BuildRequest, PlayerMode, PlayerProfile, ResourceKey, WorldState } from './types';
import { RESOURCE_ICONS, RESOURCE_LABELS } from './types';

type AppMode = 'boot' | 'world' | 'castle';

const topResources: ResourceKey[] = ['gold', 'food', 'wood', 'stone', 'iron', 'influence', 'army'];

function App() {
  const [mode, setMode] = useState<AppMode>('boot');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [world, setWorld] = useState<WorldState | null>(null);
  const [selectedKingdomId, setSelectedKingdomId] = useState<string | undefined>();
  const [controlledKingdomId, setControlledKingdomId] = useState<string | undefined>();
  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>();
  const [selectedHoldingId, setSelectedHoldingId] = useState<string | undefined>();
  const [serverStatus, setServerStatus] = useState<'offline' | 'connecting' | 'online'>('offline');
  const [notice, setNotice] = useState<string>('');
  const [playerMode, setPlayerMode] = useState<PlayerMode>('player');

  const selectedKingdom = useMemo(
    () => world?.kingdoms.find((kingdom) => kingdom.id === selectedKingdomId),
    [selectedKingdomId, world?.kingdoms],
  );
  const selectedRegion = useMemo(
    () => world?.regions.find((region) => region.id === selectedRegionId),
    [selectedRegionId, world?.regions],
  );
  const selectedHolding = useMemo(
    () => world?.holdings.find((holding) => holding.id === selectedHoldingId),
    [selectedHoldingId, world?.holdings],
  );

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  }, []);

  useEffect(() => {
    function onConnect() {
      setServerStatus('online');
      if (profile) {
        socket.emit('player:join', profile);
      }
    }

    function onDisconnect() {
      setServerStatus('offline');
    }

    function onWorldState(nextWorld: WorldState) {
      setWorld(nextWorld);
    }

    function onRejected(payload: { reason: string }) {
      showNotice(payload.reason);
    }

    function onCountrySelected(payload: { kingdomId?: string; countryId?: string }) {
      const kingdomId = payload.kingdomId ?? payload.countryId;
      if (kingdomId) {
        setControlledKingdomId(kingdomId);
        setSelectedKingdomId(kingdomId);
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('world:state', onWorldState);
    socket.on('action:rejected', onRejected);
    socket.on('build:rejected', onRejected);
    socket.on('country:rejected', onRejected);
    socket.on('player:countrySelected', onCountrySelected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('world:state', onWorldState);
      socket.off('action:rejected', onRejected);
      socket.off('build:rejected', onRejected);
      socket.off('country:rejected', onRejected);
      socket.off('player:countrySelected', onCountrySelected);
    };
  }, [profile, showNotice]);

  useEffect(() => {
    if (!world || !selectedKingdomId) {
      return;
    }

    const kingdom = world.kingdoms.find((item) => item.id === selectedKingdomId);
    if (!kingdom) {
      return;
    }

    if (!selectedRegionId || !world.regions.some((region) => region.id === selectedRegionId)) {
      setSelectedRegionId(kingdom.capitalRegionId);
    }

    if (!selectedHoldingId || !world.holdings.some((holding) => holding.id === selectedHoldingId)) {
      const capitalRegion = world.regions.find((region) => region.id === kingdom.capitalRegionId);
      const firstHolding = world.holdings.find((holding) => holding.regionId === capitalRegion?.id);
      setSelectedHoldingId(firstHolding?.id);
    }
  }, [selectedHoldingId, selectedKingdomId, selectedRegionId, world]);

  const sendAction = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    socket.emit('world:action', { type, payload });
  }, []);

  const enterGame = useCallback((nextProfile: PlayerProfile) => {
    setProfile(nextProfile);
    setMode('world');
    setServerStatus('connecting');
    setPlayerMode(nextProfile.mode);
    setControlledKingdomId(nextProfile.selectedKingdomId);
    setSelectedKingdomId(nextProfile.selectedKingdomId);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('player:join', nextProfile);
    socket.emit('kingdom:select', { kingdomId: nextProfile.selectedKingdomId });
  }, []);

  const selectKingdom = useCallback((kingdomId: string) => {
    if (playerMode === 'admin') {
      setControlledKingdomId(kingdomId);
      setSelectedKingdomId(kingdomId);
      socket.emit('kingdom:select', { kingdomId });
      return;
    }

    if (kingdomId === controlledKingdomId) {
      setSelectedKingdomId(kingdomId);
    }
  }, [controlledKingdomId, playerMode]);

  const selectRegion = useCallback((regionId: string) => {
    setSelectedRegionId(regionId);
    const holding = world?.holdings.find((item) => item.regionId === regionId);
    if (holding) {
      setSelectedHoldingId(holding.id);
    }
  }, [world?.holdings]);

  const openHolding = useCallback((holdingId: string) => {
    const holding = world?.holdings.find((item) => item.id === holdingId);
    if (holding) {
      setSelectedHoldingId(holdingId);
      setSelectedRegionId(holding.regionId);
      if (playerMode !== 'admin' && holding.kingdomId !== controlledKingdomId) {
        showNotice('Чужое владение выбрано как цель. Открыть строительство можно только в своей державе.');
        return;
      }
      if (playerMode === 'admin') {
        setSelectedKingdomId(holding.kingdomId);
        setControlledKingdomId(holding.kingdomId);
        socket.emit('kingdom:select', { kingdomId: holding.kingdomId });
      }
    }
    setMode('castle');
  }, [controlledKingdomId, playerMode, showNotice, world?.holdings]);

  const build = useCallback((request: BuildRequest) => {
    const holdingId = request.holdingId ?? request.castleId ?? selectedHoldingId;
    if (!holdingId) {
      showNotice('Владение не выбрано.');
      return;
    }

    sendAction('holding:build', {
      holdingId,
      type: request.type,
      x: request.x,
      z: request.z,
      rotation: request.rotation,
    });
  }, [selectedHoldingId, sendAction, showNotice]);

  const toggleMode = useCallback(() => {
    const nextMode: PlayerMode = playerMode === 'admin' ? 'player' : 'admin';
    setPlayerMode(nextMode);
    setProfile((current) => current ? { ...current, mode: nextMode } : current);
    socket.emit('player:setMode', { mode: nextMode });
  }, [playerMode]);

  if (mode === 'boot' || !profile) {
    return <BootScreen onComplete={enterGame} />;
  }

  if (!world) {
    return (
      <main className="app loading-app">
        <div className="loading-panel">
          <img src="/assets/branding/logo-crown.png" alt="" />
          <strong>Подключение к миру...</strong>
          <span>{serverStatus === 'online' ? 'Ожидаем состояние кампании' : 'Сервер недоступен'}</span>
        </div>
      </main>
    );
  }

  if (mode === 'castle' && selectedHolding) {
    return (
      <main className="app castle-app">
        {notice && <div className="toast">{notice}</div>}
        <CastleScene
          castle={selectedHolding}
          country={selectedKingdom}
          buildingCatalog={world.buildingCatalog}
          onBack={() => setMode('world')}
          onBuild={build}
        />
      </main>
    );
  }

  return (
    <main className="app strategy-app">
      {notice && <div className="toast">{notice}</div>}

      <header className="topbar">
        <div className="brand-lockup">
          <img src="/assets/branding/logo-small.png" alt="MF.Game" />
          <span>{serverStatus === 'online' ? 'мир синхронизирован' : 'сервер недоступен'}</span>
        </div>

        <div className="top-resource-strip">
          {selectedKingdom && topResources.map((resource) => (
            <div className="top-resource" key={resource} title={RESOURCE_LABELS[resource]}>
              <img src={RESOURCE_ICONS[resource]} alt="" />
              <strong>{Math.floor(selectedKingdom.resources[resource]).toLocaleString('ru-RU')}</strong>
            </div>
          ))}
        </div>

        <div className="time-control">
          <button className="icon-button" onClick={() => sendAction('time:set', { paused: !world.time.paused })} title={world.time.paused ? 'Продолжить' : 'Пауза'}>
            <img src={world.time.paused ? '/assets/ui/icon-play.png' : '/assets/ui/icon-pause.png'} alt="" />
          </button>
          {[1, 2, 3].map((speed) => (
            <button
              className={world.time.speed === speed ? 'icon-button icon-button-active' : 'icon-button'}
              key={speed}
              onClick={() => sendAction('time:set', { speed })}
              title={`Скорость ${speed}`}
            >
              <img src={`/assets/ui/icon-speed-${speed}.png`} alt="" />
            </button>
          ))}
          <div className="date-box">
            <strong>День {world.time.day}</strong>
            <span>{world.time.season}, год {world.time.year}</span>
          </div>
          <button className={playerMode === 'admin' ? 'mode-button mode-button-admin' : 'mode-button'} onClick={toggleMode}>
            {playerMode === 'admin' ? 'Admin' : 'Player'}
          </button>
        </div>
      </header>

      <div className="strategy-layout">
        <CountryPanel
          kingdoms={world.kingdoms}
          regions={world.regions}
          holdings={world.holdings}
          armies={world.armies}
          selectedKingdomId={selectedKingdomId}
          selectedRegionId={selectedRegionId}
          onSelectKingdom={selectKingdom}
          onSelectRegion={selectRegion}
          onOpenHolding={openHolding}
        />

        <WorldMap
          mapState={world.map}
          kingdoms={world.kingdoms}
          regions={world.regions}
          holdings={world.holdings}
          selectedKingdomId={selectedKingdomId}
          selectedRegionId={selectedRegionId}
          selectedHoldingId={selectedHoldingId}
          onSelectKingdom={selectKingdom}
          onSelectRegion={selectRegion}
          onOpenHolding={openHolding}
        />

        <div className="right-stack">
          <CommandPanel
            world={world}
            selectedKingdom={selectedKingdom}
            selectedRegion={selectedRegion}
            selectedHolding={selectedHolding}
            adminMode={playerMode === 'admin'}
            onAction={(type, payload = {}) => sendAction(type, { kingdomId: controlledKingdomId, ...payload })}
            onOpenCastle={openHolding}
          />
          <EventLog events={world.events} kingdoms={world.kingdoms} selectedKingdomId={selectedKingdomId} />
        </div>
      </div>
    </main>
  );
}

export default App;
