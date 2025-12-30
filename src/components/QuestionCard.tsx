import { useState } from "react";
import { Shield, Lock, CheckCircle2, XCircle, Lightbulb, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Question } from "@/lib/ctfData";

interface QuestionCardProps {
  question: Question;
  index: number;
  attempt?: { answer: string; correct: boolean };
  onSubmit: (questionId: string, answer: string) => void;
}

const QuestionCard = ({ question, index, attempt, onSubmit }: QuestionCardProps) => {
  const [answer, setAnswer] = useState(attempt?.answer || "");
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSubmit(question.id, answer.trim());
    setIsSubmitting(false);
  };

  const isAttempted = !!attempt;
  const isCorrect = attempt?.correct;

  return (
    <div
      className={`ctf-card p-6 transition-all duration-300 animate-slide-up ${
        isCorrect
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
            <h3 className="font-semibold text-lg text-foreground">
              Round {index + 1}: {question.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {question.points} points
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
      <div className="bg-muted/50 rounded-xl p-4 mb-4 font-mono text-sm font-medium">
        {question.description.split('\n').map((line, i) => (
          <p key={i} className="text-foreground">{line}</p>
        ))}
      </div>

      {/* Hint Toggle */}
      <button
        onClick={() => setShowHint(!showHint)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <Lightbulb className="h-4 w-4" />
        <span>{showHint ? "Hide Hint" : "Show Hint"}</span>
        {showHint ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {showHint && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-4 text-sm text-warning animate-fade-in">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{question.hint}</p>
          </div>
        </div>
      )}

      {/* Answer Form */}
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
    </div>
  );
};

export default QuestionCard;
