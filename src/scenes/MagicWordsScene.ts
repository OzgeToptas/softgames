import { Application, Container, Text, Sprite, Graphics, Rectangle } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../core/SceneManager';
import { Button } from '../components/Button';
import { gsap } from 'gsap';

interface DialogueEntry {
    character?: string;
    name?: string;
    speaker?: string;
    message?: string;
    text?: string;
    msg?: string;
    content?: string;
}

export class MagicWordsScene extends BaseScene {
    private sceneManager: SceneManager;
    private backButton: Button | null = null;
    private dialogueData: DialogueEntry[] = [];
    private errorText: Text | null = null;
    private dialogueContainer: Container | null = null;
    private EMOJI_SIZE = 24;
    private scrollY: number = 0;
    private startY: number = 0;
    private isDragging: boolean = false;
    private minScrollY: number = 0;
    private maxScrollY: number = 0;
    private maskGraphics: Graphics = new Graphics();
    private isTouching: boolean = false;
    private lastTouchY: number = 0;
    private avatars: { [name: string]: { url: string, position: string } } = {};
    private MASK_Y = 100;
    private MASK_HEIGHT = typeof window !== 'undefined' ? window.innerHeight - 120 : 600;
    private EXTRA_SCROLL_PADDING = 80;
    private scrollArrow: Sprite | null = null;
    private emojiMap: Record<string, string> = {};
    private boundResize: () => void;

    constructor(app: Application, sceneManager: SceneManager) {
        super(app);
        this.sceneManager = sceneManager;
        this.boundResize = this.onResize.bind(this);
        this.backButton = new Button('Back to Menu', () => {
            this.sceneManager.start('gameselect');
        });
        this.dialogueContainer = new Container();
    }

