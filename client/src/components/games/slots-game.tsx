import { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Star, Coins, Trophy, Zap, ChevronDown, ChevronUp, Hash, TrendingUp, Clock, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sounds";

import doroHappy from "@assets/doro-face-happy.png";
import doroLove from "@assets/doro-face-love.png";
import doroStar from "@assets/doro-face-star.png";
import doroCool from "@assets/doro-face-cool.png";
import doroExcited from "@assets/doro-face-excited.png";
import doroShy from "@assets/doro-face-shy.png";
import doroSleepy from "@assets/doro-face-sleepy.png";
import doroDiamond from "@assets/doro-face-diamond.png";

const SYMBOLS = [
  { id: "happy", image: doroHappy, label: "Happy Doro", color: "#FFB6C1", multiplier: 2 },
  { id: "love", image: doroLove, label: "Love Doro", color: "#FF69B4", multiplier: 3 },
  { id: "star", image: doroStar, label: "Star Doro", color: "#FFD700", multiplier: 5 },
  { id: "cool", image: doroCool, label: "Cool Doro", color: "#9B59B6", multiplier: 4 },
  { id: "excited", image: doroExcited, label: "Excited Doro", color: "#FF6347", multiplier: 3 },
  { id: "shy", image: doroShy, label: "Shy Doro", color: "#F48FB1", multiplier: 2 },
  { id: "sleepy", image: doroSleepy, label: "Sleepy Doro", color: "#87CEEB", multiplier: 2 },
  { id: "diamond", image: doroDiamond, label: "Diamond Doro", color: "#00CED1", multiplier: 10 },
];

const REEL_HEIGHT = 140;
const EXTRA_SYMBOLS = 25;

interface ReelSymbol {
  symbol: typeof SYMBOLS[0];
}

interface SpinHistoryEntry {
  reels: [string, string, string];
  bet: number;
  result: "win" | "lose" | "jackpot";
  amount: number;
}

function getRandomSymbol(): ReelSymbol {
  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  return { symbol };
}

function generateReelStrip(): ReelSymbol[] {
  return Array.from({ length: EXTRA_SYMBOLS }, () => getRandomSymbol());
}

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = value;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

function SparkleParticles({ count, isJackpot }: { count: number; isJackpot: boolean }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const distance = 80 + Math.random() * 200;
    const size = isJackpot ? 8 + Math.random() * 12 : 4 + Math.random() * 8;
    return { angle, distance, size, delay: Math.random() * 0.3, id: i };
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "50%",
            width: p.size,
            height: p.size,
            background: isJackpot
              ? `radial-gradient(circle, #FFD700, #FF69B4)`
              : `radial-gradient(circle, #FFD700, #FFA500)`,
            boxShadow: isJackpot
              ? `0 0 ${p.size * 2}px #FFD700, 0 0 ${p.size * 4}px #FF69B4`
              : `0 0 ${p.size}px #FFD700`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1, 0],
          }}
          transition={{
            duration: isJackpot ? 2 : 1.2,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function SingleReel({
  reelIndex,
  spinning,
  finalSymbol,
  strip,
  spinCount,
  stopped,
  onStop,
  isWinningReel,
}: {
  reelIndex: number;
  spinning: boolean;
  finalSymbol: ReelSymbol;
  strip: ReelSymbol[];
  spinCount: number;
  stopped: boolean;
  onStop: () => void;
  isWinningReel: boolean;
}) {
  const fullStrip = [...strip, finalSymbol];
  const totalOffset = -(fullStrip.length - 1) * REEL_HEIGHT;

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        height: `${REEL_HEIGHT}px`,
        background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(15,5,30,0.6) 50%, rgba(0,0,0,0.5) 100%)",
        border: isWinningReel && !spinning
          ? "1px solid rgba(255,215,0,0.5)"
          : "1px solid rgba(255,255,255,0.05)",
        boxShadow: isWinningReel && !spinning
          ? "0 0 15px rgba(255,215,0,0.2), inset 0 0 15px rgba(255,215,0,0.05)"
          : "inset 0 0 20px rgba(0,0,0,0.3)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
      data-testid={`reel-${reelIndex}`}
    >
      {spinning && !stopped ? (
        <div style={{ filter: "blur(1px)" }}>
          <motion.div
            className="flex flex-col items-center"
            initial={{ y: 0 }}
            animate={{ y: totalOffset }}
            transition={{
              duration: 1.2 + reelIndex * 0.4,
              ease: [0.15, 0.6, 0.15, 1],
            }}
            onAnimationComplete={() => {
              sfx.reelTick();
              onStop();
            }}
          >
            {fullStrip.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center shrink-0"
                style={{ height: `${REEL_HEIGHT}px` }}
              >
                <img
                  src={item.symbol.image}
                  alt={item.symbol.label}
                  className="w-16 h-16 object-contain"
                />
                <span className="text-[9px] text-muted-foreground/40 mt-1">
                  {item.symbol.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <motion.div
            className="relative"
            initial={spinCount > 0 ? { scale: 1.3, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: reelIndex * 0.1, type: "spring", stiffness: 300 }}
          >
            <img
              src={finalSymbol.symbol.image}
              alt={finalSymbol.symbol.label}
              className="w-16 h-16 object-contain"
              style={isWinningReel ? {
                filter: "drop-shadow(0 0 8px rgba(255,215,0,0.5))",
              } : {}}
            />
          </motion.div>
          <span className="text-[9px] text-muted-foreground/40 mt-1">
            {finalSymbol.symbol.label}
          </span>
        </div>
      )}

      <div
        className="absolute inset-x-0 top-0 h-6 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-6 pointer-events-none z-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
      />
    </div>
  );
}

function WinMultiplierDisplay({ multiplier, amount }: { multiplier: number; amount: number }) {
  return (
    <motion.div
      className="flex items-center justify-center gap-3"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <div
        className="px-4 py-2 rounded-full font-bold text-sm"
        style={{
          background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,105,180,0.2))",
          border: "1px solid rgba(255,215,0,0.3)",
          color: "#FFD700",
          boxShadow: "0 0 20px rgba(255,215,0,0.15)",
        }}
      >
        {multiplier}x
      </div>
      <motion.div
        className="text-lg font-bold text-yellow-400"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        +<AnimatedCounter value={amount} duration={1200} />
      </motion.div>
    </motion.div>
  );
}

