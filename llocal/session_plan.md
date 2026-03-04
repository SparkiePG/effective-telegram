# Objective
Upgrade all individual game components to professional quality inspired by polished gaming sites. Also upgrade the game board shell wrapper. The games hub (T001) is already in good shape with 3-column layout, stat cards, filters, and search bar - no changes needed.

Minor homepage changes (already completed):
- Changed description text
- Changed "Enter the Galaxy" to "Enter Doro Arcade"  
- Made price chart real-time (10s refetch + 30s server-side auto price updates)

# Tasks

### T002: Upgrade Slots Game to Professional Quality
- **Blocked By**: []
- **Details**:
  - Major visual overhaul of `client/src/components/games/slots-game.tsx`
  - Add proper reel spin animation with CSS transforms (vertical scroll, not instant swap)
  - Add glowing payline indicator across winning row
  - Add particle/sparkle effects on wins and jackpots
  - Better bet selector UI (chip-style buttons instead of plain buttons)
  - Add spin history (last 5 spins displayed)
  - Win multiplier display with animated counter
  - Pulsing SPIN button with disabled state during spin
  - Add reel blur effect during spinning
  - Paytable popup showing all symbol values
  - Professional coin counter with animated number transitions
  - The game uses Doro face PNG images for reel symbols - keep this
  - Files: `client/src/components/games/slots-game.tsx`
  - Acceptance: Slots game feels polished like a real casino slot machine

### T003: Upgrade Memory Game to Professional Quality
- **Blocked By**: []
- **Details**:
  - Visual overhaul of `client/src/components/games/memory-game.tsx`
  - Add 3D card flip animation (CSS perspective/rotateY)
  - Matched pairs get a glow/shimmer effect
  - Add combo counter (matching consecutively gives bonus visual feedback)
  - Star rating at end (3 stars for under 12 moves, 2 for under 18, 1 for rest)
  - Better card back design with Doro pattern
  - Add subtle particle trail when cards are flipped
  - Smooth animated timer and move counter
  - Victory celebration with confetti-style particles
  - The game uses Doro face PNG images - keep this
  - Files: `client/src/components/games/memory-game.tsx`
  - Acceptance: Memory game feels polished with smooth 3D flips and rewarding feedback

### T004: Upgrade Clicker Game to Professional Quality
- **Blocked By**: []
- **Details**:
  - Visual overhaul of `client/src/components/games/clicker-game.tsx`
  - Better click feedback with ripple/burst animation at click point
  - Animated coin counter with rolling numbers
  - Upgrade cards with progress bars showing level and next cost
  - Milestone achievements display (100 clicks, 1000 coins, etc.)
  - Coins per second meter with visual indicator
  - Better visual hierarchy for the Doro click target (larger, bouncy idle animation)
  - Floating "+N" numbers at click position with varied sizes
  - Background that subtly changes as you progress (more particles/effects)
  - Files: `client/src/components/games/clicker-game.tsx`
  - Acceptance: Clicker game feels satisfying with punchy feedback and progression

### T005: Upgrade Runner Game to Professional Quality
- **Blocked By**: []
- **Details**:
  - Visual overhaul of `client/src/components/games/runner-game.tsx`
  - Better canvas rendering with gradient sky, parallax background layers
  - Star trail effect behind Doro when running
  - Screen shake on collision
  - Speed-up visual indicator (screen edges pulse)
  - Better obstacle variety and visual distinction (colored gradients instead of flat blocks)
  - Animated HUD overlay with score, speed, and stars collected
  - Game over screen with stats breakdown and restart prompt
  - Smoother Doro character rendering (rounded blob shape, not rectangle)
  - Files: `client/src/components/games/runner-game.tsx`
  - Acceptance: Runner game looks and feels like a polished web game with smooth visuals

### T006: Upgrade Game Board Shell (Wrapper)
- **Blocked By**: []
- **Details**:
  - Polish `client/src/components/game-board.tsx` wrapper
  - Add subtle animated background matching game theme color
  - Better instructions panel with icons, colored sections
  - Add "Sound On/Off" toggle button
  - Better back button and game title display
  - Files: `client/src/components/game-board.tsx`, `client/src/lib/sounds.ts`
  - Acceptance: Game board shell feels professional and consistent across all games
