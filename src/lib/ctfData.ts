export interface Question {
  id: string;
  title: string;
  description: string;
  hint: string;
  answer: string;
  points: number;
}

export interface Player {
  name: string;
  rollNo: string;
  pcNo: string;
  score: number;
  startTime: number;
  endTime?: number;
  attempts: Record<string, { answer: string; correct: boolean; timestamp: number }>;
}

export interface LeaderboardEntry {
  name: string;
  rollNo: string;
  pcNo: string;
  score: number;
  time: number;
  completedAt: string;
}

export const QUESTIONS: Question[] = [
  {
    id: "r1",
    title: "ROT13 Cipher Challenge",
    description: "Decode the following ROT13 encoded message: 'frperg_zrffntr'\n\nExample: jbeyq\nProcess: Shift each letter -13 steps: j→w, b→o, e→r, y→l, q→d\nResult: world",
    hint: "ROT13 rotates each letter by 13 positions. A becomes N, B becomes O, etc.",
    answer: "SECRET_MESSAGE",
    points: 10,
  },
  {
    id: "r2",
    title: "Caesar Cipher Breaker",
    description: "Decrypt this Caesar cipher: 'xqorfn_vwdjh'\n\nExample: frgh\nProcess: Shift each letter -3 steps backward: f→c, r→o, g→d, h→e\nResult: code",
    hint: "Caesar cipher shifts letters by a fixed number. Try different shift values (this one uses shift of 3).",
    answer: "UNLOCK_STAGE",
    points: 10,
  },
];

export const TOTAL_TIME_SECONDS = 25 * 60; // 25 minutes

export const getStoredLeaderboard = (): LeaderboardEntry[] => {
  const stored = localStorage.getItem("ctf_leaderboard");
  return stored ? JSON.parse(stored) : [];
};

export const saveToLeaderboard = (entry: LeaderboardEntry): void => {
  const leaderboard = getStoredLeaderboard();
  leaderboard.push(entry);
  localStorage.setItem("ctf_leaderboard", JSON.stringify(leaderboard));
};

export const clearLeaderboard = (): void => {
  localStorage.removeItem("ctf_leaderboard");
};

export const getCurrentPlayer = (): Player | null => {
  const stored = localStorage.getItem("ctf_current_player");
  return stored ? JSON.parse(stored) : null;
};

export const saveCurrentPlayer = (player: Player): void => {
  localStorage.setItem("ctf_current_player", JSON.stringify(player));
};

export const clearCurrentPlayer = (): void => {
  localStorage.removeItem("ctf_current_player");
};

export const exportToExcel = (data: LeaderboardEntry[]): void => {
  const headers = ["Rank", "Name", "Roll No", "PC No", "Score", "Time (seconds)", "Completed At"];
  const sortedData = [...data].sort((a, b) => b.score - a.score || a.time - b.time);
  
  const csvContent = [
    headers.join(","),
    ...sortedData.map((entry, index) => [
      index + 1,
      `"${entry.name}"`,
      `"${entry.rollNo}"`,
      `"${entry.pcNo}"`,
      entry.score,
      entry.time.toFixed(2),
      `"${entry.completedAt}"`,
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `ctf_leaderboard_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
