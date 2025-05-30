import { Application } from 'pixi.js';
import { BaseScene } from '../scenes/BaseScene';

export class SceneManager {
    private scenes: Map<string, BaseScene> = new Map();
    private currentScene: BaseScene | null = null;
    private app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public add(name: string, scene: BaseScene): void {
        this.scenes.set(name, scene);
    }

    public start(name: string): void {
        if (this.currentScene) {
            this.currentScene.destroy();
            this.app.stage.removeChild(this.currentScene.container);
        }

        const scene = this.scenes.get(name);
        if (!scene) {
            console.error(`Scene "${name}" not found!`);
            return;
        }

        this.currentScene = scene;
        this.app.stage.addChild(scene.container);
        scene.init();
    }

    public getCurrentScene(): BaseScene | null {
        return this.currentScene;
    }

    public getScene(name: string): BaseScene | undefined {
        return this.scenes.get(name);
    }
} 