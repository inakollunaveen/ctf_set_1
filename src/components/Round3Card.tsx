import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle, AlertCircle, Code, Lightbulb } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Round3CardProps {
  teamId: string;
  isLocked: boolean;
  attempt?: { answer: string; correct: boolean; timestamp: number };
  onComplete: (identifier: string, correct: boolean) => void;
  onHintUsed?: () => void;
  hintUsed?: boolean;
}

const Round3Card = ({ teamId, isLocked, attempt, onComplete, onHintUsed, hintUsed = false }: Round3CardProps) => {
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter the unique identifier.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/validate-round3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId,
          identifier: identifier.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Round 3 Completed!",
          description: `+${hintUsed ? 5 : 10} points earned${hintUsed ? " (hint used: -5)" : ""}.`,
        });
        onComplete(identifier, true, hintUsed);
      } else {
        toast({
          title: "Incorrect Identifier",
          description: "The identifier you entered is invalid. Try again.",
          variant: "destructive",
        });
        onComplete(identifier, false, hintUsed);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate. Please check if the backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <Card className="ctf-card border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Round 3: Header Challenge
          </CardTitle>
          <CardDescription>
            Complete Round 2 to unlock this challenge.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isCompleted = attempt?.correct;

  return (
    <Card className={`ctf-card ${isCompleted ? 'border-green-500' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Code className="h-5 w-5" />
          )}
          Round 3: Header Challenge
          {isCompleted && <Badge variant="secondary">Completed</Badge>}
        </CardTitle>
        <CardDescription>
          Use HTTP headers to access a hidden endpoint and extract the unique identifier.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-500/15 border border-blue-500/30 rounded-xl p-5 mb-4 font-mono text-base font-medium leading-relaxed">
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Open the link <code className="bg-background px-1 py-0.5 rounded">http://localhost:3001/api/hidden?team_id={teamId}</code> in your browser and locate the token shown as X-XXXXX-Token.</li>
            <li>Copy the token value exactly as displayed.</li>
            <li>Send a GET request using curl by placing the token into the header:</li>
          </ol>
          <pre className="bg-background p-2 rounded text-sm overflow-x-auto mt-2">
            curl -H "X-XXXXX-Token: open_sesame" "http://localhost:3001/api/hidden?team_id={teamId}"
          </pre>
          <p className="text-sm text-muted-foreground mt-2">
            4. The response will contain a flag—extract and submit only the flag ID portion.
          </p>
        </div>

        {/* Hint Section */}
        {!isCompleted && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">Hint</span>
                {hintUsed && <Badge variant="outline" className="text-yellow-600">Used (-5 points)</Badge>}
              </div>
              {!showHint && !hintUsed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowHint(true);
                    onHintUsed?.();
                  }}
                >
                  Show Hint (-5 points)
                </Button>
              )}
            </div>
            {showHint && (
              <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                <div>
                  <strong>Hint:</strong>
                </div>
                <pre className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded text-xs overflow-x-auto">
                  curl -H "X-XXXXX-Token: open_sesame" "http://localhost:3001/api/hidden?team_id=your_pc_number"
                </pre>
                <div className="text-black font-semibold">
                  paste in cmd prompt
                </div>
                <div>
                  <strong>Example:</strong><br />
                  If the response is <code>flag&#123;shadowbreak_mission_1_d04acb46f025&#125;</code><br />
                  Submit only the flag ID: <code>d04acb46f02</code>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="identifier">Unique Identifier</Label>
          <Input
            id="identifier"
            placeholder="Enter the 12-character identifier"
            value={isCompleted ? attempt?.answer || "" : identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            maxLength={12}
            disabled={isCompleted}
          />
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isCompleted}
            className="w-full"
          >
            {isSubmitting ? "Validating..." : isCompleted ? "Completed" : "Submit Identifier"}
          </Button>
        </div>

        {attempt && (
          <div className="flex items-center gap-2 text-sm">
            {attempt.correct ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Correct: +{(attempt as any).hintUsed ? 5 : 10} points{(attempt as any).hintUsed ? " (hint used: -5)" : ""}</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600">Incorrect attempt</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Round3Card;