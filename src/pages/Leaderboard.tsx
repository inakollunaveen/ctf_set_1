import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Medal,
  Download,
  ArrowLeft,
  Crown,
  Clock,
  User,
  Hash,
  Monitor,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getStoredLeaderboard,
  exportToExcel,
  LeaderboardEntry,
} from "@/lib/ctfData";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const stored = getStoredLeaderboard();
    const sorted = [...stored].sort((a, b) => b.score - a.score || a.time - b.time);
    setEntries(sorted);
  }, []);

  const handleExport = () => {
    if (entries.length === 0) return;
    exportToExcel(entries);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-medium">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/20";
      case 2:
        return "bg-gray-400/10 border-gray-400/20";
      case 3:
        return "bg-amber-600/10 border-amber-600/20";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-2xl text-foreground">
                    CTF Leaderboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {entries.length} participant{entries.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={entries.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {entries.length === 0 ? (
          <div className="ctf-card p-12 text-center animate-fade-in">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Entries Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Be the first to complete the CTF challenge!
            </p>
            <Button onClick={() => navigate("/")}>Start Challenge</Button>
          </div>
        ) : (
          <div className="ctf-card overflow-hidden animate-fade-in">
            {/* Table Header */}
            <div className="bg-muted/50 px-6 py-4 border-b border-border">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Roll No
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  PC No
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone No
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Score
                </div>
                <div className="col-span-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {entries.map((entry, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={`${entry.rollNo}-${entry.completedAt}`}
                    className={`px-6 py-4 hover:bg-muted/30 transition-colors ${getRankBg(rank)}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 flex justify-center">
                        {getRankIcon(rank)}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-foreground">
                          {entry.name}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground font-mono text-sm">
                          {entry.rollNo}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground font-mono text-sm">
                          {entry.pcNo}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground font-mono text-sm">
                          {entry.phoneNo}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                            entry.score === 30
                              ? "bg-primary/20 text-primary"
                              : entry.score >= 20
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {entry.score}/30
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span className="text-muted-foreground font-mono text-sm">
                          {entry.time.toFixed(1)}s
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
