import { Application, Container, Text, Sprite, Graphics } from 'pixi.js';
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
    private dialogueContainer: Container = new Container();
    private EMOJI_SIZE = 24;
    private scrollY: number = 0;
    private minScrollY: number = 0;
    private maxScrollY: number = 0;
    private maskGraphics: Graphics = new Graphics();
    private avatars: { [name: string]: { url: string, position: string } } = {};
    private MASK_Y = 100;
    private MASK_HEIGHT = typeof window !== 'undefined' ? window.innerHeight - 120 : 600;
    private scrollArrow: Sprite | null = null;
    private emojiMap: Record<string, string> = {};
    private boundResize: () => void;
    private _windowWheelListener: ((e: WheelEvent) => void) | null = null;
    private _scrollOverlay: HTMLDivElement | null = null;

    constructor(app: Application, sceneManager: SceneManager) {
        super(app);
        this.sceneManager = sceneManager;
        this.boundResize = this.onResize.bind(this);
    }

    public async init(): Promise<void> {
        this.cleanupScene();
        this.container.addChild(this.fpsText);

        this.backButton = new Button('Back to Menu', () => {
            this.sceneManager.start('gameselect');
        });
        this.backButton.position.set(
            window.innerWidth - this.backButton.width - 20,
            20
        );
        this.container.addChild(this.backButton);

        this.dialogueContainer = new Container();
        this.container.addChild(this.dialogueContainer);

        this.updateMask();
        this.dialogueContainer.mask = this.maskGraphics;
        this.container.addChild(this.maskGraphics);

        if (!this._windowWheelListener) {
            this._windowWheelListener = (e: WheelEvent) => {
                e.preventDefault();
                this.scrollY -= e.deltaY;
                this.scrollY = Math.max(this.minScrollY, Math.min(this.maxScrollY, this.scrollY));
                this.dialogueContainer.y = this.scrollY;
                this.updateScrollArrowVisibility();
            };
            window.addEventListener('wheel', this._windowWheelListener, { passive: false });
        }

        window.addEventListener('resize', this.boundResize);

        try {
            const response = await fetch('https://api.allorigins.win/raw?url=https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
            const data = await response.json();

            this.dialogueData = data.dialogue ?? [];
            if (data.avatars && Array.isArray(data.avatars)) {
                for (const avatar of data.avatars) {
                    this.avatars[avatar.name] = { url: avatar.url, position: avatar.position };
                }
            }
            if (data.emojies && Array.isArray(data.emojies)) {
                for (const emoji of data.emojies) {
                    this.emojiMap[emoji.name] = emoji.url;
                }
            }

            this.renderDialoguesAnimated();
        } catch (e) {
            console.error("Fetch Error:", e);
            this.showError('Failed to load dialogue');
        }

        this.addScrollArrow();
    }

    private cleanupScene(): void {
        window.removeEventListener('resize', this.boundResize);
        if (this._windowWheelListener) {
            window.removeEventListener('wheel', this._windowWheelListener);
            this._windowWheelListener = null;
        }
        if (this._scrollOverlay) {
            document.body.removeChild(this._scrollOverlay);
            this._scrollOverlay = null;
        }
        this.container.removeAllListeners();
        this.dialogueContainer.removeAllListeners();
        this.dialogueContainer.destroy({ children: true });
        this.container.removeChildren();
        if (this.scrollArrow) {
            this.scrollArrow.removeAllListeners();
            this.scrollArrow.destroy();
            this.scrollArrow = null;
        }
        if (this.errorText) {
            this.errorText.destroy();
        }
        this.maskGraphics.clear();
        this.dialogueData = [];
        this.avatars = {};
        this.emojiMap = {};
        this.backButton = null;
        this.scrollY = 0;
        this.minScrollY = 0;
        this.maxScrollY = 0;
    }

    private parseMessage(message: string): (Text | Sprite)[] {
        const parts = message.split(/(:[a-zA-Z0-9_]+:|\{[a-zA-Z0-9_]+\})/g);
        const result: (Text | Sprite)[] = [];
        for (const part of parts) {
            let emojiKey = '';
            if (/^:[a-zA-Z0-9_]+:$/.test(part)) {
                emojiKey = part.slice(1, -1);
            } else if (/^\{[a-zA-Z0-9_]+\}$/.test(part)) {
                emojiKey = part.slice(1, -1);
            }
            if (emojiKey && this.emojiMap[emojiKey]) {
                const sprite = Sprite.from(this.emojiMap[emojiKey]);
                sprite.width = this.EMOJI_SIZE;
                sprite.height = this.EMOJI_SIZE;
                sprite.anchor.set(0, 0.15);
                result.push(sprite);
            } else if (part.length > 0) {
                result.push(new Text(part, {
                    fontSize: 18,
                    fill: 0xffffff,
                    wordWrap: true,
                    wordWrapWidth: window.innerWidth - 140
                }));
            }
        }
        return result;
    }

    private renderDialoguesAnimated() {
        this.dialogueContainer.removeChildren();
        let yOffset = this.MASK_Y;

        const renderNext = (index: number) => {
            if (index >= this.dialogueData.length) return;
            const entry = this.dialogueData[index];
            const charName = entry.character || entry.name || entry.speaker || 'Unknown';
            const message = entry.message || entry.text || entry.msg || entry.content || '';
            const avatarInfo = this.avatars[charName];
            const position = avatarInfo?.position === 'right' ? 'right' : 'left';
            const parts = this.parseMessage(message);

            const contentContainer = new Container();
            let x = 10;
            for (const part of parts) {
                part.position.set(x, 0);
                contentContainer.addChild(part);
                x += part.width + 6;
            }

            const bubbleWidth = contentContainer.width + 20;
            const bubbleHeight = contentContainer.height + 20;
            const bubble = new Graphics();
            bubble.beginFill(0x23234a);
            bubble.drawRoundedRect(0, 0, bubbleWidth, bubbleHeight, 12);
            bubble.endFill();
            bubble.alpha = 0;

            const rowContainer = new Container();
            contentContainer.position.set(10, 10);
            bubble.position.set(0, 0);

            rowContainer.addChild(bubble);
            rowContainer.addChild(contentContainer);

            const nameText = new Text(charName, {
                fontSize: 14,
                fill: 0xffff88
            });
            nameText.y = -20;
            rowContainer.addChild(nameText);

            if (avatarInfo) {
                const avatar = Sprite.from(avatarInfo.url);
                avatar.width = 36;
                avatar.height = 36;
                avatar.y = 0;
                rowContainer.addChild(avatar);

                if (position === 'left') {
                    avatar.x = 0;
                    bubble.x = 46;
                    contentContainer.x = 56;
                    nameText.x = 46;
                    rowContainer.position.set(50, yOffset);
                } else {
                    avatar.x = bubbleWidth + 10;
                    bubble.x = 0;
                    contentContainer.x = 10;
                    nameText.x = 0;
                    rowContainer.position.set(window.innerWidth - bubbleWidth - 100, yOffset);
                }
            } else {
                nameText.x = 0;
                rowContainer.position.set(position === 'right' ? window.innerWidth - bubbleWidth - 50 : 50, yOffset);
            }

            this.dialogueContainer.addChild(rowContainer);

            gsap.to(bubble, {
                alpha: 1,
                duration: 0.5,
                onComplete: () => {
                    yOffset += bubbleHeight + 40;
                    this.updateScrollLimits();
                    renderNext(index + 1);
                }
            });
        };

        renderNext(0);
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
        let contentHeight = 0;
        if (this.dialogueContainer && this.dialogueContainer.children.length > 0) {
            let maxY = 0;
            for (const child of this.dialogueContainer.children) {
                if ('y' in child && typeof child.y === 'number' && 'height' in child) {
                    maxY = Math.max(maxY, child.y + (child as any).height);
                }
            }
            contentHeight = maxY;
        }
        this.maxScrollY = 0;
        this.minScrollY = Math.min(0, visibleHeight - contentHeight - 100);
        this.scrollY = Math.max(this.minScrollY, Math.min(this.maxScrollY, this.scrollY));
        if (this.dialogueContainer) this.dialogueContainer.y = this.scrollY;
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
            this.scrollY = Math.max(this.minScrollY, this.scrollY - 120);
            if (this.dialogueContainer) this.dialogueContainer.y = this.scrollY;
            this.updateScrollArrowVisibility();
        });
        this.container.addChild(this.scrollArrow);
        this.updateScrollArrowVisibility();
    }

    private updateScrollArrowVisibility() {
        if (!this.scrollArrow) return;
        this.scrollArrow.visible = true;
    }

    private onResize(): void {
        this.updateMask();
        this.updateScrollLimits();

        if (this.backButton) {
            this.backButton.position.set(
                window.innerWidth - this.backButton.width - 20,
                20
            );
        }

        if (this.scrollArrow) {
            this.scrollArrow.position.set(window.innerWidth / 2, window.innerHeight - 40);
        }
    }

    public destroy(): void {
        this.cleanupScene();
    }
}
