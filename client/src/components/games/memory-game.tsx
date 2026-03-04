import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Timer, Trophy, Star, Zap, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sounds";

import doroHappy from "@assets/doro-face-happy.png";
import doroLove from "@assets/doro-face-love.png";
import doroStar from "@assets/doro-face-star.png";
import doroSleepy from "@assets/doro-face-sleepy.png";
import doroExcited from "@assets/doro-face-excited.png";
import doroCool from "@assets/doro-face-cool.png";
import doroShy from "@assets/doro-face-shy.png";
import doroDiamond from "@assets/doro-face-diamond.png";

const DORO_EMOTES = [
  { id: "happy", image: doroHappy, label: "Happy", color: "#FFB6C1" },
  { id: "love", image: doroLove, label: "Love", color: "#FF69B4" },
  { id: "star", image: doroStar, label: "Star", color: "#FFD700" },
  { id: "sleepy", image: doroSleepy, label: "Sleepy", color: "#87CEEB" },
  { id: "excited", image: doroExcited, label: "Excited", color: "#FF6347" },
  { id: "cool", image: doroCool, label: "Cool", color: "#9B59B6" },
  { id: "shy", image: doroShy, label: "Shy", color: "#F48FB1" },
  { id: "diamond", image: doroDiamond, label: "Diamond", color: "#00CED1" },
];

interface CardState {
  id: number;
  emoteId: string;
  image: string;
  label: string;
  color: string;
  flipped: boolean;
  matched: boolean;
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  shape: "circle" | "square" | "triangle";
  delay: number;
  duration: number;
  wobble: number;
}

interface ComboParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  size: number;
}

interface FlipParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
  size: number;
}

