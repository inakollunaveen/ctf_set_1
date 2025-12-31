import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Trophy, Flag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Timer from "@/components/Timer";
import QuestionCard from "@/components/QuestionCard";
import {
  QUESTIONS,
  TOTAL_TIME_SECONDS,
  getCurrentPlayer,
  saveCurrentPlayer,
  saveToLeaderboard,
  clearCurrentPlayer,
  Player,
} from "@/lib/ctfData";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  useEffect(() => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) {
      navigate("/");
      return;
    }
    setPlayer(currentPlayer);
  }, [navigate]);

  const calculateScore = useCallback((attempts: Player["attempts"], hintUsage: Record<string, boolean>) => {
    const scores = Object.entries(attempts)
      .filter(([_, a]) => a.correct)
      .map(([id, _]) => hintUsage[id] ? 5 : 10); // -5 if hint was used
    return scores.sort((a, b) => b - a).slice(0, 3).reduce((sum, s) => sum + s, 0);
  }, []);

  const [hintUsage, setHintUsage] = useState<Record<string, boolean>>(() => {
    const stored = localStorage.getItem("ctf_hint_usage");
    return stored ? JSON.parse(stored) : {};
  });

  const handleHintUsed = useCallback((questionId: string) => {
    setHintUsage(prev => {
      const updated = { ...prev, [questionId]: true };
      localStorage.setItem("ctf_hint_usage", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSubmit = useCallback(
    (questionId: string, answer: string, hintUsed: boolean) => {
      if (!player) return;

      const question = QUESTIONS.find((q) => q.id === questionId);
      if (!question) return;

      const isCorrect = answer.toUpperCase() === question.answer;
      const pointsEarned = hintUsed ? 5 : 10;

      const updatedPlayer = {
        ...player,
        attempts: {
          ...player.attempts,
          [questionId]: {
            answer,
            correct: isCorrect,
            timestamp: Date.now(),
            hintUsed,
          },
        },
      };

      updatedPlayer.score = calculateScore(updatedPlayer.attempts, hintUsage);
      setPlayer(updatedPlayer);
      saveCurrentPlayer(updatedPlayer);

      if (isCorrect) {
        toast({
          title: "✓ Correct Answer!",
          description: `+${pointsEarned} points earned${hintUsed ? " (hint used: -5)" : ""}.`,
        });
      } else {
        toast({
          title: "✗ Incorrect",
          description: "Try again or move to another question.",
          variant: "destructive",
        });
      }
    },
    [player, calculateScore, hintUsage]
  );

  const handleFinish = useCallback(() => {
    if (!player) return;

    const attemptCount = Object.keys(player.attempts).length;
    if (attemptCount < 3) {
      toast({
        title: "Not Enough Attempts",
        description: `You need to attempt at least 3 questions. Currently: ${attemptCount}/3`,
        variant: "destructive",
      });
      return;
    }

    setShowFinishDialog(true);
  }, [player]);

  const confirmFinish = useCallback(() => {
    if (!player) return;

    const endTime = Date.now();
    const timeElapsed = (endTime - player.startTime) / 1000;

    const entry = {
      name: player.name,
      rollNo: player.rollNo,
      pcNo: player.pcNo,
      score: player.score,
      time: timeElapsed,
      completedAt: new Date().toISOString(),
    };

    saveToLeaderboard(entry);
    clearCurrentPlayer();

    toast({
      title: "🎉 Mission Complete!",
      description: `Final Score: ${player.score}/30`,
    });

    navigate("/leaderboard");
  }, [player, navigate]);

  const handleTimeUp = useCallback(() => {
    if (!player) return;

    toast({
      title: "⏱️ Time's Up!",
      description: "Submitting your progress...",
      variant: "destructive",
    });

    const endTime = Date.now();
    const timeElapsed = (endTime - player.startTime) / 1000;

    const entry = {
      name: player.name,
      rollNo: player.rollNo,
      pcNo: player.pcNo,
      score: player.score,
      time: timeElapsed,
      completedAt: new Date().toISOString(),
    };

    saveToLeaderboard(entry);
    clearCurrentPlayer();
    navigate("/leaderboard");
  }, [player, navigate]);

  if (!player) return null;

  const attemptCount = Object.keys(player.attempts).length;
  const correctCount = Object.values(player.attempts).filter((a) => a.correct).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo & User */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-foreground">CTF Challenge</h1>
                  <p className="text-sm text-muted-foreground">
                    Agent: {player.name} • PC {player.pcNo}
                  </p>
                </div>
              </div>
            </div>

            {/* Score & Timer */}
            <div className="flex items-center gap-4">
              {/* Score Badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold">
                <Trophy className="h-5 w-5" />
                <span>{player.score}/30</span>
              </div>

              {/* Timer */}
              <Timer
                startTime={player.startTime}
                totalSeconds={TOTAL_TIME_SECONDS}
                onTimeUp={handleTimeUp}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Progress Info */}
        <div className="ctf-card p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                Mission Progress
              </h2>
              <p className="text-muted-foreground">
                Attempt any 3 out of 4 questions. Best 3 scores count.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{attemptCount}/4</p>
                <p className="text-sm text-muted-foreground">Attempted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{correctCount}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {/* Info about choice rounds */}
          <div className="text-center text-muted-foreground text-sm mb-2">
            Complete Round 1 → Unlock Round 2 → Unlock Rounds 3 & 4 (Choose any one)
          </div>
          
          {QUESTIONS.map((question, index) => {
            // Unlock logic: R1 always open, R2 after R1 correct, R3 & R4 after R2 correct
            const r1Correct = player.attempts["r1"]?.correct;
            const r2Correct = player.attempts["r2"]?.correct;
            
            let isLocked = false;
            if (index === 1) isLocked = !r1Correct; // Round 2
            if (index === 2 || index === 3) isLocked = !r2Correct; // Round 3 & 4
            
            const isChoice = index === 2 || index === 3; // Round 3 & 4 are choice
            
            return (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                attempt={player.attempts[question.id]}
                onSubmit={handleSubmit}
                isLocked={isLocked}
                isChoice={isChoice}
                onHintUsed={handleHintUsed}
                hintUsed={hintUsage[question.id] || false}
              />
            );
          })}
        </div>

        {/* Finish Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleFinish}
            variant="hero"
            size="xl"
            disabled={attemptCount < 3}
            className="gap-3"
          >
            <Flag className="h-6 w-6" />
            Finish Mission
          </Button>
        </div>

        {attemptCount < 3 && (
          <p className="text-center text-muted-foreground mt-4 flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Attempt at least 3 questions to finish
          </p>
        )}
      </main>

      {/* Finish Confirmation Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Mission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to finish? Your current score is{" "}
              <strong>{player.score}/30</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Playing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFinish}>
              Finish Mission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
