# MF.Game — Browser Kingdoms Prototype

Pre-MVP браузерной grand strategy / CK-like игры:

- React + TypeScript + Vite frontend
- OpenLayers глобальная карта
- Babylon.js сцена замка
- Node.js + Express + Socket.IO backend
- server-side real-time tick
- псевдо-авторизация игрока
- выбор страны
- экономика страны
- события
- строительство домиков/ферм/складов/казарм/башен в 3D-замке
- GeoServer подключается как внешний ожидаемый сервис через env, но есть fallback GeoJSON

## Запуск

```bash
docker compose up --build
```

После запуска:

- frontend: http://localhost:5173
- backend health: http://localhost:3001/health

## GeoServer

В первом pre-MVP GeoServer **не поднимается** внутри `docker-compose.yml`.
Клиент уже подготовлен к внешнему GeoServer через переменные окружения:

```env
VITE_GEOSERVER_WFS_COUNTRIES_URL=
VITE_GEOSERVER_WFS_CASTLES_URL=
VITE_GEOSERVER_WMS_URL=
VITE_GEOSERVER_WMS_LAYER=
```

Пока они пустые, OpenLayers грузит локальные файлы:

```text
frontend/public/data/world.geojson
frontend/public/data/castles.geojson
```

Позже можно поднять GeoServer отдельно и подать WFS/WMS URL без переписывания карты.

## Игровая логика

Сервер каждые 5 секунд двигает игровой день:

- пересчитывает ресурсы стран;
- учитывает построенные здания;
- иногда создаёт случайные события;
- отправляет обновлённое состояние через Socket.IO.

Состояние хранится только в памяти. После перезапуска Docker мир сбрасывается.

## Что специально не включено в pre-MVP

- настоящая регистрация;
- реальный мультиплеер с блокировкой стран;
- боты;
- PostGIS;
- встроенный GeoServer;
- сохранение мира после рестарта;
- боёвка;
- WebGPU renderer.
