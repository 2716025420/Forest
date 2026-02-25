import { _decorator, Component, director, game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    private static instance: GameManager | null = null;
    
    @property
    isPaused: boolean = false;
    
    @property
    enemiesDefeated: number = 0;
    
    @property
    gameTime: number = 0;
    
    private _isGameOver: boolean = false;
    private _isVictory: boolean = false;

    public static getInstance(): GameManager | null {
        return GameManager.instance;
    }

    onLoad() {
        if (GameManager.instance && GameManager.instance !== this) {
            this.node.destroy();
            return;
        }
        
        GameManager.instance = this;
        director.addPersistRootNode(this.node);
        
        this.initGame();
    }

    initGame() {
        this.isPaused = false;
        this._isGameOver = false;
        this._isVictory = false;
        this.enemiesDefeated = 0;
        this.gameTime = 0;
    }

    update(dt: number) {
        if (!this.isPaused && !this._isGameOver && !this._isVictory) {
            this.gameTime += dt;
        }
    }

    pauseGame() {
        this.isPaused = true;
        director.pause();
    }

    resumeGame() {
        this.isPaused = false;
        director.resume();
    }

    onEnemyDefeated() {
        this.enemiesDefeated++;
    }

    onGameOver() {
        this._isGameOver = true;
        this.scheduleOnce(() => {
            director.loadScene('GameOverScene');
        }, 1.5);
    }

    onVictory() {
        this._isVictory = true;
        this.scheduleOnce(() => {
            director.loadScene('VictoryScene');
        }, 1.5);
    }

    getFormattedTime(): string {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    isGameOver(): boolean {
        return this._isGameOver;
    }

    isVictory(): boolean {
        return this._isVictory;
    }
}
