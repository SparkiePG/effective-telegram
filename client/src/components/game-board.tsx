import { useState, useCallback, useEffect, useMemo } from "react";
import { type GameInfo } from "@/lib/gameData";
import { setSoundMuted } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Lightbulb, Gamepad2, Target, Volume2, VolumeX, Keyboard, Trophy, Zap } from "lucide-react";
import { StarField } from "@/components/star-field";
import { MemoryGame } from "@/components/games/memory-game";
import { ClickerGame } from "@/components/games/clicker-game";
import { BattleGame } from "@/components/games/battle-game";
import { RunnerGame } from "@/components/games/runner-game";
import { TicTacToeGame } from "@/components/games/tictactoe-game";
import { SlotsGame } from "@/components/games/slots-game";
import { MultiplayerTicTacToe } from "@/components/games/multiplayer-tictactoe";
import { motion, AnimatePresence } from "framer-motion";

interface GameBoardProps {
  game: GameInfo;
  profile: any;
  onBack: () => void;
}

function AnimatedBackground({ color }: { color: string }) {
  const orbs = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      size: 200 + Math.random() * 300,
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 40,
      duration: 8 + Math.random() * 6,
      delay: i * 1.5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${color}12 0%, transparent 60%), linear-gradient(to bottom, rgba(12,1,24,0.95), var(--background))`,
        }}
      />
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, ${color}08 0%, ${color}03 40%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 15, 0],
            scale: [1, 1.15, 0.9, 1],
            opacity: [0.4, 0.7, 0.3, 0.4],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}30, transparent)`,
        }}
      />
    </div>
  );
}

export function GameBoard({ game, profile, onBack }: GameBoardProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("xdoro-sound");
    return saved !== "off";
  });

  useEffect(() => {
    setSoundMuted(!soundEnabled);
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("xdoro-sound", next ? "on" : "off");
      return next;
    });
  }, []);

  const renderGame = () => {
    switch (game.id) {
      case "memory-match":
        return <MemoryGame profile={profile} />;
      case "doro-clicker":
        return <ClickerGame profile={profile} />;
      case "doro-battle":
        return <BattleGame profile={profile} />;
      case "doro-runner":
        return <RunnerGame profile={profile} />;
      case "doro-tictactoe":
        return <TicTacToeGame profile={profile} />;
      case "doro-slots":
        return <SlotsGame profile={profile} />;
      case "multiplayer-tictactoe":
        return <MultiplayerTicTacToe profile={profile} />;
      default:
        return <div className="text-center text-muted-foreground py-20">Coming soon!</div>;
    }
  };

  const difficultyColors: Record<string, string> = {
    Easy: "#22c55e",
    Medium: "#f59e0b",
    Hard: "#ef4444",
  };
  const diffColor = difficultyColors[game.difficulty] || game.color;

  return (
    <div className="min-h-screen relative pt-16">
      <AnimatedBackground color={game.color} />
      <StarField count={50} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="shrink-0 rounded-full border border-white/10 bg-white/5"
                data-testid="button-back-game"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    className="font-game font-bold text-xl truncate"
                    data-testid="text-game-title"
                    style={{ color: game.color }}
                  >
                    {game.name}
                  </h2>
                  <Badge
                    className="text-[9px] px-1.5 py-0 border shrink-0"
                    style={{
                      color: diffColor,
                      borderColor: diffColor + "30",
                      backgroundColor: diffColor + "10",
                    }}
                  >
                    {game.difficulty}
                  </Badge>
                  <Badge
                    className="text-[9px] px-1.5 py-0 border shrink-0"
                    style={{
                      color: game.color,
                      borderColor: game.color + "20",
                      backgroundColor: game.color + "08",
                    }}
                  >
                    {game.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground/70 line-clamp-1 mt-0.5">
                  {game.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full border transition-colors ${
                  soundEnabled
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-white/10 bg-white/5"
                }`}
                onClick={toggleSound}
                data-testid="button-toggle-sound"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              {game.instructions && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full border text-xs transition-colors ${
                    showInstructions
                      ? "border-white/20 bg-white/10"
                      : "border-white/10 bg-white/5"
                  }`}
                  onClick={() => setShowInstructions(!showInstructions)}
                  data-testid="button-toggle-instructions"
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                  How to Play
                  {showInstructions ? (
                    <ChevronUp className="w-3 h-3 ml-1" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showInstructions && game.instructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden mb-6"
            >
              <Card
                className="p-0 bg-black/50 backdrop-blur-xl border-white/5 rounded-2xl overflow-hidden"
                data-testid="card-instructions"
              >
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${game.color}, ${game.color}60, transparent)`,
                  }}
                />
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: game.color + "18" }}
                        >
                          <Gamepad2 className="w-3.5 h-3.5" style={{ color: game.color }} />
                        </div>
                        <h4 className="text-sm font-semibold">How to Play</h4>
                      </div>
                      <ul className="space-y-2">
                        {game.instructions.howToPlay.map((step, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span
                              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5"
                              style={{
                                backgroundColor: game.color + "15",
                                color: game.color,
                              }}
                            >
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-yellow-500/12 flex items-center justify-center">
                          <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                        </div>
                        <h4 className="text-sm font-semibold">Tips</h4>
                      </div>
                      <ul className="space-y-2">
                        {game.instructions.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <Zap className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/12 flex items-center justify-center">
                          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <h4 className="text-sm font-semibold">Goal</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {game.instructions.winCondition}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/12 flex items-center justify-center">
                          <Keyboard className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <h4 className="text-sm font-semibold">Controls</h4>
                      </div>
                      <ul className="space-y-2">
                        {game.instructions.controls.map((ctrl, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-blue-400/50 shrink-0 mt-1"
                            />
                            <span>{ctrl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {renderGame()}
        </motion.div>
      </div>
    </div>
  );
}
