
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { QuizConfig, QuizParticipant, QuizAnswer, ResultTemplate, EnhancedQuizParticipant } from "@/types/quiz";
import { getNextQuestionId, getPersonalizedResult, sendDataToWebhook, buildWebhookPayload, isAnswerCorrect } from "@/utils/quizUtils";
import IntroductionPage from "./IntroductionPage";
import QuestionCard from "./QuestionCard";
import ConversionLandingPage from "./ConversionLandingPage";
import UserInfoForm from "./UserInfoForm";
import { JourneyAnswer, JourneyUserContext } from "@/lib/buildJourney";

interface QuizControllerProps {
  config: QuizConfig;
}

type QuizStage = "intro" | "questions" | "user-info" | "conversion-landing";

const QuizController = ({ config }: QuizControllerProps) => {
  const [stage, setStage] = useState<QuizStage>("intro");
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    config.questions.length > 0 ? config.questions[0].id : null
  );
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [participant, setParticipant] = useState<EnhancedQuizParticipant>({
    name: "",
    email: "",
    answers: [],
    quizStartTime: undefined,
    questionTimings: {}
  });
  const [personalizedResult, setPersonalizedResult] = useState<ResultTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [gradedAnswers, setGradedAnswers] = useState<JourneyAnswer[]>([]);
  const [userContext, setUserContext] = useState<JourneyUserContext | undefined>(undefined);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const isSubmittingRef = useRef(false);

  // Effect to handle completion of questions and transition to user info stage
  useEffect(() => {
    console.log("Effect triggered - Stage:", stage, "Current Question ID:", currentQuestionId);
    
    if (stage === "questions" && currentQuestionId === null && participant.answers.length > 0) {
      console.log("Quiz questions completed. Transitioning to user info stage.");
      const result = getPersonalizedResult(participant.answers, config.resultTemplates);
      setPersonalizedResult(result);
      setStage("user-info");
    }
  }, [stage, currentQuestionId, participant.answers, config.resultTemplates]);

  const handleStartQuiz = () => {
    console.log("Starting quiz");
    const startTime = new Date();
    setParticipant(prev => ({ ...prev, quizStartTime: startTime }));
    setStage("questions");
    // Add first question to history when starting
    if (config.questions.length > 0) {
      setQuestionHistory([config.questions[0].id]);
      setQuestionStartTime(startTime);
    }
  };



  const handleAnswer = (answer: QuizAnswer) => {
    console.log("Answer received:", answer);
    
    // Calculate time spent on current question
    if (questionStartTime && currentQuestionId) {
      const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
      setParticipant(prev => ({
        ...prev,
        questionTimings: {
          ...prev.questionTimings,
          [currentQuestionId]: timeSpent
        }
      }));
    }
    
    // Update or add the answer
    const existingIndex = participant.answers.findIndex(
      (a) => a.questionId === answer.questionId
    );
    
    if (existingIndex > -1) {
      const updatedAnswers = [...participant.answers];
      updatedAnswers[existingIndex] = answer;
      setParticipant({ ...participant, answers: updatedAnswers });
    } else {
      setParticipant({
        ...participant,
        answers: [...participant.answers, answer]
      });
    }
    
    // Reset question start time for next question
    setQuestionStartTime(new Date());
  };
  
  const handleNext = () => {
    if (!currentQuestionId) {
      console.log("No current question ID, cannot proceed to next question");
      return;
    }
    
    setIsLoading(true);
    console.log("Moving from question:", currentQuestionId);
    
    // Find next question ID
    const nextQuestionId = getNextQuestionId(
      currentQuestionId,
      participant.answers,
      config.questions
    );
    
    console.log("Next question ID determined:", nextQuestionId);
    
    if (nextQuestionId) {
      // Move to next question and add to history
      setTimeout(() => {
        setCurrentQuestionId(nextQuestionId);
        setQuestionHistory(prev => [...prev, nextQuestionId]);
        setQuestionStartTime(new Date());
        setIsLoading(false);
      }, 100); // Small delay for better UX
    } else {
      // End of questions
      console.log("No more questions. Proceeding to user info form.");
      setCurrentQuestionId(null);
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (questionHistory.length <= 1) {
      console.log("Already at first question, cannot go back");
      return;
    }
    
    setIsLoading(true);
    console.log("Going back from question:", currentQuestionId);
    
    // Remove current question from history and go to previous
    const newHistory = [...questionHistory];
    newHistory.pop(); // Remove current question
    const previousQuestionId = newHistory[newHistory.length - 1];
    
    setTimeout(() => {
      setCurrentQuestionId(previousQuestionId);
      setQuestionHistory(newHistory);
      setIsLoading(false);
    }, 100);
  };

  const handleUserInfoSubmit = (name: string, email: string) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    console.log("User info submitted:", name, email);

    // Update participant info
    const updatedParticipant: EnhancedQuizParticipant = {
      ...participant,
      name,
      email
    };

    // Compute graded answers for journey cards (q: numeric id, isCorrect flag)
    try {
      const graded: JourneyAnswer[] = (participant.answers || []).map((a) => {
        const qNum = parseInt(String(a.questionId).replace("q", ""), 10);
        const correct = isAnswerCorrect(a);
        return {
          q: Number.isNaN(qNum) ? 0 : qNum,
          isCorrect: !!correct,
          value: typeof a.value === "string" ? a.value : undefined
        };
      });
      setGradedAnswers(graded);
    } catch (e) {
      console.error("Error grading answers for journey cards:", e);
      setGradedAnswers([]);
    }

    setParticipant(updatedParticipant);

    const payload = buildWebhookPayload(updatedParticipant, config, personalizedResult);

    const doRedirect = () => {
      const destination = new URL('https://spanishvip.com/start-spanish-today/');
      const params = new URLSearchParams();

      params.set('score', String(payload.score));
      if (payload.percentageScore != null) params.set('percentage', String(payload.percentageScore));
      if (payload.resultLevel) {
        const cefrMatch = payload.resultLevel.match(/^(A1|A2|B1|B2|C1|C2)/i);
        params.set('result_level', cefrMatch ? cefrMatch[1].toUpperCase() : payload.resultLevel);
      }
      params.set('total_questions', String(payload.totalQuestions));
      params.set('time_taken_seconds', String(payload.timeTakenSeconds));

      destination.search = params.toString();
      console.log('Quiz redirect URL:', destination.toString());
      window.parent.postMessage({ action: 'redirect', url: destination.toString() }, '*');
    };

    // Send data to webhook if configured, then redirect
    if (config.webhookUrl) {
      sendDataToWebhook(config.webhookUrl, updatedParticipant, config, personalizedResult)
        .then((success) => {
          if (!success) {
            toast({
              title: "Data submission issue",
              description: "There was an issue sending your responses. Please try again later.",
              variant: "destructive"
            });
          }
        })
        .catch(error => {
          console.error("Error sending data to webhook:", error);
          toast({
            title: "Data submission error",
            description: "There was an error submitting your data.",
            variant: "destructive"
          });
        })
        .finally(() => {
          doRedirect();
        });
    } else {
      doRedirect();
    }
  };
  
  const handleExternalRedirect = () => {
    // Post a message to parent to handle redirection
    if (config.externalRedirectUrl) {
      window.parent.postMessage({ action: 'redirect', url: config.externalRedirectUrl }, '*');
    }
  };

  // DEBUG: Function to jump directly to conversion landing page
  const handleDebugLanding = () => {
    // Set up mock data for testing
    const mockParticipant = {
      name: "Test User",
      email: "test@example.com",
      answers: []
    };
    const mockResult = config.resultTemplates.length > 0 ? config.resultTemplates[0] : null;

    setParticipant(mockParticipant);
    setPersonalizedResult(mockResult);
    setStage("conversion-landing");
  };

  // DEBUG: Function to jump to user info form with random answers pre-loaded
  const handleDebugUserInfo = () => {
    const randomAnswers: QuizAnswer[] = config.questions.map((q) => {
      let value: string;
      if ((q.type === 'mcq' || q.type === 'audio') && q.options && q.options.length > 0) {
        value = q.options[Math.floor(Math.random() * q.options.length)].value;
      } else if (q.type === 'image-selection' && q.imageOptions && q.imageOptions.length > 0) {
        value = q.imageOptions[Math.floor(Math.random() * q.imageOptions.length)].value;
      } else {
        value = 'debug_answer';
      }
      return { questionId: q.id, type: q.type, value };
    });

    const mockStartTime = new Date(Date.now() - 180000); // 3 minutes ago
    const mockParticipant: EnhancedQuizParticipant = {
      name: "",
      email: "",
      answers: randomAnswers,
      quizStartTime: mockStartTime,
      questionTimings: {}
    };

    const result = getPersonalizedResult(randomAnswers, config.resultTemplates);
    setParticipant(mockParticipant);
    setPersonalizedResult(result);
    setStage("user-info");
  };
  
  // Calculate progress
  const calculateProgress = () => {
    if (!currentQuestionId || config.questions.length === 0) return 0;
    
    const currentIndex = config.questions.findIndex(q => q.id === currentQuestionId);
    if (currentIndex === -1) return 0;
    
    return Math.round(((currentIndex + 1) / config.questions.length) * 100);
  };
  
  // Find current question
  const currentQuestion = currentQuestionId
    ? config.questions.find(q => q.id === currentQuestionId)
    : null;
  
  // Find current answer if it exists
  const currentAnswer = currentQuestionId
    ? participant.answers.find(a => a.questionId === currentQuestionId)
    : undefined;

  console.log("Current stage:", stage, "Current question ID:", currentQuestionId, "Answers count:", participant.answers.length);

  // Check if we can go back (not on first question)
  const canGoBack = questionHistory.length > 1;

  // Render the appropriate stage
  const renderStage = () => {
    switch (stage) {
      case "intro":
        return (
          <IntroductionPage
            config={config}
            onStart={handleStartQuiz}
            onDebugLanding={handleDebugLanding}
            onDebugUserInfo={handleDebugUserInfo}
          />
        );
      case "questions":
        if (isLoading) {
          return (
            <div className="quiz-container flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent"></div>
                <p className="mt-2 text-gray-600">Loading next question...</p>
              </div>
            </div>
          );
        }
        
        return currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            progress={calculateProgress()}
            currentAnswer={currentAnswer}
            canGoBack={canGoBack}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        ) : (
          <div className="quiz-container">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent"></div>
              <p className="mt-2 text-gray-600">Preparing your results...</p>
            </div>
          </div>
        );
      case "user-info":
        return (
          <UserInfoForm 
            onSubmit={handleUserInfoSubmit}
            config={config}
          />
        );
      case "conversion-landing":
        return (
          <ConversionLandingPage
            config={config}
            participant={participant}
            personalizedResult={personalizedResult}
            gradedAnswers={gradedAnswers}
            userContext={userContext}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-quiz-gray-light p-4">
      {renderStage()}
    </div>
  );
};

export default QuizController;
