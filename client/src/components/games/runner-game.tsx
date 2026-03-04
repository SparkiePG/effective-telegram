import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Star, Trophy, ArrowUp, ArrowDown, Zap, Timer } from "lucide-react";
import { sfx } from "@/lib/sounds";

interface Obstacle {
  id: number;
  x: number;
  type: "spike" | "orb" | "laser" | "crate";
  hue: number;
}

interface CollectStar {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  collectFrame?: number;
  bobOffset: number;
}

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  type: "trail" | "burst" | "speed" | "death";
}

interface BgStar {
  x: number;
  y: number;
  size: number;
  twinkleOffset: number;
  speed: number;
  layer: number;
}

interface Mountain {
  x: number;
  width: number;
  height: number;
  layer: number;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  opacity: number;
  speed: number;
}

export function RunnerGame({ profile }: { profile: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("xdoro-runner-best");
    return saved ? parseInt(saved) : 0;
  });

  const gameData = useRef({
    doroY: 0,
    doroVy: 0,
    isJumping: false,
    isDucking: false,
    obstacles: [] as Obstacle[],
    stars: [] as CollectStar[],
    particles: [] as TrailParticle[],
    bgStars: [] as BgStar[],
    mountains: [] as Mountain[],
    clouds: [] as Cloud[],
    frame: 0,
    speed: 4,
    score: 0,
    groundY: 0,
    squishFrames: 0,
    starsCollected: 0,
    maxSpeed: 4,
    groundDashOffset: 0,
    shakeX: 0,
    shakeY: 0,
    shakeIntensity: 0,
    flashAlpha: 0,
    edgePulse: 0,
    doroRotation: 0,
    runCycle: 0,
    comboStars: 0,
    lastStarFrame: 0,
    obstacleCounter: 0,
  });

  const initBackground = useCallback(() => {
    const data = gameData.current;
    data.bgStars = [];
    for (let i = 0; i < 60; i++) {
      const layer = Math.floor(Math.random() * 3);
      data.bgStars.push({
        x: Math.random() * 500,
        y: Math.random() * 140,
        size: 0.3 + layer * 0.4 + Math.random() * 0.8,
        twinkleOffset: Math.random() * Math.PI * 2,
        speed: 0.05 + layer * 0.1 + Math.random() * 0.15,
        layer,
      });
    }
    data.mountains = [];
    for (let layer = 0; layer < 3; layer++) {
      const count = 6 + layer * 2;
      for (let i = 0; i < count; i++) {
        data.mountains.push({
          x: i * (500 / count) + Math.random() * 30,
          width: 50 + Math.random() * 60 - layer * 10,
          height: 25 + Math.random() * 35 + (2 - layer) * 15,
          layer,
        });
      }
    }
    data.clouds = [];
    for (let i = 0; i < 5; i++) {
      data.clouds.push({
        x: Math.random() * 600,
        y: 15 + Math.random() * 60,
        width: 40 + Math.random() * 60,
        opacity: 0.04 + Math.random() * 0.06,
        speed: 0.15 + Math.random() * 0.25,
      });
    }
  }, []);

  const startGame = useCallback(() => {
    const data = gameData.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    data.groundY = canvas.height - 50;
    data.doroY = data.groundY;
    data.doroVy = 0;
    data.isJumping = false;
    data.isDucking = false;
    data.obstacles = [];
    data.stars = [];
    data.particles = [];
    data.frame = 0;
    data.speed = 4;
    data.score = 0;
    data.squishFrames = 0;
    data.starsCollected = 0;
    data.maxSpeed = 4;
    data.groundDashOffset = 0;
    data.shakeX = 0;
    data.shakeY = 0;
    data.shakeIntensity = 0;
    data.flashAlpha = 0;
    data.edgePulse = 0;
    data.doroRotation = 0;
    data.runCycle = 0;
    data.comboStars = 0;
    data.lastStarFrame = 0;
    data.obstacleCounter = 0;
    initBackground();
    setScore(0);
    setStarsCollected(0);
    setMaxSpeed(0);
    setIsNewRecord(false);
    setDisplayScore(0);
    setTimeSurvived(0);
    setGameState("playing");
  }, [initBackground]);

  const handleInput = useCallback((action: "jump" | "duck") => {
    const data = gameData.current;
    if (action === "jump" && !data.isJumping) {
      data.doroVy = -12.5;
      data.isJumping = true;
      data.doroRotation = -0.15;
      sfx.jump();
      for (let i = 0; i < 5; i++) {
        data.particles.push({
          x: 60 + Math.random() * 20,
          y: data.doroY,
          vx: -1 + Math.random() * 2,
          vy: 1 + Math.random() * 2,
          life: 12 + Math.random() * 8,
          maxLife: 20,
          size: 2 + Math.random() * 3,
          hue: 280 + Math.random() * 40,
          type: "burst",
        });
      }
    }
    if (action === "duck") {
      data.isDucking = true;
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== "playing") {
        if (e.code === "Space") {
          e.preventDefault();
          startGame();
        }
        return;
      }
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        handleInput("jump");
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        handleInput("duck");
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown") {
        gameData.current.isDucking = false;
      }
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, handleInput, startGame]);

  useEffect(() => {
    if (gameState === "dead") {
      let current = 0;
      const target = score;
      const step = Math.max(1, Math.floor(target / 40));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setDisplayScore(current);
      }, 25);
      return () => clearInterval(interval);
    }
  }, [gameState, score]);

  useEffect(() => {
    if (gameState === "dead") {
      const el = containerRef.current;
      if (el) {
        el.style.transition = "transform 0.04s";
        const shake = [
          "translate(5px, -3px)", "translate(-5px, 3px)", "translate(4px, 2px)",
          "translate(-3px, -2px)", "translate(2px, 1px)", "translate(-1px, -1px)", "translate(0, 0)"
        ];
        shake.forEach((t, i) => {
          setTimeout(() => { el.style.transform = t; }, i * 40);
        });
      }
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    const drawStar5 = (cx: number, cy: number, outerR: number, innerR: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        if (i === 0) {
          ctx.moveTo(cx + Math.cos(outerAngle) * outerR, cy + Math.sin(outerAngle) * outerR);
        } else {
          ctx.lineTo(cx + Math.cos(outerAngle) * outerR, cy + Math.sin(outerAngle) * outerR);
        }
        ctx.lineTo(cx + Math.cos(innerAngle) * innerR, cy + Math.sin(innerAngle) * innerR);
      }
      ctx.closePath();
    };

    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const loop = () => {
      const data = gameData.current;
      data.frame++;
      data.speed = 4 + data.frame / 450;
      if (data.speed > data.maxSpeed) data.maxSpeed = data.speed;
      data.runCycle += data.speed * 0.15;

      if (data.shakeIntensity > 0) {
        data.shakeX = (Math.random() - 0.5) * data.shakeIntensity;
        data.shakeY = (Math.random() - 0.5) * data.shakeIntensity;
        data.shakeIntensity *= 0.9;
        if (data.shakeIntensity < 0.3) data.shakeIntensity = 0;
      } else {
        data.shakeX = 0;
        data.shakeY = 0;
      }

      ctx.save();
      ctx.translate(data.shakeX, data.shakeY);

      const skyTime = Math.min(data.frame / 3000, 1);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      const r1 = Math.floor(13 + skyTime * 5);
      const g1 = Math.floor(5 + skyTime * 2);
      const b1 = Math.floor(32 + skyTime * 10);
      skyGrad.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
      skyGrad.addColorStop(0.4, "#1a0a35");
      skyGrad.addColorStop(0.7, "#2d1245");
      skyGrad.addColorStop(1, "#4a1a5e");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-5, -5, W + 10, H + 10);

      const nebulaX = W * 0.65 + Math.sin(data.frame * 0.002) * 20;
      const nebulaY = 50 + Math.cos(data.frame * 0.003) * 10;
      const nebulaGrad = ctx.createRadialGradient(nebulaX, nebulaY, 5, nebulaX, nebulaY, 80);
      nebulaGrad.addColorStop(0, "rgba(150, 50, 200, 0.08)");
      nebulaGrad.addColorStop(0.5, "rgba(100, 30, 180, 0.04)");
      nebulaGrad.addColorStop(1, "rgba(60, 20, 120, 0)");
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, W, H);

      data.clouds.forEach((cloud) => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < -20) {
          cloud.x = W + 20 + Math.random() * 40;
          cloud.y = 15 + Math.random() * 60;
        }
        ctx.globalAlpha = cloud.opacity;
        const cGrad = ctx.createRadialGradient(cloud.x + cloud.width / 2, cloud.y, cloud.width * 0.1, cloud.x + cloud.width / 2, cloud.y, cloud.width * 0.5);
        cGrad.addColorStop(0, "rgba(180, 140, 220, 1)");
        cGrad.addColorStop(1, "rgba(100, 60, 160, 0)");
        ctx.fillStyle = cGrad;
        ctx.fillRect(cloud.x, cloud.y - cloud.width * 0.3, cloud.width, cloud.width * 0.6);
      });
      ctx.globalAlpha = 1;

      data.bgStars.forEach((star) => {
        star.x -= star.speed * (1 + data.speed * 0.05);
        if (star.x < -5) star.x = W + 5;
        const twinkle = 0.2 + 0.8 * Math.abs(Math.sin(data.frame * 0.03 + star.twinkleOffset));
        ctx.globalAlpha = twinkle * (0.4 + star.layer * 0.25);
        const starColor = star.layer === 0 ? "#c8b0ff" : star.layer === 1 ? "#e8d0ff" : "#fff0ff";
        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        if (star.size > 1.2) {
          ctx.globalAlpha = twinkle * 0.15;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      const mountainColors = [
        ["rgba(40, 15, 60, 0.7)", "rgba(30, 10, 50, 0.5)"],
        ["rgba(55, 20, 75, 0.5)", "rgba(45, 15, 65, 0.3)"],
        ["rgba(70, 28, 90, 0.35)", "rgba(60, 22, 80, 0.2)"],
      ];
      for (let layer = 0; layer < 3; layer++) {
        const layerMts = data.mountains.filter(m => m.layer === layer);
        const parallaxSpeed = (0.15 + layer * 0.12) * data.speed;
        layerMts.forEach((mt) => {
          mt.x -= parallaxSpeed;
          if (mt.x + mt.width < -30) mt.x = W + 30 + Math.random() * 50;
          const mtGrad = ctx.createLinearGradient(mt.x + mt.width / 2, data.groundY - mt.height, mt.x + mt.width / 2, data.groundY);
          mtGrad.addColorStop(0, mountainColors[layer][0]);
          mtGrad.addColorStop(1, mountainColors[layer][1]);
          ctx.fillStyle = mtGrad;
          ctx.beginPath();
          ctx.moveTo(mt.x, data.groundY);
          ctx.quadraticCurveTo(mt.x + mt.width * 0.3, data.groundY - mt.height * 0.9, mt.x + mt.width / 2, data.groundY - mt.height);
          ctx.quadraticCurveTo(mt.x + mt.width * 0.7, data.groundY - mt.height * 0.85, mt.x + mt.width, data.groundY);
          ctx.closePath();
          ctx.fill();
        });
      }

      const groundGrad = ctx.createLinearGradient(0, data.groundY, 0, H);
      groundGrad.addColorStop(0, "#2a1040");
      groundGrad.addColorStop(0.3, "#201035");
      groundGrad.addColorStop(1, "#150820");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, data.groundY, W, H - data.groundY);

      ctx.strokeStyle = "rgba(200, 120, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(200, 120, 255, 0.3)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, data.groundY);
      ctx.lineTo(W, data.groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      data.groundDashOffset = (data.groundDashOffset + data.speed) % 24;
      ctx.strokeStyle = "rgba(150, 80, 200, 0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 14]);
      ctx.lineDashOffset = -data.groundDashOffset;
      ctx.beginPath();
      ctx.moveTo(0, data.groundY + 10);
      ctx.lineTo(W, data.groundY + 10);
      ctx.stroke();
      ctx.lineDashOffset = -data.groundDashOffset * 0.6;
      ctx.beginPath();
      ctx.moveTo(0, data.groundY + 22);
      ctx.lineTo(W, data.groundY + 22);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < W; i += 10) {
        const grassX = (i + data.frame * data.speed * 0.4) % W;
        const sway = Math.sin(data.frame * 0.05 + i * 0.3) * 1.5;
        const h = 3 + Math.sin(i * 0.7) * 2.5;
        ctx.strokeStyle = `rgba(100, 180, 120, ${0.15 + Math.sin(i * 0.3) * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(grassX, data.groundY);
        ctx.quadraticCurveTo(grassX + sway, data.groundY - h * 0.6, grassX - 1 + sway, data.groundY - h);
        ctx.stroke();
      }

      data.doroVy += 0.65;
      data.doroY += data.doroVy;
      const wasJumping = data.isJumping;
      if (data.doroY >= data.groundY) {
        data.doroY = data.groundY;
        data.doroVy = 0;
        if (wasJumping) {
          data.squishFrames = 10;
          data.doroRotation = 0;
        }
        data.isJumping = false;
      }

      if (data.isJumping) {
        data.doroRotation += 0.02;
      }

      if (data.squishFrames > 0) data.squishFrames--;

      let doroW: number, doroH: number;
      if (data.isDucking) {
        doroW = 40;
        doroH = 16;
      } else if (data.squishFrames > 0) {
        const t = data.squishFrames / 10;
        doroW = 32 + t * 10;
        doroH = 32 - t * 10;
      } else {
        const breathe = Math.sin(data.frame * 0.08) * 1;
        doroW = 32 + breathe;
        doroH = 32 - breathe * 0.5;
      }
      const doroX = 65;
      const doroTop = data.doroY - doroH;
      const doroCX = doroX + doroW / 2;
      const doroCY = doroTop + doroH / 2;

      if (data.frame % 2 === 0) {
        const trailSpeed = data.speed;
        const hue = 300 + Math.sin(data.frame * 0.02) * 30;
        data.particles.push({
          x: doroX - 2,
          y: data.doroY - doroH * 0.3 + (Math.random() - 0.5) * doroH * 0.4,
          vx: -1.2 - Math.random() * trailSpeed * 0.4,
          vy: (Math.random() - 0.5) * 1.2,
          life: 18 + Math.random() * 12,
          maxLife: 30,
          size: 1.5 + Math.random() * 2.5,
          hue,
          type: "trail",
        });
      }
      if (data.frame % 3 === 0 && data.isJumping) {
        data.particles.push({
          x: doroCX + (Math.random() - 0.5) * doroW,
          y: doroCY + (Math.random() - 0.5) * doroH,
          vx: -0.5 + Math.random() * 1,
          vy: -0.5 - Math.random() * 1,
          life: 10 + Math.random() * 8,
          maxLife: 18,
          size: 1 + Math.random() * 1.5,
          hue: 40 + Math.random() * 20,
          type: "trail",
        });
      }

      data.particles = data.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.type === "burst") p.vy += 0.1;
        if (p.type === "death") {
          p.vy += 0.05;
          p.vx *= 0.98;
        }
        p.life--;
        if (p.life <= 0) return false;
        const alpha = p.life / p.maxLife;
        if (p.type === "trail") {
          ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha * 0.6})`;
        } else if (p.type === "burst") {
          ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${alpha * 0.8})`;
        } else if (p.type === "death") {
          ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha * 0.9})`;
        } else {
          ctx.fillStyle = `hsla(${p.hue}, 60%, 80%, ${alpha * 0.5})`;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        if (p.type === "trail" && p.size > 2) {
          ctx.globalAlpha = alpha * 0.15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * alpha * 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        return true;
      });

      ctx.fillStyle = "rgba(200, 140, 255, 0.1)";
      ctx.beginPath();
      ctx.ellipse(doroCX, data.doroY + 2, doroW * 0.55, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(doroCX, doroCY);
      ctx.rotate(data.doroRotation);

      const bodyGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, doroW * 0.55);
      bodyGrad.addColorStop(0, "#fff5f5");
      bodyGrad.addColorStop(0.5, "#FFD4E0");
      bodyGrad.addColorStop(1, "#FFB0C4");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, doroW / 2, doroH / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(200, 100, 140, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, doroW / 2, doroH / 2, 0, 0, Math.PI * 2);
      ctx.stroke();

      if (!data.isDucking) {
        const earSize = 7;
        [-1, 1].forEach((side) => {
          ctx.fillStyle = "#FFB6C1";
          ctx.beginPath();
          ctx.moveTo(side * 8, -doroH / 2 + 4);
          ctx.lineTo(side * 13, -doroH / 2 - earSize);
          ctx.lineTo(side * 3, -doroH / 2 + 2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#FF91A4";
          ctx.beginPath();
          ctx.moveTo(side * 8, -doroH / 2 + 4);
          ctx.lineTo(side * 11, -doroH / 2 - earSize + 3);
          ctx.lineTo(side * 5, -doroH / 2 + 3);
          ctx.closePath();
          ctx.fill();
        });
      }

      const eyeY = -doroH * 0.08;
      const eyeSpacing = doroW * 0.22;
      const eyeR = data.isDucking ? 2.5 : 4;
      const blinkCycle = data.frame % 180;
      const isBlinking = blinkCycle > 175;

      if (isBlinking) {
        ctx.strokeStyle = "#6B21A8";
        ctx.lineWidth = 1.5;
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          ctx.moveTo(side * eyeSpacing - 3, eyeY);
          ctx.lineTo(side * eyeSpacing + 3, eyeY);
          ctx.stroke();
        });
      } else {
        ctx.fillStyle = "#6B21A8";
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          ctx.arc(side * eyeSpacing, eyeY, eyeR, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(side * eyeSpacing + 1.5, eyeY - 1.5, eyeR * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#6B21A8";
        });
      }

      if (data.speed > 7) {
        ctx.fillStyle = "rgba(255, 200, 50, 0.6)";
        ctx.beginPath();
        drawStar5(doroW * 0.35, -doroH * 0.3, 3, 1.2);
        ctx.fill();
      }

      const cheekY = eyeY + doroH * 0.2;
      ctx.fillStyle = "rgba(255, 105, 180, 0.35)";
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.arc(side * doroW * 0.32, cheekY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!data.isDucking && !data.isJumping) {
        const legOffset = Math.sin(data.runCycle) * 3;
        ctx.strokeStyle = "#FFB0C4";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-5, doroH / 2 - 2);
        ctx.lineTo(-5 + legOffset, doroH / 2 + 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(5, doroH / 2 - 2);
        ctx.lineTo(5 - legOffset, doroH / 2 + 4);
        ctx.stroke();
        ctx.lineCap = "butt";
      }

      ctx.restore();

      const obstacleTypes: Array<"spike" | "orb" | "laser" | "crate"> = ["spike", "orb", "laser", "crate"];
      const spawnRate = Math.max(50, 80 - Math.floor(data.frame / 300) * 5);
      if (data.frame % spawnRate === 0) {
        data.obstacleCounter++;
        const typeIdx = data.obstacleCounter % obstacleTypes.length;
        const type = obstacleTypes[typeIdx];
        const hue = type === "spike" ? 0 : type === "orb" ? 270 : type === "laser" ? 120 : 30;
        data.obstacles.push({ id: data.frame, x: W + 20, type, hue });
      }

      if (data.frame % 55 === 25) {
        data.stars.push({
          id: data.frame,
          x: W + 20,
          y: data.groundY - 40 - Math.random() * 60,
          collected: false,
          bobOffset: Math.random() * Math.PI * 2,
        });
      }

      data.obstacles = data.obstacles.filter((o) => o.x > -40);
      data.stars = data.stars.filter((s) => s.x > -30 && (!s.collected || (s.collectFrame && data.frame - s.collectFrame < 18)));

      data.obstacles.forEach((obs) => {
        obs.x -= data.speed;
        let obsW: number, obsH: number, obsY: number;

        if (obs.type === "spike") {
          obsW = 22;
          obsH = 26;
          obsY = data.groundY - obsH;

          ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
          ctx.beginPath();
          ctx.ellipse(obs.x + obsW / 2, data.groundY + 2, obsW * 0.5, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          const spikeGrad = ctx.createLinearGradient(obs.x, obsY + obsH, obs.x, obsY);
          spikeGrad.addColorStop(0, "#8B0000");
          spikeGrad.addColorStop(0.4, "#E74C3C");
          spikeGrad.addColorStop(0.8, "#FF6B6B");
          spikeGrad.addColorStop(1, "#FF9999");
          ctx.fillStyle = spikeGrad;
          ctx.beginPath();
          ctx.moveTo(obs.x, obsY + obsH);
          ctx.lineTo(obs.x + obsW * 0.5, obsY);
          ctx.lineTo(obs.x + obsW, obsY + obsH);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "rgba(255, 180, 180, 0.25)";
          ctx.beginPath();
          ctx.moveTo(obs.x + 3, obsY + obsH);
          ctx.lineTo(obs.x + obsW * 0.5, obsY + 4);
          ctx.lineTo(obs.x + obsW * 0.5, obsY + obsH);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "rgba(255, 100, 100, 0.15)";
          ctx.beginPath();
          ctx.arc(obs.x + obsW / 2, obsY + obsH / 2, obsW * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === "orb") {
          obsW = 20;
          obsH = 20;
          obsY = data.groundY - 55;

          const orbCX = obs.x + obsW / 2;
          const orbCY = obsY + obsH / 2;
          const orbR = obsW / 2;
          const pulse = 0.8 + Math.sin(data.frame * 0.1) * 0.2;

          ctx.globalAlpha = 0.1 * pulse;
          ctx.fillStyle = "#9B59B6";
          ctx.beginPath();
          ctx.arc(orbCX, orbCY, orbR * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.2 * pulse;
          ctx.beginPath();
          ctx.arc(orbCX, orbCY, orbR * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;

          const orbGrad = ctx.createRadialGradient(orbCX - 3, orbCY - 3, 1, orbCX, orbCY, orbR);
          orbGrad.addColorStop(0, "#E8D0FF");
          orbGrad.addColorStop(0.5, "#A855F7");
          orbGrad.addColorStop(1, "#6B21A8");
          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(orbCX, orbCY, orbR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.beginPath();
          ctx.arc(orbCX - 3, orbCY - 3, 2.5, 0, Math.PI * 2);
          ctx.fill();

          const ringAngle = data.frame * 0.04;
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 + Math.sin(data.frame * 0.08) * 0.1})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(orbCX, orbCY, orbR * 1.6, orbR * 0.5, ringAngle, 0, Math.PI * 2);
          ctx.stroke();
        } else if (obs.type === "laser") {
          obsW = 4;
          obsH = 40;
          obsY = data.groundY - obsH;

          const laserPulse = 0.7 + Math.sin(data.frame * 0.15) * 0.3;

          ctx.globalAlpha = 0.08 * laserPulse;
          ctx.fillStyle = "#22FF22";
          ctx.fillRect(obs.x - 8, obsY, obsW + 16, obsH);
          ctx.globalAlpha = 0.2 * laserPulse;
          ctx.fillStyle = "#44FF44";
          ctx.fillRect(obs.x - 3, obsY, obsW + 6, obsH);
          ctx.globalAlpha = 1;

          const laserGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obsW, 0);
          laserGrad.addColorStop(0, "rgba(0, 255, 100, 0.9)");
          laserGrad.addColorStop(0.5, "rgba(100, 255, 150, 1)");
          laserGrad.addColorStop(1, "rgba(0, 255, 100, 0.9)");
          ctx.fillStyle = laserGrad;
          ctx.fillRect(obs.x, obsY, obsW, obsH);

          ctx.shadowColor = "rgba(0, 255, 100, 0.5)";
          ctx.shadowBlur = 8;
          ctx.fillStyle = "rgba(200, 255, 200, 0.9)";
          ctx.fillRect(obs.x + 1, obsY, 2, obsH);
          ctx.shadowBlur = 0;

          ctx.fillStyle = "#44FF44";
          ctx.beginPath();
          ctx.arc(obs.x + obsW / 2, obsY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(obs.x + obsW / 2, obsY + obsH, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          obsW = 22;
          obsH = 22;
          obsY = data.groundY - obsH;

          ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
          ctx.beginPath();
          ctx.ellipse(obs.x + obsW / 2, data.groundY + 2, obsW * 0.5, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          const crateGrad = ctx.createLinearGradient(obs.x, obsY, obs.x, obsY + obsH);
          crateGrad.addColorStop(0, "#C4A35A");
          crateGrad.addColorStop(0.5, "#9A7B3A");
          crateGrad.addColorStop(1, "#7A5B2A");
          ctx.fillStyle = crateGrad;
          drawRoundedRect(obs.x, obsY, obsW, obsH, 3);
          ctx.fill();

          ctx.strokeStyle = "rgba(160, 120, 60, 0.5)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(obs.x, obsY + obsH / 2);
          ctx.lineTo(obs.x + obsW, obsY + obsH / 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(obs.x + obsW / 2, obsY);
          ctx.lineTo(obs.x + obsW / 2, obsY + obsH);
          ctx.stroke();

          ctx.fillStyle = "rgba(255, 220, 150, 0.2)";
          ctx.fillRect(obs.x + 2, obsY + 2, obsW / 2 - 2, obsH / 2 - 2);
        }

        const collides =
          doroX + doroW > obs.x + 3 &&
          doroX < obs.x + obsW - 3 &&
          doroTop + doroH > obsY + 3 &&
          doroTop < obsY + obsH - 3;

        if (collides) {
          sfx.die();
          data.flashAlpha = 0.6;

          for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            data.particles.push({
              x: doroCX,
              y: doroCY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 2,
              life: 20 + Math.random() * 15,
              maxLife: 35,
              size: 2 + Math.random() * 3,
              hue: obs.hue + Math.random() * 40,
              type: "death",
            });
          }

          setGameState("dead");
          const finalScore = Math.floor(data.score);
          setScore(finalScore);
          setStarsCollected(data.starsCollected);
          setMaxSpeed(Math.round(data.maxSpeed * 10) / 10);
          setTimeSurvived(Math.floor(data.frame / 60));
          if (finalScore > highScore) {
            setHighScore(finalScore);
            setIsNewRecord(true);
            localStorage.setItem("xdoro-runner-best", finalScore.toString());
          }
        }
      });

      data.stars.forEach((star) => {
        star.x -= data.speed;

        if (star.collected) {
          if (star.collectFrame) {
            const elapsed = data.frame - star.collectFrame;
            const progress = elapsed / 18;
            ctx.globalAlpha = 1 - progress;
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2 + elapsed * 0.4;
              const dist = elapsed * 3;
              ctx.fillStyle = `hsla(45, 100%, ${60 + i * 5}%, ${1 - progress})`;
              ctx.beginPath();
              ctx.arc(
                star.x + 8 + Math.cos(angle) * dist,
                star.y + 8 + Math.sin(angle) * dist,
                2.5 - progress * 2,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
            ctx.globalAlpha = 1;

            if (elapsed < 10) {
              ctx.globalAlpha = 1 - elapsed / 10;
              ctx.fillStyle = "#FFD700";
              ctx.font = "bold 11px Poppins, sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("+10", star.x + 8, star.y - elapsed * 1.5);
              ctx.globalAlpha = 1;
            }
          }
          return;
        }

        const starCX = star.x + 8;
        const bob = Math.sin(data.frame * 0.06 + star.bobOffset) * 3;
        const starCY = star.y + 8 + bob;
        const sparkle = 0.6 + 0.4 * Math.sin(data.frame * 0.1 + star.id);

        ctx.globalAlpha = sparkle * 0.15;
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(starCX, starCY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        const starGrad = ctx.createRadialGradient(starCX - 1, starCY - 1, 1, starCX, starCY, 8);
        starGrad.addColorStop(0, "#FFFACD");
        starGrad.addColorStop(0.3, "#FFD700");
        starGrad.addColorStop(1, "#DAA520");
        ctx.fillStyle = starGrad;
        drawStar5(starCX, starCY, 9, 4);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.arc(starCX - 2, starCY - 2.5, 1.8, 0, Math.PI * 2);
        ctx.fill();

        const collectDist = 20;
        const collides =
          Math.abs(doroCX - starCX) < collectDist &&
          Math.abs(doroCY - starCY) < collectDist;

        if (collides) {
          star.collected = true;
          star.collectFrame = data.frame;
          data.score += 10;
          data.starsCollected++;
          if (data.frame - data.lastStarFrame < 60) {
            data.comboStars++;
          } else {
            data.comboStars = 1;
          }
          data.lastStarFrame = data.frame;
          sfx.collectStar();
        }
      });

      data.score += 0.1;
      setScore(Math.floor(data.score));

      if (data.speed > 6) {
        const intensity = Math.min((data.speed - 6) / 4, 1);
        data.edgePulse += 0.08;
        const pulseAlpha = intensity * 0.12 * (0.5 + Math.sin(data.edgePulse) * 0.5);

        const leftEdge = ctx.createLinearGradient(0, 0, 40, 0);
        leftEdge.addColorStop(0, `rgba(200, 100, 255, ${pulseAlpha})`);
        leftEdge.addColorStop(1, "rgba(200, 100, 255, 0)");
        ctx.fillStyle = leftEdge;
        ctx.fillRect(0, 0, 40, H);

        const rightEdge = ctx.createLinearGradient(W, 0, W - 40, 0);
        rightEdge.addColorStop(0, `rgba(200, 100, 255, ${pulseAlpha})`);
        rightEdge.addColorStop(1, "rgba(200, 100, 255, 0)");
        ctx.fillStyle = rightEdge;
        ctx.fillRect(W - 40, 0, 40, H);

        if (data.frame % 4 === 0) {
          for (let i = 0; i < 2; i++) {
            const side = i === 0 ? -5 : W + 5;
            data.particles.push({
              x: side,
              y: 20 + Math.random() * (H - 40),
              vx: i === 0 ? 2 : -2,
              vy: (Math.random() - 0.5) * 0.5,
              life: 8 + Math.random() * 6,
              maxLife: 14,
              size: 1 + Math.random() * 1.5,
              hue: 280,
              type: "speed",
            });
          }
        }
      }

      if (data.flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 50, 50, ${data.flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
        data.flashAlpha *= 0.88;
        if (data.flashAlpha < 0.01) data.flashAlpha = 0;
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      drawRoundedRect(7, 7, 90, 32, 4);
      ctx.fill();
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      drawRoundedRect(W - 110, 7, 103, 32, 4);
      ctx.fill();

      const speedPercent = Math.min((data.speed - 4) / 8, 1);
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      drawRoundedRect(12, 12, 80, 7, 3);
      ctx.fill();
      const barGrad = ctx.createLinearGradient(12, 12, 92, 12);
      barGrad.addColorStop(0, "#9B59B6");
      barGrad.addColorStop(0.7, "#E74C3C");
      barGrad.addColorStop(1, "#FF6B6B");
      ctx.fillStyle = barGrad;
      drawRoundedRect(12, 12, 80 * speedPercent, 7, 3);
      ctx.fill();

      if (speedPercent > 0.8) {
        ctx.shadowColor = "#FF6B6B";
        ctx.shadowBlur = 4;
        ctx.fillStyle = "rgba(255, 107, 107, 0.4)";
        drawRoundedRect(12, 12, 80 * speedPercent, 7, 3);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "bold 8px Poppins, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`SPEED ${Math.floor(data.speed * 10) / 10}x`, 12, 30);

      ctx.fillStyle = "#FFD700";
      drawStar5(W - 98, 18, 5, 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 15px Poppins, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${Math.floor(data.score)}`, W - 12, 22);

      ctx.fillStyle = "rgba(255, 215, 0, 0.6)";
      ctx.font = "9px Poppins, sans-serif";
      ctx.fillText(`Best: ${highScore}`, W - 12, 34);

      if (data.comboStars > 1 && data.frame - data.lastStarFrame < 60) {
        const comboFade = 1 - (data.frame - data.lastStarFrame) / 60;
        ctx.globalAlpha = comboFade;
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 12px Poppins, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${data.comboStars}x COMBO!`, W / 2, 22);
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, highScore]);

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge variant="secondary" data-testid="badge-score">
          <Star className="w-3 h-3 mr-1" />
          Score: {score}
        </Badge>
        <Badge variant="secondary" data-testid="badge-stars">
          <Zap className="w-3 h-3 mr-1" />
          Stars: {starsCollected}
        </Badge>
        <Badge variant="outline" data-testid="badge-best">
          <Trophy className="w-3 h-3 mr-1" />
          Best: {highScore}
        </Badge>
      </div>

      <Card className="p-0 bg-card/60 backdrop-blur-sm border-border/50 relative overflow-hidden">
        <div ref={containerRef}>
          <canvas
            ref={canvasRef}
            width={500}
            height={240}
            className="w-full rounded-md"
            onClick={() => {
              if (gameState === "playing") handleInput("jump");
              else startGame();
            }}
            data-testid="canvas-runner"
          />
        </div>
        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md"
               style={{ background: "linear-gradient(to bottom, rgba(13,5,32,0.88), rgba(26,10,53,0.88))" }}>
            <div className="text-center space-y-3">
              <p className="text-lg font-bold font-game text-white" data-testid="text-title">Doro Runner</p>
              <p className="text-xs text-gray-300">Dodge obstacles and collect stars!</p>
              <Button size="sm" onClick={startGame} data-testid="button-start-runner">
                <Play className="w-3 h-3 mr-1" />
                Start Running
              </Button>
              <p className="text-xs text-gray-400">Space / Tap to jump</p>
            </div>
          </div>
        )}
        {gameState === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-md"
               style={{ background: "linear-gradient(to bottom, rgba(13,5,32,0.93), rgba(26,10,53,0.93))" }}>
            <p className="text-xl font-bold font-game mb-1 text-white" data-testid="text-game-over">Game Over!</p>
            {isNewRecord && (
              <p className="text-sm font-bold text-yellow-400 mb-2 animate-pulse" data-testid="text-new-record">New Record!</p>
            )}
            <div className="flex flex-col items-center gap-1.5 mb-3">
              <p className="text-3xl font-bold text-white font-game" data-testid="text-final-score">{displayScore}</p>
              <div className="grid grid-cols-3 gap-3 text-xs text-gray-300 mt-1">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-gray-500 text-[10px]">DISTANCE</span>
                  <span data-testid="text-distance">{Math.floor(displayScore * 0.8)}m</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-gray-500 text-[10px]">STARS</span>
                  <span className="text-yellow-400" data-testid="text-stars-collected">{starsCollected}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-gray-500 text-[10px]">MAX SPEED</span>
                  <span data-testid="text-max-speed">{maxSpeed}x</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1" data-testid="text-time-survived">
                <Timer className="w-3 h-3 inline mr-1" />
                Survived {timeSurvived}s
              </div>
            </div>
            <Button size="sm" onClick={startGame} data-testid="button-restart-runner">
              <RotateCcw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
          </div>
        )}
      </Card>

      <div className="flex justify-center gap-3 md:hidden">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onTouchStart={() => gameState === "playing" && handleInput("jump")}
          onClick={() => {
            if (gameState !== "playing") startGame();
            else handleInput("jump");
          }}
          data-testid="button-jump"
        >
          <ArrowUp className="w-4 h-4 mr-1" />
          Jump
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onTouchStart={() => gameState === "playing" && handleInput("duck")}
          onTouchEnd={() => { gameData.current.isDucking = false; }}
          data-testid="button-duck"
        >
          <ArrowDown className="w-4 h-4 mr-1" />
          Duck
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Space/Tap to jump. Down arrow to duck. Collect stars, avoid obstacles!
      </p>
    </div>
  );
}
