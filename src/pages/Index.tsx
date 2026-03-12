import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Timeline, { type TimelineEvent } from "@/components/Timeline";
import { structureTestimony } from "@/lib/mock-structure";
import { Loader2, Feather } from "lucide-react";

const Index = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);

  const handleStructure = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setEvents(null);

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 2200));

    const result = structureTestimony(text);
    setEvents(result);
    setIsLoading(false);
  };

  const handleReset = () => {
    setEvents(null);
    setText("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Feather className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl text-foreground tracking-tight">
              ClearPath
            </h1>
          </div>
        </header>

        {!events ? (
          /* Writing Phase */
          <div className="space-y-8 animate-fade-in-up">
            <p className="text-center text-muted-foreground font-body text-lg leading-relaxed max-w-md mx-auto">
              Take your time. Share what you remember, in whatever order it
              comes to you.
            </p>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Begin writing here..."
              className="min-h-[280px] resize-none bg-card/60 border-border/50 text-foreground placeholder:text-muted-foreground/50 font-body text-base leading-relaxed p-5 rounded-xl focus:ring-primary/30 focus:border-primary/40 transition-all duration-300"
            />

            <div className="flex justify-center">
              <Button
                variant="calm"
                size="lg"
                onClick={handleStructure}
                disabled={!text.trim() || isLoading}
                className="px-8 py-6 text-base rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="animate-pulse-gentle">
                      Structuring your testimony…
                    </span>
                  </>
                ) : (
                  "Structure My Testimony"
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Results Phase */
          <div className="space-y-8">
            <div className="text-center animate-fade-in-up">
              <h2 className="font-display text-2xl text-foreground mb-2">
                Your Structured Timeline
              </h2>
              <p className="text-muted-foreground text-sm font-body">
                Events organized chronologically from your account
              </p>
            </div>

            <Timeline events={events} />

            <div className="flex justify-center pt-4 animate-fade-in-up animate-fade-in-up-delay-5">
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-xl"
              >
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
