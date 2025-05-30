import { Container, Text, Graphics } from 'pixi.js';

export class Button extends Container {
    private text: Text;
    private background: Graphics;
    private onClick: () => void;

    constructor(label: string, onClick: () => void) {
        super();
        this.onClick = onClick;


        this.background = new Graphics();
        this.background.beginFill(0x4a4a4a);
        this.background.lineStyle(2, 0xffffff);
        this.background.drawRoundedRect(0, 0, 150, 40, 10);
        this.background.endFill();
        this.addChild(this.background);


        this.text = new Text(label, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffffff
        });
        this.text.anchor.set(0.5);
        this.text.position.set(75, 20);
        this.addChild(this.text);


        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerover', this.onPointerOver.bind(this));
        this.on('pointerout', this.onPointerOut.bind(this));
        this.on('pointerdown', this.onPointerDown.bind(this));
        this.on('pointerup', this.onPointerUp.bind(this));
        this.on('pointerupoutside', this.onPointerUp.bind(this));
        this.on('click', this.onClick.bind(this));
    }

    private onPointerOver(): void {
        this.background.tint = 0x666666;
    }

    private onPointerOut(): void {
        this.background.tint = 0xffffff;
    }

    private onPointerDown(): void {
        this.background.tint = 0x333333;
    }

    private onPointerUp(): void {
        this.background.tint = 0x666666;
    }

    public get width(): number {
        return this.background.width;
    }

    public get height(): number {
        return this.background.height;
    }

    public set anchor(value: { x: number; y: number }) {
        this.pivot.set(
            this.width * value.x,
            this.height * value.y
        );
    }

    public destroy(): void {
        this.removeAllListeners();
        super.destroy({ children: true });
    }
} 