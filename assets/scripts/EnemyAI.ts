import { _decorator, Component, Node, Vec3, find } from 'cc';
const { ccclass, property } = _decorator;

const State = {
    Idle: 0,
    Patrol: 1,
    Chase: 2,
    Attack: 3
};

type StateType = typeof State[keyof typeof State];

@ccclass('EnemyAI')
export class EnemyAI extends Component {

    @property
    moveSpeed: number = 80;

    @property
    detectionRange: number = 200;

    @property
    attackRange: number = 50;

    @property
    attackCooldown: number = 2.0;

    @property
    patrolRange: number = 100;

    private player: Node | null = null;
    private startPosition: Vec3 = new Vec3(0, 0, 0);
    private currentTarget: Vec3 = new Vec3(0, 0, 0);
    private isPatrolling: boolean = true;
    private canAttack: boolean = true;
    private attackTimer: number = 0;
    private facingRight: boolean = true;

    private currentState: StateType = State.Idle;

    onLoad() {
        this.startPosition = new Vec3(
            this.node.position.x,
            this.node.position.y,
            this.node.position.z
        );
        this.currentTarget = new Vec3(
            this.startPosition.x + this.patrolRange,
            this.startPosition.y,
            this.startPosition.z
        );
        this.findPlayer();
    }

    findPlayer() {
        this.player = find('GameObjects/Player');
    }

    update(dt: number) {
        if (!this.canAttack) {
            this.attackTimer -= dt;
            if (this.attackTimer <= 0) {
                this.canAttack = true;
            }
        }

        if (!this.player) {
            this.findPlayer();
            this.patrol();
            return;
        }

        const distanceToPlayer = this.getDistanceToPlayer();

        if (distanceToPlayer <= this.attackRange) {
            this.attackPlayer();
        } else if (distanceToPlayer <= this.detectionRange) {
            this.chasePlayer();
        } else {
            this.patrol();
        }

        this.handleMovement(dt);
        this.updateFacing();
    }

    handleMovement(dt: number) {
        if (this.currentState === State.Attack) {
            return;
        }

        let targetPosition: Vec3;

        if (this.currentState === State.Chase && this.player) {
            targetPosition = this.player.position;
        } else if (this.currentState === State.Patrol) {
            targetPosition = this.currentTarget;
        } else {
            return;
        }

        const direction = new Vec3(
            targetPosition.x - this.node.position.x,
            targetPosition.y - this.node.position.y,
            0
        );

        const distance = direction.length();
        if (distance > 0) {
            direction.normalize();
            const moveDistance = this.moveSpeed * dt;
            
            if (distance <= moveDistance) {
                this.node.position = targetPosition;
            } else {
                const newPosition = new Vec3(
                    this.node.position.x + direction.x * moveDistance,
                    this.node.position.y + direction.y * moveDistance,
                    this.node.position.z
                );
                this.node.position = newPosition;
            }
        }
    }

    getDistanceToPlayer(): number {
        if (!this.player) return Infinity;
        return Vec3.distance(this.node.position, this.player.position);
    }

    patrol() {
        this.currentState = State.Patrol;
        this.isPatrolling = true;

        const direction = this.currentTarget.x > this.node.position.x ? 1 : -1;
        
        if (Math.abs(this.currentTarget.x - this.node.position.x) < 10) {
            if (this.currentTarget.x > this.startPosition.x) {
                this.currentTarget = new Vec3(
                    this.startPosition.x - this.patrolRange,
                    this.startPosition.y,
                    this.startPosition.z
                );
            } else {
                this.currentTarget = new Vec3(
                    this.startPosition.x + this.patrolRange,
                    this.startPosition.y,
                    this.startPosition.z
                );
            }
        }
    }

    chasePlayer() {
        this.currentState = State.Chase;
        this.isPatrolling = false;
    }

    attackPlayer() {
        this.currentState = State.Attack;

        if (this.canAttack) {
            this.performAttack();
        }
    }

    performAttack() {
        this.canAttack = false;
        this.attackTimer = this.attackCooldown;

        const combatSystem = this.node.getComponent('CombatSystem');
        if (combatSystem) {
            const direction = this.facingRight ? 1 : -1;
            (combatSystem as any).performAttack(direction);
        }
    }

    updateFacing() {
        let shouldFaceRight = this.facingRight;
        
        if (this.currentState === State.Chase || this.currentState === State.Attack) {
            shouldFaceRight = this.player!.position.x > this.node.position.x;
        } else if (this.isPatrolling) {
            shouldFaceRight = this.currentTarget.x > this.node.position.x;
        }

        if (shouldFaceRight !== this.facingRight) {
            this.facingRight = shouldFaceRight;
            const scale = this.node.scale;
            this.node.scale = new Vec3(-scale.x, scale.y, scale.z);
        }
    }
}
