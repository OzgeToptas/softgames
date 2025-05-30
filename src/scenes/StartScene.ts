import { Application, Container, Sprite, Text, Graphics, Texture } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../core/SceneManager';
import { Button } from '../components/Button';

export class StartScene extends BaseScene {
    private sceneManager: SceneManager;
    private bgSprite: Sprite | null = null;
    private startButton: Button;

    constructor(app: Application, sceneManager: SceneManager) {
        super(app);
        this.sceneManager = sceneManager;
        this.startButton = new Button('START GAME', () => {
            this.sceneManager.start('gameselect');
        });
    }

    public init(): void {
        this.container.removeChildren();

        if (Texture.from('assets/bg.jpg').baseTexture.valid) {
            this.bgSprite = Sprite.from('assets/bg.jpg');
            this.bgSprite.anchor.set(0.5);
            this.bgSprite.position.set(window.innerWidth / 2, window.innerHeight / 2);
            this.bgSprite.width = window.innerWidth;
            this.bgSprite.height = window.innerHeight;
            this.container.addChild(this.bgSprite);
        } else {
            const bg = new Graphics();
            bg.beginFill(0x23234a);
            bg.drawRect(0, 0, window.innerWidth, window.innerHeight);
            bg.endFill();
            this.container.addChild(bg);
        }

        this.fpsText.position.set(20, 20);
        this.container.addChild(this.fpsText);

        this.startButton.position.set(window.innerWidth / 2 - this.startButton.width / 2, window.innerHeight * 0.65);
        this.startButton.scale.set(1.4);
        this.container.addChild(this.startButton);

        this.startButton.eventMode = 'static';
        this.startButton.cursor = 'pointer';
        this.startButton.on('pointerover', () => {
            this.startButton.scale.set(1.55);
        });
        this.startButton.on('pointerout', () => {
            this.startButton.scale.set(1.4);
        });
        this.startButton.on('pointerdown', () => {
            this.startButton.scale.set(1.2);
        });
        this.startButton.on('pointerup', () => {
            this.startButton.scale.set(1.4);
        });
        window.addEventListener('resize', this.onResize.bind(this));
        this.onResize();
    }

    public onResize(): void {
        if (this.bgSprite) {
            this.bgSprite.position.set(window.innerWidth / 2, window.innerHeight / 2);
            this.bgSprite.width = window.innerWidth;
            this.bgSprite.height = window.innerHeight;
        }
        if (this.startButton) {
            this.startButton.position.set(window.innerWidth / 2 - this.startButton.width / 2, window.innerHeight * 0.65);
        }
    }

    public destroy(): void {
        window.removeEventListener('resize', this.onResize.bind(this));
        if (this.bgSprite) this.bgSprite.destroy();
        this.startButton.destroy();
    }
} 