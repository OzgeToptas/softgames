import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

const app = new PIXI.Application({
    resizeTo: window,
    backgroundColor: 0x000000
});
document.body.appendChild(app.view as HTMLCanvasElement);

// Create simple card shape
const cardGraphic = new PIXI.Graphics();
cardGraphic.beginFill(0xffffff);
cardGraphic.lineStyle(2, 0x000000);
cardGraphic.drawRoundedRect(0, 0, 80, 120, 10);
cardGraphic.endFill();

// Convert to texture and sprite
const texture = app.renderer.generateTexture(cardGraphic);
const card = new PIXI.Sprite(texture);
card.x = 100;
card.y = 200;

app.stage.addChild(card);

// Animate with GSAP
gsap.to(card, {
    duration: 2,
    x: 600,
    y: 300
}); 