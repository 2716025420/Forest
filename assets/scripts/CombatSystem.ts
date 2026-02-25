import { _decorator, Component, Node, Vec3, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CombatSystem')
export class CombatSystem extends Component {

    @property
    attackDamage: number = 20;

    @property
    attackRange: number = 50;

    @property
    attackCooldown: number = 0.5;

    @property(Node)
    attackHitbox: Node | null = null;

    private canAttack: boolean = true;
    private attackTimer: number = 0;
    private isPlayer: boolean = false;

    onLoad() {
        this.isPlayer = (this.node as any).group === 'Player';
        
        if (this.attackHitbox) {
            this.attackHitbox.active = false;
        }
    }

    update(dt: number) {
        if (!this.canAttack) {
            this.attackTimer -= dt;
            if (this.attackTimer <= 0) {
                this.canAttack = true;
            }
        }
    }

    performAttack(direction: number = 1) {
        if (!this.canAttack) return false;

        this.canAttack = false;
        this.attackTimer = this.attackCooldown;

        if (this.attackHitbox) {
            this.attackHitbox.active = true;
            this.attackHitbox.scale = new Vec3(direction, 1, 1);

            this.scheduleOnce(() => {
                if (this.attackHitbox) {
                    this.attackHitbox.active = false;
                }
            }, 0.2);
        }

        this.playAttackSound();
        return true;
    }

    dealDamage(targetNode: Node) {
        const healthSystem = targetNode.getComponent('HealthSystem');
        if (healthSystem) {
            (healthSystem as any).takeDamage(this.attackDamage);
        }

        this.createHitEffect(targetNode.position);
        this.shakeCamera();
    }

    createHitEffect(position: Vec3) {
        console.log('创建命中特效', position);
    }

    shakeCamera() {
        const cameraNode = find('Camera');
        if (cameraNode) {
            const cameraFollow = cameraNode.getComponent('CameraFollow');
            if (cameraFollow) {
                (cameraFollow as any).shake(0.1, 3);
            }
        }
    }

    playAttackSound() {
    }

    setAttackDamage(damage: number) {
        this.attackDamage = damage;
    }

    getAttackDamage(): number {
        return this.attackDamage;
    }

    canPerformAttack(): boolean {
        return this.canAttack;
    }
}
