import { Application, Container, Sprite, Texture, Graphics, Text } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../core/SceneManager';
import { Button } from '../components/Button';
import { Howl } from 'howler';

interface FireParticle {
    sprite: Sprite;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    scaleSpeed: number;
    fadeSpeed: number;
}

export class PhoenixFlameScene extends BaseScene {
    private sceneManager: SceneManager;
    private backButton: Button | null = null;
    private particles: FireParticle[] = [];
    private maxParticles = 10;
    private particleContainer: Container | null = null;
    private lastSpawn = 0;
    private flameTextures: Texture[] = [];
    private colors = [0xffc300, 0xff5733, 0xff9000, 0xfff200, 0xff6f00];
    private fireSound: Howl | null = null;
    private boundResize: () => void;
    private closeButton: Graphics | null = null;

    constructor(app: Application, sceneManager: SceneManager) {
        super(app);
        this.sceneManager = sceneManager;
        this.boundResize = this.onResize.bind(this);
    }

    public init(): void {
        this.container.removeChildren();
        this.particleContainer = new Container();
        this.particles = [];
        this.fpsText.position.set(20, 20);
        this.container.addChild(this.fpsText);
        if (this.backButton) {
            if (this.backButton.parent) {
                this.backButton.parent.removeChild(this.backButton);
            }
            this.backButton.destroy();
            this.backButton = null;
        }
        this.closeButton = new Graphics();
        this.closeButton.beginFill(0xffffff, 0.001);
        this.closeButton.drawRect(0, 0, 48, 48);
        this.closeButton.endFill();
        this.closeButton.lineStyle(4, 0xffffff);
        this.closeButton.moveTo(12, 12);
        this.closeButton.lineTo(36, 36);
        this.closeButton.moveTo(36, 12);
        this.closeButton.lineTo(12, 36);
        this.closeButton.position.set(window.innerWidth - 56, 16);
        this.closeButton.eventMode = 'static';
        this.closeButton.cursor = 'pointer';
        this.closeButton.interactive = true;
        this.closeButton.on('pointerdown', () => {
            this.sceneManager.start('gameselect');
        });
        this.container.addChild(this.particleContainer!);
        this.container.addChild(this.closeButton);
        this.createFlameTextures();
        this.spawnInitialParticles();
        window.addEventListener('resize', this.boundResize);
        this.onResize();
        this.fireSound = new Howl({
            src: ['assets/sounds/fire.mp3'],
            volume: 0.4,
            loop: true
        });
        this.fireSound.play();
    }

    private createFlameTextures() {
        this.flameTextures = [];
        for (let i = 0; i < this.colors.length; i++) {
            const g = new Graphics();
            g.beginFill(this.colors[i], 0.8);
            g.drawCircle(0, 0, 24);
            g.endFill();
            g.beginFill(0xffffff, 0.2);
            g.drawCircle(0, 0, 12);
            g.endFill();
            this.flameTextures.push(this.app.renderer.generateTexture(g));
        }
    }

    private spawnInitialParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.spawnParticle();
        }
    }

    private spawnParticle() {
        const tex = this.flameTextures[Math.floor(Math.random() * this.flameTextures.length)];
        const sprite = new Sprite(tex);
        const centerX = window.innerWidth / 2;
        const baseY = window.innerHeight - 120;
        sprite.x = centerX + (Math.random() - 0.5) * 80;
        sprite.y = baseY + Math.random() * 40;
        sprite.anchor.set(0.5);
        sprite.scale.set(0.7 + Math.random() * 0.5);
        sprite.alpha = 0.8 + Math.random() * 0.2;
        const vx = (Math.random() - 0.5) * 1.2;
        const vy = -2.5 - Math.random() * 1.5;
        const maxLife = 60 + Math.random() * 40;
        const scaleSpeed = 0.008 + Math.random() * 0.012;
        const fadeSpeed = 0.012 + Math.random() * 0.008;
        if (this.particleContainer) {
            this.particleContainer.addChild(sprite);
        }
        this.particles.push({ sprite, vx, vy, life: 0, maxLife, scaleSpeed, fadeSpeed });
    }

    public update(delta: number): void {
        super.update(delta);
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.sprite.x += p.vx * delta * 0.8;
            p.sprite.y += p.vy * delta * 0.8;
            p.sprite.scale.x += p.scaleSpeed * delta;
            p.sprite.scale.y += p.scaleSpeed * delta;
            p.sprite.alpha -= p.fadeSpeed * delta;
            p.life += delta;
            if (p.life > p.maxLife || p.sprite.alpha <= 0) {
                if (this.particleContainer) {
                    this.particleContainer.removeChild(p.sprite);
                }
                this.particles.splice(i, 1);
            }
        }
        if (this.particles.length < this.maxParticles) {
            this.spawnParticle();
        }
    }

    public onResize(): void {
        if (this.closeButton) {
            this.closeButton.position.set(window.innerWidth - 56, 16);
        }
    }

    public destroy(): void {
        window.removeEventListener('resize', this.boundResize);
        this.container.removeAllListeners();
        this.container.removeChildren();
        if (this.particleContainer) {
            this.particleContainer.removeAllListeners();
            this.particleContainer.destroy({ children: true });
            this.particleContainer = null;
        }
        this.particles.forEach(p => p.sprite.destroy());
        this.particles = [];
        if (this.closeButton) {
            this.closeButton.removeAllListeners();
            this.closeButton.destroy();
            this.closeButton = null;
        }
        if (this.fireSound) {
            this.fireSound.stop();
            this.fireSound.unload();
            this.fireSound = null;
        }
    }
} 