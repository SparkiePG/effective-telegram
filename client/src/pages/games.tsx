import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarField } from "@/components/star-field";
import { GAMES, type GameInfo } from "@/lib/gameData";
import { ProfilePanel } from "@/components/profile-panel";
import { GameBoard } from "@/components/game-board";
import {
  ArrowLeft,
  Brain,
  MousePointerClick,
  Swords,
  Zap,
  Grid3x3,
  HelpCircle,
  Building,
  Puzzle,
  Users,
  Lock,
  Gamepad2,
  Star,
  Dices,
  Trophy,
  Coins,
  TrendingUp,
  Play,
  Wifi,
  Search,
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

import gameMemory from "@assets/game-memory.png";
import gameClicker from "@assets/game-clicker.png";
import gameBattle from "@assets/game-battle.png";
import gameRunner from "@assets/game-runner.png";
import gameTictactoe from "@assets/game-tictactoe.png";
import gameSlots from "@assets/game-slots.png";
import doroGif from "@assets/oiiaoiia-doro_1771795507251.gif";

const ICON_MAP: Record<string, any> = {
  brain: Brain,
  "mouse-pointer-click": MousePointerClick,
  swords: Swords,
  zap: Zap,
  "grid-3x3": Grid3x3,
  "help-circle": HelpCircle,
  building: Building,
  puzzle: Puzzle,
  dices: Dices,
  users: Users,
};

const GAME_IMAGES: Record<string, string> = {
  "memory-match": gameMemory,
  "doro-clicker": gameClicker,
  "doro-battle": gameBattle,
  "doro-runner": gameRunner,
  "doro-tictactoe": gameTictactoe,
  "doro-slots": gameSlots,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  Medium: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  Hard: "text-red-400 border-red-400/30 bg-red-400/10",
};

type FilterCategory = "all" | "solo" | "multiplayer" | "strategy" | "action" | "coming-soon";

const CATEGORIES: { id: FilterCategory; label: string; icon: any }[] = [
  { id: "all", label: "All Games", icon: Gamepad2 },
  { id: "solo", label: "Solo", icon: Star },
  { id: "multiplayer", label: "Multiplayer", icon: Users },
  { id: "strategy", label: "Strategy", icon: Brain },
  { id: "action", label: "Action", icon: Zap },
  { id: "coming-soon", label: "Coming Soon", icon: Lock },
];

const STRATEGY_GAMES = ["memory-match", "doro-battle", "doro-tictactoe", "multiplayer-tictactoe"];
const ACTION_GAMES = ["doro-clicker", "doro-runner", "doro-slots"];

function getPlayerStats() {
  const runnerBest = localStorage.getItem("xdoro-runner-best");
  const battleWins = localStorage.getItem("xdoro-battle-wins");
  const tttStats = localStorage.getItem("xdoro-ttt-stats");
  const slotsCoins = localStorage.getItem("xdoro-slots-coins");

  let tttWins = 0;
  try { if (tttStats) tttWins = JSON.parse(tttStats).wins || 0; } catch {}

  const totalWins = (parseInt(battleWins || "0") || 0) + tttWins;

  return {
    runnerBest: runnerBest ? parseInt(runnerBest) : null,
    battleWins: parseInt(battleWins || "0") || 0,
    slotsCoins: parseInt(slotsCoins || "500") || 500,
    totalWins,
  };
}

export default function GamesHub() {
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("xdoro-profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRooms, setActiveRooms] = useState(0);

  const stats = useMemo(() => getPlayerStats(), [selectedGame]);

  useEffect(() => {
    fetch("/api/rooms/count")
      .then((r) => r.json())
      .then((d) => setActiveRooms(d.count || 0))
      .catch(() => {});
    const interval = setInterval(() => {
      fetch("/api/rooms/count")
        .then((r) => r.json())
        .then((d) => setActiveRooms(d.count || 0))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleProfileSave = useCallback((p: any) => {
    localStorage.setItem("xdoro-profile", JSON.stringify(p));
    setProfile(p);
    setShowProfile(false);
  }, []);

  const filteredGames = useMemo(() => {
    let games = GAMES;

    if (activeCategory === "solo") games = games.filter((g) => g.type === "Solo" && g.playable);
    else if (activeCategory === "multiplayer") games = games.filter((g) => g.type === "Multiplayer" || g.type === "Both");
    else if (activeCategory === "strategy") games = games.filter((g) => STRATEGY_GAMES.includes(g.id) && g.playable);
    else if (activeCategory === "action") games = games.filter((g) => ACTION_GAMES.includes(g.id) && g.playable);
    else if (activeCategory === "coming-soon") games = games.filter((g) => !g.playable);
    else games = games.filter((g) => g.playable);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      games = games.filter((g) => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
    }

    return games;
  }, [activeCategory, searchQuery]);

  if (selectedGame) {
    return <GameBoard game={selectedGame} profile={profile} onBack={() => setSelectedGame(null)} />;
  }

  if (showProfile) {
    return <ProfilePanel profile={profile} onSave={handleProfileSave} onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0118] via-[#110927] to-background pointer-events-none" />
      <StarField count={150} />

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-4">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full border border-white/10 bg-white/5" data-testid="button-back-home">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <img src={doroGif} alt="Doro" className="w-10 h-10 rounded-full" />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-game">
                    <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                      Doro Arcade
                    </span>
                  </h1>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-white/10 bg-white/5 text-xs"
              onClick={() => setShowProfile(true)}
              data-testid="button-profile"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {profile ? profile.trainerName || profile.username : "Profile"}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2.5 mb-6">
            <Card className="p-3 rounded-xl bg-white/[0.03] border-white/5" data-testid="stat-total-wins">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{stats.totalWins}</p>
                  <p className="text-[9px] text-muted-foreground">Wins</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 rounded-xl bg-white/[0.03] border-white/5" data-testid="stat-battle-wins">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Swords className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{stats.battleWins}</p>
                  <p className="text-[9px] text-muted-foreground">Battles</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 rounded-xl bg-white/[0.03] border-white/5" data-testid="stat-runner-best">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{stats.runnerBest ?? "—"}</p>
                  <p className="text-[9px] text-muted-foreground">Runner</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 rounded-xl bg-white/[0.03] border-white/5" data-testid="stat-slots-coins">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{stats.slotsCoins.toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground">Coins</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-1" data-testid="category-filters">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "text-muted-foreground border border-transparent"
                    }`}
                    data-testid={`filter-${cat.id}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                    {cat.id === "multiplayer" && activeRooms > 0 && (
                      <span className="ml-1 w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] flex items-center justify-center">
                        {activeRooms}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="pl-9 h-8 text-xs bg-white/5 border-white/10 rounded-full"
                data-testid="input-search-games"
              />
            </div>
          </div>
        </div>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.filter((g) => g.playable).map((game, i) => {
              const Icon = ICON_MAP[game.icon] || Gamepad2;
              const previewImg = GAME_IMAGES[game.id];
              const isMultiplayer = game.type === "Multiplayer" || game.type === "Both";
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Card
                    className="group relative overflow-hidden rounded-2xl border-0 cursor-pointer bg-black/40 backdrop-blur-md hover:ring-1 hover:ring-white/20 transition-all duration-300"
                    onClick={() => setSelectedGame(game)}
                    data-testid={`card-game-${game.id}`}
                  >
                    <div className="relative h-40 overflow-hidden">
                      {previewImg ? (
                        <img
                          src={previewImg}
                          alt={game.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : game.id === "multiplayer-tictactoe" ? (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-600/20 via-purple-600/20 to-pink-600/20 flex items-center justify-center">
                          <div className="relative">
                            <Grid3x3 className="w-16 h-16 text-cyan-400/30" />
                            <Wifi className="w-6 h-6 text-cyan-400 absolute -top-1 -right-1" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${game.color}20, ${game.color}08)` }}
                        >
                          <Icon className="w-14 h-14 opacity-15" style={{ color: game.color }} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {isMultiplayer && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[8px] px-1.5 py-0">
                            <Wifi className="w-2.5 h-2.5 mr-0.5" />
                            LIVE
                          </Badge>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: game.color + "25" }}
                          >
                            <Icon className="w-4 h-4" style={{ color: game.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-game font-bold text-white text-sm">{game.name}</h3>
                          </div>
                          <Badge className={`text-[9px] font-semibold rounded-full px-1.5 py-0 border ${DIFFICULTY_COLORS[game.difficulty]}`}>
                            {game.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                        {game.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground/60">{game.players}</span>
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-3 h-3" />
                          Play
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {filteredGames.filter((g) => !g.playable).length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              Coming Soon
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {filteredGames.filter((g) => !g.playable).map((game, i) => {
                const Icon = ICON_MAP[game.icon] || Gamepad2;
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  >
                    <Card
                      className="p-3 rounded-xl border-white/5 bg-white/[0.02] opacity-50"
                      data-testid={`card-game-${game.id}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 opacity-40"
                          style={{ backgroundColor: game.color + "15" }}
                        >
                          <Icon className="w-4 h-4" style={{ color: game.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-game font-bold text-[11px] text-muted-foreground truncate">{game.name}</h3>
                          <p className="text-[9px] text-muted-foreground/50 truncate">{game.difficulty}</p>
                        </div>
                        <Lock className="w-3 h-3 text-muted-foreground/30 shrink-0" />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        <div className="text-center pb-10">
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 text-xs"
            onClick={() => setShowProfile(true)}
            data-testid="button-create-profile-cta"
          >
            <Star className="w-3.5 h-3.5 mr-1.5" />
            {profile ? "Edit Profile" : "Create Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
