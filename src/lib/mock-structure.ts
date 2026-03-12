import type { TimelineEvent } from "@/components/Timeline";

export function structureTestimony(text: string): TimelineEvent[] {
  if (!text.trim()) return [];

  // Mock structured output — in a real app this would call an AI API
  const mockEvents: TimelineEvent[] = [
    {
      date: "March 3, 2024",
      time: "Morning",
      description:
        "Initial incident occurred. The situation began when unexpected changes were announced without prior notice to those affected.",
      people: ["Alex Thompson", "Jordan Rivera"],
    },
    {
      date: "March 5, 2024",
      time: "2:30 PM",
      description:
        "A meeting was held to discuss the changes. Several concerns were raised but were not adequately addressed by those in charge.",
      people: ["Alex Thompson", "Casey Morgan", "Dr. Patel"],
    },
    {
      date: "March 10, 2024",
      time: "Evening",
      description:
        "Follow-up communications were sent via email. The tone was dismissive and failed to acknowledge the gravity of what had been reported.",
      people: ["Jordan Rivera"],
    },
    {
      date: "March 15, 2024",
      description:
        "Formal documentation was filed. Witnesses provided supporting statements corroborating the initial account of events.",
      people: ["Casey Morgan", "Sam Chen", "Taylor Brooks"],
    },
    {
      date: "March 22, 2024",
      time: "10:00 AM",
      description:
        "Review process was initiated. An independent party was brought in to evaluate the situation and recommend next steps.",
      people: ["Dr. Patel", "External Review Board"],
    },
  ];

  return mockEvents;
}
