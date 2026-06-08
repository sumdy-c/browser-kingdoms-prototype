import { useCallback, useEffect, useMemo, useState } from 'react';
import { BootScreen } from './components/BootScreen';
import { CastleScene } from './components/CastleScene';
import { CountryPanel } from './components/CountryPanel';
import { EventLog } from './components/EventLog';
import { WorldMap } from './components/WorldMap';
import { socket } from './services/socket';
import type { BuildRequest, PlayerProfile, WorldState } from './types';

type AppMode = 'boot' | 'world' | 'castle';

function App() {
  const [mode, setMode] = useState<AppMode>('boot');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [world, setWorld] = useState<WorldState | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>();
  const [selectedCastleId, setSelectedCastleId] = useState<string | undefined>();
  const [serverStatus, setServerStatus] = useState<'offline' | 'connecting' | 'online'>('offline');
  const [notice, setNotice] = useState<string>('');

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

    function onBuildRejected(payload: { reason: string }) {
      setNotice(payload.reason);
      window.setTimeout(() => setNotice(''), 2200);
    }

    function onCountrySelected(payload: { countryId: string }) {
      setSelectedCountryId(payload.countryId);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('world:state', onWorldState);
    socket.on('build:rejected', onBuildRejected);
    socket.on('player:countrySelected', onCountrySelected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('world:state', onWorldState);
      socket.off('build:rejected', onBuildRejected);
      socket.off('player:countrySelected', onCountrySelected);
    };
  }, [profile]);

  const enterGame = useCallback((nextProfile: PlayerProfile) => {
    setProfile(nextProfile);
    setMode('world');
    setServerStatus('connecting');

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('player:join', nextProfile);
  }, []);

  const selectCountry = useCallback((countryId: string) => {
    setSelectedCountryId(countryId);
    setProfile((current) => current ? { ...current, selectedCountryId: countryId } : current);
    socket.emit('country:select', { countryId });
  }, []);

  const openCastle = useCallback((castleId: string) => {
    const castle = world?.castles.find((item) => item.id === castleId);
    if (castle) {
      setSelectedCountryId(castle.countryId);
      socket.emit('country:select', { countryId: castle.countryId });
    }
    setSelectedCastleId(castleId);
    setMode('castle');
  }, [world?.castles]);

  const build = useCallback((request: BuildRequest) => {
    socket.emit('castle:build', request);
  }, []);

  const selectedCastle = useMemo(() => world?.castles.find((castle) => castle.id === selectedCastleId), [selectedCastleId, world?.castles]);
  const selectedCountry = useMemo(() => world?.countries.find((country) => country.id === selectedCountryId), [selectedCountryId, world?.countries]);

  if (mode === 'boot' || !profile) {
    return <BootScreen onComplete={enterGame} />;
  }

  if (mode === 'castle' && selectedCastle) {
    return (
      <main className="app">
        {notice && <div className="toast">{notice}</div>}
        <CastleScene castle={selectedCastle} country={selectedCountry} onBack={() => setMode('world')} onBuild={build} />
      </main>
    );
  }

  return (
    <main className="app">
      {notice && <div className="toast">{notice}</div>}

      <header className="topbar">
        <div>
          <div className="app-title">MF.Game Kingdoms</div>
          <div className="app-subtitle">pre-MVP браузерной grand strategy</div>
        </div>
        <div className="session-box">
          <span className={serverStatus === 'online' ? 'status-dot status-online' : 'status-dot'} />
          <div>
            <strong>{profile.nickname}</strong>
            <span>{serverStatus === 'online' ? 'сервер подключен' : 'сервер недоступен'}</span>
          </div>
        </div>
      </header>

      <div className="main-layout">
        <CountryPanel
          countries={world?.countries ?? []}
          castles={world?.castles ?? []}
          selectedCountryId={selectedCountryId}
          time={world?.time}
          onSelectCountry={selectCountry}
          onOpenCastle={openCastle}
        />

        <WorldMap
          countries={world?.countries ?? []}
          castles={world?.castles ?? []}
          selectedCountryId={selectedCountryId}
          selectedCastleId={selectedCastleId}
          onSelectCountry={selectCountry}
          onOpenCastle={openCastle}
        />

        <EventLog events={world?.events ?? []} />
      </div>
    </main>
  );
}

export default App;