    public async init(): Promise<void> {
        this.container.removeChildren();
        this.dialogueData = [];
        this.errorText = null;
        this.dialogueContainer = new Container();
        this.fpsText.position.set(20, 20);
        this.container.addChild(this.fpsText);
        this.backButton = new Button('Back to Menu', () => {
            this.sceneManager.start('gameselect');
        });
        this.backButton.position.set(
            window.innerWidth - this.backButton.width - 20,
            20
        );
        this.container.addChild(this.backButton);
        this.container.addChild(this.dialogueContainer);
        this.scrollY = 0;
        this.updateScrollLimits();
        this.dialogueContainer.y = this.scrollY;
        this.updateMask();
        this.dialogueContainer.mask = this.maskGraphics;
        this.container.addChild(this.maskGraphics);
        this.container.eventMode = 'static';
        this.container.on('wheel', this.onWheelScroll, this);
        this.container.on('pointerdown', this.onTouchStart, this);
        this.container.on('pointermove', this.onTouchMove, this);
        this.container.on('pointerup', this.onTouchEnd, this);
        this.container.on('pointerupoutside', this.onTouchEnd, this);
        this.onResize();
        window.addEventListener('resize', this.boundResize);

        try {
            const response = await fetch('https://api.allorigins.win/raw?url=https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            console.log('Fetched API data:', data);

            if (!data || !Array.isArray(data.dialogue)) {
                console.error('API returned unexpected structure:', data);
                this.showError('Invalid API response format');
                return;
            }

            this.dialogueData = data.dialogue;
            if (data.avatars && Array.isArray(data.avatars)) {
                this.avatars = {};
                for (const avatar of data.avatars) {
                    this.avatars[avatar.name] = { url: avatar.url, position: avatar.position };
                }
            }
            if (data.emojies && Array.isArray(data.emojies)) {
                this.emojiMap = {};
                for (const emoji of data.emojies) {
                    this.emojiMap[emoji.name] = emoji.url;
                }
            }
            this.renderDialogues();

        } catch (error) {
            console.error('Fetch error:', error);
            this.showError('Failed to load dialogue');
        }

        this.addScrollArrow();
    }

    private parseMessage(message: string | undefined): (Text | Sprite)[] {
        const FONT_SIZE = 24;
        if (typeof message !== 'string') return [];
        const parts = message.split(/(:[a-zA-Z0-9_]+:|\{[a-zA-Z0-9_]+\})/g);
        const result: (Text | Sprite)[] = [];
        for (const part of parts) {
            let emojiKey = '';
            if (/^:[a-zA-Z0-9_]+:$/.test(part)) {
                emojiKey = part.slice(1, -1);
            } else if (/^\{[a-zA-Z0-9_]+\}$/.test(part)) {
                emojiKey = part.slice(1, -1);
            }
            if (emojiKey) {
                if (emojiKey === 'affirmative') {
                    const sprite = Sprite.from('assets/affirmative.png');
                    sprite.width = FONT_SIZE;
                    sprite.height = FONT_SIZE;
                    sprite.anchor.set(0, 0.15);
                    result.push(sprite);
                } else if (this.emojiMap[emojiKey]) {
                    const sprite = Sprite.from(this.emojiMap[emojiKey]);
                    sprite.width = FONT_SIZE;
                    sprite.height = FONT_SIZE;
                    sprite.anchor.set(0, 0.15);
                    result.push(sprite);
                }
            } else if (part.length > 0) {
                const text = new Text(part, {
                    fontSize: FONT_SIZE,
                    fill: 0xffffff,
                    fontFamily: 'Arial'
                });
                result.push(text);
            }
        }
        return result;
    }

    private async renderDialogues() {
        this.dialogueContainer?.removeChildren();
        const screenWidth = window.innerWidth;
        const rowContainers: Container[] = [];
        let totalHeight = this.MASK_Y;

        for (const entry of this.dialogueData) {
            const charName = entry.character ?? entry.name ?? entry.speaker ?? 'Unknown';
            const avatarInfo = this.avatars[charName];
            const position = avatarInfo?.position === 'right' ? 'right' : 'left';
            const messageParts = this.parseMessage(entry.message ?? entry.text ?? entry.msg ?? entry.content ?? '');
            const rowContainer = new Container();
            let x = 0;
            if (avatarInfo) {
                const avatarSprite = Sprite.from(avatarInfo.url);
                avatarSprite.width = 36;
                avatarSprite.height = 36;
                avatarSprite.anchor.set(0, 0.15);
                avatarSprite.position.set(x, 0);
                rowContainer.addChild(avatarSprite);
                x += 40;
            }
            const charText = new Text(`${charName}:`, {
                fontWeight: 'bold',
                fontSize: 24,
                fill: 0xffffff,
                fontFamily: 'Arial'
            });
            charText.position.set(x, 0);
            rowContainer.addChild(charText);
            x += charText.width + 10;
            for (const part of messageParts) {
                part.position.set(x, 4);
                rowContainer.addChild(part);
                x += part.width + 6;
            }
            const padding = 16;
            const bubbleWidth = rowContainer.width + padding * 2;
            const bubbleHeight = Math.max(rowContainer.height + padding, 48);
            const bubble = new Graphics();
            bubble.beginFill(0x23234a, 0.95);
            bubble.drawRoundedRect(0, 0, bubbleWidth, bubbleHeight, 18);
            bubble.endFill();
            rowContainer.addChildAt(bubble, 0);
            for (const child of rowContainer.children) {
                if (child !== bubble) {
                    child.x += padding;
                    child.y += padding / 2;
                }
            }
            const rowWidth = bubbleWidth;
            if (position === 'right') {
                rowContainer.position.set(screenWidth - rowWidth - 50, totalHeight);
            } else {
                rowContainer.position.set(50, totalHeight);
            }
            rowContainer.alpha = 0;
            rowContainers.push(rowContainer);
            totalHeight += bubbleHeight + 20;
        }

        for (let i = 0; i < rowContainers.length; i++) {
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    this.dialogueContainer?.addChild(rowContainers[i]);
                    gsap.to(rowContainers[i], {
                        alpha: 1,
                        duration: 0.5,
                        onComplete: resolve
                    });
                }, i * 300);
            });
        }

        if (this.dialogueContainer) {
            this.dialogueContainer.interactive = true;
            this.dialogueContainer.interactiveChildren = true;

            this.dialogueContainer.hitArea = new Rectangle(
                0,
                0,
                window.innerWidth,
                Math.max(totalHeight, this.MASK_HEIGHT)
            );
        }
        this.updateScrollLimits();
        this.updateScrollArrowVisibility();
    }

    private showError(message: string) {
        this.dialogueContainer?.removeChildren();
        this.errorText = new Text(message, {
            fontSize: 32,
            fill: 0xff4444,
            fontFamily: 'Arial'
        });
        this.errorText.position.set(50, 120);
        this.dialogueContainer?.addChild(this.errorText);
    }

    private updateMask() {
        const width = window.innerWidth;
        this.maskGraphics.clear();
        this.maskGraphics.beginFill(0x000000, 1);
        this.maskGraphics.drawRect(0, this.MASK_Y, width, this.MASK_HEIGHT);
        this.maskGraphics.endFill();
        this.maskGraphics.position.set(0, 0);
    }

    private updateScrollLimits() {
        const visibleHeight = window.innerHeight;
        const contentHeight = this.dialogueContainer ? this.dialogueContainer.height : 0;
        this.maxScrollY = 0;
        this.minScrollY = Math.min(0, visibleHeight - contentHeight - 100); // 100px padding
        this.scrollY = Math.max(this.minScrollY, Math.min(this.maxScrollY, this.scrollY));
        if (this.dialogueContainer) this.dialogueContainer.y = this.scrollY;
    }

    private onWheelScroll(event: any) {
        if (event.data && event.data.originalEvent) {
            event.data.originalEvent.preventDefault();
        } else if (event.preventDefault) {
            event.preventDefault();
        }
        const deltaY = event.deltaY || (event.data && event.data.originalEvent && event.data.originalEvent.deltaY) || 0;
        this.scrollY -= deltaY;
        this.scrollY = Math.max(this.minScrollY, Math.min(this.maxScrollY, this.scrollY));
        if (this.dialogueContainer) this.dialogueContainer.y = this.scrollY;
        this.updateScrollArrowVisibility();
    }

    private onTouchStart(event: any) {
        this.isDragging = true;
        this.startY = event.data ? event.data.global.y : event.global.y;
    }

    private onTouchMove(event: any) {
        if (!this.isDragging) return;
        const currentY = event.data ? event.data.global.y : event.global.y;
        const delta = currentY - this.startY;
        this.startY = currentY;
        this.scrollY += delta;
        this.scrollY = Math.max(this.minScrollY, Math.min(this.maxScrollY, this.scrollY));
        if (this.dialogueContainer) this.dialogueContainer.y = this.scrollY;
        this.updateScrollArrowVisibility();
    }

    private onTouchEnd() {
        this.isDragging = false;
    }

    public onResize(): void {
        if (this.backButton) {
            this.backButton.position.set(
                window.innerWidth - this.backButton.width - 20,
                20
            );
        }
        this.updateMask();
        this.updateScrollLimits();
        if (this.scrollArrow) {
            this.scrollArrow.position.set(window.innerWidth / 2, window.innerHeight - 40);
        }
        this.updateScrollArrowVisibility();

        if (this.dialogueContainer) {
            this.dialogueContainer.width = window.innerWidth;
            this.dialogueContainer.height = window.innerHeight;

            for (const child of this.dialogueContainer.children) {
                if (child instanceof Container) {
                    const rowWidth = child.width;
                    const position = child.position.x > window.innerWidth / 2 ? 'right' : 'left';
                    if (position === 'right') {
                        child.position.set(window.innerWidth - rowWidth - 50, child.position.y);
                    } else {
                        child.position.set(50, child.position.y);
                    }
                }
            }
        }
    }

    private addScrollArrow() {
        if (this.scrollArrow) {
            this.container.removeChild(this.scrollArrow);
        }
        this.scrollArrow = Sprite.from('assets/arrow-down.png');
        this.scrollArrow.width = 40;
        this.scrollArrow.height = 40;
        this.scrollArrow.anchor.set(0.5);
        this.scrollArrow.position.set(window.innerWidth / 2, window.innerHeight - 40);
        this.scrollArrow.eventMode = 'static';
        this.scrollArrow.cursor = 'pointer';
        this.scrollArrow.zIndex = 9999;
        this.container.sortableChildren = true;
        this.scrollArrow.on('pointerdown', () => {
            console.log('Arrow clicked!', 'scrollY:', this.scrollY, 'minScrollY:', this.minScrollY);
            this.scrollY = Math.max(this.minScrollY, this.scrollY - 120);
            if (this.dialogueContainer) this.dialogueContainer.y = this.scrollY;
            this.updateScrollArrowVisibility();
            console.log('After scroll:', 'scrollY:', this.scrollY, 'minScrollY:', this.minScrollY);
        });
        this.container.addChild(this.scrollArrow);
        this.updateScrollArrowVisibility();
    }

    private updateScrollArrowVisibility() {
        if (!this.scrollArrow) return;
        this.scrollArrow.visible = true;
    }

    public destroy(): void {
        window.removeEventListener('resize', this.boundResize);
        this.container.removeAllListeners();
        if (this.dialogueContainer) {
            this.dialogueContainer.removeAllListeners();
            this.dialogueContainer.destroy({ children: true });
            this.dialogueContainer = null;
        }
        if (this.scrollArrow) {
            this.scrollArrow.removeAllListeners();
            this.scrollArrow.destroy();
            this.scrollArrow = null;
        }
        this.container.removeChildren();
        if (this.errorText) {
            this.errorText.destroy();
        }
        this.maskGraphics.destroy();
        this.dialogueData = [];
        this.avatars = {};
        this.emojiMap = {};
    }
}
