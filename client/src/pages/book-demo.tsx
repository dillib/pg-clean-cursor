import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfDay, parseISO } from "date-fns";
import {
  QrCode, Calendar, ChevronLeft, ChevronRight,
  CheckCircle, Download, Loader2, User, Mail, Building, Zap, Clock, ArrowRight
} from "lucide-react";

const INTEREST_AREAS = [
  { id: "eu_dpp_compliance", label: "EU DPP Compliance", icon: "🇪🇺" },
  { id: "battery_regulation", label: "Battery Regulation", icon: "🔋" },
  { id: "sap_integration", label: "SAP Integration", icon: "🔗" },
  { id: "supply_chain", label: "Supply Chain Traceability", icon: "🚚" },
  { id: "ai_sustainability", label: "AI Sustainability", icon: "🌱" },
  { id: "other", label: "General Overview", icon: "📋" },
];

type Step = "intro" | "contact" | "interest" | "slot" | "confirm" | "success";

interface ContactInfo {
  name: string;
  email: string;
  company: string;
}

interface ChatMessage {
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

function getBotMessage(step: Step, info?: Partial<ContactInfo>): string {
  switch (step) {
    case "intro":
      return "Hi there! I'm here to help you schedule a 30-minute demo with the PhotonicTag team. It'll just take a minute to get you set up. What's your name?";
    case "contact":
      return `Great to meet you, ${info?.name || ""}! Could you share your work email and company name so we can prepare for our session?`;
    case "interest":
      return "What area of PhotonicTag are you most interested in exploring? This helps us tailor the demo for you.";
    case "slot":
      return "Perfect! Let's find a time that works for you. I have 30-minute slots available Monday through Friday, 9am–5pm CET.";
    case "confirm":
      return "Here's a summary of your booking. Does everything look correct?";
    case "success":
      return "You're all set! Your demo is confirmed. Download the calendar invite below to add it to your calendar.";
  }
}

/** Format a UTC ISO slot string as CET (UTC+1) display time. */
function formatSlotTime(isoString: string): string {
  const d = parseISO(isoString);
  // Shift to CET = UTC+1
  const cetMs = d.getTime() + 60 * 60 * 1000;
  const cetDate = new Date(cetMs);
  return format(cetDate, "EEEE, MMMM d 'at' h:mm a 'CET'");
}

/** Format a UTC ISO slot string as short CET display time. */
function formatSlotTimeShort(isoString: string): string {
  const d = parseISO(isoString);
  const cetMs = d.getTime() + 60 * 60 * 1000;
  const cetDate = new Date(cetMs);
  return format(cetDate, "h:mm a");
}

function groupSlotsByDay(slots: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  for (const slot of slots) {
    const d = parseISO(slot);
    // Group by CET date (UTC+1) so that late-UTC slots appear on the correct day
    const cetDate = new Date(d.getTime() + 60 * 60 * 1000);
    const dayKey = format(cetDate, "yyyy-MM-dd");
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(slot);
  }
  return grouped;
}

export default function BookDemo() {
  const [step, setStep] = useState<Step>("intro");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", content: getBotMessage("intro"), timestamp: new Date() },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [contact, setContact] = useState<ContactInfo>({ name: "", email: "", company: "" });
  const [contactPhase, setContactPhase] = useState<"name_asked" | "email_asked" | "company_asked">("name_asked");
  const [interestArea, setInterestArea] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: slotsData, isLoading: slotsLoading } = useQuery<{ slots: string[] }>({
    queryKey: ["/api/demo-slots"],
    enabled: step === "slot" || step === "confirm" || step === "success",
  });

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/demo-bookings", {
        name: contact.name,
        email: contact.email,
        company: contact.company || undefined,
        interestArea,
        slotDatetime: selectedSlot,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setBookingId(data.id);
      addBotMessage(getBotMessage("success"));
      setStep("success");
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addBotMessage = (content: string, delay = 600) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "bot", content, timestamp: new Date() }]);
    }, delay);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { role: "user", content, timestamp: new Date() }]);
  };

  const handleTextSubmit = () => {
    const value = inputValue.trim();
    if (!value) return;

    setInputValue("");

    if (step === "intro") {
      addUserMessage(value);
      setContact(prev => ({ ...prev, name: value }));
      setContactPhase("email_asked");
      setStep("contact");
      addBotMessage(`Nice to meet you, ${value}! What's your work email address?`);
      return;
    }

    if (step === "contact") {
      if (contactPhase === "email_asked") {
        if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          addUserMessage(value);
          addBotMessage("That doesn't look like a valid email. Could you try again?", 300);
          return;
        }
        addUserMessage(value);
        setContact(prev => ({ ...prev, email: value }));
        setContactPhase("company_asked");
        addBotMessage("Great! And your company name? (You can skip this by typing 'skip')");
      } else if (contactPhase === "company_asked") {
        addUserMessage(value === "skip" ? "Skipped" : value);
        setContact(prev => ({ ...prev, company: value === "skip" ? "" : value }));
        addBotMessage(getBotMessage("interest", contact));
        setStep("interest");
      }
    }
  };

  const handleInterestSelect = (area: typeof INTEREST_AREAS[0]) => {
    setInterestArea(area.id);
    addUserMessage(`${area.icon} ${area.label}`);
    addBotMessage(getBotMessage("slot"));
    setStep("slot");
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    addUserMessage(`${formatSlotTime(slot)}`);
    addBotMessage(getBotMessage("confirm"));
    setStep("confirm");
  };

  const handleConfirm = () => {
    addUserMessage("Yes, confirm my booking!");
    createBookingMutation.mutate();
  };

  const handleEdit = () => {
    addUserMessage("Let me change something...");
    addBotMessage("Of course! What area would you like to change?");
    setStep("interest");
  };

  const groupedSlots = slotsData ? groupSlotsByDay(slotsData.slots) : {};
  const allDays = Object.keys(groupedSlots).sort();
  const visibleDays = allDays.slice(weekOffset * 5, weekOffset * 5 + 5);

  const getInterestLabel = (id: string) => INTEREST_AREAS.find(a => a.id === id)?.label || id;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Book a Demo - PhotonicTag | EU Digital Product Passport</title>
        <meta name="description" content="Schedule a 30-minute demo with the PhotonicTag team. See how our EU DPP compliance platform can work for your organization." />
      </Helmet>
      <PublicNav hideBookDemo />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">Book a Demo</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Your 30-Minute Demo</h1>
          <p className="text-muted-foreground mt-2">
            Mon–Fri · 9am–5pm CET · 30 minutes · No preparation needed
          </p>
        </div>

        {/* Chat window */}
        <Card className="mb-4 overflow-hidden">
          <div className="h-[420px] overflow-y-auto p-5 space-y-4" data-testid="chat-window">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "bot"
                      ? "bg-muted text-foreground rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  }`}
                  data-testid={`message-${msg.role}-${i}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t p-4 bg-background">
            {(step === "intro" || step === "contact") && (
              <div className="flex gap-2">
                <Input
                  placeholder={
                    step === "intro" ? "Your name..."
                    : contactPhase === "email_asked" ? "your@email.com"
                    : "Company name (or 'skip')"
                  }
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleTextSubmit()}
                  data-testid="input-chat"
                  className="flex-1"
                  autoFocus
                />
                <Button onClick={handleTextSubmit} data-testid="button-send">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {step === "interest" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" data-testid="interest-options">
                {INTEREST_AREAS.map(area => (
                  <button
                    key={area.id}
                    onClick={() => handleInterestSelect(area)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-background hover:bg-muted hover:border-primary transition-colors text-sm font-medium text-left"
                    data-testid={`interest-${area.id}`}
                  >
                    <span className="text-base">{area.icon}</span>
                    {area.label}
                  </button>
                ))}
              </div>
            )}

            {step === "slot" && (
              <div>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading available times...</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
                        disabled={weekOffset === 0}
                        className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 transition-colors"
                        data-testid="button-prev-week"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-muted-foreground">
                        {visibleDays.length > 0 && `${format(parseISO(visibleDays[0]), "MMM d")} – ${format(parseISO(visibleDays[visibleDays.length - 1]), "MMM d")}`}
                      </span>
                      <button
                        onClick={() => setWeekOffset(prev => prev + 1)}
                        disabled={(weekOffset + 1) * 5 >= allDays.length}
                        className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 transition-colors"
                        data-testid="button-next-week"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 max-h-52 overflow-y-auto" data-testid="slot-grid">
                      {visibleDays.map(day => (
                        <div key={day}>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                            {format(parseISO(day), "EEEE, MMMM d")}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {groupedSlots[day].map(slot => (
                              <button
                                key={slot}
                                onClick={() => handleSlotSelect(slot)}
                                className="px-3 py-1.5 text-xs font-medium rounded-md border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                data-testid={`slot-${slot}`}
                              >
                                {formatSlotTimeShort(slot)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {visibleDays.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No slots available in this period.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === "confirm" && (
              <div>
                <div className="bg-muted/50 rounded-lg p-4 mb-3 text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{contact.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                  {contact.company && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>{contact.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span>{getInterestLabel(interestArea)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedSlot ? formatSlotTime(selectedSlot) : ""}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>30 minutes</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    data-testid="button-edit-booking"
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirm}
                    disabled={createBookingMutation.isPending}
                    data-testid="button-confirm-booking"
                    className="flex-1"
                  >
                    {createBookingMutation.isPending ? (
                      <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Booking...</>
                    ) : (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Confirm</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === "success" && bookingId && (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Demo confirmed for {selectedSlot ? format(parseISO(selectedSlot), "MMM d 'at' h:mm a 'CET'") : ""}
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  data-testid="button-download-ics"
                >
                  <a href={`/api/demo-bookings/${bookingId}/calendar.ics`} download>
                    <Download className="w-3 h-3 mr-1" />
                    .ics
                  </a>
                </Button>
              </div>
            )}

            {step === "success" && !bookingId && (
              <div className="flex items-center gap-2 text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Confirming your booking...</span>
              </div>
            )}
          </div>
        </Card>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>30-minute session</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Mon–Fri, 9am–5pm CET</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-primary" />
            <span>No commitment required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Calendar invite included</span>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
