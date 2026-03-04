import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Swords, Shield, Zap, Heart, RotateCcw, Star, Bot, Target, Flame, Droplets, Snowflake } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BATTLE_MOVES,
  BATTLE_DOROS,
  TYPE_CHART_ADV,
  TYPE_CHART_WEAK,
  TYPE_COLORS_BATTLE,
  TYPE_EMOJI,
  type BattleMoveData,
  type DoroBattler,
  type ElementType,
  type StatusEffect,
} from "@/lib/gameData";
import { sfx } from "@/lib/sounds";

type Difficulty = "easy" | "medium" | "hard";

interface ActiveStatus {
  effect: StatusEffect;
  turnsLeft: number;
}

interface BattleState {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  statuses: ActiveStatus[];
  atkMod: number;
  defMod: number;
}

function getMoveById(id: string): BattleMoveData | undefined {
  return BATTLE_MOVES.find((m) => m.id === id);
}

function getEffectiveness(moveType: ElementType, defenderType: ElementType): number {
  if (TYPE_CHART_ADV[moveType]?.includes(defenderType)) return 1.5;
  if (TYPE_CHART_WEAK[moveType]?.includes(defenderType)) return 0.75;
  return 1;
}

function calcDamage(
  attackerAtk: number,
  attackerAtkMod: number,
  move: BattleMoveData,
  defenderDef: number,
  defenderDefMod: number,
  defenderType: ElementType
): number {
  if (move.power <= 0) return 0;
  const eff = getEffectiveness(move.type, defenderType);
  const atk = attackerAtk * (1 + attackerAtkMod * 0.25);
  const def = defenderDef * (1 + defenderDefMod * 0.25);
  const base = (move.power * (atk / Math.max(def, 1))) * eff * (move.accuracy / 100);
  const variance = 0.85 + Math.random() * 0.3;
  return Math.max(1, Math.floor(base * variance));
}

function applyStatusDamage(state: BattleState): { state: BattleState; messages: string[] } {
  const messages: string[] = [];
  let newHp = state.hp;
  const newStatuses = state.statuses
    .map((s) => {
      if (s.effect === "burn") {
        const dmg = Math.max(1, Math.floor(state.maxHp * 0.06));
        newHp = Math.max(0, newHp - dmg);
        messages.push(`Burn dealt ${dmg} damage!`);
      }
      if (s.effect === "poison") {
        const dmg = Math.max(1, Math.floor(state.maxHp * 0.08));
        newHp = Math.max(0, newHp - dmg);
        messages.push(`Poison dealt ${dmg} damage!`);
      }
      return { ...s, turnsLeft: s.turnsLeft - 1 };
    })
    .filter((s) => s.turnsLeft > 0);
  return { state: { ...state, hp: newHp, statuses: newStatuses }, messages };
}

function isStunned(state: BattleState): boolean {
  return state.statuses.some((s) => s.effect === "stun" || s.effect === "freeze");
}

function scaleForDifficulty(doro: DoroBattler, difficulty: Difficulty): DoroBattler {
  const scale = difficulty === "easy" ? 0.8 : difficulty === "hard" ? 1.3 : 1;
  return {
    ...doro,
    hp: Math.floor(doro.hp * scale),
    attack: Math.floor(doro.attack * scale),
    defense: Math.floor(doro.defense * scale),
    speed: Math.floor(doro.speed * (difficulty === "hard" ? 1.2 : difficulty === "easy" ? 0.9 : 1)),
  };
}

function evaluateMove(
  move: BattleMoveData,
  attackerState: BattleState,
  attackerDoro: DoroBattler,
  defenderState: BattleState,
  defenderDoro: DoroBattler
): number {
  if (move.power < 0) {
    const missing = attackerState.maxHp - attackerState.hp;
    if (missing < attackerState.maxHp * 0.2) return -5;
    return Math.min(-move.power, missing) * 1.5;
  }
  if (move.power === 0 && move.effect) {
    if (move.effect === "buff-atk" || move.effect === "buff-def") {
      return attackerState.atkMod < 2 ? 25 : 5;
    }
    if (move.effect === "debuff-atk" || move.effect === "debuff-def") return 20;
    if (move.effect === "stun" || move.effect === "freeze") {
      return defenderState.statuses.some((s) => s.effect === "stun" || s.effect === "freeze") ? 2 : 30;
    }
    if (move.effect === "burn" || move.effect === "poison") {
      return defenderState.statuses.some((s) => s.effect === "burn" || s.effect === "poison") ? 2 : 25;
    }
    return 15;
  }

  const dmg = calcDamage(attackerDoro.attack, attackerState.atkMod, move, defenderDoro.defense, defenderState.defMod, defenderDoro.type);
  let score = dmg;
  const eff = getEffectiveness(move.type, defenderDoro.type);
  if (eff > 1) score *= 1.3;
  if (defenderState.hp <= dmg * 1.2) score *= 2;
  if (move.effect && move.effectChance && move.effectChance > 20) score *= 1.15;
  return score;
}

