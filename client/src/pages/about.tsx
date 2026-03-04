import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarField } from "@/components/star-field";
import { ArrowLeft, ExternalLink, Check } from "lucide-react";
import { Link } from "wouter";
import doroGif from "@assets/dance-nikke_1771772479544.gif";
import doroShowcase from "@assets/doro-showcase.png";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Launch",
    items: ["Token launch on pump.fun", "Website & socials live", "Community building"],
    done: true,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    phase: "Phase 2",
    title: "Gaming",
    items: ["10 Doro mini-games", "Trainer profiles & leaderboards", "Score tracking & rewards"],
    done: false,
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    phase: "Phase 3",
    title: "Expand",
    items: ["Doro NFT collection", "CEX listings", "Strategic partnerships"],
    done: false,
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    phase: "Phase 4",
    title: "Moon",
    items: ["DAO governance", "Doro metaverse", "Global domination"],
    done: false,
    gradient: "from-blue-500 to-cyan-500",
  },
];

export default function About() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-background to-background dark:from-purple-950/40 pointer-events-none" />
        <StarField count={60} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back-about">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black">About <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">xdoro</span></h1>
              <p className="text-sm text-muted-foreground mt-1">The story behind the cutest memecoin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-purple-500/10">
                <img
                  src={doroShowcase}
                  alt="Dororong"
                  className="w-full aspect-[3/4] object-cover"
                  data-testid="img-about-doro"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-sm font-semibold text-primary uppercase tracking-widest">The Character</span>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 mb-5">Meet Dororong</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Dororong (also known as Doro) is an adorable Korean character that became a viral sensation
                across social media. With her pink hair, rosy cheeks, and irresistible charm, Doro has
                captured the hearts of millions worldwide.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                From animated stickers to GIFs, Doro has become one of the most beloved kawaii characters
                on the internet. Now she lives on the Solana blockchain as $XDORO.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                $XDORO is more than just a token — it's a gaming ecosystem where you can collect Doro skins,
                compete in games, climb leaderboards, and be part of the cutest community in crypto.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Vision</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">
              Road{" "}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Map
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmapPhases.map((phase, i) => (
              <motion.div
                key={phase.phase}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="p-6 h-full rounded-2xl bg-card/80 backdrop-blur-sm border-border/30 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${phase.gradient}`} />
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${phase.gradient} bg-clip-text text-transparent`}>
                      {phase.phase}
                    </span>
                    {phase.done && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 rounded-full">
                        <Check className="w-3 h-3 mr-0.5" />
                        Done
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-3">{phase.title}</h3>
                  <ul className="space-y-2">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <img
              src={doroGif}
              alt="Doro"
              className="w-24 h-24 rounded-2xl mx-auto mb-6 animate-float shadow-lg shadow-purple-500/20"
            />
            <h2 className="text-2xl sm:text-3xl font-black mb-4">
              Join the{" "}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Movement
              </span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Be part of the cutest community in crypto. Buy $XDORO, play games, and spread the Doro love.
            </p>
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-full px-10 h-12 text-base shadow-lg shadow-primary/30" data-testid="button-buy-about">
                <ExternalLink className="w-5 h-5 mr-2" />
                Buy $XDORO on pump.fun
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
