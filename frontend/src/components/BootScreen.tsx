import { useMemo, useState, type CSSProperties } from 'react';
import type { PlayerProfile, ResourceKey } from '../types';
import { KINGDOM_ASSETS, RESOURCE_ICONS } from '../types';

interface BootScreenProps {
  onComplete: (profile: PlayerProfile) => void;
}

type BootStage = 'intro' | 'briefing' | 'factions';
type FactionId = keyof typeof KINGDOM_ASSETS;

interface FactionProfile {
  id: FactionId;
  name: string;
  realm: string;
  ruler: string;
  rulerTitle: string;
  difficulty: string;
  temperament: string;
  opening: string;
  doctrine: string;
  promise: string;
  quote: string;
  accent: string;
  tags: string[];
  strengths: string[];
  risks: string[];
  firstOrders: string[];
  resources: Array<{ key: ResourceKey; value: string; label: string }>;
}

const factionProfiles: FactionProfile[] = [
  {
    id: 'riverland',
    name: 'Риверланд',
    realm: 'Королевство рек и хлебных долин',
    ruler: 'Queen Elayne of Crownwater',
    rulerTitle: 'королева переправ и плодородных берегов',
    difficulty: 'Уверенный старт',
    temperament: 'торговля · еда · стабильность',
    opening: 'Речные города кормят материк, а мосты Риверланда связывают север, юг и восточные рынки. Корона богата не роскошью, а потоком зерна, пошлин и верных вассалов.',
    doctrine: 'Держите контроль в Crownwater, стройте рынки и склады, покупайте железо до первой войны.',
    promise: 'Самый понятный старт для знакомства с экономикой, дипломатией и строительством.',
    quote: 'Реки не спорят с камнем. Они просто находят путь.',
    accent: '#89c9ff',
    tags: ['Еда', 'Торговля', 'Дипломатия'],
    strengths: ['много еды и населения', 'сильные торговые решения', 'стабильная казна в длинной партии'],
    risks: ['центр карты легко втягивает в чужие войны', 'железа меньше, чем хочется', 'важно держать контроль регионов'],
    firstOrders: ['улучшить отношения с Кальдорией', 'поставить склад в столице', 'провести патруль Crownwater'],
    resources: [
      { key: 'gold', value: '420', label: 'казна' },
      { key: 'food', value: '520', label: 'амбары' },
      { key: 'population', value: '860', label: 'население' },
      { key: 'stability', value: '74%', label: 'порядок' },
    ],
  },
  {
    id: 'nordgard',
    name: 'Нордгард',
    realm: 'Ярлство волчьих фьордов',
    ruler: 'Jarl Hakon Greywolf',
    rulerTitle: 'ярл зимних дружин',
    difficulty: 'Военный старт',
    temperament: 'лес · железо · дружины',
    opening: 'Нордгард беднее южных домов, зато его люди не ломаются от зимы. Деревянные гавани, железные рудники и суровая честь дают раннюю силу на границе.',
    doctrine: 'Ставьте оборонительную доктрину, укрепляйте фьорды и выбирайте рейды только после набора.',
    promise: 'Для игрока, который хочет чувствовать давление границ с первых дней.',
    quote: 'Лёд учит терпеть. Меч учит помнить.',
    accent: '#d8dce4',
    tags: ['Армия', 'Лес', 'Рейды'],
    strengths: ['сильная армия на старте', 'лес и железо для обороны', 'удобный выход в рейды'],
    risks: ['еда слабее юга', 'процветание растёт медленно', 'мирные договоры требуют вложений'],
    firstOrders: ['укрепить Wolfharbor', 'поставить лесопилку', 'набрать войска до первого рейда'],
    resources: [
      { key: 'army', value: '210', label: 'дружина' },
      { key: 'wood', value: '430', label: 'лес' },
      { key: 'stone', value: '360', label: 'камень' },
      { key: 'threat', value: '26%', label: 'угроза' },
    ],
  },
  {
    id: 'caldoria',
    name: 'Кальдория',
    realm: 'Мраморная торговая республика',
    ruler: 'Doge Aurelio Valcrest',
    rulerTitle: 'дож банковских домов',
    difficulty: 'Богатый старт',
    temperament: 'золото · рынки · гавани',
    opening: 'Кальдория считает монеты быстрее, чем соседи считают копья. Её города держат южные гавани, а каждое соглашение превращается в пошлину.',
    doctrine: 'Подписывайте торговые договоры, покупайте дерево и не давайте Морвену превратить море в угрозу.',
    promise: 'Лучший старт для игрока, который хочет управлять рынком и дипломатией.',
    quote: 'Закон стоит дорого. Поэтому мы умеем его продавать.',
    accent: '#f7c46a',
    tags: ['Золото', 'Рынок', 'Договоры'],
    strengths: ['самая сильная казна', 'высокое процветание', 'быстрые торговые договоры'],
    risks: ['армия уступает северу', 'портовые угрозы быстро бьют по доходу', 'строительство требует дерева'],
    firstOrders: ['заключить договор с Риверландом', 'купить дерево на рынке', 'профинансировать исследования'],
    resources: [
      { key: 'gold', value: '620', label: 'казна' },
      { key: 'prosperity', value: '86%', label: 'богатство' },
      { key: 'influence', value: '84', label: 'влияние' },
      { key: 'technology', value: '52', label: 'архивы' },
    ],
  },
  {
    id: 'velund',
    name: 'Велунд',
    realm: 'Конкорд древних рощ',
    ruler: 'High Warden Maera Vel',
    rulerTitle: 'верховная хранительница рощ',
    difficulty: 'Оборонительный старт',
    temperament: 'леса · контроль · лучники',
    opening: 'Велунд слушает леса старше любой короны. Дороги здесь исчезают под ветвями, а договоры держатся на клятвах, которые трудно нарушить без последствий.',
    doctrine: 'Играйте от контроля территории, сторожевых башен и аккуратных союзов.',
    promise: 'Спокойный, но глубокий старт через оборону, ресурсы и контроль угрозы.',
    quote: 'Кто спешит в лес, тот оставляет имя у первого дерева.',
    accent: '#9ecb88',
    tags: ['Оборона', 'Лес', 'Контроль'],
    strengths: ['много дерева', 'низкая угроза', 'хорошая стабильность'],
    risks: ['золото не бесконечно', 'технологии нужно разгонять решениями', 'рейды требуют подготовки'],
    firstOrders: ['поставить сторожевую башню', 'провести патруль', 'искать пакт о ненападении'],
    resources: [
      { key: 'wood', value: '560', label: 'леса' },
      { key: 'stability', value: '78%', label: 'порядок' },
      { key: 'army', value: '165', label: 'стража' },
      { key: 'threat', value: '15%', label: 'угроза' },
    ],
  },
  {
    id: 'solaria',
    name: 'Солария',
    realm: 'Теократия солнечного престола',
    ruler: 'Hierarch Cassian Sol',
    rulerTitle: 'иерарх сияющего закона',
    difficulty: 'Политический старт',
    temperament: 'влияние · вера · порядок',
    opening: 'Солария правит дорогами, храмами и обещанием единого закона. Здесь решения двора звучат громче монет, а вера способна держать людей спокойнее гарнизона.',
    doctrine: 'Используйте влияние, ускоряйте исследования и превращайте стабильность в долгий экономический рост.',
    promise: 'Для игрока, который любит законы, влияние и мягкую силу.',
    quote: 'Свет не спорит с тенью. Он требует места.',
    accent: '#ffe08a',
    tags: ['Влияние', 'Законы', 'Исследования'],
    strengths: ['высокое влияние', 'развитые земли', 'сильная стабильность'],
    risks: ['камень и дерево требуют внимания', 'угрозу нельзя игнорировать', 'рейды дорого обходятся репутации'],
    firstOrders: ['провести праздник короны', 'выбрать инженерный фокус', 'подписать торговый договор'],
    resources: [
      { key: 'influence', value: '92', label: 'влияние' },
      { key: 'population', value: '850', label: 'люди' },
      { key: 'prosperity', value: '78%', label: 'процветание' },
      { key: 'technology', value: '48', label: 'учение' },
    ],
  },
  {
    id: 'dragonridge',
    name: 'Драконья гряда',
    realm: 'Горные крепости и кузни',
    ruler: 'Lord Marshal Kael Draven',
    rulerTitle: 'маршал пепельных перевалов',
    difficulty: 'Суровый старт',
    temperament: 'железо · камень · крепости',
    opening: 'Гряда не просит мира. Она строит стены, плавит железо и встречает чужие армии там, где дороги становятся узкими и дорогими.',
    doctrine: 'Укрепляйте регионы, держите угрозу под контролем и превращайте железо в превосходство армии.',
    promise: 'Жёсткий старт для тех, кто любит крепости и военную экономику.',
    quote: 'Камень не отступает. Он ждёт, пока у врага кончится дыхание.',
    accent: '#ff9a68',
    tags: ['Крепости', 'Железо', 'Война'],
    strengths: ['много железа и камня', 'высокая армия', 'сильная защита регионов'],
    risks: ['высокая угроза', 'стабильность ниже средней', 'рынок нужен с первых дней'],
    firstOrders: ['укрепить столичный регион', 'купить еду', 'перейти к оборонной доктрине'],
    resources: [
      { key: 'iron', value: '240', label: 'железо' },
      { key: 'stone', value: '520', label: 'камень' },
      { key: 'army', value: '245', label: 'легионы' },
      { key: 'threat', value: '34%', label: 'угроза' },
    ],
  },
  {
    id: 'morven',
    name: 'Морвен',
    realm: 'Штормовая береговая лига',
    ruler: 'Admiral Rhosyn Vale',
    rulerTitle: 'адмирал чёрных гаваней',
    difficulty: 'Рискованный старт',
    temperament: 'порты · налёты · гибкость',
    opening: 'Морвен живёт там, где море спорит с берегом. Его капитаны богатеют на скорости, слухах и караванах, которые не всегда доходят до адресата.',
    doctrine: 'Стабилизируйте угрозу, используйте рынок и выбирайте рейды как инструмент, а не привычку.',
    promise: 'Нервный и яркий старт для игрока, который любит риск и быстрые решения.',
    quote: 'Шторм честнее двора. Он хотя бы сразу показывает зубы.',
    accent: '#79d0d8',
    tags: ['Порты', 'Рейды', 'Рынок'],
    strengths: ['хорошая армия', 'гибкая экономика', 'удобные цели для рейдов'],
    risks: ['высокая угроза', 'низкая стабильность', 'соседи быстро настораживаются'],
    firstOrders: ['провести патруль', 'продать лишний ресурс', 'улучшить отношения с Кальдорией'],
    resources: [
      { key: 'army', value: '185', label: 'флотилии' },
      { key: 'wood', value: '350', label: 'снасти' },
      { key: 'stability', value: '58%', label: 'порядок' },
      { key: 'threat', value: '38%', label: 'угроза' },
    ],
  },
  {
    id: 'frostheim',
    name: 'Фростхейм',
    realm: 'Ледяная корона кристальных шахт',
    ruler: 'Queen Isolde Frostveil',
    rulerTitle: 'королева ледниковых залов',
    difficulty: 'Техничный старт',
    temperament: 'камень · ледники · технологии',
    opening: 'Фростхейм далеко от мягких земель, но его ледники скрывают шахты, архивы и крепости, которые переживают чужие амбиции.',
    doctrine: 'Развивайте технологии, укрепляйте столицу и не позволяйте Драконьей гряде диктовать границу.',
    promise: 'Для игрока, который любит прочный рост, исследования и холодную оборону.',
    quote: 'Лёд хранит всё. Даже ошибки соседей.',
    accent: '#a7d8ff',
    tags: ['Технологии', 'Камень', 'Оборона'],
    strengths: ['сильные технологии', 'много камня и железа', 'хорошая стабильность'],
    risks: ['еда слабая', 'мало населения', 'нужны торговые связи'],
    firstOrders: ['профинансировать исследования', 'заключить пакт с Нордгардом', 'построить рынок или склад'],
    resources: [
      { key: 'technology', value: '50', label: 'кристаллы' },
      { key: 'stone', value: '430', label: 'камень' },
      { key: 'army', value: '205', label: 'гвардия' },
      { key: 'food', value: '270', label: 'запасы' },
    ],
  },
];

