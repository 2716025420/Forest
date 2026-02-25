import { _decorator, Component, Node, Vec3, find } from 'cc';
const { ccclass, property } = _decorator;

const State = {
    Idle: 0,
    Chase: 1,
    Attack: 2,
    SpecialAttack: 3,
    Enrage: 4
};

type StateType = typeof State[keyof typeof State];

@ccclass('BossController')
export class BossController extends Component {

    @property
    bossName: string = 'Forest Guardian';

    @property
    moveSpeed: number = 60;

    @property
    detectionRange: number = 300;

    @property
    attackRange: number = 80;

    @property
    phase2HealthPercent: number = 0.5;

    @property
    phase3HealthPercent: number = 0.25;

    private player: Node | null = null;
    private currentPhase: number = 1;
    private attackTimer: number = 0;
    private specialAttackTimer: number = 0;
    private facingRight: boolean = true;

    private currentState: StateType = State.Idle;

    onLoad() {
        this.findPlayer();
        this.setupBossUI();
    }

    findPlayer() {
        this.player = find('GameObjects/Player');
    }

    setupBossUI() {
        const uiManager = this.getUIManager();
        if (uiManager) {
            uiManager.setBossName(this.bossName);
            uiManager.showBossHealthUI(true);
        }
    }

    update(dt: number) {
        if (!this.player) {
            this.findPlayer();
            return;
        }

        this.checkPhaseTransition();

        const distanceToPlayer = this.getDistanceToPlayer();

        if (this.currentPhase >= 2 && Math.random() < 0.01 * this.currentPhase) {
            this.performSpecialAttack();
        } else if (distanceToPlayer <= this.attackRange) {
            this.performAttack();
        } else if (distanceToPlayer <= this.detectionRange) {
            this.chasePlayer();
        } else {
            this.idle();
        }

        this.handleMovement(dt);
        this.updateFacing();
        this.updateBossUI();
    }

    handleMovement(dt: number) {
        if (this.currentState === State.Attack || this.currentState === State.SpecialAttack) {
            return;
        }

        if (this.currentState === State.Chase && this.player) {
            const direction = new Vec3(
                this.player.position.x - this.node.position.x,
                this.player.position.y - this.node.position.y,
                0
            );

            const distance = direction.length();
            if (distance > 0) {
                direction.normalize();
                const moveDistance = this.moveSpeed * dt * (1 + (this.currentPhase - 1) * 0.2);
                
                if (distance > moveDistance) {
                    const newPosition = new Vec3(
                        this.node.position.x + direction.x * moveDistance,
                        this.node.position.y + direction.y * moveDistance,
                        this.node.position.z
                    );
                    this.node.position = newPosition;
                }
            }
        }
    }

    checkPhaseTransition() {
        const healthSystem = this.node.getComponent('HealthSystem');
        if (!healthSystem) return;

        const healthPercent = (healthSystem as any).getHealthPercentage();

        if (this.currentPhase === 1 && healthPercent <= this.phase2HealthPercent) {
            this.currentPhase = 2;
            this.onPhaseChange(2);
        } else if (this.currentPhase === 2 && healthPercent <= this.phase3HealthPercent) {
            this.currentPhase = 3;
            this.onPhaseChange(3);
        }
    }

    onPhaseChange(phase: number) {
        console.log(`Boss进入第 ${phase} 阶段!`);
        
        const combatSystem = this.node.getComponent('CombatSystem');
        if (combatSystem) {
            const damageMultiplier = 1 + (phase - 1) * 0.5;
            const baseDamage = (combatSystem as any).getAttackDamage();
            (combatSystem as any).setAttackDamage(Math.floor(baseDamage * damageMultiplier));
        }

        this.scheduleOnce(() => {
            this.performSpecialAttack();
        }, 1.0);
    }

    getDistanceToPlayer(): number {
        if (!this.player) return Infinity;
        return Vec3.distance(this.node.position, this.player.position);
    }

    idle() {
        this.currentState = State.Idle;
    }

    chasePlayer() {
        this.currentState = State.Chase;
    }

    performAttack() {
        this.currentState = State.Attack;

        if (this.attackTimer <= 0) {
            this.attackTimer = 1.5 - (this.currentPhase - 1) * 0.2;
            
            const combatSystem = this.node.getComponent('CombatSystem');
            if (combatSystem) {
                const direction = this.facingRight ? 1 : -1;
                (combatSystem as any).performAttack(direction);
            }
        } else {
            this.attackTimer -= 0.016;
        }
    }

    performSpecialAttack() {
        this.currentState = State.SpecialAttack;
        console.log('Boss使用特殊攻击!');
        
        this.attackTimer = 2.0;
    }

    updateFacing() {
        if (!this.player) return;

        const shouldFaceRight = this.player.position.x > this.node.position.x;
        if (shouldFaceRight !== this.facingRight) {
            this.facingRight = shouldFaceRight;
            const scale = this.node.scale;
            this.node.scale = new Vec3(-scale.x, scale.y, scale.z);
        }
    }

    updateBossUI() {
        const uiManager = this.getUIManager();
        const healthSystem = this.node.getComponent('HealthSystem');
        if (uiManager && healthSystem) {
            uiManager.updateBossHealthBar(
                (healthSystem as any).currentHealth,
                (healthSystem as any).maxHealth
            );
        }
    }

    private getUIManager() {
        const node = find('UIManager');
        if (node) return node.getComponent('UIManager') as any;
        return null;
    }

    onDestroy() {
        const uiManager = this.getUIManager();
        if (uiManager) {
            uiManager.showBossHealthUI(false);
        }

        const gameManager = this.getGameManager();
        if (gameManager) {
            gameManager.onVictory();
        }
    }

    private getGameManager() {
        const node = find('GameManager');
        if (node) return node.getComponent('GameManager') as any;
        return null;
    }
}