function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    const colors = ["#FFD700", "#FF69B4", "#9B59B6", "#00CED1", "#FF6347", "#87CEEB", "#FFB6C1", "#F48FB1", "#A855F7", "#22D3EE"];
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 80; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 7,
        shape: ["circle", "square", "triangle"][Math.floor(Math.random() * 3)] as ConfettiPiece["shape"],
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 3,
        wobble: (Math.random() - 0.5) * 200,
      });
    }
    setPieces(newPieces);
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}%`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: "100vh",
            x: `${p.x + (p.wobble / 10)}%`,
            opacity: [1, 1, 1, 0],
            rotate: 360 + Math.random() * 720,
            scale: [1, 1.2, 0.8, 0.5],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "triangle" ? "0" : "2px",
            clipPath: p.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
            left: `${p.x}%`,
            boxShadow: `0 0 ${p.size}px ${p.color}60`,
          }}
        />
      ))}
    </div>
  );
}

function FlipParticles({ particles }: { particles: FlipParticle[] }) {
  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.x, y: p.y, scale: 1, opacity: 0.9 }}
          animate={{
            x: p.x + Math.cos(p.angle) * p.speed,
            y: p.y + Math.sin(p.angle) * p.speed,
            scale: 0,
            opacity: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute z-30 pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: "50%",
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </AnimatePresence>
  );
}

function ComboDisplay({ combo, particles }: { combo: number; particles: ComboParticle[] }) {
  return (
    <AnimatePresence>
      {combo >= 2 && (
        <motion.div
          key={`combo-${combo}`}
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
        >
          <div
            className="px-5 py-2.5 rounded-full font-bold text-lg flex items-center gap-2"
            style={{
              background: combo >= 4
                ? "linear-gradient(135deg, #FFD700, #FF6347, #FF69B4)"
                : combo >= 3
                  ? "linear-gradient(135deg, #A855F7, #EC4899)"
                  : "linear-gradient(135deg, #9B59B6, #FF69B4)",
              color: "#fff",
              textShadow: "0 0 10px rgba(255,255,255,0.5)",
              boxShadow: `0 0 20px rgba(155,89,182,0.5), 0 0 40px rgba(255,105,180,0.3), 0 0 ${combo * 15}px rgba(255,215,0,${Math.min(combo * 0.1, 0.5)})`,
            }}
          >
            <Zap className="w-4 h-4" />
            Combo x{combo}!
          </div>
        </motion.div>
      )}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
          animate={{
            x: p.x + Math.cos(p.angle) * 100,
            y: p.y + Math.sin(p.angle) * 100,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute z-20 pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: "50%",
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </AnimatePresence>
  );
}

function AnimatedNumber({ value, label, icon }: { value: string; label: string; icon: typeof Timer }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium" data-testid={`badge-${label.toLowerCase()}`}>
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-muted-foreground text-xs">{label}</span>
      <motion.span
        key={value}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="tabular-nums font-semibold min-w-[1.5rem] text-center"
      >
        {value}
      </motion.span>
    </div>
  );
}

function StarRating({ stars, animate }: { stars: number; animate: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 my-3">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={animate ? { scale: 0, rotate: -180, opacity: 0 } : false}
          animate={
            animate
              ? {
                  scale: i <= stars ? 1 : 0.6,
                  rotate: 0,
                  opacity: i <= stars ? 1 : 0.2,
                }
              : { scale: i <= stars ? 1 : 0.6, opacity: i <= stars ? 1 : 0.2 }
          }
          transition={animate ? { delay: 0.5 + i * 0.3, type: "spring", stiffness: 300, damping: 12 } : undefined}
        >
          <Star
            className={i <= stars ? "w-10 h-10" : "w-7 h-7"}
            fill={i <= stars ? "#FFD700" : "none"}
            stroke={i <= stars ? "#FFD700" : "currentColor"}
            style={
              i <= stars
                ? {
                    filter: "drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 16px rgba(255,215,0,0.5))",
                  }
                : {}
            }
          />
        </motion.div>
      ))}
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden bg-border/30">
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{
          background: pct === 100
            ? "linear-gradient(90deg, #FFD700, #FF69B4)"
            : "linear-gradient(90deg, #9B59B6, #A855F7)",
          boxShadow: pct > 0 ? "0 0 8px rgba(155,89,182,0.4)" : "none",
        }}
      />
    </div>
  );
}

const MEMORY_STYLES = `
  @keyframes matchShimmer {
    0%, 100% { box-shadow: 0 0 10px var(--card-glow), 0 0 20px var(--card-glow); transform: scale(1); }
    50% { box-shadow: 0 0 18px var(--card-glow), 0 0 36px var(--card-glow), 0 0 6px var(--card-glow) inset; transform: scale(1.02); }
  }
  @keyframes cardBackPulse {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.35; }
  }
  @keyframes cardBackShine {
    0% { transform: translateX(-100%) rotate(25deg); }
    100% { transform: translateX(200%) rotate(25deg); }
  }
  .card-scene {
    perspective: 800px;
  }
  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.55s cubic-bezier(0.4, 0.0, 0.2, 1);
    transform-style: preserve-3d;
  }
  .card-inner.is-flipped {
    transform: rotateY(180deg);
  }
  .card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .card-back {
    background: linear-gradient(145deg, #5B1F6E 0%, #7B2D8E 25%, #9B59B6 50%, #A855F7 75%, #7B2D8E 100%);
    border: 2px solid rgba(155,89,182,0.5);
    box-shadow: 0 2px 12px rgba(155,89,182,0.15), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .card-back:hover {
    border-color: rgba(168,85,247,0.7);
    box-shadow: 0 4px 20px rgba(155,89,182,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .card-back-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.2;
    animation: cardBackPulse 3s ease-in-out infinite;
    background-image:
      radial-gradient(circle at 20% 20%, #FFD700 1.5px, transparent 1.5px),
      radial-gradient(circle at 80% 20%, #FF69B4 1px, transparent 1px),
      radial-gradient(circle at 50% 50%, #FFD700 2px, transparent 2px),
      radial-gradient(circle at 20% 80%, #FF69B4 1px, transparent 1px),
      radial-gradient(circle at 80% 80%, #FFD700 1.5px, transparent 1.5px),
      radial-gradient(circle at 35% 35%, #00CED1 1px, transparent 1px),
      radial-gradient(circle at 65% 65%, #00CED1 1px, transparent 1px);
    background-size: 100% 100%;
  }
  .card-back-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      25deg,
      transparent 0%,
      transparent 40%,
      rgba(255,255,255,0.08) 45%,
      rgba(255,255,255,0.15) 50%,
      rgba(255,255,255,0.08) 55%,
      transparent 60%,
      transparent 100%
    );
    animation: cardBackShine 4s ease-in-out infinite;
  }
  .card-back-diamond {
    width: 18px;
    height: 18px;
    background: rgba(255,215,0,0.3);
    transform: rotate(45deg);
    border: 1.5px solid rgba(255,215,0,0.25);
    box-shadow: 0 0 12px rgba(255,215,0,0.15);
    position: relative;
    z-index: 2;
  }
  .card-back-diamond::after {
    content: '';
    position: absolute;
    inset: 3px;
    background: rgba(255,215,0,0.2);
    border-radius: 1px;
  }
  .card-front {
    transform: rotateY(180deg);
    border: 2px solid hsl(var(--border) / 0.3);
    background: hsl(var(--card));
  }
  .card-matched {
    animation: matchShimmer 2s ease-in-out infinite;
  }
  .card-matched .card-front-inner img {
    filter: drop-shadow(0 0 4px var(--card-glow));
  }
`;

export function MemoryGame({ profile }: { profile: any }) {
  const [cards, setCards] = useState<CardState[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [combo, setCombo] = useState(0);
  const [comboParticles, setComboParticles] = useState<ComboParticle[]>([]);
  const [showCombo, setShowCombo] = useState(0);
  const [flipParticles, setFlipParticles] = useState<FlipParticle[]>([]);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem("xdoro-memory-best");
    return saved ? parseInt(saved) : 999;
  });

  const getStarRating = (movesCount: number) => {
    if (movesCount <= 12) return 3;
    if (movesCount <= 18) return 2;
    return 1;
  };

  const spawnFlipParticles = (cardElement: HTMLElement, color: string) => {
    const rect = cardElement.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const cx = rect.left - containerRect.left + rect.width / 2;
    const cy = rect.top - containerRect.top + rect.height / 2;
    const colors = [color, "#FFD700", "#A855F7", "#fff"];
    const newParticles: FlipParticle[] = [];

    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: cx + (Math.random() - 0.5) * 20,
        y: cy + (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5,
        speed: 30 + Math.random() * 40,
        size: 3 + Math.random() * 4,
      });
    }

    setFlipParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setFlipParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 600);
  };

  const spawnComboParticles = () => {
    const colors = ["#FFD700", "#FF69B4", "#9B59B6", "#00CED1", "#FF6347", "#A855F7"];
    const newParticles: ComboParticle[] = [];
    const cx = containerRef.current ? containerRef.current.offsetWidth / 2 : 200;
    const cy = containerRef.current ? containerRef.current.offsetHeight / 2 : 200;
    for (let i = 0; i < 16; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: cx,
        y: cy,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: (Math.PI * 2 * i) / 16,
        size: 4 + Math.random() * 5,
      });
    }
    setComboParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setComboParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 800);
  };

  const initGame = useCallback(() => {
    const shuffled = [...DORO_EMOTES, ...DORO_EMOTES]
      .sort(() => Math.random() - 0.5)
      .map((emote, i) => ({
        id: i,
        emoteId: emote.id,
        image: emote.image,
        label: emote.label,
        color: emote.color,
        flipped: false,
        matched: false,
      }));
    setCards(shuffled);
    setFlippedIds([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setGameActive(true);
    setGameComplete(false);
    setCombo(0);
    setShowCombo(0);
    setComboParticles([]);
    setFlipParticles([]);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (!gameActive || gameComplete) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameActive, gameComplete]);

  useEffect(() => {
    if (matches === DORO_EMOTES.length && matches > 0) {
      sfx.victory();
      setGameComplete(true);
      setGameActive(false);
      if (moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem("xdoro-memory-best", moves.toString());
      }
    }
  }, [matches, moves, bestScore]);

  const handleCardClick = (id: number, e: React.MouseEvent) => {
    if (!gameActive || flippedIds.length >= 2) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;

    const target = (e.currentTarget as HTMLElement);
    spawnFlipParticles(target, card.color);

    const newCards = [...cards];
    newCards[id] = { ...newCards[id], flipped: true };
    setCards(newCards);

    sfx.flip();

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (newCards[first].emoteId === newCards[second].emoteId) {
        setTimeout(() => {
          sfx.match();
          setCards((prev) =>
            prev.map((c) =>
              c.emoteId === newCards[first].emoteId ? { ...c, matched: true } : c
            )
          );
          setMatches((m) => m + 1);
          setFlippedIds([]);

          setCombo((prev) => {
            const newCombo = prev + 1;
            if (newCombo >= 2) {
              setShowCombo(newCombo);
              spawnComboParticles();
              if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
              comboTimerRef.current = setTimeout(() => setShowCombo(0), 1500);
            }
            return newCombo;
          });
        }, 400);
      } else {
        setTimeout(() => {
          sfx.mismatch();
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) ? { ...c, flipped: false } : c
            )
          );
          setFlippedIds([]);
          setCombo(0);
        }, 800);
      }
    }
  };

  const isNewBest = gameComplete && moves <= bestScore;
  const timeStr = `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-4 relative" ref={containerRef}>
      <style>{MEMORY_STYLES}</style>
      <Confetti active={gameComplete} />
      <ComboDisplay combo={showCombo} particles={comboParticles} />
      <FlipParticles particles={flipParticles} />

      <div
        className="flex items-center justify-between gap-3 flex-wrap rounded-xl p-3"
        style={{
          background: "linear-gradient(135deg, rgba(155,89,182,0.08), rgba(255,105,180,0.06))",
          border: "1px solid hsl(var(--border) / 0.5)",
        }}
        data-testid="stats-bar"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <AnimatedNumber value={timeStr} label="Time" icon={Clock} />
          <div className="w-px h-4 bg-border/50" />
          <AnimatedNumber value={moves.toString()} label="Moves" icon={Timer} />
          <div className="w-px h-4 bg-border/50" />
          <div className="flex items-center gap-1.5 text-sm font-medium" data-testid="badge-matches">
            <span className="text-muted-foreground text-xs">Found</span>
            <motion.span
              key={matches}
              initial={{ scale: 1.4, color: "#A855F7" }}
              animate={{ scale: 1, color: "inherit" }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="tabular-nums font-semibold"
            >
              {matches}/{DORO_EMOTES.length}
            </motion.span>
          </div>
          <div className="w-px h-4 bg-border/50" />
          <div className="flex items-center gap-1.5 text-sm font-medium" data-testid="badge-best-score">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="tabular-nums font-semibold">{bestScore === 999 ? "--" : bestScore}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={initGame} data-testid="button-restart-memory">
          <RotateCcw className="w-3 h-3 mr-1" />
          Restart
        </Button>
      </div>

      <ProgressBar current={matches} total={DORO_EMOTES.length} />

      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {cards.map((card, index) => {
          const isOpen = card.flipped || card.matched;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: index * 0.03, type: "spring", stiffness: 300, damping: 20 }}
              whileHover={!isOpen ? { y: -4, scale: 1.04 } : undefined}
              whileTap={{ scale: 0.95 }}
              className="aspect-square card-scene cursor-pointer"
              onClick={(e) => handleCardClick(card.id, e)}
              data-testid={`card-memory-${card.id}`}
            >
              <div
                className={`card-inner ${isOpen ? "is-flipped" : ""}`}
              >
                <div className="card-face card-back">
                  <div className="card-back-pattern" />
                  <div className="card-back-shine" />
                  <div className="card-back-diamond" />
                </div>
                <div
                  className={`card-face card-front ${card.matched ? "card-matched" : ""}`}
                  style={{
                    ...(isOpen
                      ? {
                          backgroundColor: card.color + "15",
                          borderColor: card.color + "55",
                          ["--card-glow" as any]: card.color + "70",
                        }
                      : {}),
                  }}
                >
                  <div className="card-front-inner flex flex-col items-center justify-center p-1">
                    <motion.img
                      src={card.image}
                      alt={card.label}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                      initial={false}
                      animate={card.matched ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                    <span
                      className="text-[8px] sm:text-[9px] mt-0.5 font-medium"
                      style={{ color: card.matched ? card.color : undefined, opacity: card.matched ? 0.9 : 0.5 }}
                    >
                      {card.label}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {gameComplete && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center py-6"
          >
            <Card className="p-6 border-border/50 max-w-sm mx-auto rounded-2xl relative overflow-visible">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
              >
                <h3
                  className="font-game text-xl font-bold mb-1"
                  style={{
                    background: "linear-gradient(135deg, #A855F7, #FF69B4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  You did it!
                </h3>
              </motion.div>

              <StarRating stars={getStarRating(moves)} animate={true} />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-1"
              >
                <p className="text-sm text-muted-foreground">
                  Completed in <span className="font-semibold text-foreground">{moves}</span> moves
                </p>
                <p className="text-xs text-muted-foreground">
                  Time: <span className="font-semibold text-foreground">{timeStr}</span>
                  {combo >= 2 && (
                    <span className="ml-2">
                      Best Combo: <span className="font-semibold" style={{ color: "#A855F7" }}>x{combo}</span>
                    </span>
                  )}
                </p>
              </motion.div>

              {isNewBest && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, type: "spring", stiffness: 300 }}
                  className="mt-3"
                >
                  <Badge
                    style={{
                      background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.1))",
                      color: "#FFD700",
                      border: "1px solid rgba(255,215,0,0.3)",
                      boxShadow: "0 0 16px rgba(255,215,0,0.25)",
                    }}
                  >
                    <Star className="w-3 h-3 mr-1" fill="#FFD700" />
                    New Best Score!
                  </Badge>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-4"
              >
                <Button onClick={initGame} className="rounded-full" data-testid="button-play-again-memory">
                  Play Again
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
