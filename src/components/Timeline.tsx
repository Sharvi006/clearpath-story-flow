import { Card, CardContent } from "@/components/ui/card";

export interface TimelineEvent {
  date: string;
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
      <div className="absolute left-3 top-2 bottom-2 w-px timeline-line" />

      <div className="space-y-5">
        {events.map((event, index) => (
          <div
            key={index}
            className={`relative animate-fade-in-up animate-fade-in-up-delay-${Math.min(index + 1, 5)}`}
          >
            {/* Dot */}
            <div className="absolute -left-5 top-5 w-2.5 h-2.5 rounded-full timeline-dot" />

            <Card className="border-border/40 bg-card/70 backdrop-blur-sm shadow-none hover:bg-card/90 transition-colors duration-300 rounded-2xl">
              <CardContent className="p-5">
                <span className="font-display text-sm font-semibold text-foreground tracking-wide">
                  {event.date}
                </span>

                <p className="text-foreground/85 leading-relaxed mt-2 mb-3 font-body text-sm">
                  {event.description}
                </p>

                {event.people.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {event.people.map((person, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/60 text-accent-foreground"
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
