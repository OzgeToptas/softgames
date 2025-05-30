import './style.css'
import { App } from './core/App'


const app = new App()


let lastTime = performance.now()
function gameLoop(currentTime: number) {
  const delta = currentTime - lastTime
  lastTime = currentTime

  const currentScene = app.getCurrentScene()
  if (currentScene) {
    currentScene.update(delta)
  }

  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)
