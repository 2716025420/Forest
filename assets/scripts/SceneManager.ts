import { _decorator, Component, director, game, sys } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('SceneManager')
export class SceneManager extends Component {

    private static instance: SceneManager | null = null;
    private _targetScene: string = '';

    public static getInstance(): SceneManager | null {
        return SceneManager.instance;
    }

    onLoad() {
        if (SceneManager.instance && SceneManager.instance !== this) {
            this.node.destroy();
            return;
        }
        SceneManager.instance = this;
        director.addPersistRootNode(this.node);
    }

    loadScene(sceneName: string) {
        this._targetScene = sceneName;
        director.loadScene('LoadingScene');
    }

    getTargetScene(): string {
        return this._targetScene;
    }

    loadGameScene() {
        this.loadScene('GameScene');
    }

    loadBossScene() {
        this.loadScene('BossScene');
    }

    loadStartScene() {
        this.loadScene('StartScene');
    }

    loadVictoryScene() {
        director.loadScene('VictoryScene');
    }

    loadGameOverScene() {
        director.loadScene('GameOverScene');
    }

    restartGame() {
        const gameManager = GameManager.getInstance();
        if (gameManager) {
            gameManager.initGame();
        }
        this.loadGameScene();
    }

    goToMainMenu() {
        const gameManager = GameManager.getInstance();
        if (gameManager) {
            gameManager.initGame();
        }
        this.loadStartScene();
    }

    quitGame() {
        if (sys.isBrowser) {
            window.close();
        } else {
            game.end();
        }
    }
}
