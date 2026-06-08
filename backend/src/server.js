import http from 'node:http';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { advanceWorld, buildInCastle, createInitialWorld, getPublicSnapshot, selectCountry } from './world.js';

const port = Number(process.env.PORT ?? 3001);
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const tickMs = Number(process.env.TICK_MS ?? 5000);

const app = express();
app.use(cors({ origin: clientOrigin }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST'],
  },
});

const world = createInitialWorld(tickMs);

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'MF.Game backend',
    tickMs,
    day: world.time.day,
    onlinePlayers: world.players.size,
  });
});

app.get('/state', (_req, res) => {
  res.json(getPublicSnapshot(world));
});

io.on('connection', (socket) => {
  socket.emit('world:state', getPublicSnapshot(world));

  socket.on('player:join', (profile) => {
    world.players.set(socket.id, {
      id: profile?.id ?? socket.id,
      nickname: profile?.nickname ?? `Gamer${Math.floor(1000 + Math.random() * 8999)}`,
      role: profile?.role ?? 'king',
      selectedCountryId: profile?.selectedCountryId,
    });

    socket.emit('world:state', getPublicSnapshot(world));
    io.emit('world:presence', { onlinePlayers: world.players.size });
  });

  socket.on('country:select', (payload) => {
    const ok = selectCountry(world, socket.id, payload?.countryId);

    if (!ok) {
      socket.emit('country:rejected', { reason: 'Не удалось выбрать страну.' });
      return;
    }

    socket.emit('player:countrySelected', { countryId: payload.countryId });
    socket.emit('world:state', getPublicSnapshot(world));
  });

  socket.on('castle:build', (payload) => {
    const result = buildInCastle(world, socket.id, payload ?? {});

    if (!result.ok) {
      socket.emit('build:rejected', { reason: result.reason });
      return;
    }

    io.emit('world:state', getPublicSnapshot(world));
  });

  socket.on('disconnect', () => {
    world.players.delete(socket.id);
    io.emit('world:presence', { onlinePlayers: world.players.size });
    io.emit('world:state', getPublicSnapshot(world));
  });
});

setInterval(() => {
  advanceWorld(world);
  io.emit('world:state', getPublicSnapshot(world));
}, tickMs);

server.listen(port, () => {
  console.log(`MF.Game backend listening on http://localhost:${port}`);
});
