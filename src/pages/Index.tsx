import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, User, Hash, Monitor, Rocket, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveCurrentPlayer } from "@/lib/ctfData";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [pcNo, setPcNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !rollNo.trim() || !pcNo.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const player = {
      name: name.trim(),
      rollNo: rollNo.trim(),
      pcNo: pcNo.trim(),
      score: 0,
      startTime: Date.now(),
      attempts: {},
    };

    saveCurrentPlayer(player);
    
    toast({
      title: "Mission Started!",
      description: "Good luck, Agent. The clock is ticking.",
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            CTF Challenge
          </h1>
          <p className="text-muted-foreground">
            Capture The Flag • Decrypt • Decode • Conquer
          </p>
        </div>

        {/* Login Card */}
        <div className="ctf-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Hash className="h-4 w-4 inline mr-2" />
                Roll Number
              </label>
              <Input
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="Enter your roll number"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Monitor className="h-4 w-4 inline mr-2" />
                PC Number
              </label>
              <Input
                value={pcNo}
                onChange={(e) => setPcNo(e.target.value)}
                placeholder="Enter your PC number"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Rocket className="h-5 w-5" />
                  Start Mission
                </>
              )}
            </Button>
          </form>

          {/* Leaderboard Link */}
          <div className="mt-6 pt-6 border-t border-border">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/leaderboard")}
            >
              <Trophy className="h-5 w-5" />
              View Leaderboard
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Attempt any 3 out of 4 questions • Best 3 scores count
        </p>
      </div>
    </div>
  );
};

export default Index;
