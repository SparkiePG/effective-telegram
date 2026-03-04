import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, MousePointerClick, TrendingUp, RotateCcw, Trophy, Sparkles, Rocket, Globe, Heart, Star, ChevronUp, Gauge } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import doroGif from "@assets/dance-nikke_1771772479544.gif";
import { sfx } from "@/lib/sounds";

interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  perClick: number;
  perSec: number;
  level: number;
}

const INITIAL_UPGRADES: Upgrade[] = [
  { id: "paw", name: "Doro Paw", description: "Stronger clicks", baseCost: 10, perClick: 1, perSec: 0, level: 0 },
  { id: "fan", name: "Fan Club", description: "Passive admirers", baseCost: 50, perClick: 0, perSec: 1, level: 0 },
  { id: "meme", name: "Meme Factory", description: "Viral content", baseCost: 200, perClick: 0, perSec: 5, level: 0 },
  { id: "rocket", name: "Moon Rocket", description: "To the moon", baseCost: 1000, perClick: 0, perSec: 25, level: 0 },
  { id: "galaxy", name: "Galaxy Portal", description: "Infinite power", baseCost: 5000, perClick: 0, perSec: 100, level: 0 },
];

const UPGRADE_ICONS: Record<string, typeof MousePointerClick> = {
  paw: MousePointerClick,
  fan: Heart,
  meme: Sparkles,
  rocket: Rocket,
  galaxy: Globe,
};

const UPGRADE_COLORS: Record<string, string> = {
  paw: "text-yellow-400",
  fan: "text-pink-400",
  meme: "text-purple-400",
  rocket: "text-orange-400",
  galaxy: "text-cyan-400",
};

interface ClickEffect {
  id: number;
  x: number;
  y: number;
  isCrit: boolean;
  xOffset: number;
  size: number;
}

interface CoinParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
}

interface RippleEffect {
  id: number;
  x: number;
  y: number;
}

interface BurstRay {
  id: number;
  x: number;
  y: number;
  angle: number;
  length: number;
}

const MILESTONES = [
  { type: "clicks", threshold: 50, label: "50 Clicks", icon: MousePointerClick },
  { type: "clicks", threshold: 100, label: "100 Clicks", icon: MousePointerClick },
  { type: "clicks", threshold: 500, label: "500 Clicks", icon: MousePointerClick },
  { type: "clicks", threshold: 1000, label: "1K Clicks", icon: MousePointerClick },
  { type: "clicks", threshold: 5000, label: "5K Clicks", icon: Star },
  { type: "coins", threshold: 500, label: "500 Coins", icon: Coins },
  { type: "coins", threshold: 1000, label: "1K Coins", icon: Coins },
  { type: "coins", threshold: 10000, label: "10K Coins", icon: Coins },
  { type: "coins", threshold: 100000, label: "100K Coins", icon: Trophy },
  { type: "coins", threshold: 1000000, label: "1M Coins", icon: Trophy },
];

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 80, damping: 20, mass: 0.5 });
  const [display, setDisplay] = useState(Math.floor(value));

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    const unsubscribe = springVal.on("change", (v) => {
      setDisplay(Math.floor(v));
    });
    return unsubscribe;
  }, [springVal]);

  return <span className={className}>{display.toLocaleString()}</span>;
}

