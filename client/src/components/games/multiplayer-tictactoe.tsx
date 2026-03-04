import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Users, Wifi, WifiOff, RotateCcw, Trophy, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sounds";
import { io, Socket } from "socket.io-client";

interface MultiplayerTicTacToeProps {
  profile: any;
}

type GamePhase = "lobby" | "waiting" | "playing" | "finished";

const REACTIONS = ["(^.^)", "(o.o)", "(>.< )", "(T.T)", "(*.*)"];

export function MultiplayerTicTacToe({ profile }: MultiplayerTicTacToeProps) {
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [playerIndex, setPlayerIndex] = useState(-1);
  const [players, setPlayers] = useState<{ name: string; symbol: string }[]>([]);
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [opponentReaction, setOpponentReaction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const reactionTimeout = useRef<number | null>(null);

  const playerName = profile?.trainerName || profile?.username || "Doro Trainer";

  useEffect(() => {
    const s = io(window.location.origin, { path: "/socket.io" });
    setSocket(s);

    s.on("room-created", ({ code, playerIndex: pi }: { code: string; playerIndex: number }) => {
      setRoomCode(code);
      setPlayerIndex(pi);
      setPhase("waiting");
      sfx.click();
    });

    s.on("join-error", ({ message }: { message: string }) => {
      setError(message);
      sfx.mismatch();
    });

    s.on("game-start", ({ players: p, board: b, currentTurn: ct }: any) => {
      setPlayers(p);
      setBoard(b);
      setCurrentTurn(ct);
      setGameOver(false);
      setWinner(null);
      setWinLine(null);
      setIsDraw(false);
      setPhase("playing");
      sfx.match();
    });

    s.on("game-update", (data: any) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      if (data.gameOver) {
        setGameOver(true);
        setWinner(data.winner);
        setWinLine(data.winLine);
        setIsDraw(data.isDraw);
        setPhase("finished");
        if (data.isDraw) sfx.draw();
        else sfx.victory();
      } else {
        sfx.place();
      }
    });

    s.on("opponent-reaction", ({ emoji }: { emoji: string }) => {
      setOpponentReaction(emoji);
      if (reactionTimeout.current) clearTimeout(reactionTimeout.current);
      reactionTimeout.current = window.setTimeout(() => setOpponentReaction(null), 2000);
    });

    s.on("opponent-left", () => {
      setError("Your opponent disconnected.");
      setPhase("lobby");
      sfx.defeat();
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const createRoom = useCallback(() => {
    if (!socket) return;
    setError("");
    socket.emit("create-room", { playerName });
  }, [socket, playerName]);

  const joinRoom = useCallback(() => {
    if (!socket || !joinCode.trim()) return;
    setError("");
    socket.emit("join-room", { code: joinCode.trim(), playerName });
  }, [socket, joinCode, playerName]);

  const makeMove = useCallback((index: number) => {
    if (!socket || gameOver || currentTurn !== playerIndex || board[index] !== null) return;
    socket.emit("game-move", { index });
  }, [socket, gameOver, currentTurn, playerIndex, board]);

  const requestRematch = useCallback(() => {
    if (!socket) return;
    socket.emit("request-rematch");
    sfx.click();
  }, [socket]);

  const sendReaction = useCallback((emoji: string) => {
    if (!socket) return;
    socket.emit("send-reaction", { emoji });
    sfx.click();
  }, [socket]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    sfx.coin();
    setTimeout(() => setCopied(false), 1500);
  }, [roomCode]);

  const leaveRoom = useCallback(() => {
    if (socket) socket.emit("leave-room");
    setPhase("lobby");
    setRoomCode("");
    setJoinCode("");
    setError("");
    setBoard(Array(9).fill(null));
    setPlayers([]);
    setGameOver(false);
    setWinner(null);
    setWinLine(null);
  }, [socket]);

  const isMyTurn = currentTurn === playerIndex;
  const mySymbol = players[playerIndex]?.symbol || "";
  const opponentSymbol = players[1 - playerIndex]?.symbol || "";
  const amWinner = winner === players[playerIndex]?.name;

  if (phase === "lobby") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 max-w-md mx-auto" data-testid="multiplayer-lobby">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-game font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Multiplayer Arena
          </h2>
          <p className="text-sm text-muted-foreground">Play Tic-Tac-Toe against a friend in real-time</p>
        </div>

        {error && (
          <Card className="p-3 border-red-500/30 bg-red-500/10 w-full" data-testid="text-error">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </Card>
        )}

        <Card className="p-6 w-full bg-white/[0.03] border-white/10 rounded-2xl" data-testid="card-create-room">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Create a Room
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Start a new game and share the room code with your friend</p>
          <Button onClick={createRoom} className="w-full" data-testid="button-create-room">
            <Users className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </Card>

        <div className="flex items-center gap-3 text-muted-foreground text-xs w-full">
          <div className="flex-1 h-px bg-white/10" />
          <span>or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Card className="p-6 w-full bg-white/[0.03] border-white/10 rounded-2xl" data-testid="card-join-room">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            Join a Room
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Enter the 5-letter room code from your friend</p>
          <div className="flex gap-2">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABCDE"
              maxLength={5}
              className="font-mono tracking-[0.3em] text-center uppercase bg-white/5 border-white/10"
              data-testid="input-join-code"
            />
            <Button onClick={joinRoom} disabled={joinCode.trim().length < 5} data-testid="button-join-room">
              Join
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div className="flex flex-col items-center gap-6 py-12 max-w-md mx-auto" data-testid="multiplayer-waiting">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
        <h2 className="text-xl font-game font-bold text-white">Waiting for Opponent...</h2>
        <p className="text-sm text-muted-foreground text-center">Share this room code with your friend</p>

        <Card className="p-6 bg-white/[0.03] border-white/10 rounded-2xl" data-testid="card-room-code">
          <div className="flex items-center gap-3">
            <span className="font-mono text-3xl font-bold tracking-[0.4em] text-white" data-testid="text-room-code">
              {roomCode}
            </span>
            <Button variant="outline" size="icon" onClick={copyCode} className="border-white/10" data-testid="button-copy-code">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          {copied && <p className="text-xs text-emerald-400 text-center mt-2">Copied!</p>}
        </Card>

        <Button variant="ghost" onClick={leaveRoom} className="text-muted-foreground" data-testid="button-leave-room">
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 max-w-sm mx-auto" data-testid="multiplayer-game">
      <div className="flex items-center justify-between w-full gap-2">
        <Card className={`flex-1 p-3 rounded-xl text-center transition-all ${playerIndex === 0 ? "border-cyan-500/30 bg-cyan-500/5" : "border-white/5 bg-white/[0.02]"} ${currentTurn === 0 && !gameOver ? "ring-1 ring-cyan-400/50" : ""}`}>
          <p className="text-lg font-game">{players[0]?.symbol}</p>
          <p className="text-[10px] text-muted-foreground truncate">{players[0]?.name}{playerIndex === 0 ? " (You)" : ""}</p>
        </Card>
        <Badge className="text-xs bg-white/5 border-white/10 shrink-0 px-2">VS</Badge>
        <Card className={`flex-1 p-3 rounded-xl text-center transition-all ${playerIndex === 1 ? "border-purple-500/30 bg-purple-500/5" : "border-white/5 bg-white/[0.02]"} ${currentTurn === 1 && !gameOver ? "ring-1 ring-purple-400/50" : ""}`}>
          <p className="text-lg font-game">{players[1]?.symbol}</p>
          <p className="text-[10px] text-muted-foreground truncate">{players[1]?.name}{playerIndex === 1 ? " (You)" : ""}</p>
        </Card>
      </div>

      {!gameOver && (
        <p className="text-sm font-semibold" data-testid="text-turn-status">
          {isMyTurn ? (
            <span className="text-emerald-400">Your turn!</span>
          ) : (
            <span className="text-amber-400">Opponent's turn...</span>
          )}
        </p>
      )}

      <AnimatePresence>
        {opponentReaction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-2xl font-game text-purple-300"
            data-testid="text-opponent-reaction"
          >
            {opponentReaction}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2 w-full aspect-square max-w-[280px]" data-testid="board-multiplayer">
        {board.map((cell, i) => {
          const isWinCell = winLine?.includes(i);
          return (
            <motion.button
              key={i}
              whileTap={!cell && isMyTurn && !gameOver ? { scale: 0.9 } : {}}
              onClick={() => makeMove(i)}
              disabled={!!cell || !isMyTurn || gameOver}
              className={`aspect-square rounded-2xl text-2xl font-game font-bold flex items-center justify-center transition-all border
                ${isWinCell ? "bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border-emerald-400/50 shadow-lg shadow-emerald-500/20" :
                  cell ? "bg-white/[0.05] border-white/10" :
                  isMyTurn && !gameOver ? "bg-white/[0.03] border-white/5 cursor-pointer" :
                  "bg-white/[0.02] border-white/5 cursor-not-allowed opacity-60"
                }`}
              data-testid={`cell-mp-${i}`}
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={cell === mySymbol ? "text-cyan-400" : "text-purple-400"}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          data-testid="card-game-result"
        >
          {isDraw ? (
            <p className="text-xl font-game font-bold text-amber-400 mb-3">It's a Draw!</p>
          ) : amWinner ? (
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <p className="text-xl font-game font-bold text-emerald-400">You Win!</p>
            </div>
          ) : (
            <p className="text-xl font-game font-bold text-red-400 mb-3">You Lose!</p>
          )}
          <div className="flex gap-2 justify-center">
            <Button onClick={requestRematch} data-testid="button-rematch">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Rematch
            </Button>
            <Button variant="outline" onClick={leaveRoom} className="border-white/10" data-testid="button-leave-game">
              Leave
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex gap-1.5 mt-2" data-testid="reactions-bar">
        {REACTIONS.map((r) => (
          <Button
            key={r}
            variant="ghost"
            size="sm"
            onClick={() => sendReaction(r)}
            className="text-base px-2 py-1 rounded-full"
            data-testid={`button-reaction-${r}`}
          >
            {r}
          </Button>
        ))}
      </div>
    </div>
  );
}