const briefingCards = [
  {
    icon: '/assets/ui/icon-map.png',
    title: 'Вы правите державой',
    text: 'Карта живёт по дням: регионы дают доход, контроль меняется, соседи строят, торгуют и реагируют на ваши решения.',
  },
  {
    icon: RESOURCE_ICONS.gold,
    title: 'Экономика держит корону',
    text: 'Золото, еда, дерево, камень и железо питают строительство, рынок, армию и чрезвычайные решения двора.',
  },
  {
    icon: '/assets/ui/icon-diplomacy.png',
    title: 'Двор отвечает письмами',
    text: 'Правители присылают аудиенции. Если событие требует выбора, новое не перекроет его, пока вы не ответите.',
  },
  {
    icon: '/assets/ui/icon-army.png',
    title: 'Война начинается с приказа',
    text: 'Набирайте войска, укрепляйте регионы, патрулируйте дороги и выбирайте рейды только там, где выгода выше риска.',
  },
];

const campaignLessons = [
  'Выберите державу по стилю, а не только по цифрам.',
  'Первый день лучше потратить на обзор казны, угрозы и дипломатии.',
  'Если угроза растёт, патруль дешевле пожара в столице.',
  'Договоры работают каждый день, поэтому ранняя дипломатия окупается.',
];