function FloatingParticles({ coinCount, perSec }: { coinCount: number; perSec: number }) {
  const tier = useMemo(() => {
    if (coinCount >= 100000) return 4;
    if (coinCount >= 10000) return 3;
    if (coinCount >= 1000) return 2;
    if (coinCount >= 100) return 1;
    return 0;
  }, [Math.floor(coinCount / 100)]);

  const particleCount = useMemo(() => {
    return Math.min(5 + tier * 8 + Math.floor(perSec / 10) * 2, 50);
  }, [tier, Math.floor(perSec / 10)]);

  const tierColors = useMemo(() => {
    const colors = [
      ["rgba(250, 204, 21, 0.25)", "rgba(250, 204, 21, 0.15)"],
      ["rgba(250, 204, 21, 0.35)", "rgba(251, 146, 60, 0.25)"],
      ["rgba(251, 146, 60, 0.3)", "rgba(167, 139, 250, 0.25)"],
      ["rgba(167, 139, 250, 0.3)", "rgba(56, 189, 248, 0.25)"],
      ["rgba(56, 189, 248, 0.35)", "rgba(250, 204, 21, 0.3)"],
    ];
    return colors[tier] || colors[0];
  }, [tier]);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 5,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.1,
      color: tierColors[Math.floor(Math.random() * tierColors.length)],
    }));
  }, [particleCount, tierColors]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={`${p.id}-${tier}`}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [p.opacity, p.opacity * 2.5, p.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function CpsIndicator({ perSec }: { perSec: number }) {
  const maxCps = 500;
  const fillPercent = Math.min((perSec / maxCps) * 100, 100);

  return (
    <div className="flex items-center gap-2" data-testid="cps-indicator">
      <Gauge className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: perSec > 50
              ? "linear-gradient(90deg, #f59e0b, #ef4444, #a855f7)"
              : perSec > 10
              ? "linear-gradient(90deg, #f59e0b, #ef4444)"
              : "linear-gradient(90deg, #fbbf24, #f59e0b)",
          }}
          initial={false}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums min-w-[4rem] text-right">
        {perSec.toFixed(1)}/sec
      </span>
    </div>
  );
}

