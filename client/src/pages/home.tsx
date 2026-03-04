import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/star-field";
import { PriceTicker } from "@/components/price-ticker";
import { Link } from "wouter";
import {
  ExternalLink,
  Copy,
  Gamepad2,
  Rocket,
  ArrowRight,
  Wallet,
  ArrowDownUp,
  Search,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  ChevronRight,
} from "lucide-react";
import { SiTelegram } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import doroGif from "@assets/dance-nikke_1771772479544.gif";
import heroBg from "@assets/hero-bg.png";
import gamesPreview from "@assets/games-preview.png";
import stickerHodl from "@assets/sticker-hodl.png";
import stickerMoon from "@assets/sticker-moon.png";
import stickerDiamondHands from "@assets/sticker-diamond-hands.png";
import stickerPump from "@assets/sticker-pump.png";
import stickerWhale from "@assets/sticker-whale.png";
import stickerWagmi from "@assets/sticker-wagmi.png";
import communityPreview from "@assets/community-preview.png";
import collectiblesPreview from "@assets/collectibles-preview.png";
import { PriceChart } from "@/components/price-chart";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const CONTRACT_ADDRESS = "xDoR0...coming soon";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export default function Home() {
  const { toast } = useToast();

  const copyAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    toast({ title: "Copied!", description: "Contract address copied to clipboard" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/40 via-transparent to-purple-950/40" />
        </div>
        <StarField count={80} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.12] mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-white/80 font-medium">Live on Solana</span>
                <span className="w-px h-3.5 bg-white/20" />
                <span className="text-sm text-white/50 font-medium">pump.fun</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-[0.95]">
                <span className="text-white drop-shadow-2xl">Meet</span>
                <br />
                <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                  $XDORO
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/70 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
                Meet Doro — a goofy little gremlin creature born from meme culture
                with a fanbase of its own. Explore, play games, collect, and earn.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-6">
                <a href="https://pump.fun" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="text-base px-8 h-13 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 border-0 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.03] font-bold"
                    data-testid="button-buy-hero"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Buy on pump.fun
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
                <Link href="/games">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base px-8 h-13 rounded-full bg-white/[0.08] border-white/20 text-white hover:bg-white/[0.15] hover:text-white hover:border-white/30 backdrop-blur-sm transition-all duration-300 font-semibold"
                    data-testid="button-play-hero"
                  >
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Play Games
                  </Button>
                </Link>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/[0.08]">
                <span className="text-xs text-white/40 font-mono truncate max-w-[180px] sm:max-w-none">
                  {CONTRACT_ADDRESS}
                </span>
                <button
                  onClick={copyAddress}
                  className="text-white/40 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                  data-testid="button-copy-ca"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            <motion.div
              className="flex-shrink-0"
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                <img
                  src={doroGif}
                  alt="xdoro dancing"
                  className="w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-3xl animate-float shadow-2xl shadow-purple-500/20"
                  data-testid="img-hero-doro"
                />
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 blur-xl -z-10 animate-pulse-glow" />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </div>
      </section>

      <section className="py-3 border-y border-border/20 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-8 px-4">
                <span className="text-sm font-semibold text-primary whitespace-nowrap">$XDORO</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">Solana Memecoin</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                <span className="text-sm font-semibold text-primary whitespace-nowrap">Doro Galaxy</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">11 Mini Games</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400/50" />
                <span className="text-sm font-semibold text-primary whitespace-nowrap">pump.fun</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">Fair Launch</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/50" />
                <span className="text-sm font-semibold text-primary whitespace-nowrap">Community</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">Join the Huddle</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400/50" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-3 bg-card/50">
        <div className="max-w-6xl mx-auto px-4">
          <PriceTicker />
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 bg-card/30">
        <div className="max-w-3xl mx-auto">
          <PriceChart />
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              <Sparkles className="w-4 h-4" />
              Explore
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-2">
              The Doro{" "}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Ecosystem
              </span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-base">
              Games, collectibles, and a thriving community — everything you need in one place.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:row-span-2"
            >
              <Link href="/games">
                <Card className="group relative h-full overflow-hidden rounded-3xl border-0 cursor-pointer hover:ring-1 hover:ring-white/10 transition-all duration-500" data-testid="card-explore-games">
                  <img
                    src={gamesPreview}
                    alt="Doro Games"
                    className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="relative z-10 flex flex-col justify-end h-full min-h-[400px] lg:min-h-[500px] p-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] w-fit mb-4">
                      <Gamepad2 className="w-4 h-4 text-pink-400" />
                      <span className="text-xs text-white/80 font-semibold">7 Playable Games</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">Doro Galaxy</h3>
                    <p className="text-white/50 text-sm max-w-md leading-relaxed">
                      Enter the intergalactic gaming hub. Play Memory Match, Battle, Runner
                      and more. Compete for the leaderboard crown.
                    </p>
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/20 text-white text-sm font-semibold group-hover:from-pink-500/30 group-hover:to-purple-500/30 group-hover:border-pink-500/30 transition-all duration-300">
                        Play Now
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="group relative overflow-hidden rounded-3xl border-0 hover:ring-1 hover:ring-white/10 transition-all duration-500" data-testid="card-explore-community">
                <img
                  src={communityPreview}
                  alt="Doro Community"
                  className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10 flex flex-col justify-end min-h-[240px] p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] w-fit mb-3">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs text-white/80 font-semibold">Community</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">The Huddle</h3>
                  <p className="text-white/50 text-sm max-w-sm leading-relaxed">
                    Join the cutest community in crypto. Connect with fellow Doro lovers.
                  </p>
                  <div className="mt-5 flex items-center gap-2">
                    <a href="https://t.me" target="_blank" rel="noopener noreferrer">
                      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.1] text-white text-sm font-medium hover:bg-white/[0.14] transition-all" data-testid="link-telegram-community">
                        <SiTelegram className="w-4 h-4" />
                        Telegram
                      </button>
                    </a>
                    <a href="https://x.com" target="_blank" rel="noopener noreferrer">
                      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.1] text-white text-sm font-medium hover:bg-white/[0.14] transition-all" data-testid="link-twitter-community">
                        <FaXTwitter className="w-4 h-4" />
                        Follow
                      </button>
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="group relative overflow-hidden rounded-3xl border-0 cursor-pointer hover:ring-1 hover:ring-white/10 transition-all duration-500" data-testid="card-explore-collectibles">
                <img
                  src={collectiblesPreview}
                  alt="Doro Collectibles"
                  className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10 flex flex-col justify-end min-h-[240px] p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] w-fit mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs text-white/80 font-semibold">32 Skins</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Collectibles</h3>
                  <p className="text-white/50 text-sm max-w-sm leading-relaxed">
                    Unlock unique Doro skins, outfits, and accessories. Customize your
                    trainer profile with rare items.
                  </p>
                  <div className="mt-5">
                    <span className="inline-flex items-center gap-2 text-white/60 text-sm font-medium group-hover:text-white/90 transition-colors">
                      Coming Soon
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              <TrendingUp className="w-4 h-4" />
              Tokenomics
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-2" data-testid="text-tokenomics-heading">
              Simple. Fair.{" "}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Transparent.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: "Total Supply", value: "1B", sub: "$XDORO Tokens", gradient: "from-pink-500 to-rose-500", icon: Sparkles },
              { label: "Tax", value: "0%", sub: "Buy & Sell Tax", gradient: "from-purple-500 to-indigo-500", icon: Shield },
              { label: "Liquidity", value: "100%", sub: "Burned on pump.fun", gradient: "from-indigo-500 to-blue-500", icon: TrendingUp },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="p-8 text-center rounded-3xl bg-card/80 backdrop-blur-sm border-border/20 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} bg-opacity-10 flex items-center justify-center mx-auto mb-5 opacity-80 group-hover:opacity-100 transition-opacity`} style={{ background: `linear-gradient(135deg, var(--tw-gradient-from) / 0.15, var(--tw-gradient-to) / 0.15)` }}>
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className={`text-5xl sm:text-6xl font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-2`}>
                    {item.value}
                  </p>
                  <p className="font-semibold text-sm mb-1">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              <Rocket className="w-4 h-4" />
              Get Started
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-2" data-testid="text-howto-heading">
              How to{" "}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Buy
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Wallet,
                title: "Get a Wallet",
                desc: "Download Phantom or Solflare wallet and fund it with SOL from any exchange.",
                color: "from-pink-500 to-rose-500",
              },
              {
                step: "02",
                icon: Search,
                title: "Visit pump.fun",
                desc: "Go to pump.fun and connect your Solana wallet. Search for $XDORO.",
                color: "from-purple-500 to-indigo-500",
              },
              {
                step: "03",
                icon: ArrowDownUp,
                title: "Swap for $XDORO",
                desc: "Enter the amount of SOL you want to swap and confirm the transaction.",
                color: "from-indigo-500 to-blue-500",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <Card className="p-8 rounded-3xl bg-card/80 backdrop-blur-sm border-border/20 text-center hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto shadow-lg`} style={{ background: `linear-gradient(135deg, var(--tw-gradient-from) / 0.15, var(--tw-gradient-to) / 0.15)` }}>
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 sm:right-auto sm:left-1/2 sm:ml-8 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-14"
          >
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="rounded-full px-10 h-13 text-base font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 border-0 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.03]"
                data-testid="button-buy-howto"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Buy $XDORO Now
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              <Sparkles className="w-4 h-4" />
              Collect
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-2">
              Doro{" "}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Stickers
              </span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto text-base">
              Download crypto-themed Doro stickers for your memes, Telegram groups, and X posts.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-12">
            {[
              { src: stickerHodl, name: "HODL" },
              { src: stickerMoon, name: "Moon" },
              { src: stickerDiamondHands, name: "Diamond Hands" },
              { src: stickerPump, name: "Pump It" },
              { src: stickerWhale, name: "Whale" },
              { src: stickerWagmi, name: "WAGMI" },
            ].map((s, i) => (
              <motion.div
                key={s.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="p-3 rounded-2xl bg-card/60 border-border/20 backdrop-blur-sm hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group" data-testid={`card-sticker-preview-${i}`}>
                  <div className="aspect-square flex items-center justify-center">
                    <img src={s.src} alt={s.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" data-testid={`img-sticker-preview-${i}`} />
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground font-medium mt-1.5">{s.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <Link href="/stickers">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 font-semibold border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                data-testid="button-view-stickers"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View All Stickers
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-background to-background dark:from-purple-950/40 pointer-events-none" />
        <StarField count={60} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
            transition={{ duration: 0.7 }}
          >
            <img
              src={doroGif}
              alt="Doro"
              className="w-28 h-28 rounded-3xl mx-auto mb-8 animate-float shadow-xl shadow-purple-500/20"
            />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              Ready to{" "}
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Play?
              </span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Enter the Doro Galaxy. Create your trainer profile, choose your partner
              Doro, and battle through 7 unique games.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/games">
                <Button
                  size="lg"
                  className="rounded-full px-10 h-13 text-base font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 border-0 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.03]"
                  data-testid="button-games-cta"
                >
                  Enter Doro Arcade
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="https://pump.fun" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-13 text-base font-semibold border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                  data-testid="button-buy-cta-bottom"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Buy $XDORO
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-16 px-4 sm:px-6 border-t border-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src={doroGif} alt="xdoro" className="w-9 h-9 rounded-full ring-2 ring-pink-500/20" />
                <span className="text-xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  xdoro
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Meet Doro — a goofy little gremlin creature born from meme culture with a fanbase of its own. Explore, play games, collect, and earn.
              </p>
              <div className="flex items-center gap-2">
                <a href="https://t.me" target="_blank" rel="noopener noreferrer">
                  <button className="w-9 h-9 rounded-full bg-card border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all" data-testid="link-telegram">
                    <SiTelegram className="w-4 h-4" />
                  </button>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer">
                  <button className="w-9 h-9 rounded-full bg-card border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all" data-testid="link-twitter">
                    <FaXTwitter className="w-4 h-4" />
                  </button>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-4">Explore</h4>
              <ul className="space-y-2.5">
                <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
                <li><Link href="/games" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Games</Link></li>
                <li><Link href="/stickers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stickers</Link></li>
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Buy on pump.fun</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Whitepaper</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Brand Kit</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-4">Get $XDORO</h4>
              <a href="https://pump.fun" target="_blank" rel="noopener noreferrer">
                <Button
                  className="w-full rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 border-0 shadow-lg shadow-purple-500/20 transition-all duration-300 mb-3"
                  data-testid="button-buy-footer"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Buy on pump.fun
                </Button>
              </a>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border/20">
                <span className="text-[10px] text-muted-foreground font-mono truncate flex-1">{CONTRACT_ADDRESS}</span>
                <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-colors shrink-0" data-testid="button-copy-ca-footer">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; 2025 xdoro. All rights reserved. $XDORO is a memecoin with no intrinsic value.
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              Powered by
              <span className="font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Solana</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