function createPlayerId() {
  return crypto.randomUUID?.() ?? `player-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [stage, setStage] = useState<BootStage>('intro');
  const [briefingComplete, setBriefingComplete] = useState(false);
  const [selectedFactionId, setSelectedFactionId] = useState<FactionId>('riverland');
  const nickname = useMemo(() => `Founder${Math.floor(1000 + Math.random() * 8999)}`, []);
  const selectedFaction = factionProfiles.find((faction) => faction.id === selectedFactionId) ?? factionProfiles[0];
  const selectedAssets = KINGDOM_ASSETS[selectedFaction.id];

  const openFactions = () => {
    setBriefingComplete(true);
    setStage('factions');
  };

  const complete = () => {
    onComplete({
      id: createPlayerId(),
      nickname,
      role: 'ruler',
      mode: 'player',
      selectedKingdomId: selectedFaction.id,
      selectedCountryId: selectedFaction.id,
    });
  };

  return (
    <main className={`boot-screen boot-stage-${stage}`}>
      <div className="boot-background" />

      <header className="boot-topline">
        <img src="/assets/branding/logo-full.png" alt="MF.Game" />
        <nav className="boot-progress" aria-label="Старт кампании">
          <button className={stage === 'intro' ? 'boot-progress-active' : ''} onClick={() => setStage('intro')}>
            <span>01</span>
            Вступление
          </button>
          <button className={stage === 'briefing' ? 'boot-progress-active' : ''} onClick={() => setStage('briefing')}>
            <span>02</span>
            Обучение
          </button>
          <button
            className={stage === 'factions' ? 'boot-progress-active' : ''}
            disabled={!briefingComplete && stage !== 'factions'}
            onClick={openFactions}
          >
            <span>03</span>
            Корона
          </button>
        </nav>
      </header>

      {stage === 'intro' && (
        <section className="boot-intro">
          <div className="boot-intro-copy">
            <img className="boot-crown-mark" src="/assets/branding/logo-crown.png" alt="" />
            <span className="boot-kicker">single-player kingdom survival</span>
            <h1>Восемь корон проснулись на одном острове.</h1>
            <p>
              MF.Game начинается не с меню, а с трона. Вы наследуете державу, где каждый день приносит налоги,
              голод, письма соседей, стройки, угрозы на дорогах и решения, за которые отвечает корона.
            </p>
            <div className="boot-intro-actions">
              <button className="boot-gold-action" onClick={() => setStage('briefing')}>
                <img src="/assets/ui/icon-forward.png" alt="" />
                Войти в хронику
              </button>
            </div>
          </div>

          <aside className="boot-world-panel">
            <img src="/assets/map/world-map-minimap.png" alt="" />
            <div>
              <strong>Остров восьми престолов</strong>
              <span>Карта уже живёт: AI строит, рынок меняет цены, события приходят в журнал.</span>
            </div>
          </aside>
        </section>
      )}

      {stage === 'briefing' && (
        <section className="boot-briefing">
          <div className="boot-briefing-head">
            <span className="boot-kicker">перед выбором державы</span>
            <h1>Что это за игра</h1>
            <p>
              Это MVP браузерной grand strategy про выживание королевства. Здесь важно не кликнуть быстрее,
              а понять, какой долгий порядок вы строите: богатый рынок, крепкую армию, сеть договоров или
              спокойные земли с высокой стабильностью.
            </p>
          </div>

          <div className="boot-briefing-grid">
            {briefingCards.map((card) => (
              <article className="boot-briefing-card" key={card.title}>
                <img src={card.icon} alt="" />
                <strong>{card.title}</strong>
                <p>{card.text}</p>
              </article>
            ))}
          </div>

          <div className="boot-lessons">
            {campaignLessons.map((lesson, index) => (
              <article key={lesson}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <span>{lesson}</span>
              </article>
            ))}
          </div>

          <footer className="boot-stage-actions">
            <button className="boot-dark-action" onClick={() => setStage('intro')}>
              <img src="/assets/ui/icon-back.png" alt="" />
              Назад
            </button>
            <button className="boot-gold-action" onClick={openFactions}>
              <img src="/assets/ui/icon-check.png" alt="" />
              Перейти к выбору державы
            </button>
          </footer>
        </section>
      )}

      {stage === 'factions' && (
        <section className="boot-factions">
          <aside className="boot-faction-rail">
            <div className="boot-faction-rail-head">
              <span className="boot-kicker">выбор державы</span>
              <strong>Кому достанется ваша первая корона?</strong>
            </div>

            <div className="boot-faction-list">
              {factionProfiles.map((faction) => {
                const assets = KINGDOM_ASSETS[faction.id];
                const selected = faction.id === selectedFaction.id;

                return (
                  <button
                    className={selected ? 'boot-faction-row boot-faction-row-active' : 'boot-faction-row'}
                    key={faction.id}
                    onClick={() => setSelectedFactionId(faction.id)}
                    style={{ '--faction-accent': faction.accent } as CSSProperties}
                  >
                    <img src={assets.crest} alt="" />
                    <span>
                      <strong>{faction.name}</strong>
                      <small>{faction.temperament}</small>
                    </span>
                    <b>{faction.difficulty}</b>
                  </button>
                );
              })}
            </div>
          </aside>

          <section
            className="boot-faction-showcase"
            key={selectedFaction.id}
            style={{ '--faction-accent': selectedFaction.accent } as CSSProperties}
          >
            <div className="boot-faction-art">
              <img className="boot-faction-card-art" src={selectedAssets.card} alt="" />
              <span className="boot-faction-art-shade" />
              <img className="boot-faction-ruler" src={selectedAssets.ruler} alt="" />
              <img className="boot-faction-crest-large" src={selectedAssets.crest} alt="" />
              <div className="boot-faction-title">
                <span>{selectedFaction.realm}</span>
                <h1>{selectedFaction.name}</h1>
                <p>{selectedFaction.promise}</p>
              </div>
            </div>

            <div className="boot-faction-details">
              <section className="boot-ruler-card">
                <span>Правитель</span>
                <strong>{selectedFaction.ruler}</strong>
                <small>{selectedFaction.rulerTitle}</small>
                <p>{selectedFaction.quote}</p>
              </section>

              <section className="boot-faction-text">
                <span className="boot-kicker">{selectedFaction.difficulty}</span>
                <p>{selectedFaction.opening}</p>
                <strong>{selectedFaction.doctrine}</strong>
                <div className="boot-faction-tags">
                  {selectedFaction.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </section>

              <section className="boot-resource-strip">
                {selectedFaction.resources.map((resource) => (
                  <article key={resource.key}>
                    <img src={RESOURCE_ICONS[resource.key]} alt="" />
                    <span>{resource.label}</span>
                    <strong>{resource.value}</strong>
                  </article>
                ))}
              </section>

              <section className="boot-faction-lists">
                <div>
                  <strong>Сильные стороны</strong>
                  {selectedFaction.strengths.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div>
                  <strong>Риски</strong>
                  {selectedFaction.risks.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div>
                  <strong>Первые приказы</strong>
                  {selectedFaction.firstOrders.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </section>
            </div>
          </section>

          <footer className="boot-coronation">
            <div>
              <span>Профиль кампании</span>
              <strong>{nickname}</strong>
              <small>режим игрока · одиночный MVP · сервер подключится после выбора</small>
            </div>
            <button className="boot-dark-action" onClick={() => setStage('briefing')}>
              <img src="/assets/ui/icon-back.png" alt="" />
              Обучение
            </button>
            <button className="boot-gold-action" onClick={complete}>
              <img src={selectedAssets.crest} alt="" />
              Принять корону {selectedFaction.name}
            </button>
          </footer>
        </section>
      )}
    </main>
  );
}
