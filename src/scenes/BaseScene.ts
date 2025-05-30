import { Container, Text, Application } from 'pixi.js';

export abstract class BaseScene {
    public container: Container;
    protected app: Application;
    protected fpsText: Text;

    constructor(app: Application) {
        this.app = app;
        this.container = new Container();
        this.fpsText = new Text('', {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffffff
        });
        this.container.addChild(this.fpsText);
    }

    public abstract init(): void;

    public update(delta: number): void {

        const fps = Math.round(1000 / delta);
        this.fpsText.text = `FPS: ${fps}`;
    }

    public abstract destroy(): void;

    public getContainer(): Container {
        return this.container;
    }
} 