# ONE MORE SECOND

### How long will you risk it?

A fast-paced arcade survival game built with **React Native**, **Expo**, and **TypeScript**. Pilot a blue orb through an arena of incoming enemies, survive as long as possible, and make split-second decisions to bank big scores.

---

## 📱 Gameplay

<div align="center">
  <table>
    <tr>
      <td align="center"><img src="https://github.com/user-attachments/assets/19ab04bc-8cff-4115-8a47-db1a82ddf1d9" width="240" alt="Landing Screen" /></td>
      <td align="center"><img src="https://github.com/user-attachments/assets/95bb58ff-18cb-4052-babd-7d3c5f2e6fb4" width="240" alt="Gameplay" /></td>
      <td align="center"><img src="https://github.com/user-attachments/assets/d803ab97-7a78-4102-8ece-bdde0a4c6747" width="240" alt="Game Over" /></td>
    </tr>
    <tr>
      <td align="center"><strong>Landing Screen</strong></td>
      <td align="center"><strong>Gameplay</strong></td>
      <td align="center"><strong>Game Over</strong></td>
    </tr>
  </table>
</div>

---

## 🎮 How It Works

- 🔵 **Move** your orb around the arena with intuitive touch controls.
- 🔴 **Avoid** incoming red enemies that pursue and intercept your position.
- 📈 **Survive** longer to increase your unbanked score at 10 points per second.
- 🟢 **BANK** to lock in your current score and secure your progress.
- 🔥 **RISK** to continue playing and climb a multiplier ladder (1x → 1.5x → 2x → 3x → 4x).

The longer you risk, the faster enemies spawn and move—but the higher your score multiplier climbs. One collision ends your run.

---

## 🎯 How to Play

1. Tap **PLAY** on the home screen to start.
2. Drag your orb to dodge enemies.
3. Watch your unbanked score climb as you survive.
4. Press **BANK** anytime to secure your score and reset the multiplier.
5. Press **RISK** to activate the next multiplier tier and pursue a higher final score.
6. Try to beat your best score and climb the leaderboard.

---

## 🧠 Engineering Highlights

- **Real-time 60 FPS game loop** using `requestAnimationFrame` with smooth frame-throttled rendering (15 FPS UI updates to balance performance).
- **Mutable refs-based architecture** — game state lives in refs for instant reads/writes without React re-render overhead.
- **Smart enemy steering** — enemies pursue the player with adaptive steering, then switch to coasting momentum once they get close, preventing permanent lock-on and creating opportunities to dodge.
- **Difficulty ramping** — enemy spawn rate and speed scale dynamically with survival time and multiplier level.
- **Risk-reward scaling** — multiplier affects enemy speed (+30%), steering response (+15%), and spawn frequency (+50%), creating escalating tension.
- **Collision detection** — precise circle-to-circle distance checks with leniency tuning for responsive gameplay feel.
- **Obstacle separation** — enemies deflect off each other to avoid clumping and improve visual clarity.
- **Event system** — real-time notifications for milestones (10s/20s/30s/45s/60s), near-misses, and new personal bests.
- **Persistent best score** — AsyncStorage integration preserves best score across sessions.
- **Danger visualization** — dynamic UI feedback (time, risk level, proximity) communicates game pressure to the player.

---

## 🛠 Tech Stack

| Technology | Purpose |
| --- | --- |
| React Native | Cross-platform mobile UI and game rendering |
| Expo | Development, native builds, and EAS deployment |
| TypeScript | Type-safe game logic and component architecture |
| AsyncStorage | Persistent best score storage |
| requestAnimationFrame | High-performance 60 FPS game loop |

---

## 🚀 Run Locally

```bash
# Clone the repository
git clone https://github.com/Rishiraj029/One-More-Second.git
cd One-More-Second

# Install dependencies
npm install

# Start the dev server (or use 'npm run android' / 'npm run ios' for direct native testing)
npm start
```

Scan the QR code with the Expo Go app on your phone, or press `a` for Android / `i` for iOS in the terminal.

---

## 📦 Build & Deploy

This project uses **EAS** for cloud building and deployment:

```bash
# Build for iOS or Android
npx eas-cli@latest build --platform ios
npx eas-cli@latest build --platform android

# Submit to app stores
npx eas-cli@latest submit --platform ios
npx eas-cli@latest submit --platform android
```

---

## 🔄 What's Next?

- **Leaderboards** — online high-score persistence and global rankings.
- **Sound & haptics** — audio feedback and vibration cues for near-misses and milestones.
- **Power-ups** — temporary shields or slow-motion mechanics.
- **Difficulty modes** — "Arcade" (current), "Endless," and "Time Attack."
- **Visual themes** — alternate color schemes and particle effects.
- **Touch gesture refinement** — support for drag vs. tap-to-follow controls.

---

## 📄 License

MIT — Open source for learning and personal use.

---

**Built by:** [Rishiraj Singh](https://github.com/Rishiraj029)

**Questions or feedback?** Open an issue or reach out!
