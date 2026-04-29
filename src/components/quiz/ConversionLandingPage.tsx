import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuizConfig, QuizParticipant, ResultTemplate } from "@/types/quiz";
import { 
  Calendar, 
  Check, 
  ArrowRight, 
  Play, 
  Brain, 
  Heart, 
  Star, 
  Shield,
  X,
  TrendingUp,
  Target,
  Award,
  Users,
  CheckCircle
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

import { ConfettiBurst } from "./ConfettiBurst";
import { buildJourney, JourneyAnswer, JourneyUserContext } from "@/lib/buildJourney";

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

  // Build dynamic journey payload for the "Based on your answers..." section
  const journey = buildJourney({
    personalizedResult: personalizedResult ?? { id: "a1", title: "A1 • Beginner", description: "" },
    answers: (gradedAnswers ?? []).filter(a => a.q > 0),
    user: userContext,
    proof: {
      classesTaughtText: "Live classes taught every day",
      ratingText: "Top-rated by learners"
    }
  });

  // Derived stat ring values for readiness (Card 4)
  const readinessStr = journey.cards.proofTutor.stat?.value ?? "0%";
  const readinessNum = parseInt(readinessStr.replace("%", ""), 10) || 0;
  const ringCircumference = 251.2;
  const ringDashOffset = ringCircumference * (1 - Math.max(0, Math.min(100, readinessNum)) / 100);

  // Play celebration SFX alongside confetti. Handles autoplay restrictions by
  // retrying playback on the next user gesture if necessary.
  useEffect(() => {
    const audioSrc = "/music/Success%20Joy.wav";
    const audio = new Audio(audioSrc);
    audio.volume = 0.6;
    let interactionHandler: ((e?: any) => void) | null = null;

    const tryPlay = async () => {
      try {
        await audio.play();
      } catch (err) {
        // Autoplay blocked — attach one-time gesture listeners to retry
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

    // Attempt immediate playback when confetti is shown
    if (showConfetti) {
      tryPlay();
    }

    return () => {
      // Cleanup audio and any event listeners
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = "";
      } catch (e) {
        // ignore
      }
      if (interactionHandler) {
        window.removeEventListener("pointerdown", interactionHandler as EventListener);
        window.removeEventListener("keydown", interactionHandler as EventListener);
        interactionHandler = null;
      }
    };
  }, [showConfetti]);
  
  // Load HubSpot meetings script when the component mounts
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const openVideoModal = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const openTestimonialModal = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
    setIsModalOpen(true);
  };

  const closeTestimonialModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  // Testimonial data
  const testimonials = [
    {
      name: "Koji",
      quote: "I can finally talk to my grandchildren in Spanish!",
      video: "/videos/koji-testimonial.mp4",
      image: "/images/testimonials-preview/koji-testimonial.png"
    },
    {
      name: "Suzanne", 
      quote: "My confidence has skyrocketed! I love it!",
      video: "/videos/suzanne-testimonial.mp4",
      image: "/images/testimonials-preview/suzanne-testimonial.png"
    },
    {
      name: "Catie",
      quote: "Learning Spanish opened new doors!",
      video: "/videos/catie-testimonial.mp4",
      image: "/images/testimonials-preview/catie-testimonial.png"
    },
    {
      name: "Boris",
      quote: "Classes were structured to meet my needs...",
      video: "/videos/boris-testimonial.mp4",
      image: "/images/testimonials-preview/boris-testimonial.png"
    },
    {
      name: "Chris", 
      quote: "Each class is tailored to my individual needs and abilities.",
      video: "/videos/chris-testimonial.mp4",
      image: "/images/testimonials-preview/chris-testimonial.png"
    },
    {
      name: "Kholman",
      quote: "Spanish VIP is the best program I've worked with.",
      video: "/videos/kholman-testimonial.mp4",
      image: "/images/testimonials-preview/kholman-testimonial.png"
    }
  ];

  const textTestimonials = [
    {
      name: "Anna Garcia",
      quote: "The personalized learning path was exactly what I needed. I'm now fluent and confident!",
      rating: 5
    },
    {
      name: "Robert Kim",
      quote: "SpanishVIP's methodology is revolutionary. I learned more in 3 months than 2 years of self-study.",
      rating: 5
    },
    {
      name: "Maria Santos",
      quote: "The teachers are native speakers who really care about your progress. Highly recommended!",
      rating: 5
    },
    {
      name: "John Davis",
      quote: "Perfect for busy professionals. Flexible scheduling and amazing results.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-orange-50 to-amber-50">
      <ConfettiBurst active={showConfetti} duration={4000} onDone={() => setShowConfetti(false)} />

      {/* SECTION 1: HERO SECTION */}
      <section className="bg-white py-6 sm:py-8 md:py-12 lg:py-16 xl:py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8 order-2 lg:order-1">
              {/* Brand Logo */}
          {config.logoUrl && (
                <div className="flex justify-center lg:justify-start mb-4">
              <img
                src={config.logoUrl}
                alt={`${config.title} logo`}
                    className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto max-w-full"
              />
            </div>
          )}
          
              {/* Main Headline */}
              <div className="space-y-3 sm:space-y-4 md:space-y-6 text-center lg:text-left">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 leading-tight px-2 sm:px-0">
                  ¡Felicidades! Your Spanish Journey Starts Now 🎉
                </h1>
                
                {/* Statistics Box */}
                <div className="bg-orange-50 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border border-orange-100 mx-2 sm:mx-0">
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600">87%</div>
                    <div className="text-gray-700 text-center sm:text-left">
                      <p className="font-semibold text-xs sm:text-sm md:text-base">Success Rate</p>
                      <p className="text-xs sm:text-sm">of students achieve fluency within 6 months</p>
            </div>
          </div>
        </div>

                {/* Primary CTA */}
                <div className="flex justify-center lg:justify-start px-2 sm:px-0">
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto max-w-sm sm:max-w-none"
                    onClick={() => document.getElementById('book-class-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Start Your Free Class Today
                    <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Media */}
            <div className="relative order-1 lg:order-2 px-2 sm:px-0">
              <div className="relative rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl overflow-hidden">
                <img
                  src={config.introImageUrl || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
                  alt="Spanish learning success"
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <button
                    onClick={() => openVideoModal("https://www.youtube.com/embed/aIaWXzztvc0")}
                    aria-label="Play video"
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 sm:p-3 md:p-4 transition-all duration-300 transform hover:scale-110"
                  >
                    <Play className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-600 ml-0.5 sm:ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: RESULTS VISUALIZATION (Dynamic) */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 w-full min-w-full p-0">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 w-full">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2 sm:px-0">
              Based on your answers, your Spanish learning journey is...
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">{journey.levelTitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* CARD 1 - Starting Level */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 animate-fade-in mx-2 sm:mx-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">
                {journey.cards.startingLevel.title}
              </h3>
              {journey.cards.startingLevel.subtitle && (
                <p className="text-gray-700 text-xs sm:text-sm md:text-base mb-3 sm:mb-4">{journey.cards.startingLevel.subtitle}</p>
              )}

              {journey.cards.startingLevel.chips && journey.cards.startingLevel.chips.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                  {journey.cards.startingLevel.chips.map((c) => (
                    <span key={c} className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs sm:text-sm border border-orange-200">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {journey.cards.startingLevel.progress && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-xs sm:text-sm">
                      {journey.cards.startingLevel.progress.label ?? "Progress"}
                    </span>
                    <span className="text-gray-900 text-xs sm:text-sm font-semibold">
                      {Math.max(0, Math.min(100, journey.cards.startingLevel.progress.current))}%
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 sm:h-3">
                    <div
                      className="bg-orange-500 h-2 sm:h-3 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(0, Math.min(100, journey.cards.startingLevel.progress.current))}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <Button
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => document.getElementById('book-class-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {journey.cards.startingLevel.cta?.label ?? "Book your free 1:1 class"}
                </Button>
                {journey.cards.startingLevel.footnote && (
                  <p className="text-xs text-gray-500 mt-2">{journey.cards.startingLevel.footnote}</p>
                )}
              </div>
            </div>

            {/* CARD 2 - Focus Plan */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 animate-fade-in mx-2 sm:mx-0" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">
                {journey.cards.focusPlan.title}
              </h3>
              {journey.cards.focusPlan.bullets && (
                <ul className="list-disc pl-5 space-y-2">
                  {journey.cards.focusPlan.bullets.map((b, i) => (
                    <li key={i} className="text-gray-700 text-xs sm:text-sm md:text-base">{b}</li>
                  ))}
                </ul>
              )}
              {journey.cards.focusPlan.chips && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {journey.cards.focusPlan.chips.map((c) => (
                    <span key={c} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs sm:text-sm border border-amber-200">
                      {c}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold rounded-lg shadow-sm border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={() => document.getElementById('book-class-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {journey.cards.focusPlan.cta?.label ?? "See this plan in your free class"}
                </Button>
              </div>
            </div>

            {/* CARD 3 - Timeline */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 animate-fade-in mx-2 sm:mx-0" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">
                {journey.cards.timeline.title}
              </h3>
              {journey.cards.timeline.bullets && (
                <ul className="list-disc pl-5 space-y-2">
                  {journey.cards.timeline.bullets.map((b, i) => (
                    <li key={i} className="text-gray-700 text-xs sm:text-sm md:text-base">{b}</li>
                  ))}
                </ul>
              )}
              {journey.cards.timeline.progress && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-xs sm:text-sm">
                      {journey.cards.timeline.progress.label}
                    </span>
                    <span className="text-gray-900 text-xs sm:text-sm font-semibold">
                      {Math.min(100, Math.round((journey.cards.timeline.progress.current / journey.cards.timeline.progress.target) * 100))}%
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 sm:h-3">
                    <div
                      className="bg-green-500 h-2 sm:h-3 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.round((journey.cards.timeline.progress.current / journey.cards.timeline.progress.target) * 100))}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold rounded-lg shadow-sm border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => document.getElementById('book-class-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {journey.cards.timeline.cta?.label ?? "Start a free group session"}
                </Button>
              </div>
            </div>

            {/* CARD 4 - Proof & Tutor */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 animate-fade-in mx-2 sm:mx-0" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">
                {journey.cards.proofTutor.title}
              </h3>
              {journey.cards.proofTutor.subtitle && (
                <p className="text-gray-700 text-xs sm:text-sm md:text-base mb-4">{journey.cards.proofTutor.subtitle}</p>
              )}
              <div className="flex items-center justify-center">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#ea580c"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringDashOffset}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">{readinessNum}%</div>
                  </div>
                </div>
              </div>
              {journey.cards.proofTutor.stat?.label && (
                <div className="text-xs sm:text-sm text-gray-600 text-center mt-2">
                  {journey.cards.proofTutor.stat.label}
                </div>
              )}
              <div className="mt-4 text-center">
                <Button
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => document.getElementById('book-class-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {journey.cards.proofTutor.cta?.label ?? "Book your free 1:1 class"}
                </Button>
                {journey.cards.proofTutor.footnote && (
                  <p className="text-xs text-gray-500 mt-2">{journey.cards.proofTutor.footnote}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HUBSPOT CALENDAR SECTION */}
      <section id="book-class-section" className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-24 bg-white">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">
            Book Your Free Spanish Class
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2 sm:px-0">
            Get a personalized 1:1 session with a native Spanish teacher
          </p>
        </div>
        <div
          className="meetings-iframe-container"
          data-src="https://meetings.hubspot.com/spanishvip/schedule-your-free-spanish-class?embed=true"
          style={{ width: "100%", minHeight: "350px", overflow: "auto", position: "relative" }}
        ></div>
      </section>

      {/* SECTION 3: SOCIAL PROOF SECTION */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-24" style={{ background: 'linear-gradient(135deg, #062231 0%, #012F56 100%)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            {/* Left Side */}
            <div className="text-white space-y-4 sm:space-y-6 md:space-y-8 order-2 lg:order-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-center lg:text-left px-2 sm:px-0">
                Join 10,000+ Successful Spanish Learners
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-blue-100 text-center lg:text-left px-2 sm:px-0">
                Our proven methodology delivers exceptional results for learners at every level
              </p>
              
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 px-2 sm:px-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold">85% faster acquisition</h3>
                    <p className="text-xs sm:text-sm md:text-base text-blue-100">Compared to traditional methods</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 px-2 sm:px-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold">70% deeper connections</h3>
                    <p className="text-xs sm:text-sm md:text-base text-blue-100">With native speakers and culture</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 px-2 sm:px-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold">Enhanced experiences</h3>
                    <p className="text-xs sm:text-sm md:text-base text-blue-100">In travel, work, and personal life</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="relative order-1 lg:order-2 px-2 sm:px-0">
              <img 
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Successful Spanish learners"
                className="rounded-xl sm:rounded-2xl shadow-xl w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: VIDEO TESTIMONIALS */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 bg-white w-full min-w-full p-0">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 w-full">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-center text-gray-800 mb-6 sm:mb-8 md:mb-12 px-2 sm:px-0">
            Real stories from our Spanish learners
          </h2>
          
          <div className="w-full max-w-5xl mx-auto px-2 sm:px-0">
            <Carousel opts={{ align: 'start', slidesToScroll: 1 }}>
              <CarouselContent className="-ml-2 sm:-ml-4">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-2 sm:pl-4 md:basis-1/3 basis-full">
                    <div className="relative overflow-hidden shadow-lg rounded-xl sm:rounded-2xl group cursor-pointer" onClick={() => openTestimonialModal(testimonial.video)}>
                      <div className="aspect-video relative">
                        <img
                          src={testimonial.image}
                          alt={`${testimonial.name} testimonial preview`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-gray-800 ml-0.5 sm:ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 md:p-6">
                        <div className="flex text-yellow-400 mb-2">
                          {"★".repeat(5)}
                        </div>
                        <p className="text-gray-700 mb-2 text-xs sm:text-sm md:text-base">"{testimonial.quote}"</p>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">{testimonial.name}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-2 sm:-left-4" />
              <CarouselNext className="-right-2 sm:-right-4" />
            </Carousel>
          </div>
          
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2 sm:px-0">Join 2,147 successful Spanish learners</p>
          </div>
        </div>
      </section>

      {/* SECTION 6: GUARANTEE SECTION */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-24" style={{ background: 'linear-gradient(135deg, #84FFB9 0%, #A9FFCE 100%)' }}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-12 mx-2 sm:mx-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 px-2 sm:px-0">
              100% Satisfaction Guarantee
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0">
              Try our program risk-free for 30 days. If you're not completely satisfied with your progress, 
              we'll refund your investment, no questions asked.
            </p>
            <div className="bg-green-50 p-3 sm:p-4 md:p-6 rounded-xl">
              <p className="text-sm sm:text-base md:text-lg font-semibold text-green-800">
                Your success is our commitment. We're confident you'll love the results!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FINAL TESTIMONIALS */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-24" style={{ backgroundColor: '#F7F4EE' }}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">
              What Our Students Say
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2 sm:px-0">
              Don't just take our word for it - hear from our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {textTestimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mx-2 sm:mx-0">
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-3 sm:mb-4 md:mb-6 italic text-sm sm:text-base md:text-lg">"{testimonial.quote}"</p>
                <p className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

                  {/* FINAL CTA SECTION */}
      <section id="calendar-section" className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">
            Ready to Transform Your Spanish?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0">
            Join thousands of students who have already transformed their Spanish skills with SpanishVIP.
          </p>
          
          <Button
            onClick={() => document.getElementById('book-class-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto max-w-sm sm:max-w-none mx-2 sm:mx-0"
          >
            Book Your Free Class <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-6 sm:py-8 md:py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100 mx-2 sm:mx-0">
            <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
              This isn't a formal test to evaluate your Spanish skills — it's just a fun way to get to know you better 
              so we can send you personalized recommendations, resources, and exclusive deals from SpanishVIP. 🎁✨<br/>
              So no pressure — just enjoy it!
            </p>
          </div>
        </div>
      </section>

            {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-6xl w-full p-0 mx-0 bg-transparent">
          <div className="relative aspect-video w-full">
            {selectedVideo && (
              <>
                <button
                  onClick={closeVideoModal}
                  aria-label="Close video"
                  className="absolute top-2 right-2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1.5 sm:p-2 shadow"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <iframe
                  src={selectedVideo}
                  title="Student Testimonial"
                  className="w-full h-full"
                  allowFullScreen
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Testimonial Video Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all p-4"
          onClick={closeTestimonialModal}
        >
          <div
            className="relative bg-black rounded-2xl shadow-2xl max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1.5 sm:p-2 shadow"
              onClick={closeTestimonialModal}
              aria-label="Close video"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="aspect-video w-full h-full flex items-center justify-center">
              {selectedVideo && selectedVideo.startsWith('youtube:') ? (
                <iframe
                  src={selectedVideo.replace('youtube:', '') + '?autoplay=1'}
                  title="YouTube video player"
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

      {/* Page animations (confetti CSS removed in favor of react-confetti) */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ConversionLandingPage;