function getBotMoveIndex(
  moves: BattleMoveData[],
  attackerState: BattleState,
  attackerDoro: DoroBattler,
  defenderState: BattleState,
  defenderDoro: DoroBattler,
  difficulty: Difficulty
): number {
  if (difficulty === "easy") return Math.floor(Math.random() * moves.length);
  const scores = moves.map((m) => evaluateMove(m, attackerState, attackerDoro, defenderState, defenderDoro));
  if (difficulty === "medium" && Math.random() < 0.3) return Math.floor(Math.random() * moves.length);
  let bestIdx = 0;
  for (let i = 1; i < scores.length; i++) {
    if (scores[i] > scores[bestIdx]) bestIdx = i;
  }
  return bestIdx;
}

const ANIM_VARIANTS: Record<string, any> = {
  slash: { x: [0, -15, 15, 0], rotate: [0, -10, 10, 0], transition: { duration: 0.4 } },
  beam: { scale: [1, 1.15, 0.95, 1], opacity: [1, 0.7, 1], transition: { duration: 0.5 } },
  blast: { scale: [1, 1.3, 0.9, 1], rotate: [0, 5, -5, 0], transition: { duration: 0.5 } },
  wave: { y: [0, -8, 8, 0], transition: { duration: 0.4 } },
  pulse: { scale: [1, 1.2, 1, 1.1, 1], transition: { duration: 0.6 } },
  strike: { x: [0, -20, 20, 0], transition: { duration: 0.3 } },
  shield: { scale: [1, 1.15, 1], borderWidth: ["2px", "4px", "2px"], transition: { duration: 0.4 } },
  spark: { rotate: [0, 15, -15, 10, 0], transition: { duration: 0.4 } },
  flame: { y: [0, -10, 0], scale: [1, 1.2, 1], transition: { duration: 0.4 } },
  frost: { x: [0, -5, 5, -3, 0], opacity: [1, 0.8, 1], transition: { duration: 0.5 } },
  bolt: { y: [0, -12, 4, 0], scale: [1, 1.1, 1], transition: { duration: 0.3 } },
  shadow: { opacity: [1, 0.4, 1], scale: [1, 0.95, 1], transition: { duration: 0.5 } },
  heal: { scale: [1, 1.1, 1], transition: { duration: 0.6 } },
  buff: { scale: [1, 1.15, 1.05, 1], transition: { duration: 0.5 } },
  debuff: { scale: [1, 0.9, 1], opacity: [1, 0.7, 1], transition: { duration: 0.5 } },
  meteor: { y: [0, -20, 5, 0], scale: [1, 1.3, 0.9, 1], transition: { duration: 0.5 } },
  vortex: { rotate: [0, 180, 360], scale: [1, 0.9, 1], transition: { duration: 0.6 } },
  nova: { scale: [1, 1.4, 0.8, 1.1, 1], transition: { duration: 0.6 } },
};

const ANIM_COLORS: Record<string, string> = {
  slash: "#ffffff",
  beam: "#E879A0",
  blast: "#FF6347",
  wave: "#4FC3F7",
  pulse: "#9B59B6",
  strike: "#FFD700",
  shield: "#4ADE80",
  spark: "#FFD700",
  flame: "#FF6347",
  frost: "#87CEEB",
  bolt: "#FFD700",
  shadow: "#4A4A6A",
  heal: "#4ADE80",
  buff: "#60A5FA",
  debuff: "#EF4444",
  meteor: "#FF8A65",
  vortex: "#A78BFA",
  nova: "#FFD700",
};

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; desc: string }> = {
  easy: { label: "Easy", color: "text-emerald-400", desc: "Random moves" },
  medium: { label: "Medium", color: "text-yellow-400", desc: "Mixed strategy" },
  hard: { label: "Hard", color: "text-red-400", desc: "Smart AI + stat boost" },
};

