import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QuizConfig, QuizParticipant, ResultTemplate } from "@/types/quiz";
import { Play, X, ArrowRight, ChevronDown } from "lucide-react";
import { ConfettiBurst } from "./ConfettiBurst";
import { buildJourney, JourneyAnswer, JourneyUserContext } from "@/lib/buildJourney";
import { ALL_CORRECT_ANSWERS } from "@/utils/quizUtils";

interface ConversionLandingPageProps {
  config: QuizConfig;
  participant: QuizParticipant;
  personalizedResult: ResultTemplate | null;
  gradedAnswers?: JourneyAnswer[];
  userContext?: JourneyUserContext;
}

const ConversionLandingPage = ({
  config,
  participant,
  personalizedResult,
  gradedAnswers,
  userContext
}: ConversionLandingPageProps) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const journey = buildJourney({
    personalizedResult: personalizedResult ?? { id: "a1", title: "A1 • Beginner", description: "" },
    answers: (gradedAnswers ?? []).filter(a => a.q > 0),
    user: userContext,
    proof: {
      classesTaughtText: "Live classes taught every day",
      ratingText: "Top-rated by learners"
    }
  });

  // Play celebration SFX alongside confetti
  useEffect(() => {
    const audioSrc = "/music/Success%20Joy.wav";
    const audio = new Audio(audioSrc);
    audio.volume = 0.6;
    let interactionHandler: ((e?: any) => void) | null = null;

    const tryPlay = async () => {
      try {
        await audio.play();
      } catch {
        interactionHandler = () => {
          audio.play().catch(() => {});
          if (interactionHandler) {
            window.removeEventListener("pointerdown", interactionHandler as EventListener);
            window.removeEventListener("keydown", interactionHandler as EventListener);
            interactionHandler = null;
          }
        };
        window.addEventListener("pointerdown", interactionHandler);
        window.addEventListener("keydown", interactionHandler);
      }
    };

    if (showConfetti) tryPlay();

    return () => {
      try { audio.pause(); audio.currentTime = 0; audio.src = ""; } catch {}
      if (interactionHandler) {
        window.removeEventListener("pointerdown", interactionHandler as EventListener);
        window.removeEventListener("keydown", interactionHandler as EventListener);
      }
    };
  }, [showConfetti]);

  // Load HubSpot meetings script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const openVideoModal = (videoUrl: string) => { setSelectedVideo(videoUrl); setIsVideoModalOpen(true); };
  const closeVideoModal = () => { setIsVideoModalOpen(false); setSelectedVideo(null); };
  const openTestimonialModal = (videoUrl: string) => { setSelectedVideo(videoUrl); setIsModalOpen(true); };
  const closeTestimonialModal = () => { setIsModalOpen(false); setSelectedVideo(null); };

  const testimonials = [
    { name: "Koji", quote: "I can finally talk to my grandchildren in Spanish!", video: "/videos/koji-testimonial.mp4", image: "/images/testimonials-preview/koji-testimonial.png" },
    { name: "Suzanne", quote: "My confidence has skyrocketed! I love it!", video: "/videos/suzanne-testimonial.mp4", image: "/images/testimonials-preview/suzanne-testimonial.png" },
    { name: "Catie", quote: "Learning Spanish opened new doors!", video: "/videos/catie-testimonial.mp4", image: "/images/testimonials-preview/catie-testimonial.png" },
    { name: "Boris", quote: "Classes were structured to meet my needs...", video: "/videos/boris-testimonial.mp4", image: "/images/testimonials-preview/boris-testimonial.png" },
    { name: "Chris", quote: "Each class is tailored to my individual needs and abilities.", video: "/videos/chris-testimonial.mp4", image: "/images/testimonials-preview/chris-testimonial.png" },
    { name: "Kholman", quote: "Spanish VIP is the best program I've worked with.", video: "/videos/kholman-testimonial.mp4", image: "/images/testimonials-preview/kholman-testimonial.png" }
  ];

  const textTestimonials = [
    { name: "Alison", date: "September 28", quote: "SpanishVIP helped me find tutoring times that fit my schedule. My tutor is fun, patient, and tailors lessons to me." },
    { name: "Michael LaClair", date: "August 19", quote: "Affordable, personalized Spanish classes. Students are personalized with a strong focus on culture and colloquial language." },
    { name: "Laurie A.", date: "September 1", quote: "Best Spanish classes ever! I take three private lessons weekly plus group classes and the combo works great." },
    { name: "Jon", date: "October 5", quote: "Amazing program. After just a few months I can hold real conversations. The teachers are incredible." }
  ];

  const displayName = participant.name
    ? participant.name.charAt(0).toUpperCase() + participant.name.slice(1)
    : "there";

  const [isResultsExpanded, setIsResultsExpanded] = useState(false);

  // Returns the human-readable label for a given answer value on a question
  const getAnswerLabel = (question: import("@/types/quiz").QuizQuestion, value: string): string => {
    if (question.options) {
      const opt = question.options.find(o => o.value === value);
      if (opt) return opt.text;
    }
    if (question.imageOptions) {
      const opt = question.imageOptions.find(o => o.value === value);
      if (opt) return opt.alt;
    }
    return value; // fill-in-blanks: value is the text itself
  };

  const classStats = [
    { top: "1-on-1", bottom: "Private sessions" },
    { top: "45 min", bottom: "Per lesson" },
    { top: "100%", bottom: "Certified teachers" },
    { top: "Any level", bottom: "From beginner" },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white font-kumbh">
      <ConfettiBurst active={showConfetti} duration={4000} onDone={() => setShowConfetti(false)} />

      {/* ── SECTION 1: HERO + CALENDAR ── */}
      <section id="book-class-section" className="bg-white pt-10 pb-14 sm:pt-14 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 text-center">

          {/* Logo */}
          {config.logoUrl && (
            <div className="flex justify-center mb-7">
              <img src={config.logoUrl} alt="SpanishVIP" className="h-10 sm:h-12 w-auto" />
            </div>
          )}

          {/* Results Summary Card */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl mb-7 text-left shadow-soft overflow-hidden">

            {/* Clickable header row */}
            <button
              className="w-full p-4 sm:p-5 flex items-start gap-4 hover:bg-gray-100/60 transition-colors text-left"
              onClick={() => setIsResultsExpanded(v => !v)}
              aria-expanded={isResultsExpanded}
            >
              {/* Level badge */}
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-brand-secondary flex flex-col items-center justify-center text-white">
                <span className="text-xs font-bold uppercase tracking-wide leading-none mb-0.5">
                  {journey.levelTitle.split("•")[0]?.trim() ?? ""}
                </span>
                <span className="text-[10px] opacity-80 leading-none">level</span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm sm:text-base">{journey.levelTitle}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400 whitespace-nowrap">{journey.totals.totalCorrect} / 12 correct</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isResultsExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 leading-relaxed">{journey.levelDescription}</p>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-brand-secondary h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((journey.totals.totalCorrect / 12) * 100)}%` }}
                  />
                </div>

                {/* Strong topics (hidden when expanded to avoid duplication) */}
                {!isResultsExpanded && journey.strongTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {journey.strongTopics.slice(0, 3).map(topic => (
                      <span key={topic} className="px-2 py-0.5 bg-white border border-brand-secondary/30 text-brand-secondary text-xs rounded-full">
                        ✓ {topic}
                      </span>
                    ))}
                  </div>
                )}

                {!isResultsExpanded && (
                  <p className="text-xs text-brand-secondary mt-3 font-medium">Tap to see your full results ↓</p>
                )}
              </div>
            </button>

            {/* Expandable question breakdown */}
            {isResultsExpanded && (
              <div className="border-t border-gray-200 px-4 sm:px-5 pb-5 pt-4">

                {/* Skill summary row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {(Object.entries(journey.totals.bySkillPct) as [string, number][]).map(([skill, pct]) => (
                    <div key={skill} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                      <div className="text-base font-bold text-gray-900">{Math.round(pct)}%</div>
                      <div className="text-xs text-gray-400 capitalize">{skill}</div>
                      <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                        <div
                          className="h-1 rounded-full bg-brand-secondary"
                          style={{ width: `${Math.round(pct)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weak / strong topics */}
                {(journey.weakTopics.length > 0 || journey.strongTopics.length > 0) && (
                  <div className="flex flex-wrap gap-4 mb-5">
                    {journey.strongTopics.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Strong</p>
                        <div className="flex flex-wrap gap-1.5">
                          {journey.strongTopics.map(t => (
                            <span key={t} className="px-2 py-0.5 bg-white border border-brand-secondary/30 text-brand-secondary text-xs rounded-full">✓ {t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {journey.weakTopics.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Needs work</p>
                        <div className="flex flex-wrap gap-1.5">
                          {journey.weakTopics.map(t => (
                            <span key={t} className="px-2 py-0.5 bg-white border border-red-200 text-red-400 text-xs rounded-full">✗ {t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Question-by-question breakdown */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Question Breakdown</p>
                <div className="space-y-2">
                  {participant.answers.map((answer, idx) => {
                    const question = config.questions.find(q => q.id === answer.questionId);
                    if (!question) return null;
                    const correct = ALL_CORRECT_ANSWERS[answer.questionId];
                    const isCorrect = correct !== undefined && answer.value === correct;
                    const userLabel = typeof answer.value === "string"
                      ? getAnswerLabel(question, answer.value)
                      : String(answer.value ?? "—");
                    const correctLabel = typeof correct === "string"
                      ? getAnswerLabel(question, correct)
                      : Array.isArray(correct) ? correct.join(", ") : "—";

                    return (
                      <div
                        key={answer.questionId}
                        className={`rounded-xl border p-3 text-sm ${isCorrect ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
                      >
                        <div className="flex items-start gap-2">
                          <span className={`flex-shrink-0 text-base leading-none ${isCorrect ? "text-green-500" : "text-red-400"}`}>
                            {isCorrect ? "✓" : "✗"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-xs sm:text-sm leading-snug mb-1">
                              <span className="text-gray-400 mr-1">Q{idx + 1}.</span>
                              {question.title}
                              {question.subtitle && (
                                <span className="text-gray-400 font-normal"> — {question.subtitle}</span>
                              )}
                            </p>
                            <p className={`text-xs ${isCorrect ? "text-green-700" : "text-red-500"}`}>
                              Your answer: <span className="font-medium">{userLabel}</span>
                            </p>
                            {!isCorrect && (
                              <p className="text-xs text-green-700 mt-0.5">
                                Correct: <span className="font-medium">{correctLabel}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

          {/* Teal badge */}
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-secondary mb-3">
            YOUR NEXT STEP ✦
          </span>

          {/* Personalized headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Your Guided{" "}
            <span className="text-brand-secondary">Spanish Journey</span>{" "}
            Starts Today
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 text-base sm:text-lg mb-7 max-w-xl mx-auto leading-relaxed">
            Meet a certified teacher, experience a free, engaging lesson, and learn how the program works. The perfect first step!
          </p>

          {/* Trustpilot row */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            <span className="text-brand-secondary text-lg leading-none">{"★".repeat(5)}</span>
            <span className="text-sm text-gray-600 font-medium">Rating 4.9 out of 5</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm font-bold text-[#00B67A]">✓ Trustpilot</span>
          </div>

          {/* HubSpot Calendar Card */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
            <div
              className="meetings-iframe-container"
              data-src="https://meetings.hubspot.com/spanishvip/schedule-your-free-spanish-class?embed=true"
              style={{ width: "100%", minHeight: "350px", overflow: "auto", position: "relative" }}
            />
          </div>

        </div>
      </section>

      {/* ── SECTION 2: CLASS PREVIEW VIDEO ── */}
      <section className="bg-white py-16 sm:py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">

          <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-secondary mb-3">
            SEE IT IN ACTION ✦
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            What a SpanishVIP Class Looks Like
          </h2>
          <p className="text-gray-500 text-base mb-9 max-w-xl mx-auto leading-relaxed">
            Watch a real session — see how our teachers make learning natural, engaging, and built for your level.
          </p>

          {/* Video thumbnail */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-soft cursor-pointer group mb-10"
            onClick={() => openVideoModal("https://www.youtube.com/embed/aIaWXzztvc0")}
          >
            <img
              src={config.introImageUrl || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80"}
              alt="SpanishVIP class preview"
              className="w-full h-56 sm:h-72 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/35 transition-colors">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 text-brand-secondary ml-1" />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-stretch justify-center divide-x divide-gray-200 border border-gray-100 rounded-2xl overflow-hidden shadow-soft">
            {classStats.map((stat, i) => (
              <div key={i} className="flex-1 min-w-[80px] px-4 sm:px-8 py-4 text-center bg-white">
                <div className="text-base sm:text-lg font-bold text-gray-900">{stat.top}</div>
                <div className="text-xs sm:text-sm text-gray-400 mt-0.5">{stat.bottom}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 3: VIDEO TESTIMONIALS GRID ── */}
      <section className="bg-gray-50 py-16 sm:py-20 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4">

          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-secondary mb-3">
              REAL STORIES ✦
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Hear From Our Students
            </h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              Adults like you who decided to finally learn Spanish — and did.
            </p>
          </div>

          {/* 3×2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => openTestimonialModal(t.video)}
              >
                <div className="relative aspect-video">
                  <img
                    src={t.image}
                    alt={`${t.name} testimonial`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-brand-secondary ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="text-brand-secondary text-sm mb-2">{"★".repeat(5)}</div>
                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">"{t.quote}"</p>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">SpanishVIP student</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 4: TRUSTPILOT REVIEWS ── */}
      <section className="bg-white py-16 sm:py-20 border-t border-gray-100 pb-24">
        <div className="max-w-5xl mx-auto px-4 text-center">

          <div className="text-brand-secondary text-2xl mb-3">{"★".repeat(5)}</div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Learners Worldwide Choose{" "}
            <span className="text-brand-secondary">SpanishVIP</span>
          </h2>

          <p className="text-gray-500 text-base mb-10">
            Thousands of students build momentum here — one guided session at a time.{" "}
            <a
              href="https://www.trustpilot.com/review/spanishvip.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-gray-500 hover:text-brand-secondary transition-colors"
            >
              Read 600+ real learner reviews on Trustpilot
            </a>
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-5">

            {/* Trustpilot badge */}
            <div className="flex-shrink-0 bg-white rounded-2xl shadow-soft border border-gray-100 p-5 text-left w-full sm:w-36">
              <div className="text-xs font-bold text-[#00B67A] mb-1 uppercase tracking-wide">Trustpilot</div>
              <div className="text-lg font-bold text-gray-900 leading-none mb-1">Excellent</div>
              <div className="text-[#00B67A] text-base mb-1">{"★".repeat(5)}</div>
              <div className="text-xs text-gray-400">Based on 623 reviews</div>
              <div className="text-xs text-gray-900 font-semibold mt-2">4.9 / 5</div>
            </div>

            {/* Review cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 text-left">
              {textTestimonials.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
                  <div className="text-[#00B67A] text-sm mb-2">{"★".repeat(5)}</div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">"{r.quote}"</p>
                  <p className="text-xs font-semibold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.date}</p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 5: STICKY FOOTER CTA ── */}
      <div className="sticky bottom-0 z-40 bg-brand-secondary py-3 px-4 flex items-center justify-center shadow-lg">
        <button
          onClick={() => document.getElementById('book-class-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-white text-brand-secondary font-bold text-sm sm:text-base px-6 py-2.5 rounded-full shadow hover:shadow-md transition-all hover:scale-105 flex items-center gap-2"
        >
          Book My Free Class
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── DEMO VIDEO MODAL ── */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-0">
          <div className="relative aspect-video w-full">
            {selectedVideo && (
              <>
                <button
                  onClick={closeVideoModal}
                  aria-label="Close video"
                  className="absolute top-2 right-2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow"
                >
                  <X className="h-5 w-5" />
                </button>
                <iframe
                  src={selectedVideo}
                  title="Class Demo"
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── TESTIMONIAL VIDEO MODAL ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={closeTestimonialModal}
        >
          <div
            className="relative bg-black rounded-2xl shadow-2xl max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow"
              onClick={closeTestimonialModal}
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video w-full flex items-center justify-center">
              {selectedVideo && selectedVideo.startsWith('youtube:') ? (
                <iframe
                  src={selectedVideo.replace('youtube:', '') + '?autoplay=1'}
                  title="YouTube video"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full rounded-b-2xl"
                />
              ) : selectedVideo ? (
                <video src={selectedVideo} controls autoPlay className="w-full h-full rounded-b-2xl" />
              ) : null}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn { to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ConversionLandingPage;