function getLevelColor(level: number): string {
  if (level >= 20) return "bg-amber-500/20 text-amber-300 border-amber-500/40";
  if (level >= 15) return "bg-purple-500/20 text-purple-300 border-purple-500/40";
  if (level >= 10) return "bg-blue-500/20 text-blue-300 border-blue-500/40";
  if (level >= 5) return "bg-green-500/20 text-green-300 border-green-500/40";
  return "bg-muted text-muted-foreground border-border";
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function ClickerGame({ profile }: { profile: any }) {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("xdoro-clicker");
    return saved ? JSON.parse(saved).coins || 0 : 0;
  });
  const [clickPower, setClickPower] = useState(1);
  const [perSec, setPerSec] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => {
    const saved = localStorage.getItem("xdoro-clicker");
    if (saved) {
      const parsed = JSON.parse(saved).upgrades;
      if (parsed && parsed.length === INITIAL_UPGRADES.length && parsed[0].description !== undefined) {
        return parsed;
      }
    }
    return INITIAL_UPGRADES;
  });
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [coinParticles, setCoinParticles] = useState<CoinParticle[]>([]);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [burstRays, setBurstRays] = useState<BurstRay[]>([]);
  const [totalClicks, setTotalClicks] = useState(() => {
    const saved = localStorage.getItem("xdoro-clicker");
    return saved ? JSON.parse(saved).totalClicks || 0 : 0;
  });
  const [maxCoinsEver, setMaxCoinsEver] = useState(() => {
    const saved = localStorage.getItem("xdoro-clicker");
    return saved ? JSON.parse(saved).maxCoinsEver || 0 : 0;
  });
  const [clickCombo, setClickCombo] = useState(0);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newMilestone, setNewMilestone] = useState<string | null>(null);
  const prevMilestoneCountRef = useRef(0);

  useEffect(() => {
    let cp = 1;
    let ps = 0;
    upgrades.forEach((u) => {
      cp += u.perClick * u.level;
      ps += u.perSec * u.level;
    });
    setClickPower(cp);
    setPerSec(ps);
  }, [upgrades]);

  useEffect(() => {
    if (perSec <= 0) return;
    const interval = setInterval(() => {
      setCoins((c: number) => {
        const next = c + perSec / 10;
        setMaxCoinsEver((m: number) => Math.max(m, next));
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [perSec]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem("xdoro-clicker", JSON.stringify({ coins, upgrades, totalClicks, maxCoinsEver }));
    }, 2000);
    return () => clearInterval(saveInterval);
  }, [coins, upgrades, totalClicks, maxCoinsEver]);

  const earnedMilestones = MILESTONES.filter((m) => {
    if (m.type === "clicks") return totalClicks >= m.threshold;
    return maxCoinsEver >= m.threshold;
  });

  useEffect(() => {
    if (earnedMilestones.length > prevMilestoneCountRef.current && prevMilestoneCountRef.current > 0) {
      const latest = earnedMilestones[earnedMilestones.length - 1];
      setNewMilestone(latest.label);
      sfx.levelUp();
      const timer = setTimeout(() => setNewMilestone(null), 2500);
      return () => clearTimeout(timer);
    }
    prevMilestoneCountRef.current = earnedMilestones.length;
  }, [earnedMilestones.length]);

  const handleClick = (e: React.MouseEvent) => {
    sfx.coin();

    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    setClickCombo((c) => c + 1);
    comboTimerRef.current = setTimeout(() => setClickCombo(0), 1200);

    setCoins((c: number) => {
      const next = c + clickPower;
      setMaxCoinsEver((m: number) => Math.max(m, next));
      return next;
    });
    setTotalClicks((t: number) => t + 1);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    const isCrit = Math.random() < 0.15;
    const xOffset = (Math.random() - 0.5) * 60;
    const size = isCrit ? 1.8 : (0.8 + Math.random() * 0.6);

    setClickEffects((prev) => [...prev.slice(-12), { id, x, y, isCrit, xOffset, size }]);
    setTimeout(() => {
      setClickEffects((prev) => prev.filter((ef) => ef.id !== id));
    }, 1000);

    const rippleId = Date.now() + Math.random() + 1;
    setRipples((prev) => [...prev.slice(-4), { id: rippleId, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 700);

    const rayCount = isCrit ? 8 : 5;
    for (let i = 0; i < rayCount; i++) {
      const rId = Date.now() + Math.random() + i + 100;
      const angle = (Math.PI * 2 * i) / rayCount + (Math.random() - 0.5) * 0.3;
      const length = 25 + Math.random() * 25;
      setBurstRays((prev) => [...prev.slice(-20), { id: rId, x, y, angle, length }]);
      setTimeout(() => {
        setBurstRays((prev) => prev.filter((r) => r.id !== rId));
      }, 500);
    }

    const pCount = isCrit ? 6 : 4;
    for (let i = 0; i < pCount; i++) {
      const pId = Date.now() + Math.random() + i + 2;
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 40;
      setCoinParticles((prev) => [...prev.slice(-20), { id: pId, x, y, angle, distance }]);
      setTimeout(() => {
        setCoinParticles((prev) => prev.filter((p) => p.id !== pId));
      }, 800);
    }
  };

  const buyCost = (upgrade: Upgrade) => Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level));

  const buyUpgrade = (upgradeId: string) => {
    setUpgrades((prev) =>
      prev.map((u) => {
        if (u.id === upgradeId) {
          const cost = buyCost(u);
          if (coins >= cost) {
            sfx.upgrade();
            setCoins((c: number) => c - cost);
            return { ...u, level: u.level + 1 };
          }
        }
        return u;
      })
    );
  };

  const resetGame = () => {
    setCoins(0);
    setUpgrades(INITIAL_UPGRADES);
    setTotalClicks(0);
    setMaxCoinsEver(0);
    setClickCombo(0);
    localStorage.removeItem("xdoro-clicker");
  };

  const totalUpgradeLevel = upgrades.reduce((sum, u) => sum + u.level, 0);

  return (
    <div className="relative">
      <FloatingParticles coinCount={maxCoinsEver} perSec={perSec} />

      <AnimatePresence>
        {newMilestone && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="px-4 py-2 rounded-md bg-yellow-500/20 border border-yellow-500/40 backdrop-blur-sm flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-300">
                Milestone Unlocked: {newMilestone}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="space-y-4">
          <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/50 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <motion.div
                animate={{
                  filter: [
                    "drop-shadow(0 0 4px rgba(250, 204, 21, 0.4))",
                    "drop-shadow(0 0 14px rgba(250, 204, 21, 0.8))",
                    "drop-shadow(0 0 4px rgba(250, 204, 21, 0.4))",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Coins className="w-8 h-8 text-yellow-400" />
              </motion.div>
              <span className="text-4xl font-bold font-game tabular-nums" data-testid="text-clicker-coins">
                <AnimatedNumber value={Math.floor(coins)} />
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <MousePointerClick className="w-3 h-3" />
                +{clickPower}/click
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Zap className="w-3 h-3" />
                +{perSec.toFixed(1)}/sec
              </Badge>
            </div>

            <div className="max-w-[200px] mx-auto mb-3">
              <CpsIndicator perSec={perSec} />
            </div>

            <AnimatePresence>
              {clickCombo >= 5 && (
                <motion.div
                  className="mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <Badge
                    variant="outline"
                    className="gap-1 border-orange-500/40 text-orange-400"
                    data-testid="badge-combo"
                  >
                    <Zap className="w-3 h-3" />
                    {clickCombo}x Combo
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="relative w-56 h-56 mx-auto cursor-pointer select-none"
              onClick={handleClick}
              data-testid="button-doro-click"
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 20px 4px rgba(250, 204, 21, 0.15), inset 0 0 20px 4px rgba(250, 204, 21, 0.03)",
                    "0 0 35px 10px rgba(250, 204, 21, 0.35), inset 0 0 30px 8px rgba(250, 204, 21, 0.08)",
                    "0 0 20px 4px rgba(250, 204, 21, 0.15), inset 0 0 20px 4px rgba(250, 204, 21, 0.03)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ border: "2px solid rgba(250, 204, 21, 0.25)" }}
              />

              <motion.div
                className="absolute -inset-3 rounded-full opacity-30"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(250, 204, 21, 0)",
                    "0 0 0 8px rgba(250, 204, 21, 0.15)",
                    "0 0 0 0 rgba(250, 204, 21, 0)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />

              <motion.img
                src={doroGif}
                alt="Click Doro!"
                className="w-56 h-56 rounded-full relative z-[1]"
                animate={{
                  scale: [1, 1.04, 1],
                  rotate: [0, 1, -1, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileTap={{ scale: 0.88, transition: { duration: 0.08 } }}
              />

              <AnimatePresence>
                {ripples.map((r) => (
                  <motion.div
                    key={r.id}
                    className="absolute rounded-full pointer-events-none z-[2]"
                    style={{
                      left: r.x,
                      top: r.y,
                      translateX: "-50%",
                      translateY: "-50%",
                      border: "2px solid rgba(250, 204, 21, 0.5)",
                    }}
                    initial={{ width: 0, height: 0, opacity: 0.9 }}
                    animate={{ width: 140, height: 140, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {burstRays.map((r) => (
                  <motion.div
                    key={r.id}
                    className="absolute pointer-events-none z-[2]"
                    style={{
                      left: r.x,
                      top: r.y,
                      width: 2,
                      height: r.length,
                      background: "linear-gradient(to bottom, rgba(250, 204, 21, 0.6), transparent)",
                      transformOrigin: "top center",
                      rotate: `${(r.angle * 180) / Math.PI + 90}deg`,
                    }}
                    initial={{ opacity: 1, scaleY: 0 }}
                    animate={{ opacity: 0, scaleY: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {clickEffects.map((ef) => (
                  <motion.span
                    key={ef.id}
                    className="absolute pointer-events-none z-[3] font-bold"
                    style={{
                      left: ef.x + ef.xOffset,
                      top: ef.y,
                      fontSize: `${ef.size}rem`,
                      background: ef.isCrit
                        ? "linear-gradient(180deg, #fef08a 0%, #fb923c 50%, #ef4444 100%)"
                        : "linear-gradient(180deg, #fde68a 0%, #f59e0b 50%, #d97706 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textShadow: "none",
                      filter: ef.isCrit ? "drop-shadow(0 0 8px rgba(251, 146, 60, 0.7))" : "drop-shadow(0 0 3px rgba(250, 204, 21, 0.4))",
                    }}
                    initial={{ opacity: 1, y: 0, scale: ef.isCrit ? 1.5 : 1 }}
                    animate={{
                      opacity: 0,
                      y: -60 - Math.random() * 20,
                      scale: ef.isCrit ? 1.8 : 1.15,
                      x: ef.xOffset * 0.5,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  >
                    +{clickPower}{ef.isCrit ? "!" : ""}
                  </motion.span>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {coinParticles.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute pointer-events-none z-[3]"
                    style={{ left: p.x, top: p.y }}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 0.7 }}
                    animate={{
                      opacity: 0,
                      x: Math.cos(p.angle) * p.distance,
                      y: Math.sin(p.angle) * p.distance - 25,
                      scale: 0.2,
                      rotate: 360,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  >
                    <Coins className="w-3 h-3 text-yellow-400" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
              <span className="text-xs text-muted-foreground">
                Clicks: <span className="font-medium text-foreground">{totalClicks.toLocaleString()}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                Peak: <span className="font-medium text-foreground">{formatNumber(Math.floor(maxCoinsEver))}</span>
              </span>
            </div>

            {earnedMilestones.length > 0 && (
              <div className="mt-3" data-testid="milestone-row">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                  Achievements
                </p>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {earnedMilestones.map((m) => {
                    const MIcon = m.icon;
                    return (
                      <motion.div
                        key={m.label}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <Badge variant="outline" className="gap-1 text-[10px] border-yellow-500/40 text-yellow-500">
                          <MIcon className="w-2.5 h-2.5" />
                          {m.label}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={resetGame} data-testid="button-reset-clicker">
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset Progress
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <h3 className="font-semibold text-sm flex items-center gap-1.5 font-game">
              <TrendingUp className="w-4 h-4" />
              Upgrades
            </h3>
            <Badge variant="outline" className="text-[10px] gap-1">
              <ChevronUp className="w-2.5 h-2.5" />
              Total Lv. {totalUpgradeLevel}
            </Badge>
          </div>

          {upgrades.map((upgrade) => {
            const cost = buyCost(upgrade);
            const canAfford = coins >= cost;
            const Icon = UPGRADE_ICONS[upgrade.id] || Star;
            const iconColor = UPGRADE_COLORS[upgrade.id] || "text-yellow-400";
            const nextMilestoneLvl = Math.ceil((upgrade.level + 1) / 5) * 5;
            const progressInMilestone = upgrade.level % 5;
            const progressPercent = (progressInMilestone / 5) * 100;
            const affordPercent = Math.min((coins / cost) * 100, 100);

            return (
              <motion.div
                key={upgrade.id}
                layout
                initial={false}
              >
                <Card
                  className={`p-3 bg-card/60 backdrop-blur-sm border-border/50 transition-all duration-200 ${
                    canAfford ? "shadow-[0_0_12px_rgba(250,204,21,0.12)]" : "opacity-60"
                  }`}
                  data-testid={`card-upgrade-${upgrade.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{upgrade.name}</span>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getLevelColor(upgrade.level)}`}
                        >
                          Lv.{upgrade.level}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {upgrade.description}
                        {upgrade.level > 0 && (
                          <span className="ml-1 text-foreground/70">
                            ({upgrade.perClick > 0 ? `+${upgrade.perClick * upgrade.level}/click` : `+${upgrade.perSec * upgrade.level}/sec`})
                          </span>
                        )}
                      </p>

                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] text-muted-foreground">Next: Lv.{nextMilestoneLvl}</span>
                          <span className="text-[9px] text-muted-foreground">{progressInMilestone}/5</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-500/70 to-yellow-400/90"
                            initial={false}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
                        <Coins className="w-3 h-3 text-yellow-400" />
                        {formatNumber(cost)}
                      </div>
                      {!canAfford && (
                        <div className="w-14 h-1 rounded-full bg-muted/50 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-yellow-500/40"
                            initial={false}
                            animate={{ width: `${affordPercent}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant={canAfford ? "default" : "outline"}
                        disabled={!canAfford}
                        onClick={() => buyUpgrade(upgrade.id)}
                        data-testid={`button-buy-${upgrade.id}`}
                      >
                        BUY
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
