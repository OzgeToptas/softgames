import { Container, Texture, Sprite, Text, Application, Rectangle } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../core/SceneManager';
import { Button } from '../components/Button';
import { gsap } from 'gsap';

export class AceOfShadowsScene extends BaseScene {
    private stacks: Container[][] = [[], [], [], []];
    private readonly STACK_POSITIONS = [
        { x: 150, y: 150 },
        { x: 350, y: 150 },
        { x: 550, y: 150 },
        { x: 750, y: 150 }
    ];
    private backButton: Button | null = null;
    private isAnimating: boolean = false;
    private movementInterval: number | null = null;
    protected fpsText: Text = new Text('', { fill: 0xffffff });
    private cardCounter: number = 1;
    private sceneManager: SceneManager;
    private boundResize: () => void;

    constructor(app: Application, sceneManager: SceneManager) {
        super(app);
        this.sceneManager = sceneManager;
        this.boundResize = this.onResize.bind(this);
    }

    private createCard(): Container {
        const container = new Container();

        const cardSprite = Sprite.from('assets/card-back.png');
        cardSprite.width = 80;
        cardSprite.height = 120;
        cardSprite.anchor.set(0.5);
        container.addChild(cardSprite);

        const numberText = new Text(`${this.cardCounter++}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 4
        });
        numberText.anchor.set(0.5);
        container.addChild(numberText);

        container.pivot.set(40, 60); // center pivot for accurate placement
        container.zIndex = 0;
        return container;
    }

    private updateStackPositions() {
        const stackCount = 4;
        const isMobile = window.innerWidth < 600;
        const cardWidth = isMobile ? Math.floor(window.innerWidth * 0.18) : 80;
        const cardHeight = isMobile ? Math.floor(window.innerHeight * 0.18) : 120;
        const stackSpacing = isMobile ? Math.floor(window.innerWidth * 0.08) : 120;
        const totalWidth = stackCount * cardWidth + (stackCount - 1) * stackSpacing;
        const startX = (window.innerWidth - totalWidth) / 2 + cardWidth / 2;
        const y = window.innerHeight / 2 - (isMobile ? cardHeight * 1.2 : 200);
        for (let i = 0; i < stackCount; i++) {
            this.STACK_POSITIONS[i].x = startX + i * (cardWidth + stackSpacing);
            this.STACK_POSITIONS[i].y = y;
        }
        for (let i = 0; i < stackCount; i++) {
            for (let j = 0; j < this.stacks[i].length; j++) {
                const card = this.stacks[i][j];
                card.x = this.STACK_POSITIONS[i].x;
                card.y = this.STACK_POSITIONS[i].y + j * (isMobile ? 2 : 4);
                card.width = cardWidth;
                card.height = cardHeight;
            }
        }
    }

    public init(): void {
        this.stacks = [[], [], [], []];
        this.cardCounter = 1;
        this.container.removeChildren();
        this.fpsText.position.set(20, 20);
        this.container.addChild(this.fpsText);
        this.backButton = new Button('Back to Menu', () => { });
        this.backButton.eventMode = 'static';
        this.backButton.cursor = 'pointer';
        this.backButton.interactive = true;
        this.backButton.removeAllListeners();
        this.backButton.on('pointertap', () => {
            if (!this.isAnimating) {
                this.sceneManager.start('gameselect');
            }
        });
        if (window.innerWidth < 600) {
            this.backButton.hitArea = new Rectangle(
                -20, -20,
                this.backButton.width + 40,
                this.backButton.height + 40
            );
        }
        this.backButton.position.set(
            window.innerWidth - this.backButton.width - 20,
            20
        );
        this.container.addChild(this.backButton);
        this.container.sortableChildren = true;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 36; j++) {
                const card = this.createCard();
                this.stacks[i].push(card);
                this.container.addChild(card);
            }
        }
        this.updateStackPositions();
        this.startCardMovement();
        const scale = Math.min(
            window.innerWidth / 1000,
            window.innerHeight / 800
        );
        this.setScale(scale);
        window.addEventListener('resize', this.boundResize);
    }

    private startCardMovement(): void {
        this.movementInterval = window.setInterval(() => {
            if (!this.isAnimating) {
                this.moveTopCardBetweenStacks();
            }
        }, 1000);
    }

    private moveTopCardBetweenStacks(): void {
        const fromIndexes = this.stacks
            .map((stack, i) => (stack.length > 0 ? i : -1))
            .filter(i => i !== -1);

        if (fromIndexes.length < 2) return;

        const fromIndex = fromIndexes[Math.floor(Math.random() * fromIndexes.length)];
        let toIndex = fromIndex;
        while (toIndex === fromIndex) {
            toIndex = Math.floor(Math.random() * this.stacks.length);
        }

        const fromStack = this.stacks[fromIndex];
        const toStack = this.stacks[toIndex];

        const card = fromStack.pop();
        if (!card) return;

        this.isAnimating = true;


        this.container.addChild(card);
        card.zIndex = 1000;

        const targetX = this.STACK_POSITIONS[toIndex].x;
        const targetY = this.STACK_POSITIONS[toIndex].y + toStack.length * 4;

        try {

            gsap.to(card, {
                duration: 2,
                x: targetX,
                y: targetY,
                onComplete: () => {
                    if (card && card.parent) {
                        toStack.push(card);
                        card.zIndex = toStack.length;
                        this.container.sortChildren();
                        this.isAnimating = false;
                    }
                }
            });


            gsap.to(card.scale, {
                x: 1.05,
                y: 1.05,
                duration: 0.3,
                yoyo: true,
                repeat: 1
            });

        } catch (error) {
            this.isAnimating = false;
        }
    }

    private setScale(scale: number): void {
        this.stacks.forEach(stack => {
            stack.forEach(card => card.scale.set(scale));
        });
    }

    public onResize(): void {
        const isMobile = window.innerWidth < 600;
        if (this.backButton) {
            this.backButton.scale.set(isMobile ? 1.5 : 1);
            this.backButton.position.set(
                window.innerWidth - this.backButton.width * this.backButton.scale.x - (isMobile ? 24 : 20),
                isMobile ? 24 : 20
            );
        }
        this.updateStackPositions();
        const scale = Math.min(
            window.innerWidth / (isMobile ? 600 : 1000),
            window.innerHeight / (isMobile ? 700 : 800)
        );
        this.setScale(scale);
    }

    public destroy(): void {
        if (this.movementInterval) {
            clearInterval(this.movementInterval);
            this.movementInterval = null;
        }
        window.removeEventListener('resize', this.boundResize);
        this.container.removeAllListeners();
        this.stacks.forEach(stack => {
            stack.forEach(card => card.destroy());
        });
        this.stacks = [];
        if (this.backButton) {
            this.backButton.destroy();
            this.backButton = null;
        }
        this.container.removeChildren();
        this.cardCounter = 1;
        this.isAnimating = false;
    }
} 