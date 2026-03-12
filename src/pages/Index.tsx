import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Timeline, { type TimelineEvent } from "@/components/Timeline";
import { structureTestimony } from "@/lib/mock-structure";
import { Loader2, Leaf, FileDown } from "lucide-react";
import botanicalFlowers from "@/assets/botanical-flowers.png";
import botanicalBranches from "@/assets/botanical-branches.png";

const Index = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);

  const handleStructure = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setEvents(null);

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Botanical flowers - top right */}
      <img
        src={botanicalFlowers}
        alt=""
        aria-hidden="true"
        className="absolute -top-10 -right-16 w-72 md:w-96 opacity-[0.18] pointer-events-none select-none animate-float"
      />

      {/* Botanical branches - bottom left */}
      <img
        src={botanicalBranches}
        alt=""
        aria-hidden="true"
        className="absolute -bottom-8 -left-12 w-56 md:w-72 opacity-[0.12] pointer-events-none select-none"
      />

      {/* Small flower accent - mid right on timeline */}
      <img
        src={botanicalFlowers}
        alt=""
        aria-hidden="true"
        className="absolute top-1/2 -right-20 w-48 opacity-[0.08] pointer-events-none select-none rotate-180"
      />

      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 relative z-10">
        {/* Header */}
        <header className="text-center mb-14 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <Leaf className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h1 className="font-display text-4xl text-foreground tracking-tight font-medium">
              Solace
            </h1>
          </div>
        </header>

        {!events ? (
          /* Input Phase */
          <div className="space-y-8 animate-fade-in-up">
            <p className="text-center text-muted-foreground font-body text-lg leading-relaxed max-w-md mx-auto font-normal">
              Take your time. Share what you remember, in whatever order it
              comes to you.
            </p>

            <div className="relative">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Begin writing here..."
                className="min-h-[300px] resize-none bg-card/40 border-2 border-foreground/50 text-foreground placeholder:text-muted-foreground/40 font-body text-base leading-relaxed p-6 rounded-2xl focus:ring-primary/20 focus:border-foreground/70 transition-all duration-300 relative z-10"
              />
            </div>

            <div className="flex justify-center">
              <Button
                variant="calm"
                size="lg"
                onClick={handleStructure}
                disabled={!text.trim() || isLoading}
                className="px-8 py-6 text-base rounded-2xl font-body font-normal tracking-wide"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="animate-pulse-gentle">
                      Structuring your timeline…
                    </span>
                  </>
                ) : (
                  "Structure My Timeline"
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Results Phase */
          <div className="space-y-8">
            <div className="text-center animate-fade-in-up">
              <h2 className="font-display text-2xl text-foreground mb-2 font-medium">
                Your Structured Timeline
              </h2>
              <p className="text-muted-foreground text-sm font-body font-normal">
                Events organized chronologically from your account
              </p>
            </div>

            <div className="relative">
              <div className="flex justify-end mb-4 animate-fade-in-up">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground gap-1.5 font-body text-xs font-normal"
                >
                  <FileDown className="w-4 h-4" />
                  Download Legal PDF
                </Button>
              </div>
              <Timeline events={events} />
            </div>

            <div className="flex justify-center pt-4 animate-fade-in-up animate-fade-in-up-delay-5">
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-2xl border-border/40 font-body font-normal"
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
