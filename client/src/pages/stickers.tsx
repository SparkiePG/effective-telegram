import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarField } from "@/components/star-field";
import { ArrowLeft, Download, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

import stickerHodl from "@assets/sticker-hodl.png";
import stickerMoon from "@assets/sticker-moon.png";
import stickerDiamondHands from "@assets/sticker-diamond-hands.png";
import stickerFlappy from "@assets/sticker-flappy-doro.png";
import stickerBuyDip from "@assets/sticker-buy-dip.png";
import stickerGm from "@assets/sticker-gm.png";
import stickerPump from "@assets/sticker-pump.png";
import stickerWhale from "@assets/sticker-whale.png";
import stickerWagmi from "@assets/sticker-wagmi.png";
import stickerDyor from "@assets/sticker-dyor.png";

import doroGif from "@assets/dance-nikke_1771772479544.gif";
import evaGif from "@assets/Eva_Doro_GIF_1771776258716.gif";
import dorothyGif from "@assets/Dorothy_Doro_GIF_1771776258717.gif";
import doroWings from "@assets/Doro_with_wings_1771775868499.png";
import doroSpider from "@assets/16-1_1771777609412.png";
import doroFace from "@assets/Gxsq0QXXkAAGpNL_1771777609413.jpg";
import doroBrush from "@assets/Screenshot_2026-02-22_215203_1771777609413.jpg";
import doroPeek from "@assets/Screenshot_2026-02-22_215144_1771777609414.jpg";
import doroTongue from "@assets/GoLtZzkasAEjWqb_1771777609414.jpg";

const stickers = [
  { id: "hodl", name: "HODL Doro", src: stickerHodl, category: "crypto" },
  { id: "moon", name: "To The Moon", src: stickerMoon, category: "crypto" },
  { id: "diamond", name: "Diamond Hands", src: stickerDiamondHands, category: "crypto" },
  { id: "pump", name: "Pump It", src: stickerPump, category: "crypto" },
  { id: "whale", name: "Doro Whale", src: stickerWhale, category: "crypto" },
  { id: "dip", name: "Buy The Dip", src: stickerBuyDip, category: "crypto" },
  { id: "gm", name: "GM Doro", src: stickerGm, category: "crypto" },
  { id: "wagmi", name: "WAGMI", src: stickerWagmi, category: "crypto" },
  { id: "dyor", name: "DYOR", src: stickerDyor, category: "crypto" },
  { id: "flappy", name: "Flappy Doro", src: stickerFlappy, category: "gaming" },
];

const artworks = [
  { id: "dance", name: "Dancing Doro", src: doroGif },
  { id: "eva", name: "Eva Doro", src: evaGif },
  { id: "dorothy", name: "Dorothy Doro", src: dorothyGif },
  { id: "wings", name: "Doro Wings", src: doroWings },
  { id: "spider", name: "Spider Doro", src: doroSpider },
  { id: "face", name: "Doro Face", src: doroFace },
  { id: "brush", name: "Doro & Brush", src: doroBrush },
  { id: "peek", name: "Peeking Doro", src: doroPeek },
  { id: "tongue", name: "Tongue Out", src: doroTongue },
];

type Filter = "all" | "crypto" | "gaming";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function downloadImage(src: string, name: string) {
  const link = document.createElement("a");
  link.href = src;
  link.download = `xdoro-${name}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Stickers() {
  const [filter, setFilter] = useState<Filter>("all");

  const filteredStickers = filter === "all"
    ? stickers
    : stickers.filter(s => s.category === filter);

  return (
    <div className="min-h-screen pt-20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-background to-background dark:from-purple-950/50 pointer-events-none" />
        <StarField count={80} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-10">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back-stickers">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black" data-testid="text-stickers-heading">
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Doro Stickers
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Crypto-themed stickers &amp; art for your memes
              </p>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <h2 className="text-xl font-bold flex items-center gap-2" data-testid="text-crypto-stickers-heading">
                <Sparkles className="w-5 h-5 text-primary" />
                Crypto Stickers
              </h2>
              <div className="flex items-center gap-2">
                {(["all", "crypto", "gaming"] as Filter[]).map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    className="rounded-full capitalize"
                    onClick={() => setFilter(f)}
                    data-testid={`button-filter-${f}`}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredStickers.map((sticker, i) => (
                  <motion.div
                    key={sticker.id}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.8 }}
                    variants={fadeUp}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Card
                      className="group relative p-4 rounded-2xl border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden"
                      data-testid={`card-sticker-${sticker.id}`}
                    >
                      <div className="aspect-square flex items-center justify-center p-2 mb-3">
                        <img
                          src={sticker.src}
                          alt={sticker.name}
                          className="w-full h-full object-contain"
                          data-testid={`img-sticker-${sticker.id}`}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold truncate" data-testid={`text-sticker-name-${sticker.id}`}>{sticker.name}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full shrink-0"
                          onClick={() => downloadImage(sticker.src, sticker.id)}
                          data-testid={`button-download-${sticker.id}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full mt-1 capitalize">
                        {sticker.category}
                      </Badge>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6" data-testid="text-art-heading">
              <Sparkles className="w-5 h-5 text-pink-400" />
              Doro Art &amp; GIFs
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {artworks.map((art, i) => (
                <motion.div
                  key={art.id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card
                    className="group p-3 rounded-2xl border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden"
                    data-testid={`card-art-${art.id}`}
                  >
                    <div className="aspect-square flex items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-pink-500/10 to-purple-500/10 mb-2">
                      <img
                        src={art.src}
                        alt={art.name}
                        className="w-full h-full object-contain"
                        data-testid={`img-art-${art.id}`}
                      />
                    </div>
                    <span className="text-xs font-semibold" data-testid={`text-art-name-${art.id}`}>{art.name}</span>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center py-8">
            <Card className="p-8 rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-border/30 inline-block">
              <p className="text-sm text-muted-foreground mb-4">
                Use these stickers in your Telegram groups, X posts, and memes!
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <a href="https://pump.fun" target="_blank" rel="noopener noreferrer">
                  <Button className="rounded-full" data-testid="button-buy-stickers">
                    Buy $XDORO
                  </Button>
                </a>
                <Link href="/games">
                  <Button variant="outline" className="rounded-full" data-testid="button-games-stickers">
                    Play Games
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
