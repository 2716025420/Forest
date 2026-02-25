import { _decorator, Component, ProgressBar, Label, find, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {

    @property(ProgressBar)
    healthBar: ProgressBar | null = null;

    @property(ProgressBar)
    energyBar: ProgressBar | null = null;

    @property(ProgressBar)
    bossHealthBar: ProgressBar | null = null;

    @property(Label)
    bossNameLabel: Label | null = null;

    @property(Label)
    timePlayedLabel: Label | null = null;

    @property(Label)
    enemiesDefeatedLabel: Label | null = null;

    private static instance: UIManager | null = null;

    public static getInstance(): UIManager | null {
        return UIManager.instance;
    }

    onLoad() {
        if (UIManager.instance && UIManager.instance !== this) {
            this.node.destroy();
            return;
        }
        UIManager.instance = this;
        director.addPersistRootNode(this.node);
    }

    updateHealthBar(current: number, max: number) {
        if (this.healthBar) {
            this.healthBar.progress = current / max;
        }
    }

    updateEnergyBar(current: number, max: number) {
        if (this.energyBar) {
            this.energyBar.progress = current / max;
        }
    }

    updateBossHealthBar(current: number, max: number) {
        if (this.bossHealthBar) {
            this.bossHealthBar.progress = current / max;
        }
    }

    setBossName(name: string) {
        if (this.bossNameLabel) {
            this.bossNameLabel.string = name;
        }
    }

    updateStats() {
        const gameManager = this.getGameManager();
        if (!gameManager) return;

        if (this.timePlayedLabel) {
            this.timePlayedLabel.string = `游戏时间: ${gameManager.getFormattedTime()}`;
        }

        if (this.enemiesDefeatedLabel) {
            this.enemiesDefeatedLabel.string = `击败敌人: ${gameManager.enemiesDefeated}`;
        }
    }

    showSettings() {
        console.log('显示设置面板');
    }

    hideSettings() {
        console.log('隐藏设置面板');
    }

    onStartButtonClicked() {
        const sceneManager = this.getSceneManager();
        if (sceneManager) {
            sceneManager.loadGameScene();
        }
    }

    onSettingButtonClicked() {
        this.showSettings();
    }

    onPauseButtonClicked() {
        const gameManager = this.getGameManager();
        if (gameManager) {
            if (gameManager.isPaused) {
                gameManager.resumeGame();
            } else {
                gameManager.pauseGame();
            }
        }
    }

    onMainMenuButtonClicked() {
        const sceneManager = this.getSceneManager();
        if (sceneManager) {
            sceneManager.goToMainMenu();
        }
    }

    onRestartButtonClicked() {
        const sceneManager = this.getSceneManager();
        if (sceneManager) {
            sceneManager.restartGame();
        }
    }

    showBossHealthUI(show: boolean) {
        if (this.bossHealthBar && this.bossHealthBar.node) {
            this.bossHealthBar.node.active = show;
        }
        if (this.bossNameLabel && this.bossNameLabel.node) {
            this.bossNameLabel.node.active = show;
        }
    }

    private getGameManager() {
        const node = find('GameManager');
        if (node) return node.getComponent('GameManager') as any;
        return null;
    }

    private getSceneManager() {
        const node = find('SceneManager');
        if (node) return node.getComponent('SceneManager') as any;
        return null;
    }
}
