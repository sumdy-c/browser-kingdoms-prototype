import type { GameEvent, Kingdom } from '../types';

interface EventLogProps {
  events: GameEvent[];
  kingdoms: Kingdom[];
  selectedKingdomId?: string;
}

const eventIcons: Record<string, string> = {
  trade: '/assets/events/event-trade.png',
  harvest: '/assets/events/event-harvest.png',
  bandits: '/assets/events/event-bandits.png',
  research: '/assets/events/event-research.png',
  diplomacy: '/assets/events/event-diplomacy.png',
  army: '/assets/events/event-army.png',
  construction: '/assets/events/event-construction.png',
  warning: '/assets/events/event-warning.png',
  success: '/assets/events/event-success.png',
  scroll: '/assets/events/event-scroll.png',
};

export function EventLog({ events, kingdoms, selectedKingdomId }: EventLogProps) {
  const visibleEvents = events
    .filter((event) => !selectedKingdomId || event.scope === 'world' || !event.kingdomId || event.kingdomId === selectedKingdomId)
    .slice(-12)
    .reverse();

  return (
    <section className="ornate-panel event-log">
      <div className="panel-heading">
        <img src="/assets/ui/icon-bell.png" alt="" />
        <div>
          <strong>Хроника мира</strong>
          <span>Последние события кампании</span>
        </div>
      </div>

      <div className="event-list">
        {visibleEvents.length === 0 ? (
          <div className="empty-state">Событий пока нет</div>
        ) : (
          visibleEvents.map((event) => {
            const kingdom = kingdoms.find((item) => item.id === event.kingdomId);
            return (
              <article className="event-card" key={event.id}>
                <img src={eventIcons[event.category] ?? eventIcons.scroll} alt="" />
                <div>
                  <div className="event-meta">
                    <span>День {event.day}</span>
                    {kingdom && <span style={{ color: kingdom.accent }}>{kingdom.name}</span>}
                  </div>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
