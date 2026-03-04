import { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Trophy, Bot, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sounds";

type Cell = "X" | "O" | null;
type Board = Cell[];
type Difficulty = "easy" | "medium" | "hard";

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: Board): Cell | "draw" | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every((c) => c !== null)) return "draw";
  return null;
}

function minimax(board: Board, isMaximizing: boolean, depth: number): number {
  const result = checkWinner(board);
  if (result === "O") return 10 - depth;
  if (result === "X") return -10 + depth;
  if (result === "draw") return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, false, depth + 1));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "X";
        best = Math.min(best, minimax(board, true, depth + 1));
        board[i] = null;
      }
    }
    return best;
  }
}

function getEmpties(board: Board): number[] {
  return board.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0);
}

function getBotMove(board: Board, difficulty: Difficulty, marker: Cell = "O"): number {
  const empties = getEmpties(board);
  if (empties.length === 0) return -1;

  if (difficulty === "easy") {
    if (Math.random() < 0.15) {
      const opponent = marker === "O" ? "X" : "O";
      for (const [a, b, c] of WINNING_LINES) {
        const line = [board[a], board[b], board[c]];
        if (line.filter((v) => v === opponent).length === 2 && line.includes(null)) {
          const idx = [a, b, c][line.indexOf(null)];
          return idx;
        }
      }
    }
    return empties[Math.floor(Math.random() * empties.length)];
  }

  if (difficulty === "medium") {
    if (Math.random() < 0.35) {
      return empties[Math.floor(Math.random() * empties.length)];
    }
  }

  let bestScore = -Infinity;
  let bestMove = empties[0];
  const isMax = marker === "O";

  for (const i of empties) {
    board[i] = marker;
    const score = isMax
      ? minimax(board, false, 0)
      : -minimax(board, true, 0);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; desc: string }> = {
  easy: { label: "Easy", desc: "Random moves" },
  medium: { label: "Medium", desc: "Mixed strategy" },
  hard: { label: "Hard", desc: "Near-perfect play" },
};

export function TicTacToeGame({ profile }: { profile: any }) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [botVsBot, setBotVsBot] = useState(false);
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("xdoro-ttt-stats");
    try {
      return saved ? JSON.parse(saved) : { wins: 0, losses: 0, draws: 0 };
    } catch {
      return { wins: 0, losses: 0, draws: 0 };
    }
  });
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  const resetGame = useCallback(() => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    botTimerRef.current = null;
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setResult(null);
    setWinLine(null);
    setBotVsBot(false);
  }, []);

  const checkResult = useCallback(
    (newBoard: Board) => {
      const winner = checkWinner(newBoard);
      if (winner) {
        if (winner === "draw") {
          setResult("Draw!");
          sfx.draw();
          if (!botVsBot) {
            setStats((s: any) => {
              const newStats = { ...s, draws: s.draws + 1 };
              localStorage.setItem("xdoro-ttt-stats", JSON.stringify(newStats));
              return newStats;
            });
          }
        } else {
          for (const line of WINNING_LINES) {
            if (newBoard[line[0]] === winner && newBoard[line[1]] === winner && newBoard[line[2]] === winner) {
              setWinLine(line);
              break;
            }
          }
          if (botVsBot) {
            setResult(winner === "X" ? "Bot X wins!" : "Bot O wins!");
          } else if (winner === "X") {
            setResult("You win!");
            sfx.victory();
            setStats((s: any) => {
              const newStats = { ...s, wins: s.wins + 1 };
              localStorage.setItem("xdoro-ttt-stats", JSON.stringify(newStats));
              return newStats;
            });
          } else {
            setResult("Doro Bot wins!");
            sfx.defeat();
            setStats((s: any) => {
              const newStats = { ...s, losses: s.losses + 1 };
              localStorage.setItem("xdoro-ttt-stats", JSON.stringify(newStats));
              return newStats;
            });
          }
        }
        return true;
      }
      return false;
    },
    [botVsBot]
  );

  const handleCellClick = (index: number) => {
    if (board[index] || !isPlayerTurn || result || botVsBot) return;
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    sfx.place();
    if (!checkResult(newBoard)) {
      setIsPlayerTurn(false);
    }
  };

  useEffect(() => {
    if (isPlayerTurn || result) return;
    if (botVsBot) return;
    const timeout = setTimeout(() => {
      const newBoard = [...board];
      const move = getBotMove([...newBoard], difficulty);
      if (move >= 0) {
        newBoard[move] = "O";
        setBoard(newBoard);
        sfx.place();
        checkResult(newBoard);
      }
      setIsPlayerTurn(true);
    }, 400 + Math.random() * 300);
    botTimerRef.current = timeout;
    return () => clearTimeout(timeout);
  }, [isPlayerTurn, board, result, checkResult, difficulty, botVsBot]);

  const startBotVsBot = useCallback(() => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    setBoard(Array(9).fill(null));
    setResult(null);
    setWinLine(null);
    setBotVsBot(true);
    setIsPlayerTurn(true);
  }, []);

  useEffect(() => {
    if (!botVsBot || result) return;

    const currentBoard = [...board];
    const xCount = currentBoard.filter((c) => c === "X").length;
    const oCount = currentBoard.filter((c) => c === "O").length;
    const isXTurn = xCount === oCount;
    const marker: Cell = isXTurn ? "X" : "O";

    const timeout = setTimeout(() => {
      const newBoard = [...currentBoard];
      const botDiff = isXTurn ? "medium" : difficulty;
      const move = getBotMove([...newBoard], botDiff, marker);
      if (move >= 0) {
        newBoard[move] = marker;
        setBoard(newBoard);
        sfx.place();
        checkResult(newBoard);
      }
    }, 600 + Math.random() * 400);
    botTimerRef.current = timeout;
    return () => clearTimeout(timeout);
  }, [board, botVsBot, result, difficulty, checkResult]);

  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    resetGame();
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[11px]" data-testid="badge-ttt-wins">W:{stats.wins}</Badge>
          <Badge variant="outline" className="text-[11px]">L:{stats.losses}</Badge>
          <Badge variant="outline" className="text-[11px]">D:{stats.draws}</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={startBotVsBot} data-testid="button-bot-vs-bot">
            <Eye className="w-3 h-3 mr-1" />
            Watch
          </Button>
          <Button variant="outline" size="sm" onClick={resetGame} data-testid="button-reset-ttt">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1.5" data-testid="ttt-difficulty-selector">
        <Bot className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground mr-1">Bot:</span>
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => changeDifficulty(d)}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
              difficulty === d
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground"
            }`}
            data-testid={`button-ttt-difficulty-${d}`}
          >
            {DIFFICULTY_CONFIG[d].label}
          </button>
        ))}
      </div>

      {botVsBot && !result && (
        <div className="text-center">
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-400/20">
            <Eye className="w-3 h-3 mr-1" />
            Bot vs Bot - Spectating
          </Badge>
        </div>
      )}

      <Card className="p-5 bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl">
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {board.map((cell, i) => (
            <motion.button
              key={i}
              whileHover={!botVsBot && !cell && !result ? { scale: 1.05 } : undefined}
              whileTap={!botVsBot && !cell && !result ? { scale: 0.95 } : undefined}
              className={`aspect-square rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                cell
                  ? "border-border/40"
                  : botVsBot || result
                    ? "border-border/20"
                    : "border-border/20 cursor-pointer hover:border-primary/40 hover:bg-primary/5"
              } ${
                winLine?.includes(i)
                  ? "bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-400/50 shadow-lg shadow-pink-500/10"
                  : "bg-card/40"
              }`}
              onClick={() => handleCellClick(i)}
              data-testid={`cell-ttt-${i}`}
            >
              <AnimatePresence>
                {cell === "X" && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-pink-400 drop-shadow-sm"
                  >
                    (^.^)
                  </motion.span>
                )}
                {cell === "O" && (
                  <motion.span
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-purple-400 text-lg drop-shadow-sm"
                  >
                    (o.o)
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </Card>

      <div className="text-center">
        {result ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="font-bold">{result}</p>
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" onClick={resetGame} data-testid="button-play-again-ttt">
                Play Again
              </Button>
              <Button size="sm" variant="outline" onClick={startBotVsBot} data-testid="button-watch-again">
                Watch Bots
              </Button>
            </div>
          </motion.div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {botVsBot
              ? "Bots are playing..."
              : isPlayerTurn
                ? "Your turn! You are (^.^)"
                : "Doro Bot is thinking..."}
          </p>
        )}
      </div>
    </div>
  );
}
