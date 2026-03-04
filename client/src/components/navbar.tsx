import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, Rocket } from "lucide-react";
import { useTheme } from "./theme-provider";
import doroGif from "@assets/dance-nikke_1771772479544.gif";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/games", label: "Games" },
    { href: "/stickers", label: "Stickers" },
    { href: "/about", label: "About" },
  ];

  const isHome = location === "/";
  const navBg = scrolled || !isHome
    ? "bg-background/90 backdrop-blur-xl border-b border-border/20 shadow-lg shadow-black/5"
    : "bg-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <Link href="/" className="flex items-center gap-3 group" data-testid="link-home">
            <div className="relative">
              <img src={doroGif} alt="xdoro" className="w-10 h-10 rounded-full ring-2 ring-pink-500/30 group-hover:ring-pink-500/60 transition-all" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-background" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
              xdoro
            </span>
          </Link>

          <div className="hidden md:flex items-center">
            <div className="flex items-center bg-white/[0.04] rounded-full p-1 border border-white/[0.06]">
              {links.map((l) => (
                <Link key={l.href} href={l.href}>
                  <button
                    className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                      location === l.href
                        ? "bg-white/10 text-white shadow-sm"
                        : scrolled || !isHome
                          ? "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                          : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                    }`}
                    data-testid={`link-nav-${l.label.toLowerCase()}`}
                  >
                    {l.label}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                !scrolled && isHome
                  ? "text-white/50 hover:text-white hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
              <Button
                className="rounded-full font-bold text-sm px-5 h-10 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]"
                data-testid="button-buy-header"
              >
                <Rocket className="w-4 h-4 mr-1.5" />
                Buy $XDORO
              </Button>
            </a>

            <button
              className={`md:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                !scrolled && isHome
                  ? "text-white/60 hover:text-white hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="button-mobile-menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border/20 bg-background/98 backdrop-blur-2xl px-4 py-4 space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              <button
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location === l.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                data-testid={`link-mobile-${l.label.toLowerCase()}`}
              >
                {l.label}
              </button>
            </Link>
          ))}
          <div className="pt-3 border-t border-border/20 mt-2">
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 border-0 shadow-lg shadow-purple-500/20" data-testid="button-buy-mobile">
                <Rocket className="w-4 h-4 mr-2" />
                Buy $XDORO
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
