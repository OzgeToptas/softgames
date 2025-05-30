import { Application, Text, Graphics } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../core/SceneManager';
import { Button } from '../components/Button';

export class MenuScene extends BaseScene {
    private startButton: Button;
    private menuButtons: Text[] = [];
    private sceneManager: SceneManager;
    private showGameOptions: boolean = false;

    constructor(app: Application, sceneManager: SceneManager) {
        super(app);
        this.sceneManager = sceneManager;
        this.startButton = new Button('Start Game', () => {
            sceneManager.start('aceofshadows');
        });


        this.container.pivot.set(
            this.container.width / 2,
            this.container.height / 2
        );
        this.container.position.set(
            this.app.screen.width / 2,
            this.app.screen.height / 2
        );
    }

    public init(): void {
        this.container.removeChildren();
        this.menuButtons = [];

        this.startButton.anchor = { x: 0.5, y: 0.5 };
        this.startButton.position.set(0, 0);
        this.container.addChild(this.startButton);


        const buttonNames = ['Ace of Shadows', 'Magic Words', 'Phoenix Flame'];
        buttonNames.forEach((name, index) => {
            const btn = new Text(name, {
                fontSize: 32,
                fill: 0xffffff,
                fontFamily: 'Arial',
                align: 'center',
                fontWeight: 'bold',
            });
            btn.anchor.set(0.5);

            btn.position.set((index - 1) * 260, 200);
            btn.eventMode = 'static';
            btn.cursor = 'pointer';
            btn.visible = this.showGameOptions;
            btn.on('pointerdown', () => {
                if (name === 'Phoenix Flame') {
                    this.sceneManager.start('phoenixflame');
                } else {
                    this.sceneManager.start(name.toLowerCase().replace(/ /g, ''));
                }
            });

            const box = new Graphics();
            box.beginFill(0x23234a, 0.85);
            box.drawRoundedRect(-120, -40, 240, 80, 18);
            box.endFill();
            box.visible = this.showGameOptions;
            btn.addChild(box);
            btn.zIndex = 1;
            this.container.addChild(box);
            this.container.addChild(btn);
            this.menuButtons.push(btn);
        });


        this.fpsText.position.set(
            -this.app.screen.width / 2 + 20,
            -this.app.screen.height / 2 + 20
        );
        this.container.addChild(this.fpsText);


        window.addEventListener('resize', this.onResize.bind(this));


        this.container.pivot.set(
            this.container.width / 2,
            this.container.height / 2
        );
        this.container.position.set(
            this.app.screen.width / 2,
            this.app.screen.height / 2
        );


        this.startButton.on('pointerdown', () => {
            this.showGameOptions = true;
            this.startButton.visible = false;
            this.menuButtons.forEach(btn => btn.visible = true);
        });
    }

    private onResize(): void {

        this.container.position.set(
            this.app.screen.width / 2,
            this.app.screen.height / 2
        );


        this.fpsText.position.set(
            -this.app.screen.width / 2 + 20,
            -this.app.screen.height / 2 + 20
        );
    }

    public destroy(): void {
        window.removeEventListener('resize', this.onResize.bind(this));
        this.startButton.destroy();
        this.menuButtons.forEach(btn => btn.destroy());
        if (this.fpsText.parent) {
            this.fpsText.parent.removeChild(this.fpsText);
        }
    }
} 