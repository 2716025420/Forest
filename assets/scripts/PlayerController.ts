import { _decorator, Component, Node, input, Input, EventKeyboard, KeyCode, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    moveSpeed: number = 200;

    @property
    jumpForce: number = 400;

    @property
    dashSpeed: number = 500;

    @property
    dashDuration: number = 0.3;

    @property
    dashCooldown: number = 1.0;

    @property(Node)
    attackHitbox: Node | null = null;

    private isGrounded: boolean = false;
    private isDashing: boolean = false;
    private canDash: boolean = true;
    private isAttacking: boolean = false;
    private facingRight: boolean = true;
    private dashTimer: number = 0;
    private dashCooldownTimer: number = 0;
    
    private keys: Map<KeyCode, boolean> = new Map();

    onLoad() {
        if (this.attackHitbox) {
            this.attackHitbox.active = false;
        }

        this.setupInput();
    }

    setupInput() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        this.keys.set(event.keyCode, true);
        
        switch (event.keyCode) {
            case KeyCode.SPACE:
            case KeyCode.KEY_W:
                this.jump();
                break;
            case KeyCode.KEY_J:
                this.attack();
                break;
            case KeyCode.KEY_K:
            case KeyCode.SHIFT_LEFT:
                this.dash();
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        this.keys.set(event.keyCode, false);
    }

    isKeyPressed(keyCode: KeyCode): boolean {
        return this.keys.get(keyCode) === true;
    }

    update(dt: number) {
        if (this.isDashing) {
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
        }

        if (!this.canDash) {
            this.dashCooldownTimer -= dt;
            if (this.dashCooldownTimer <= 0) {
                this.canDash = true;
            }
        }

        if (!this.isDashing && !this.isAttacking) {
            this.handleMovement();
        }
    }

    handleMovement() {
        let horizontalInput = 0;
        
        if (this.isKeyPressed(KeyCode.KEY_A) || this.isKeyPressed(KeyCode.ARROW_LEFT)) {
            horizontalInput = -1;
            if (this.facingRight) {
                this.flip();
            }
        } else if (this.isKeyPressed(KeyCode.KEY_D) || this.isKeyPressed(KeyCode.ARROW_RIGHT)) {
            horizontalInput = 1;
            if (!this.facingRight) {
                this.flip();
            }
        }
    }

    jump() {
        if (!this.isGrounded) return;
        
        this.isGrounded = false;
        this.playSound('jump');
    }

    dash() {
        if (!this.canDash || this.isDashing) return;

        this.isDashing = true;
        this.canDash = false;
        this.dashTimer = this.dashDuration;
        this.dashCooldownTimer = this.dashCooldown;

        this.playSound('dash');
    }

    attack() {
        if (this.isAttacking) return;

        this.isAttacking = true;
        
        if (this.attackHitbox) {
            this.attackHitbox.active = true;
        }

        this.scheduleOnce(() => {
            if (this.attackHitbox) {
                this.attackHitbox.active = false;
            }
            this.isAttacking = false;
        }, 0.3);

        this.playSound('attack');
    }

    flip() {
        this.facingRight = !this.facingRight;
        const scale = this.node.scale;
        this.node.scale = new Vec3(-scale.x, scale.y, scale.z);
    }

    playSound(soundType: string) {
    }
}
