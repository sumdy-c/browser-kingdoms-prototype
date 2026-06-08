import type { GameEvent } from '../types';

interface EventLogProps {
  events: GameEvent[];
}

export function EventLog({ events }: EventLogProps) {
  return (
    <section className="panel event-log">
      <div className="panel-title">Журнал мира</div>
      <div className="event-list">
        {events.length === 0 ? (
          <div className="empty">Событий пока нет</div>
        ) : (
          events.slice(-10).reverse().map((event) => (
            <article className="event-card" key={event.id}>
              <div className="event-day">День {event.day}</div>
              <div className="event-title">{event.title}</div>
              <div className="event-description">{event.description}</div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
