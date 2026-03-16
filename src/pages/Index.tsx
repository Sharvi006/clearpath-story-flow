import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Timeline, { type TimelineEvent } from "@/components/Timeline";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Leaf, FileDown, Mic, ShieldCheck, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { generateLegalPDF } from "@/lib/generate-pdf";
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

interface Violation {
  law_section: string;
  reasoning: string;
}

const Index = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);
  const [verification, setVerification] = useState<{ generatedAt: string; hash: string } | null>(null);
  const [potentialViolations, setPotentialViolations] = useState<Violation[] | null>(null);
  const [isOfficerMode, setIsOfficerMode] = useState(false);

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
    setVerification(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/extract-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: text }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      console.log("[Solace] Full API response:", JSON.stringify(data, null, 2));
      const parsed: TimelineEvent[] = data.chronological_events.map(
        (evt: { date_or_time: string; description: string; people_involved: string[] }) => ({
          date: evt.date_or_time,
          description: evt.description,
          people: evt.people_involved ?? [],
        })
      );
      setEvents(parsed);
      const genAt = data.generated_at ?? data.generatedAt ?? null;
      const hash = data.cryptographic_hash ?? data.cryptographicHash ?? data.sha256_hash ?? null;
      console.log("[Solace] Verification fields:", { genAt, hash });
      if (genAt && hash) {
        setVerification({ generatedAt: genAt, hash });
      }
      if (data.potential_violations && Array.isArray(data.potential_violations)) {
        setPotentialViolations(data.potential_violations);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Failed to structure timeline", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEvents(null);
    setVerification(null);
    setPotentialViolations(null);
    setText("");
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ease-in-out ${isOfficerMode ? "bg-slate-950 text-slate-100" : "bg-background text-foreground"}`}>
      {/* Botanical flowers - top right */}
      {!isOfficerMode && (
        <img
          src={botanicalFlowers}
          alt=""
          aria-hidden="true"
          className="absolute -top-10 -right-16 w-72 md:w-96 opacity-[0.18] pointer-events-none select-none animate-float"
        />
      )}

      {/* Botanical branches - bottom left */}
      {!isOfficerMode && (
        <img
          src={botanicalBranches}
          alt=""
          aria-hidden="true"
          className="absolute -bottom-8 -left-12 w-56 md:w-72 opacity-[0.12] pointer-events-none select-none"
        />
      )}

      {/* Officer Mode Watermark */}
      {isOfficerMode && (
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src="/emblem.png"
            alt=""
            aria-hidden="true"
            className="w-[800px] h-auto opacity-5 scale-110 object-contain mix-blend-screen"
          />
        </div>
      )}

      {/* Small flower accent - mid right on timeline */}
      {!isOfficerMode && (
        <img
          src={botanicalFlowers}
          alt=""
          aria-hidden="true"
          className="absolute top-1/2 -right-20 w-48 opacity-[0.08] pointer-events-none select-none rotate-180"
        />
      )}

      {/* Officer Mode Toggle Wrapper */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3 bg-card/40 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 shadow-sm animate-fade-in-up">
        <label htmlFor="officer-mode" className={`text-sm font-medium tracking-wide ${isOfficerMode ? 'text-slate-300' : 'text-muted-foreground'}`}>
          Officer Mode
        </label>
        <Switch
          id="officer-mode"
          checked={isOfficerMode}
          onCheckedChange={setIsOfficerMode}
          className={isOfficerMode ? "data-[state=checked]:bg-blue-600" : ""}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 relative z-10">
        {/* Header */}
        <header className="text-center mb-14 animate-fade-in-up">
          {isOfficerMode && (
            <div className="flex justify-center mb-6 relative z-10">
              <img
                src="/emblem.png"
                alt="Indian National Emblem"
                className="h-24 opacity-90"
              />
            </div>
          )}
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <Leaf className={`w-5 h-5 ${isOfficerMode ? "text-blue-500" : "text-primary"}`} strokeWidth={1.5} />
            <h1 className={`font-display text-4xl tracking-tight font-medium ${isOfficerMode ? "text-slate-100" : "text-foreground"}`}>
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
                placeholder="Begin writing here…"
                className={`min-h-[300px] resize-none border-2 font-body text-base leading-relaxed p-6 pr-16 rounded-2xl transition-all duration-300 relative z-10 ${
                  isOfficerMode
                    ? "bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-blue-500/20 focus:border-blue-500"
                    : "bg-card/40 border-foreground/50 text-foreground placeholder:text-muted-foreground/40 focus:ring-primary/20 focus:border-foreground/70"
                }`}
              />

              {/* Voice input button */}
              <button
                type="button"
                onClick={toggleRecording}
                aria-label={isRecording ? "Stop recording" : "Start voice input"}
                className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                  isRecording
                    ? "bg-destructive/20 text-destructive shadow-[0_0_16px_4px_hsl(var(--destructive)/0.25)] animate-pulse-gentle"
                    : isOfficerMode
                    ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Mic className="w-4 h-4" strokeWidth={1.8} />
              </button>
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
              <h2 className={`font-display text-2xl mb-2 font-medium ${isOfficerMode ? "text-slate-100" : "text-foreground"}`}>
                Your Structured Timeline
              </h2>
              <p className={`text-sm font-body font-normal ${isOfficerMode ? "text-slate-400" : "text-muted-foreground"}`}>
                Events organized chronologically from your account
              </p>
            </div>

            <div className="relative">
              <div className="flex justify-end mb-4 animate-fade-in-up">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1.5 font-body text-xs font-normal ${isOfficerMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={async () => {
                    console.log("[Solace] PDF button clicked. verification state:", JSON.stringify(verification));
                    await generateLegalPDF(events, verification, isOfficerMode, potentialViolations);
                  }}
                >
                  <FileDown className="w-4 h-4" />
                  Download Legal PDF
                </Button>
              </div>
              <Timeline events={events} />
            </div>

            {/* Digital Verification Certificate */}
            {verification && (
              <div className={`animate-fade-in-up rounded-2xl border p-6 relative overflow-hidden ${
                isOfficerMode 
                  ? "bg-slate-900 border-blue-500/20 shadow-lg" 
                  : "border-primary/20 bg-card/60 backdrop-blur-sm"
              }`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-transparent ${isOfficerMode ? "via-blue-500/40" : "via-primary/40"}`} />

                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className={`w-5 h-5 ${isOfficerMode ? "text-blue-400" : "text-primary"}`} strokeWidth={1.5} />
                  <h3 className={`font-display text-lg font-semibold tracking-wide ${isOfficerMode ? "text-slate-100" : "text-foreground"}`}>
                    Digital Verification
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className={`text-xs uppercase tracking-widest font-body ${isOfficerMode ? "text-slate-500" : "text-muted-foreground"}`}>
                      Timestamp
                    </span>
                    <p className={`text-sm font-body mt-0.5 ${isOfficerMode ? "text-slate-300" : "text-foreground"}`}>
                      {verification.generatedAt}
                    </p>
                  </div>

                  <div>
                    <span className={`text-xs uppercase tracking-widest font-body ${isOfficerMode ? "text-slate-500" : "text-muted-foreground"}`}>
                      SHA-256 Hash
                    </span>
                    <p className={`text-xs font-mono mt-1 break-all leading-relaxed rounded-lg px-3 py-2 border ${
                      isOfficerMode 
                        ? "bg-slate-950 text-slate-400 border-slate-800" 
                        : "text-foreground/80 bg-muted/40 border-border/30"
                    }`}>
                      {verification.hash}
                    </p>
                  </div>
                </div>

                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-transparent ${isOfficerMode ? "via-blue-500/40" : "via-primary/40"}`} />
              </div>
            )}

            {/* Legal Assessment (Officer Mode Only) */}
            {isOfficerMode && potentialViolations && potentialViolations.length > 0 && (
              <div className="animate-fade-in-up mt-8 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" strokeWidth={2} />
                  <h3 className="font-display text-xl font-semibold text-slate-100">
                    Legal Assessment
                  </h3>
                </div>
                {potentialViolations.map((violation, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-700/60 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/80" />
                    <div className="pl-3">
                      <h4 className="font-display text-base font-bold text-amber-400 mb-1.5">
                        {violation.law_section}
                      </h4>
                      <p className="font-body text-sm text-slate-300 leading-relaxed">
                        {violation.reasoning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center pt-4 animate-fade-in-up animate-fade-in-up-delay-5">
              <Button
                variant="outline"
                onClick={handleReset}
                className={`rounded-2xl font-body font-normal transition-colors ${
                  isOfficerMode 
                    ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100 bg-transparent" 
                    : "border-border/40"
                }`}
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
