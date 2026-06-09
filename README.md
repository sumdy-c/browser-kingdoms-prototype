# MF.Game — Browser Kingdoms MVP

Single-player MVP браузерной grand strategy / kingdom survival игры.

Вдохновение: Crusader Kings 3 по ощущению карты, регионов, законов и дипломатии; Stronghold Kingdoms по экономике, строительству, рынку и отправке ресурсов. Династий и полноценного мультиплеера пока нет, но backend уже держит авторитетное состояние мира и принимает действия через Socket.IO, чтобы позже добавить аккаунты, блокировки держав, рынок между игроками и дипломатические сделки.

## Текущий MVP

- React + TypeScript + Vite frontend
- Node.js + Express + Socket.IO backend
- painted global map из `public/assets/map/`
- 8 канонических держав: Riverland, Nordgard, Caldoria, Velund, Solaria, Dragonridge, Morven, Frostheim
- CK-like регионы и владения внутри держав
- стартовый onboarding: логотип, вступление, обучение и богатый экран выбора державы
- стратегический 2D-интерфейс: боковые панели, рабочие вкладки, компактные окна почты/событий/настроек
- карта с приближением, перетаскиванием и селектором текущего обзора на миникарте
- server-side tick, пауза и скорости 1/2/3
- экономика: золото, еда, дерево, камень, железо, влияние, технологии, население, армия, стабильность, процветание, угроза
- строительство во владениях и 2D-меню карточек построек
- AI-соседи: строят, набирают войска, иногда рейдят
- рынок: покупка/продажа ресурсов
- дипломатия: отношения, посольство, отправка караванов, торговые договоры с ежедневным эффектом
- аудиенции и письма правителей: события требуют ответа и отправляют игрока в нужный раздел
- военные команды: набор войск, чрезвычайное ополчение, рейд, патруль региона, укрепление региона
- решения правителя: праздник короны, финансирование исследований, налоговая и военная политика
- временный режим `Player/Admin` в интерфейсе

## Запуск

```bash
docker compose up --build
```

После запуска:

- frontend: http://localhost:5173
- backend health: http://localhost:3001/health

Если запускаешь без Docker, нужны Node.js и npm в `backend/` и `frontend/`.

## Карта и ассеты

GeoServer больше не нужен для MVP. Основная карта и слои берутся из:

```text
frontend/public/assets/map/world-map-painted.png
frontend/public/assets/map/world-map-borders.png
frontend/public/assets/map/world-map-labels.png
frontend/public/assets/map/world-map-minimap.png
frontend/public/assets/map/marker-*.png
```

Остальные игровые изображения лежат в:

```text
frontend/public/assets/backgrounds/
frontend/public/assets/branding/
frontend/public/assets/buildings/
frontend/public/assets/events/
frontend/public/assets/kingdoms/
frontend/public/assets/resources/
frontend/public/assets/ui/
```

README внутри папок ассетов оставлены как чеклисты и арт-дирекшен.

## Что ещё не включено

- регистрация и аккаунты
- сохранение мира после перезапуска
- настоящий рынок между игроками
- полноценная война с армиями на карте
- права владения/слоты для мультиплеера
- Postgres/PostGIS
- lang-паки
