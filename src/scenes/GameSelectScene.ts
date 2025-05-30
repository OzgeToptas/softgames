import { Application, Container, Sprite, Text, Graphics } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../core/SceneManager';

interface GameCard {
    title: string;
    icon?: string;
    color: number;
    scene: string;
    emoji?: string;
}

export class GameSelectScene extends BaseScene {
    private sceneManager: SceneManager;
    private cards: Container[] = [];
    private gameList: GameCard[] = [
        {
            title: '🪄 Magic Words',
            color: 0x4e54c8,
            scene: 'magicwords',
            emoji: '🪄'
        },
        {
            title: '🔥 Phoenix Flame',
            color: 0xff9000,
            scene: 'phoenixflame',
            emoji: '🔥'
        },
        {
            title: '🂡 Ace of Shadows',
            color: 0x3b3b5c,
            scene: 'aceofshadows',
            emoji: '🂡'
        }
    ];

    constructor(app: Application, sceneManager: SceneManager) {
        super(app);
        this.sceneManager = sceneManager;
    }

    public init(): void {
        this.container.removeChildren();
        this.cards = [];

        this.fpsText.position.set(20, 20);
        this.container.addChild(this.fpsText);

        const cardWidth = Math.min(260, window.innerWidth * 0.28);
        const cardHeight = Math.min(260, window.innerHeight * 0.32);
        const gap = Math.min(40, window.innerWidth * 0.04);
        const totalWidth = cardWidth * this.gameList.length + gap * (this.gameList.length - 1);
        const startX = window.innerWidth / 2 - totalWidth / 2;
        for (let i = 0; i < this.gameList.length; i++) {
            const game = this.gameList[i];
            const card = new Container();

            const bg = new Graphics();
            bg.beginFill(game.color, 0.92);
            bg.drawRoundedRect(0, 0, cardWidth, cardHeight, 32);
            bg.endFill();
            card.addChild(bg);

            const emojiText = new Text(game.emoji || '', {
                fontSize: Math.floor(cardHeight * 0.32),
                fontFamily: 'Arial',
                align: 'center',
            });
            emojiText.anchor.set(0.5);
            emojiText.position.set(cardWidth / 2, cardHeight * 0.36);
            card.addChild(emojiText);

            const titleText = new Text(game.title, {
                fontSize: Math.floor(cardHeight * 0.16),
                fill: 0xffffff,
                fontWeight: 'bold',
                fontFamily: 'Arial',
                align: 'center',
                wordWrap: true,
                wordWrapWidth: cardWidth * 0.9
            });
            titleText.anchor.set(0.5);
            titleText.position.set(cardWidth / 2, cardHeight * 0.78);
            card.addChild(titleText);

            card.position.set(startX + i * (cardWidth + gap), window.innerHeight / 2 - cardHeight / 2);
            card.eventMode = 'static';
            card.cursor = game.scene ? 'pointer' : 'not-allowed';
            if (game.scene) {
                card.on('pointertap', () => {

                    this.fadeOut(() => {
                        this.sceneManager.start(game.scene);
                    });
                });
                card.on('pointerover', () => {
                    bg.alpha = 1;
                    card.scale.set(1.06);
                });
                card.on('pointerout', () => {
                    bg.alpha = 0.92;
                    card.scale.set(1);
                });
            }
            this.container.addChild(card);
            this.cards.push(card);
        }
        window.addEventListener('resize', this.onResize.bind(this));
        this.onResize();

        this.container.alpha = 0;
        this.fadeIn();
    }

    private fadeIn() {
        let t = 0;
        const step = () => {
            t += 0.08;
            this.container.alpha = Math.min(1, t);
            if (t < 1) requestAnimationFrame(step);
        };
        step();
    }
    private fadeOut(cb: () => void) {
        let t = 1;
        const step = () => {
            t -= 0.08;
            this.container.alpha = Math.max(0, t);
            if (t > 0) requestAnimationFrame(step);
            else cb();
        };
        step();
    }

    public onResize(): void {

        const cardWidth = Math.min(260, window.innerWidth * 0.28);
        const cardHeight = Math.min(260, window.innerHeight * 0.32);
        const gap = Math.min(40, window.innerWidth * 0.04);
        const totalWidth = cardWidth * this.cards.length + gap * (this.cards.length - 1);
        const startX = window.innerWidth / 2 - totalWidth / 2;
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            card.position.set(startX + i * (cardWidth + gap), window.innerHeight / 2 - cardHeight / 2);
            const bg = card.getChildAt(0) as Graphics;
            bg.clear();
            bg.beginFill(this.gameList[i].color, 0.92);
            bg.drawRoundedRect(0, 0, cardWidth, cardHeight, 32);
            bg.endFill();

            const emojiText = card.getChildAt(1) as Text;
            emojiText.style.fontSize = Math.floor(cardHeight * 0.32);
            emojiText.position.set(cardWidth / 2, cardHeight * 0.36);

            const titleText = card.getChildAt(2) as Text;
            titleText.style.fontSize = Math.floor(cardHeight * 0.16);
            titleText.position.set(cardWidth / 2, cardHeight * 0.78);
            titleText.style.wordWrapWidth = cardWidth * 0.9;
        }
    }

    public destroy(): void {
        window.removeEventListener('resize', this.onResize.bind(this));
        this.cards.forEach(card => card.destroy());
        this.cards = [];
    }
} 