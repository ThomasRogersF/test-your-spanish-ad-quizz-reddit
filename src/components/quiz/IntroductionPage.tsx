
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuizConfig } from "@/types/quiz";
import { ArrowRight, Settings } from "lucide-react";
import { useState } from "react";

interface IntroductionPageProps {
  config: QuizConfig;
  onStart: () => void;
  onDebugLanding?: () => void;
  onDebugUserInfo?: () => void;
}

const IntroductionPage = ({ config, onStart, onDebugLanding, onDebugUserInfo }: IntroductionPageProps) => {
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  return (
    <div className="quiz-container w-full max-w-md animate-fade-in shadow-soft">
      {config.logoUrl && (
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={() => window.parent.postMessage({ action: 'redirect', url: 'https://spanishvip.com/' }, '*')}
            aria-label="Go to SpanishVIP website"
            title="SpanishVIP"
            className="focus:outline-none"
          >
            <img 
              src={config.logoUrl} 
              alt={`${config.title} logo`}
              className="h-12 w-auto"
            />
          </button>
        </div>
      )}
      
      <h1 className="quiz-title font-bold">
        {config.title} ✨
      </h1>
      
      {config.description && (
        <p className="quiz-subtitle mb-6">{config.description}</p>
      )}

      {config.introImageUrl && (
        <div className="mb-6 rounded-[1rem] overflow-hidden shadow-md">
          <img 
            src={config.introImageUrl}
            alt="Quiz introduction"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Move Start Now button right below the image */}
      <Button 
        className="quiz-button w-full mb-3 group shadow-soft"
        onClick={onStart}
      >
        Start Now
        <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
      </Button>

      <Button 
        variant="outline" 
        className="w-full mb-6"
        onClick={() => window.parent.postMessage({ action: 'redirect', url: 'https://spanishvip.com/' }, '*')}
        aria-label="Go back to SpanishVIP"
        title="Go back to SpanishVIP"
      >
        Go back to SpanishVIP
      </Button>

      {config.introText && (
        <div className="mb-8 text-gray-700 bg-brand-background p-5 rounded-[1rem]">
          <p>{config.introText}</p>
        </div>
      )}

      {config.estimatedTime && (
        <p className="text-sm text-gray-500 text-center mt-4">
          ⏱️ Estimated time: {config.estimatedTime}
        </p>
      )}

      {/* Dev Panel */}
      {onDebugLanding && (
        <Dialog open={isDebugOpen} onOpenChange={setIsDebugOpen}>
          <DialogTrigger asChild>
            <button
              className="fixed bottom-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Dev Panel (debug mode)"
            >
              <Settings size={20} />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dev Panel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Skip the quiz for debugging purposes:</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onDebugLanding();
                  setIsDebugOpen(false);
                }}
              >
                Skip to Conversion Landing Page
              </Button>
              {onDebugUserInfo && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onDebugUserInfo();
                    setIsDebugOpen(false);
                  }}
                >
                  Skip to Name/Email Form (random answers)
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default IntroductionPage;
