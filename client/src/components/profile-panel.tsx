import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StarField } from "@/components/star-field";
import {
  DORO_SKINS,
  DORO_OUTFITS,
  DORO_ACCESSORIES,
  TRAINER_TITLES,
  RARITY_COLORS,
  SKIN_CATEGORIES,
  DORO_FACES,
} from "@/lib/gameData";
import { ArrowLeft, Check, Star, Sparkles, User, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import doroGif from "@assets/oiiaoiia-doro_1771795507251.gif";

interface ProfilePanelProps {
  profile: any;
  onSave: (profile: any) => void;
  onBack: () => void;
}

export function ProfilePanel({ profile, onSave, onBack }: ProfilePanelProps) {
  const [username, setUsername] = useState(profile?.username || "");
  const [trainerName, setTrainerName] = useState(
    profile?.trainerName || TRAINER_TITLES[Math.floor(Math.random() * TRAINER_TITLES.length)]
  );
  const [selectedSkin, setSelectedSkin] = useState(profile?.avatarSkin || "classic");
  const [selectedOutfit, setSelectedOutfit] = useState(profile?.avatarOutfit || "default");
  const [selectedAccessory, setSelectedAccessory] = useState(profile?.avatarAccessory || "none");
  const [partnerDoro, setPartnerDoro] = useState(profile?.partnerDoro || "classic");
  const [selectedFace, setSelectedFace] = useState(profile?.doroFace || "happy");
  const [skinFilter, setSkinFilter] = useState("all");

  const { toast } = useToast();

  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const res = await apiRequest("POST", "/api/profile", profileData);
      return res.json();
    },
    onError: () => {
      toast({ title: "Saved locally", description: "Profile saved to your device." });
    },
  });

  const handleSave = () => {
    if (!username.trim()) return;
    const profileData = {
      username: username.trim(),
      trainerName,
      avatarSkin: selectedSkin,
      avatarOutfit: selectedOutfit,
      avatarAccessory: selectedAccessory,
      partnerDoro,
      doroFace: selectedFace,
      level: profile?.level || 1,
      xp: profile?.xp || 0,
      wins: profile?.wins || 0,
      gamesPlayed: profile?.gamesPlayed || 0,
    };
    saveProfileMutation.mutate(profileData);
    onSave(profileData);
  };

  const filteredSkins = skinFilter === "all"
    ? DORO_SKINS
    : DORO_SKINS.filter((s) => s.category === skinFilter);

  const currentFace = DORO_FACES.find((f) => f.id === selectedFace) || DORO_FACES[0];

  return (
    <div className="min-h-screen relative pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-background to-background dark:from-purple-950/70 pointer-events-none" />
      <StarField count={100} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back-profile">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold font-game">Trainer Profile</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: DORO_SKINS.find((s) => s.id === selectedSkin)?.color + "30" }}
                >
                  <img src={doroGif} alt="Your Doro" className="w-16 h-16 object-contain" />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-[8px]"
                  style={{ backgroundColor: DORO_SKINS.find((s) => s.id === selectedSkin)?.color }}
                >
                  {currentFace.emoji.charAt(1)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg truncate">{username || "New Trainer"}</h2>
                <p className="text-sm text-muted-foreground">{trainerName}</p>
                {profile && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px]">
                      <Star className="w-3 h-3 mr-0.5" /> Lv.{profile.level || 1}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {profile.gamesPlayed || 0} games
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  maxLength={20}
                  className="rounded-xl"
                  data-testid="input-username"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Trainer Tag</label>
                <div className="flex flex-wrap gap-1.5">
                  {TRAINER_TITLES.map((title) => (
                    <Badge
                      key={title}
                      variant={trainerName === title ? "default" : "outline"}
                      className="cursor-pointer text-[10px] rounded-full"
                      onClick={() => setTrainerName(title)}
                      data-testid={`badge-title-${title.replace(/\s/g, "-").toLowerCase()}`}
                    >
                      {title}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              Doro Face
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {DORO_FACES.map((face) => (
                <button
                  key={face.id}
                  className={`relative p-2 rounded-xl border text-center transition-all ${
                    selectedFace === face.id
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border/50 bg-card/30 hover:border-primary/20"
                  }`}
                  onClick={() => setSelectedFace(face.id)}
                  data-testid={`button-face-${face.id}`}
                >
                  <span className="text-lg block">{face.emoji}</span>
                  <span className="text-[8px] text-muted-foreground block mt-0.5">{face.label}</span>
                  {selectedFace === face.id && (
                    <Check className="w-2.5 h-2.5 text-primary absolute top-0.5 right-0.5" />
                  )}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Doro Skin
              </h3>
              <div className="flex items-center gap-1">
                <Filter className="w-3 h-3 text-muted-foreground" />
                {SKIN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`text-[9px] px-2 py-0.5 rounded-full transition-all ${
                      skinFilter === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                    onClick={() => setSkinFilter(cat.id)}
                    data-testid={`button-filter-${cat.id}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {filteredSkins.map((skin) => (
                <button
                  key={skin.id}
                  className={`relative p-2 rounded-xl border text-center transition-all ${
                    partnerDoro === skin.id
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border/50 bg-card/30 hover:border-primary/20"
                  }`}
                  onClick={() => { setPartnerDoro(skin.id); setSelectedSkin(skin.id); }}
                  data-testid={`button-skin-${skin.id}`}
                >
                  <div
                    className="w-7 h-7 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: skin.color }}
                  />
                  <span className="text-[8px] text-muted-foreground block leading-tight truncate">
                    {skin.name.replace("Doro", "").trim()}
                  </span>
                  {skin.rarity && (
                    <span className={`text-[7px] font-bold block mt-0.5 ${RARITY_COLORS[skin.rarity]?.split(" ")[0] || ""}`}>
                      {skin.rarity}
                    </span>
                  )}
                  {partnerDoro === skin.id && (
                    <Check className="w-2.5 h-2.5 text-primary absolute top-0.5 right-0.5" />
                  )}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-purple-400" />
              Outfit & Accessories
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Outfit</label>
                <div className="flex flex-wrap gap-1.5">
                  {DORO_OUTFITS.map((outfit) => (
                    <Badge
                      key={outfit.id}
                      variant={selectedOutfit === outfit.id ? "default" : "outline"}
                      className="cursor-pointer text-[10px] rounded-full"
                      onClick={() => setSelectedOutfit(outfit.id)}
                      data-testid={`badge-outfit-${outfit.id}`}
                    >
                      {outfit.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Accessory</label>
                <div className="flex flex-wrap gap-1.5">
                  {DORO_ACCESSORIES.map((acc) => (
                    <Badge
                      key={acc.id}
                      variant={selectedAccessory === acc.id ? "default" : "outline"}
                      className="cursor-pointer text-[10px] rounded-full"
                      onClick={() => setSelectedAccessory(acc.id)}
                      data-testid={`badge-acc-${acc.id}`}
                    >
                      {acc.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Button
            className="w-full rounded-xl"
            size="lg"
            onClick={handleSave}
            disabled={!username.trim() || saveProfileMutation.isPending}
            data-testid="button-save-profile"
          >
            {saveProfileMutation.isPending ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
