import type { TimelineEvent } from "@/components/Timeline";

export function structureTestimony(_text: string): TimelineEvent[] {
  const mockEvents: TimelineEvent[] = [
    {
      date: "Monday, Oct 12 (Morning)",
      description:
        "I was at the coffee shop with Sarah. Everything seemed normal.",
      people: ["Sarah"],
    },
    {
      date: "Tuesday, Oct 13 (Evening)",
      description:
        "He arrived at the apartment unannounced. An argument started in the hallway.",
      people: ["John Doe"],
    },
    {
      date: "Tuesday, Oct 13 (Late Night)",
      description:
        "The neighbors called the police. Officer Smith took my statement.",
      people: ["John Doe", "Officer Smith", "Neighbors"],
    },
  ];

  return mockEvents;
}