function SpinHistory({ history }: { history: SpinHistoryEntry[] }) {
  if (history.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Clock className="w-3 h-3 text-muted-foreground/50" />
        <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">Recent Spins</span>
      </div>
      <div className="flex flex-col gap-1">
        {history.map((entry, i) => {
          const sym0 = SYMBOLS.find(s => s.id === entry.reels[0]);
          const sym1 = SYMBOLS.find(s => s.id === entry.reels[1]);
          const sym2 = SYMBOLS.find(s => s.id === entry.reels[2]);
          return (
            <motion.div
              key={i}
              initial={i === 0 ? { opacity: 0, x: -10 } : false}
              animate={{ opacity: 1 - i * 0.15, x: 0 }}
              className="flex items-center gap-2 py-1 px-2 rounded-lg"
              style={{
                background: entry.result === "jackpot"
                  ? "rgba(255,215,0,0.08)"
                  : entry.result === "win"
                  ? "rgba(16,185,129,0.06)"
                  : "rgba(255,255,255,0.02)",
              }}
              data-testid={`spin-history-${i}`}
            >
              <div className="flex items-center gap-1">
                {[sym0, sym1, sym2].map((s, j) => (
                  <img key={j} src={s?.image} alt="" className="w-5 h-5 object-contain" />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground/40 ml-auto">{entry.bet}</span>
              <span
                className="text-[10px] font-semibold min-w-[40px] text-right"
                style={{
                  color: entry.result === "jackpot"
                    ? "#FFD700"
                    : entry.result === "win"
                    ? "#10B981"
                    : "rgba(255,255,255,0.25)",
                }}
              >
                {entry.result === "lose" ? "-" + entry.bet : "+" + entry.amount}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function SlotsGame({ profile }: { profile: any }) {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("xdoro-slots-coins");
    return saved ? parseInt(saved) : 500;
  });
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<[ReelSymbol, ReelSymbol, ReelSymbol]>([
    getRandomSymbol(),
    getRandomSymbol(),
    getRandomSymbol(),
  ]);
  const [reelStrips, setReelStrips] = useState<[ReelSymbol[], ReelSymbol[], ReelSymbol[]]>([
    generateReelStrip(),
    generateReelStrip(),
    generateReelStrip(),
  ]);
  const [result, setResult] = useState<{ type: "win" | "lose" | "jackpot"; amount: number; multiplier?: number } | null>(null);
  const [totalWins, setTotalWins] = useState(() => {
    const saved = localStorage.getItem("xdoro-slots-wins");
    return saved ? parseInt(saved) : 0;
  });
  const [biggestWin, setBiggestWin] = useState(() => {
    const saved = localStorage.getItem("xdoro-slots-biggest");
    return saved ? parseInt(saved) : 0;
  });
  const [spinCount, setSpinCount] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [reelsStopped, setReelsStopped] = useState([false, false, false]);
  const [displayedWin, setDisplayedWin] = useState(0);
  const [spinHistory, setSpinHistory] = useState<SpinHistoryEntry[]>([]);
  const [winningReels, setWinningReels] = useState<boolean[]>([false, false, false]);
  const pendingResult = useRef<{ type: "win" | "lose" | "jackpot"; amount: number; multiplier?: number } | null>(null);
  const pendingHistoryEntry = useRef<SpinHistoryEntry | null>(null);

  useEffect(() => {
    localStorage.setItem("xdoro-slots-coins", coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem("xdoro-slots-wins", totalWins.toString());
  }, [totalWins]);

  useEffect(() => {
    localStorage.setItem("xdoro-slots-biggest", biggestWin.toString());
  }, [biggestWin]);

  const handleReelStop = useCallback((index: number) => {
    setReelsStopped(prev => {
      const next = [...prev];
      next[index] = true;
      if (next.every(Boolean) && pendingResult.current) {
        const r = pendingResult.current;
        setSpinning(false);
        setResult(r);
        if (r.type === "jackpot") {
          sfx.jackpot();
          setShowParticles(true);
          sfx.coin();
        } else if (r.type === "win") {
          sfx.slotWin();
          setShowParticles(true);
          sfx.coin();
        }
        setDisplayedWin(r.amount);
        if (pendingHistoryEntry.current) {
          setSpinHistory(prev => [pendingHistoryEntry.current!, ...prev].slice(0, 5));
          pendingHistoryEntry.current = null;
        }
        pendingResult.current = null;
      }
      return next;
    });
  }, []);

  const spin = useCallback(() => {
    if (spinning || coins < bet) return;

    sfx.spin();
    setCoins(prev => prev - bet);
    setSpinning(true);
    setResult(null);
    setShowParticles(false);
    setDisplayedWin(0);
    setSpinCount(prev => prev + 1);
    setReelsStopped([false, false, false]);
    setWinningReels([false, false, false]);

    const newStrips: [ReelSymbol[], ReelSymbol[], ReelSymbol[]] = [
      generateReelStrip(),
      generateReelStrip(),
      generateReelStrip(),
    ];
    setReelStrips(newStrips);

    const finalResults: [ReelSymbol, ReelSymbol, ReelSymbol] = [
      getRandomSymbol(),
      getRandomSymbol(),
      getRandomSymbol(),
    ];
    setReels(finalResults);

    const ids = finalResults.map(r => r.symbol.id);

    if (ids[0] === ids[1] && ids[1] === ids[2]) {
      const multiplier = finalResults[0].symbol.multiplier;
      const winAmount = bet * multiplier;
      const isDiamond = ids[0] === "diamond";
      setCoins(prev => prev + winAmount);
      setTotalWins(prev => prev + 1);
      setBiggestWin(prev => Math.max(prev, winAmount));
      setWinningReels([true, true, true]);
      pendingResult.current = {
        type: isDiamond ? "jackpot" : "win",
        amount: winAmount,
        multiplier,
      };
      pendingHistoryEntry.current = {
        reels: [ids[0], ids[1], ids[2]] as [string, string, string],
        bet,
        result: isDiamond ? "jackpot" : "win",
        amount: winAmount,
      };
    } else if (ids[0] === ids[1] || ids[1] === ids[2] || ids[0] === ids[2]) {
      const winAmount = Math.floor(bet * 1.5);
      setCoins(prev => prev + winAmount);
      setTotalWins(prev => prev + 1);
      const winning = [ids[0] === ids[1] || ids[0] === ids[2], ids[0] === ids[1] || ids[1] === ids[2], ids[1] === ids[2] || ids[0] === ids[2]];
      setWinningReels(winning);
      pendingResult.current = { type: "win", amount: winAmount, multiplier: 1.5 };
      pendingHistoryEntry.current = {
        reels: [ids[0], ids[1], ids[2]] as [string, string, string],
        bet,
        result: "win",
        amount: winAmount,
      };
    } else {
      pendingResult.current = { type: "lose", amount: 0 };
      pendingHistoryEntry.current = {
        reels: [ids[0], ids[1], ids[2]] as [string, string, string],
        bet,
        result: "lose",
        amount: 0,
      };
    }
  }, [spinning, coins, bet]);

  const resetCoins = () => {
    setCoins(500);
    setResult(null);
  };

  const isWin = result && (result.type === "win" || result.type === "jackpot");
  const isJackpot = result?.type === "jackpot";

  return (
    <div className="max-w-lg mx-auto">
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Card className="p-3 rounded-xl bg-card/60 border-border/30 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Coins className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] text-muted-foreground">Coins</span>
          </div>
          <p className="text-sm font-bold text-yellow-400" data-testid="text-coins">
            <AnimatedCounter value={coins} />
          </p>
        </Card>
        <Card className="p-3 rounded-xl bg-card/60 border-border/30 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-muted-foreground">Wins</span>
          </div>
          <p className="text-sm font-bold text-emerald-400" data-testid="text-total-wins">{totalWins}</p>
        </Card>
        <Card className="p-3 rounded-xl bg-card/60 border-border/30 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-pink-400" />
            <span className="text-[10px] text-muted-foreground">Best</span>
          </div>
          <p className="text-sm font-bold text-pink-400" data-testid="text-biggest-win">{biggestWin}</p>
        </Card>
        <Card className="p-3 rounded-xl bg-card/60 border-border/30 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Hash className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-muted-foreground">Spins</span>
          </div>
          <p className="text-sm font-bold text-blue-400" data-testid="text-spin-count">{spinCount}</p>
        </Card>
      </div>

      {coins < bet && (
        <div className="flex justify-center mb-4">
          <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={resetCoins} data-testid="button-reset-coins">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset (500)
          </Button>
        </div>
      )}

      <Card className="relative overflow-visible rounded-3xl border-0 p-1" data-testid="card-slot-machine"
        style={{
          background: "linear-gradient(180deg, #1a0a2e 0%, #0d0519 100%)",
        }}
      >
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(255,215,0,0.12) 0%, rgba(139,92,246,0.08) 30%, rgba(236,72,153,0.08) 70%, rgba(255,215,0,0.12) 100%)",
            border: "1px solid rgba(255,215,0,0.15)",
            borderRadius: "inherit",
          }}
        />

        <div
          className="absolute -inset-[1px] rounded-3xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.2) 0%, transparent 30%, transparent 70%, rgba(236,72,153,0.2) 100%)",
            borderRadius: "inherit",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />

        <div className="relative rounded-[22px] overflow-visible p-6" style={{ background: "rgba(10,3,21,0.95)" }}>
          <div className="text-center mb-5">
            <div className="flex items-center justify-center gap-2 mb-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                </motion.div>
              ))}
              <h3
                className="font-game text-xl font-black tracking-wider mx-2"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FF69B4, #9B59B6, #FFD700)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                DORO SLOTS
              </h3>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i + 3}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 + 0.15 }}
                >
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                </motion.div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">Match to Win</p>
          </div>

          <div
            className="relative rounded-2xl p-4 mb-5 overflow-visible"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(15,5,30,0.4) 50%, rgba(0,0,0,0.5) 100%)",
              border: isWin
                ? "1px solid rgba(255,215,0,0.3)"
                : "1px solid rgba(255,255,255,0.05)",
              boxShadow: isWin
                ? "0 0 30px rgba(255,215,0,0.1), inset 0 0 30px rgba(255,215,0,0.05)"
                : "inset 0 0 30px rgba(0,0,0,0.3)",
              transition: "border-color 0.5s, box-shadow 0.5s",
            }}
          >
            {showParticles && (
              <SparkleParticles count={isJackpot ? 40 : 20} isJackpot={!!isJackpot} />
            )}

            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((reelIndex) => (
                <SingleReel
                  key={reelIndex}
                  reelIndex={reelIndex}
                  spinning={spinning}
                  finalSymbol={reels[reelIndex]}
                  strip={reelStrips[reelIndex]}
                  spinCount={spinCount}
                  stopped={reelsStopped[reelIndex]}
                  onStop={() => handleReelStop(reelIndex)}
                  isWinningReel={winningReels[reelIndex] && !spinning}
                />
              ))}
            </div>

            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none z-20">
              <motion.div
                className="h-[2px]"
                style={{
                  background: isWin
                    ? "linear-gradient(to right, transparent, rgba(255,215,0,0.8), transparent)"
                    : "linear-gradient(to right, transparent, rgba(255,215,0,0.4), transparent)",
                  boxShadow: isWin
                    ? "0 0 12px rgba(255,215,0,0.8), 0 0 24px rgba(255,215,0,0.4)"
                    : "0 0 4px rgba(255,215,0,0.2)",
                }}
                animate={isWin ? {
                  boxShadow: [
                    "0 0 12px rgba(255,215,0,0.8), 0 0 24px rgba(255,215,0,0.4)",
                    "0 0 25px rgba(255,215,0,1), 0 0 50px rgba(255,215,0,0.6)",
                    "0 0 12px rgba(255,215,0,0.8), 0 0 24px rgba(255,215,0,0.4)",
                  ],
                } : {}}
                transition={isWin ? { duration: 0.8, repeat: Infinity } : {}}
              />
              <motion.div
                className="h-[1px] mt-[1px]"
                style={{
                  background: "linear-gradient(to right, transparent, rgba(255,215,0,0.2), transparent)",
                }}
                animate={isWin ? { opacity: [0.3, 0.8, 0.3] } : {}}
                transition={isWin ? { duration: 0.8, repeat: Infinity } : {}}
              />
            </div>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center mb-4"
              >
                {result.type === "jackpot" ? (
                  <div>
                    <motion.p
                      className="font-game text-3xl font-black"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.5, repeat: 3 }}
                      style={{
                        background: "linear-gradient(135deg, #FFD700, #FF69B4, #FFD700)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        filter: "drop-shadow(0 0 10px rgba(255,215,0,0.5))",
                      }}
                    >
                      JACKPOT!
                    </motion.p>
                    <div className="mt-2">
                      <WinMultiplierDisplay multiplier={result.multiplier || 10} amount={displayedWin} />
                    </div>
                  </div>
                ) : result.type === "win" ? (
                  <div>
                    <motion.p
                      className="font-game text-xl font-bold text-emerald-400"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    >
                      You Win!
                    </motion.p>
                    <div className="mt-1">
                      <WinMultiplierDisplay multiplier={result.multiplier || 1.5} amount={displayedWin} />
                    </div>
                  </div>
                ) : (
                  <motion.p
                    className="text-sm text-muted-foreground/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Try again...
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-wider mr-1">Bet</span>
            {[5, 10, 25, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  if (!spinning) {
                    setBet(amount);
                    sfx.click();
                  }
                }}
                className="relative transition-all duration-200"
                disabled={spinning}
                data-testid={`button-bet-${amount}`}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                  style={bet === amount ? {
                    background: "linear-gradient(135deg, #FFD700, #F59E0B)",
                    color: "#000",
                    border: "2px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 0 15px rgba(255,215,0,0.4), 0 0 30px rgba(255,215,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
                    transform: "scale(1.1)",
                  } : {
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.5)",
                    border: "2px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {amount}
                </div>
                {bet === amount && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: "2px solid rgba(255,215,0,0.4)" }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </button>
            ))}
          </div>

          <motion.div
            animate={!spinning && coins >= bet ? {
              boxShadow: [
                "0 0 20px rgba(236,72,153,0.3), 0 0 40px rgba(236,72,153,0.1)",
                "0 0 30px rgba(236,72,153,0.5), 0 0 60px rgba(236,72,153,0.2)",
                "0 0 20px rgba(236,72,153,0.3), 0 0 40px rgba(236,72,153,0.1)",
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="rounded-2xl"
          >
            <Button
              className="w-full rounded-2xl font-bold text-lg py-6 border-0 shadow-lg disabled:opacity-50"
              style={{
                background: spinning
                  ? "linear-gradient(135deg, rgba(100,100,100,0.5), rgba(80,80,80,0.5))"
                  : "linear-gradient(135deg, #F59E0B, #EC4899, #8B5CF6)",
                boxShadow: spinning ? "none" : "0 4px 20px rgba(236,72,153,0.3)",
              }}
              onClick={spin}
              disabled={spinning || coins < bet}
              data-testid="button-spin"
            >
              {spinning ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    Spinning...
                  </motion.span>
                </div>
              ) : coins < bet ? (
                "Not enough coins"
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  SPIN ({bet} coins)
                </>
              )}
            </Button>
          </motion.div>

          <SpinHistory history={spinHistory} />
        </div>
      </Card>

      <Card className="mt-4 rounded-2xl bg-card/40 border-border/20 overflow-hidden">
        <button
          className="w-full flex items-center justify-between gap-2 p-4 text-left"
          onClick={() => {
            setShowPaytable(!showPaytable);
            sfx.click();
          }}
          data-testid="button-toggle-paytable"
        >
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
            <h4 className="text-xs font-semibold text-muted-foreground">Paytable</h4>
          </div>
          {showPaytable ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <AnimatePresence>
          {showPaytable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {SYMBOLS.sort((a, b) => b.multiplier - a.multiplier).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 p-2 rounded-lg"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: s.id === "diamond" ? "1px solid rgba(0,206,209,0.2)" : "1px solid transparent",
                      }}
                    >
                      <img src={s.image} alt={s.label} className="w-10 h-10 object-contain" />
                      <div>
                        <p className="text-xs font-medium" style={{ color: s.color }}>{s.label}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: `${s.color}15`,
                              color: s.color,
                            }}
                          >
                            {s.multiplier}x
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-3 p-2 rounded-lg text-center"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <p className="text-[10px] text-muted-foreground/50">
                    Match 2 = 1.5x bet &middot; Match 3 = multiplier x bet
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {showParticles && isJackpot && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: ["#FFD700", "#FF69B4", "#9B59B6", "#00CED1", "#FF6347"][i % 5],
                boxShadow: `0 0 6px ${["#FFD700", "#FF69B4", "#9B59B6", "#00CED1", "#FF6347"][i % 5]}`,
              }}
              initial={{
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                opacity: 1,
                scale: 0,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: [0, 1, 1, 0],
                scale: [0, 2, 1.5, 0],
                rotate: Math.random() * 720,
              }}
              transition={{ duration: 2 + Math.random(), ease: "easeOut", delay: Math.random() * 0.5 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
