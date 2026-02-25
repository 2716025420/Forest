import { _decorator, Component, Node, Sprite, ProgressBar, find, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HealthSystem')
export class HealthSystem extends Component {

    @property
    maxHealth: number = 100;

    @property
    currentHealth: number = 100;

    @property(ProgressBar)
    healthBar: ProgressBar | null = null;

    @property
    isInvincible: boolean = false;

    @property
    invincibleDuration: number = 0.5;

    @property
    isPlayer: boolean = false;

    private _isDead: boolean = false;
    private invincibleTimer: number = 0;

    onLoad() {
        this.currentHealth = this.maxHealth;
        this._isDead = false;
    }

    update(dt: number) {
        if (this.isInvincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
                this.setSpriteVisible(true);
            } else {
                this.blinkSprite();
            }
        }
    }

    takeDamage(amount: number) {
        if (this._isDead || this.isInvincible) return;

        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.updateHealthBar();

        if (this.currentHealth <= 0) {
            this.die();
        } else {
            this.setInvincible();
        }
    }

    heal(amount: number) {
        if (this._isDead) return;

        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.updateHealthBar();
    }

    setInvincible() {
        this.isInvincible = true;
        this.invincibleTimer = this.invincibleDuration;
    }

    private blinkSprite() {
        const sprite = this.node.getComponent(Sprite);
        if (sprite) {
            const isVisible = Math.floor(this.invincibleTimer * 10) % 2 === 0;
            this.setSpriteVisible(isVisible);
        }
    }

    private setSpriteVisible(visible: boolean) {
        const sprite = this.node.getComponent(Sprite);
        if (sprite) {
            const newColor = new Color(sprite.color);
            newColor.a = visible ? 255 : 100;
            sprite.color = newColor;
        }
    }

    private die() {
        this._isDead = true;

        const gameManager = this.getGameManager();
        if (gameManager) {
            if (this.isPlayer) {
                gameManager.onGameOver();
            } else {
                gameManager.onEnemyDefeated();
            }
        }

        this.playDeathAnimation();
        this.scheduleOnce(() => {
            if (!this.isPlayer) {
                this.node.destroy();
            }
        }, 0.5);
    }

    private playDeathAnimation() {
    }

    private updateHealthBar() {
        if (this.healthBar) {
            this.healthBar.progress = this.currentHealth / this.maxHealth;
        }

        const uiManager = this.getUIManager();
        if (uiManager && this.isPlayer) {
            uiManager.updateHealthBar(this.currentHealth, this.maxHealth);
        }
    }

    private getGameManager() {
        const gameManagerNode = find('GameManager');
        if (gameManagerNode) {
            return gameManagerNode.getComponent('GameManager') as any;
        }
        return null;
    }

    private getUIManager() {
        const uiManagerNode = find('UIManager');
        if (uiManagerNode) {
            return uiManagerNode.getComponent('UIManager') as any;
        }
        return null;
    }

    isDead(): boolean {
        return this._isDead;
    }

    getHealthPercentage(): number {
        return this.currentHealth / this.maxHealth;
    }

    reset() {
        this.currentHealth = this.maxHealth;
        this._isDead = false;
        this.isInvincible = false;
        this.updateHealthBar();
    }
}
