import { Card, CardContent } from "@/components/ui/card";

export interface TimelineEvent {
  date: string;
  time?: string;
  description: string;
  people: string[];
}

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline = ({ events }: TimelineProps) => {
  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-3 top-2 bottom-2 w-0.5 timeline-line rounded-full" />

      <div className="space-y-6">
        {events.map((event, index) => (
          <div
            key={index}
            className={`relative animate-fade-in-up animate-fade-in-up-delay-${Math.min(index + 1, 5)}`}
          >
            {/* Dot */}
            <div className="absolute -left-5 top-4 w-3 h-3 rounded-full timeline-dot" />

            <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display text-sm font-semibold text-foreground">
                    {event.date}
                  </span>
                  {event.time && (
                    <span className="text-xs text-muted-foreground">
                      {event.time}
                    </span>
                  )}
                </div>

                <p className="text-foreground/90 leading-relaxed mb-3 font-body text-sm">
                  {event.description}
                </p>

                {event.people.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {event.people.map((person, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      >
                        {person}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
