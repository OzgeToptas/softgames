# Softgames PixiJS Assignment

This project is a modern, responsive card game collection built with Pixi.js v7 and TypeScript.
Each game scene is fullscreen, mobile-friendly, and high-performance.
It features a user-friendly menu, animations, FPS counter, and sound effects.

## Features

- **Fullscreen & Responsive:** Works seamlessly on desktop and mobile.
- **FPS Counter:** Shown in the top-left of every scene.
- **Modern Menu:** Welcome screen, game selection, and easy return to menu from any game.
- **3 Game Scenes:**
  - **Magic Words:** Scrollable chat with API-driven dialogues, avatars, and inline emojis.
  - **Phoenix Flame:** Realistic fire particle effect (max 10 sprites) and ambient fire sound.
  - **Ace of Shadows:** Card stacks with animated card movement.
- **Close (X) Button:** In Phoenix Flame, a small X in the top-right for quick return to menu.
- **Clean Event Management:** All event listeners are properly added/removed on scene enter/exit.
- **Well-commented code** in both Turkish and English.

## Folder Structure

```
src/
  assets/         # Images and sounds (e.g. fire.mp3)
  components/     # UI components (Button, CardSprite)
  core/           # SceneManager and App classes
  scenes/         # All game and menu scenes
    AceOfShadowsScene.ts
    MagicWordsScene.ts
    PhoenixFlameScene.ts
    StartScene.ts
    GameSelectScene.ts
    MenuScene.ts
    BaseScene.ts
  style.css
  main.ts
```

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the project:**

   ```bash
   npm run dev
   ```

3. **Open in your browser:**
   ```
   http://localhost:5173
   ```

## Asset Management

- **Sounds:**  
  Place fire.mp3 at `src/assets/sounds/fire.mp3` (required for PhoenixFlameScene).
- **Images:**  
  Place images (backgrounds, avatars, emojis) in `src/assets/`.

## Scenes Overview

- **StartScene:** Welcome screen with a large "START GAME" button.
- **GameSelectScene:** 3 clickable game cards for selection.
- **MagicWordsScene:** API-driven dialogues, avatars, inline emojis, scroll and arrow navigation.
- **PhoenixFlameScene:** Realistic fire effect, ambient sound, top-right X to return to menu.
- **AceOfShadowsScene:** Card stacks, animated card movement, responsive layout.

## Event & Scene Management

- Each scene uses `window.addEventListener('resize', this.boundResize)` and removes it on destroy.
- SceneManager handles all transitions and cleanup.

## Developer Notes

- All event listeners and Pixi objects are fully cleaned up on scene exit.
- Buttons and UI components are reusable.
- Code is TypeScript and linter-friendly, with null checks.

## Contributing

- To add a new game, create a new file in `src/scenes/` and register it in SceneManager.
- Add assets to the appropriate subfolders.
- Follow TypeScript and Pixi.js best practices.

---

For any questions or contributions, feel free to reach out! 🎮✨ # softgames-assignment

# softgames-assignment

# softgames-assignment

Live Test : https://adaozge.com/
