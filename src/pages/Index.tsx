import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Timeline, { type TimelineEvent } from "@/components/Timeline";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Leaf, FileDown, Mic } from "lucide-react";
import botanicalFlowers from "@/assets/botanical-flowers.png";
import botanicalBranches from "@/assets/botanical-branches.png";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

const Index = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const { toast } = useToast();

  const supportsVoice = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggleRecording = useCallback(() => {
    if (!supportsVoice) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support speech recognition. Please try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    const recognition = new (SpeechRecognition as new () => SpeechRecognitionInstance)();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) {
        setText((prev) => (prev ? prev + " " + transcript : transcript));
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      toast({
        title: "Voice input error",
        description: "Something went wrong with speech recognition. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording, supportsVoice, toast]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleStructure = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setEvents(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/extract-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: text }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const parsed: TimelineEvent[] = data.chronological_events.map(
        (evt: { date_or_time: string; description: string; people_involved: string[] }) => ({
          date: evt.date_or_time,
          description: evt.description,
          people: evt.people_involved ?? [],
        })
      );
      setEvents(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Failed to structure timeline", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
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