const STATUS_ICONS: Record<string, { label: string; color: string }> = {
  burn: { label: "🔥 BRN", color: "text-orange-400" },
  freeze: { label: "❄️ FRZ", color: "text-cyan-400" },
  poison: { label: "☠️ PSN", color: "text-purple-400" },
  stun: { label: "⚡ STN", color: "text-yellow-400" },
  "buff-atk": { label: "⬆ ATK", color: "text-red-400" },
  "buff-def": { label: "⬆ DEF", color: "text-blue-400" },
  "debuff-atk": { label: "⬇ ATK", color: "text-orange-300" },
  "debuff-def": { label: "⬇ DEF", color: "text-orange-300" },
};

export function BattleGame({ profile }: { profile: any }) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [playerDoroId, setPlayerDoroId] = useState(() => {
    const skinId = profile?.partnerDoro || "classic";
    return BATTLE_DOROS.find((d) => d.id === skinId)?.id || "classic";
  });
  const [enemyDoroId, setEnemyDoroId] = useState(() => {
    const others = BATTLE_DOROS.filter((d) => d.id !== playerDoroId);
    return others[Math.floor(Math.random() * others.length)].id;
  });

  const playerDoro = BATTLE_DOROS.find((d) => d.id === playerDoroId) || BATTLE_DOROS[0];
  const enemyDoroBase = BATTLE_DOROS.find((d) => d.id === enemyDoroId) || BATTLE_DOROS[1];
  const enemyDoro = scaleForDifficulty(enemyDoroBase, difficulty);

  const playerMoves = playerDoro.moveIds.map(getMoveById).filter(Boolean) as BattleMoveData[];
  const enemyMoves = enemyDoro.moveIds.map(getMoveById).filter(Boolean) as BattleMoveData[];

  const [playerState, setPlayerState] = useState<BattleState>({
    hp: playerDoro.hp,
    maxHp: playerDoro.hp,
    attack: playerDoro.attack,
    defense: playerDoro.defense,
    speed: playerDoro.speed,
    statuses: [],
    atkMod: 0,
    defMod: 0,
  });
  const [enemyState, setEnemyState] = useState<BattleState>({
    hp: enemyDoro.hp,
    maxHp: enemyDoro.hp,
    attack: enemyDoro.attack,
    defense: enemyDoro.defense,
    speed: enemyDoro.speed,
    statuses: [],
    atkMod: 0,
    defMod: 0,
  });

  const [log, setLog] = useState<string[]>([`A wild ${enemyDoro.name} appeared!`]);
  const [turn, setTurn] = useState<"player" | "enemy" | "done">("player");
  const [wins, setWins] = useState(() => parseInt(localStorage.getItem("xdoro-battle-wins") || "0") || 0);
  const [streak, setStreak] = useState(0);
  const [animKey, setAnimKey] = useState<string | null>(null);
  const [animTarget, setAnimTarget] = useState<"player" | "enemy" | null>(null);
  const [effectText, setEffectText] = useState<string | null>(null);

  const playerStateRef = useRef(playerState);
  playerStateRef.current = playerState;
  const enemyStateRef = useRef(enemyState);
  enemyStateRef.current = enemyState;

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-8), msg]);

  const triggerAnim = (anim: string, target: "player" | "enemy") => {
    setAnimKey(anim);
    setAnimTarget(target);
    setTimeout(() => { setAnimKey(null); setAnimTarget(null); }, 700);
  };

  const applyMove = useCallback((
    move: BattleMoveData,
    attackerDoro: DoroBattler,
    attackerState: BattleState,
    defenderDoro: DoroBattler,
    defenderState: BattleState,
    isPlayer: boolean
  ): { newAttackerState: BattleState; newDefenderState: BattleState; messages: string[]; defenderDead: boolean } => {
    const msgs: string[] = [];
    let newAttacker = { ...attackerState };
    let newDefender = { ...defenderState };
    const name = isPlayer ? (profile?.username ? `${profile.username}'s Doro` : playerDoro.name) : enemyDoro.name;

    if (move.accuracy < 100 && Math.random() * 100 > move.accuracy) {
      msgs.push(`${name} used ${move.name}... but it missed!`);
      return { newAttackerState: newAttacker, newDefenderState: newDefender, messages: msgs, defenderDead: false };
    }

    if (move.power < 0) {
      const heal = Math.min(-move.power, newAttacker.maxHp - newAttacker.hp);
      newAttacker.hp = Math.min(newAttacker.maxHp, newAttacker.hp + heal);
      msgs.push(`${name} used ${move.name}! Restored ${heal} HP!`);
    } else if (move.power > 0) {
      const dmg = calcDamage(attackerDoro.attack, newAttacker.atkMod, move, defenderDoro.defense, newDefender.defMod, defenderDoro.type);
      newDefender.hp = Math.max(0, newDefender.hp - dmg);
      const eff = getEffectiveness(move.type, defenderDoro.type);
      let effText = "";
      if (eff > 1) effText = " Super effective!";
      else if (eff < 1) effText = " Not very effective...";
      msgs.push(`${name} used ${move.name}! ${dmg} damage!${effText}`);
    }

    if (move.effect && move.effectChance) {
      if (Math.random() * 100 < move.effectChance) {
        if (move.effect === "buff-atk") {
          newAttacker.atkMod = Math.min(3, newAttacker.atkMod + 1);
          msgs.push(`${name}'s attack rose!`);
        } else if (move.effect === "buff-def") {
          newAttacker.defMod = Math.min(3, newAttacker.defMod + 1);
          msgs.push(`${name}'s defense rose!`);
        } else if (move.effect === "debuff-atk") {
          newDefender.atkMod = Math.max(-3, newDefender.atkMod - 1);
          msgs.push(`Target's attack fell!`);
        } else if (move.effect === "debuff-def") {
          newDefender.defMod = Math.max(-3, newDefender.defMod - 1);
          msgs.push(`Target's defense fell!`);
        } else {
          const already = newDefender.statuses.some((s) => s.effect === move.effect);
          if (!already) {
            newDefender.statuses = [...newDefender.statuses, { effect: move.effect, turnsLeft: 3 }];
            const statusLabel = STATUS_ICONS[move.effect]?.label || move.effect;
            msgs.push(`Target was inflicted with ${statusLabel}!`);
          }
        }
      }
    }

    return { newAttackerState: newAttacker, newDefenderState: newDefender, messages: msgs, defenderDead: newDefender.hp <= 0 };
  }, [playerDoro, enemyDoro, profile]);

  const handlePlayerMove = (moveIndex: number) => {
    if (turn !== "player") return;
    const move = playerMoves[moveIndex];
    if (!move) return;

    if (isStunned(playerState)) {
      const stunType = playerState.statuses.find((s) => s.effect === "stun" || s.effect === "freeze");
      addLog(`Your Doro is ${stunType?.effect === "freeze" ? "frozen" : "stunned"} and can't move!`);
      const { state: newPS, messages: psMsgs } = applyStatusDamage(playerState);
      psMsgs.forEach(addLog);
      setPlayerState(newPS);
      if (newPS.hp <= 0) {
        addLog("Your Doro fainted! You lost...");
        sfx.defeat();
        setTurn("done");
        setStreak(0);
        return;
      }
      setTurn("enemy");
      setTimeout(() => enemyTurn(), 800 + Math.random() * 400);
      return;
    }

    triggerAnim(move.animation, "enemy");
    if (move.power < 0) sfx.heal();
    else sfx.attack();

    const result = applyMove(move, playerDoro, playerState, enemyDoro, enemyStateRef.current, true);
    result.messages.forEach(addLog);

    const eff = move.power > 0 ? getEffectiveness(move.type, enemyDoro.type) : 0;
    if (eff > 1) { setEffectText("Super effective!"); sfx.superEffective(); }
    else if (eff < 1) setEffectText("Not very effective...");
    else setEffectText(null);
    setTimeout(() => setEffectText(null), 1500);

    let newPS = result.newAttackerState;
    const { state: psAfterStatus, messages: psMsgs } = applyStatusDamage(newPS);
    newPS = psAfterStatus;
    psMsgs.forEach(addLog);

    setPlayerState(newPS);
    setEnemyState(result.newDefenderState);

    if (result.defenderDead) {
      addLog(`${enemyDoro.name} fainted! You win!`);
      sfx.victory();
      setTurn("done");
      const newWins = wins + 1;
      setWins(newWins);
      setStreak((s) => s + 1);
      localStorage.setItem("xdoro-battle-wins", newWins.toString());
      return;
    }
    if (newPS.hp <= 0) {
      addLog("Your Doro fainted! You lost...");
      sfx.defeat();
      setTurn("done");
      setStreak(0);
      return;
    }

    setTurn("enemy");
    setTimeout(() => enemyTurn(), 800 + Math.random() * 400);
  };

  const enemyTurn = useCallback(() => {
    const es = enemyStateRef.current;
    const ps = playerStateRef.current;

    if (isStunned(es)) {
      const stunType = es.statuses.find((s) => s.effect === "stun" || s.effect === "freeze");
      addLog(`${enemyDoro.name} is ${stunType?.effect === "freeze" ? "frozen" : "stunned"} and can't move!`);
      const { state: newES, messages: esMsgs } = applyStatusDamage(es);
      esMsgs.forEach(addLog);
      setEnemyState(newES);
      if (newES.hp <= 0) {
        addLog(`${enemyDoro.name} fainted! You win!`);
        sfx.victory();
        setTurn("done");
        const newWins = wins + 1;
        setWins(newWins);
        setStreak((s) => s + 1);
        localStorage.setItem("xdoro-battle-wins", newWins.toString());
        return;
      }
      setTurn("player");
      return;
    }

    const moveIdx = getBotMoveIndex(enemyMoves, es, enemyDoro, ps, playerDoro, difficulty);
    const move = enemyMoves[moveIdx];
    if (!move) { setTurn("player"); return; }

    triggerAnim(move.animation, "player");
    sfx.hit();

    const result = applyMove(move, enemyDoro, es, playerDoro, ps, false);
    result.messages.forEach(addLog);

    let newES = result.newAttackerState;
    const { state: esAfterStatus, messages: esMsgs } = applyStatusDamage(newES);
    newES = esAfterStatus;
    esMsgs.forEach(addLog);

    setEnemyState(newES);
    setPlayerState(result.newDefenderState);

    if (result.defenderDead) {
      addLog("Your Doro fainted! You lost...");
      sfx.defeat();
      setTurn("done");
      setStreak(0);
      return;
    }
    if (newES.hp <= 0) {
      addLog(`${enemyDoro.name} fainted! You win!`);
      sfx.victory();
      setTurn("done");
      const newWins = wins + 1;
      setWins(newWins);
      setStreak((s) => s + 1);
      localStorage.setItem("xdoro-battle-wins", newWins.toString());
      return;
    }
    setTurn("player");
  }, [difficulty, enemyDoro, playerDoro, enemyMoves, applyMove, wins]);

  const newBattle = useCallback(() => {
    const skinId = profile?.partnerDoro || "classic";
    const pid = BATTLE_DOROS.find((d) => d.id === skinId)?.id || "classic";
    setPlayerDoroId(pid);
    const others = BATTLE_DOROS.filter((d) => d.id !== pid);
    const newEnemy = others[Math.floor(Math.random() * others.length)];
    setEnemyDoroId(newEnemy.id);
    const scaled = scaleForDifficulty(newEnemy, difficulty);
    const pd = BATTLE_DOROS.find((d) => d.id === pid) || BATTLE_DOROS[0];

    setPlayerState({ hp: pd.hp, maxHp: pd.hp, attack: pd.attack, defense: pd.defense, speed: pd.speed, statuses: [], atkMod: 0, defMod: 0 });
    setEnemyState({ hp: scaled.hp, maxHp: scaled.hp, attack: scaled.attack, defense: scaled.defense, speed: scaled.speed, statuses: [], atkMod: 0, defMod: 0 });
    setLog([`A wild ${newEnemy.name} appeared!`]);
    setTurn("player");
    setEffectText(null);
  }, [profile, difficulty]);

  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    const skinId = profile?.partnerDoro || "classic";
    const pid = BATTLE_DOROS.find((dd) => dd.id === skinId)?.id || "classic";
    setPlayerDoroId(pid);
    const others = BATTLE_DOROS.filter((dd) => dd.id !== pid);
    const newEnemy = others[Math.floor(Math.random() * others.length)];
    setEnemyDoroId(newEnemy.id);
    const scaled = scaleForDifficulty(newEnemy, d);
    const pd = BATTLE_DOROS.find((dd) => dd.id === pid) || BATTLE_DOROS[0];

    setPlayerState({ hp: pd.hp, maxHp: pd.hp, attack: pd.attack, defense: pd.defense, speed: pd.speed, statuses: [], atkMod: 0, defMod: 0 });
    setEnemyState({ hp: scaled.hp, maxHp: scaled.hp, attack: scaled.attack, defense: scaled.defense, speed: scaled.speed, statuses: [], atkMod: 0, defMod: 0 });
    setLog([`A wild ${newEnemy.name} appeared! [${DIFFICULTY_CONFIG[d].label} mode]`]);
    setTurn("player");
    setEffectText(null);
  };

  const hpPercent = (hp: number, max: number) => Math.max(0, (hp / max) * 100);
  const hpColor = (pct: number) => pct > 50 ? "bg-emerald-500" : pct > 25 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="space-y-3 max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-game text-xs" data-testid="badge-wins">
            <Star className="w-3 h-3 mr-1" /> {wins}W
          </Badge>
          {streak > 1 && (
            <Badge className="bg-orange-500/10 text-orange-400 border-orange-400/20 font-game text-xs" data-testid="badge-streak">
              <Zap className="w-3 h-3 mr-1" /> {streak}🔥
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Bot className="w-3 h-3 text-muted-foreground" />
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => changeDifficulty(d)}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all ${
                difficulty === d ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
              data-testid={`button-difficulty-${d}`}
            >
              {DIFFICULTY_CONFIG[d].label}
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={newBattle} className="h-7 px-2" data-testid="button-new-battle">
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <Card className="p-3 bg-card/60 backdrop-blur-sm border-border/50 rounded-xl">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: TYPE_COLORS_BATTLE[enemyDoro.type] }}>
              {TYPE_EMOJI[enemyDoro.type]} {enemyDoro.name}
            </span>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0" style={{ borderColor: TYPE_COLORS_BATTLE[enemyDoro.type] + "50", color: TYPE_COLORS_BATTLE[enemyDoro.type] }}>
              {enemyDoro.type}
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">{enemyState.hp}/{enemyState.maxHp}</span>
        </div>
        <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden mb-1">
          <motion.div
            className={`h-full rounded-full ${hpColor(hpPercent(enemyState.hp, enemyState.maxHp))}`}
            animate={{ width: `${hpPercent(enemyState.hp, enemyState.maxHp)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {enemyState.statuses.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {enemyState.statuses.map((s, i) => (
              <span key={i} className={`text-[9px] font-semibold ${STATUS_ICONS[s.effect]?.color || ""}`}>
                {STATUS_ICONS[s.effect]?.label}
              </span>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-2">
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2"
            style={{
              backgroundColor: TYPE_COLORS_BATTLE[enemyDoro.type] + "20",
              borderColor: TYPE_COLORS_BATTLE[enemyDoro.type] + "40",
            }}
            animate={animTarget === "enemy" && animKey ? ANIM_VARIANTS[animKey] : (turn === "enemy" ? { x: [-3, 3, -3, 0] } : {})}
          >
            <span className="select-none">{enemyDoro.emoji}</span>
          </motion.div>
        </div>
      </Card>

      <AnimatePresence>
        {animKey && animTarget && (
          <motion.div
            key={animKey + animTarget}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="flex justify-center -my-2 relative z-20"
          >
            <div
              className="w-8 h-8 rounded-full blur-sm"
              style={{ backgroundColor: ANIM_COLORS[animKey] || "#fff", opacity: 0.6 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="p-3 bg-card/60 backdrop-blur-sm border-border/50 rounded-xl">
        <div className="flex justify-start mb-2">
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2"
            style={{
              backgroundColor: TYPE_COLORS_BATTLE[playerDoro.type] + "20",
              borderColor: TYPE_COLORS_BATTLE[playerDoro.type] + "40",
            }}
            animate={animTarget === "player" && animKey ? ANIM_VARIANTS[animKey] : {}}
          >
            <span className="select-none">{playerDoro.emoji}</span>
          </motion.div>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: TYPE_COLORS_BATTLE[playerDoro.type] }}>
              {TYPE_EMOJI[playerDoro.type]} {profile?.username ? `${profile.username}'s Doro` : playerDoro.name}
            </span>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0" style={{ borderColor: TYPE_COLORS_BATTLE[playerDoro.type] + "50", color: TYPE_COLORS_BATTLE[playerDoro.type] }}>
              {playerDoro.type}
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">{playerState.hp}/{playerState.maxHp}</span>
        </div>
        <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden mb-1">
          <motion.div
            className={`h-full rounded-full ${hpColor(hpPercent(playerState.hp, playerState.maxHp))}`}
            animate={{ width: `${hpPercent(playerState.hp, playerState.maxHp)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {playerState.statuses.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {playerState.statuses.map((s, i) => (
              <span key={i} className={`text-[9px] font-semibold ${STATUS_ICONS[s.effect]?.color || ""}`}>
                {STATUS_ICONS[s.effect]?.label}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-2.5 bg-card/40 backdrop-blur-sm border-border/50 rounded-xl">
        <div className="h-[72px] overflow-y-auto scrollbar-hide text-[11px] space-y-0.5 px-1">
          <AnimatePresence initial={false}>
            {log.map((msg, i) => (
              <motion.p
                key={`${msg}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={i === log.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}
              >
                {msg}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      <AnimatePresence>
        {effectText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center text-xs font-bold ${
              effectText.includes("Super") ? "text-emerald-400" : "text-orange-400"
            }`}
          >
            <Target className="w-3 h-3 inline mr-1" />
            {effectText}
          </motion.div>
        )}
      </AnimatePresence>

      {turn === "player" ? (
        <div className="grid grid-cols-2 gap-2">
          {playerMoves.map((move, i) => {
            const eff = move.power > 0 ? getEffectiveness(move.type, enemyDoro.type) : 0;
            const isHeal = move.power < 0;
            const isStatus = move.power === 0;
            return (
              <Button
                key={move.id}
                variant="outline"
                className="text-[11px] justify-start h-auto py-2 px-3 rounded-xl border-border/50 hover:border-primary/40"
                onClick={() => handlePlayerMove(i)}
                data-testid={`button-move-${i}`}
              >
                <div className="flex flex-col items-start w-full gap-0.5">
                  <div className="flex items-center gap-1.5 w-full">
                    {isHeal ? (
                      <Heart className="w-3 h-3 text-green-400 shrink-0" />
                    ) : isStatus ? (
                      <Shield className="w-3 h-3 text-blue-400 shrink-0" />
                    ) : eff > 1 ? (
                      <Zap className="w-3 h-3 text-yellow-400 shrink-0" />
                    ) : (
                      <Swords className="w-3 h-3 shrink-0" style={{ color: TYPE_COLORS_BATTLE[move.type] }} />
                    )}
                    <span className="truncate font-semibold">{move.name}</span>
                    <span className="ml-auto text-muted-foreground shrink-0 text-[10px]">
                      {isHeal ? `+${-move.power}` : isStatus ? (move.effect || "—") : move.power}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <span style={{ color: TYPE_COLORS_BATTLE[move.type] }}>{TYPE_EMOJI[move.type]}</span>
                    <span>{move.type}</span>
                    {move.effect && <span className="ml-auto opacity-60">{STATUS_ICONS[move.effect]?.label}</span>}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      ) : turn === "enemy" ? (
        <div className="text-center py-3">
          <p className="text-xs text-muted-foreground animate-pulse font-medium">
            {enemyDoro.name} is thinking...
          </p>
        </div>
      ) : (
        <div className="text-center py-3 space-y-2">
          <Badge className="font-game text-sm font-bold px-4 py-1" data-testid="badge-result">
            {playerState.hp > 0 ? "🏆 Victory!" : "💀 Defeat..."}
          </Badge>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" onClick={newBattle} className="rounded-full" data-testid="button-next-battle">
              Next Battle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
