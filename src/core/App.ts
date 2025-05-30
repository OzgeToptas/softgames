import { Application } from 'pixi.js';
import { SceneManager } from './SceneManager';
import { MenuScene } from '../scenes/MenuScene';
import { AceOfShadowsScene } from '../scenes/AceOfShadowsScene';
import { MagicWordsScene } from '../scenes/MagicWordsScene';
import { BaseScene } from '../scenes/BaseScene';
import { PhoenixFlameScene } from '../scenes/PhoenixFlameScene';
import { StartScene } from '../scenes/StartScene';
import { GameSelectScene } from '../scenes/GameSelectScene';

export class App {
    private app: Application;
    private sceneManager: SceneManager;

    constructor() {
        this.app = new Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x2b2b40,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        document.body.appendChild(this.app.view as HTMLCanvasElement);

        this.sceneManager = new SceneManager(this.app);
        this.sceneManager.add('menu', new MenuScene(this.app, this.sceneManager));
        this.sceneManager.add('aceofshadows', new AceOfShadowsScene(this.app, this.sceneManager));
        this.sceneManager.add('magicwords', new MagicWordsScene(this.app, this.sceneManager));
        this.sceneManager.add('phoenixflame', new PhoenixFlameScene(this.app, this.sceneManager));
        this.sceneManager.add('start', new StartScene(this.app, this.sceneManager));
        this.sceneManager.add('gameselect', new GameSelectScene(this.app, this.sceneManager));


        this.sceneManager.start('start');


        window.addEventListener('resize', this.onResize.bind(this));
    }

    public getCurrentScene(): BaseScene | null {
        return this.sceneManager.getCurrentScene();
    }

    private onResize(): void {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        const currentScene = this.getCurrentScene();
        if (currentScene) {
            currentScene.getContainer().scale.set(
                Math.min(window.innerWidth / this.app.screen.width, window.innerHeight / this.app.screen.height)
            );
        }
    }
} 