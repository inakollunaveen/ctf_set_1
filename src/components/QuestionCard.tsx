import { useState } from "react";
import { Shield, Lock, CheckCircle2, XCircle, Lightbulb, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Question } from "@/lib/ctfData";

interface QuestionCardProps {
  question: Question;
  index: number;
  attempt?: { answer: string; correct: boolean; hintUsed?: boolean };
  onSubmit: (questionId: string, answer: string, hintUsed: boolean) => void;
  isLocked?: boolean;
  isChoice?: boolean;
  onHintUsed?: (questionId: string) => void;
  hintUsed?: boolean;
}

const QuestionCard = ({ question, index, attempt, onSubmit, isLocked = false, isChoice = false, onHintUsed, hintUsed = false }: QuestionCardProps) => {
  const [answer, setAnswer] = useState(attempt?.answer || "");
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleHint = () => {
    if (!showHint && !hintUsed && onHintUsed) {
      onHintUsed(question.id);
    }
    setShowHint(!showHint);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSubmit(question.id, answer.trim(), hintUsed);
    setIsSubmitting(false);
  };

  const isAttempted = !!attempt;
  const isCorrect = attempt?.correct;

  return (
    <div
      className={`ctf-card p-6 transition-all duration-300 animate-slide-up ${
        isLocked
          ? "opacity-60 bg-muted/30"
          : isCorrect
          ? "ring-2 ring-primary/50 bg-primary/5"
          : isAttempted
          ? "ring-2 ring-destructive/30 bg-destructive/5"
          : "hover:shadow-ctf-lg"
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl ${
              isCorrect
                ? "bg-primary/20 text-primary"
                : isAttempted
                ? "bg-destructive/20 text-destructive"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : isAttempted ? (
              <XCircle className="h-6 w-6" />
            ) : (
              <Lock className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-foreground">
                Round {index + 1}: {question.title}
              </h3>
              {isChoice && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent-foreground">
                  Choice
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {question.points} points
              {isLocked && " • 🔒 Complete previous round to unlock"}
            </p>
          </div>
        </div>

        {isAttempted && (
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCorrect
                ? "bg-primary/20 text-primary"
                : "bg-destructive/20 text-destructive"
            }`}
          >
            {isCorrect ? "✓ Correct" : "✗ Attempted"}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-muted/50 rounded-xl p-5 mb-4 font-mono text-base font-medium leading-relaxed">
        {question.description.split('\n').map((line, i) => (
          <p key={i} className="text-foreground">{line}</p>
        ))}
      </div>

      {/* Hint Toggle */}
      <button
        onClick={handleToggleHint}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <Lightbulb className="h-4 w-4" />
        <span>{showHint ? "Hide Hint" : "Show Hint"} {hintUsed && "(−5 pts)"}</span>
        {showHint ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {showHint && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-5 mb-4 text-base font-medium text-warning animate-fade-in leading-relaxed">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 mt-0.5 shrink-0" />
            <p>{question.hint}</p>
          </div>
        </div>
      )}

      {/* Answer Form */}
      {isLocked ? (
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded-xl text-muted-foreground">
          <Lock className="h-5 w-5 mr-2" />
          <span>Complete previous round to unlock this question</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer..."
            className="flex-1 bg-background border-border focus:ring-primary"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={!answer.trim() || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit
          </Button>
        </form>
      )}
    </div>
  );
};

export default QuestionCard;
