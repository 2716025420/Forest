import { _decorator, Component, Sprite, Label, director, find } from 'cc';
import { SceneManager } from './SceneManager';
const { ccclass, property } = _decorator;

@ccclass('LoadingController')
export class LoadingController extends Component {

    @property(Sprite)
    progressBarFill: Sprite | null = null;

    @property(Label)
    tipLabel: Label | null = null;

    private _loadingProgress: number = 0;
    private _targetScene: string = '';
    private _loadingTips: string[] = [
        '提示：按A/D移动，空格跳跃',
        '提示：按J攻击，按K闪避',
        '提示：击败Boss即可通关',
        '提示：收集道具恢复生命和能量',
        '提示：注意躲避敌人的攻击'
    ];

    onLoad() {
        this._loadingProgress = 0;
        
        const sceneManager = SceneManager.getInstance();
        if (sceneManager) {
            this._targetScene = sceneManager.getTargetScene();
        }
        
        if (!this._targetScene) {
            this._targetScene = 'GameScene';
        }
        
        if (this.tipLabel) {
            const randomIndex = Math.floor(Math.random() * this._loadingTips.length);
            this.tipLabel.string = this._loadingTips[randomIndex];
        }
        
        this.schedule(this.updateProgress, 0.05);
    }

    private updateProgress() {
        this._loadingProgress += 0.02;
        
        if (this.progressBarFill) {
            this.progressBarFill.fillRange = this._loadingProgress;
        }
        
        if (this._loadingProgress >= 1) {
            this.unschedule(this.updateProgress);
            director.loadScene(this._targetScene);
        }
    }
}
