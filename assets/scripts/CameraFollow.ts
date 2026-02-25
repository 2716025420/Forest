import { _decorator, Component, Node, Vec3, Camera, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraFollow')
export class CameraFollow extends Component {

    @property(Node)
    target: Node | null = null;

    @property
    smoothSpeed: number = 5.0;

    @property
    minX: number = -1000;

    @property
    maxX: number = 3000;

    @property
    minY: number = -500;

    @property
    maxY: number = 500;

    @property
    offset: Vec3 = new Vec3(0, 0, 0);

    private camera: Camera | null = null;

    onLoad() {
        this.camera = this.getComponent(Camera);
    }

    start() {
        if (!this.target) {
            this.findPlayer();
        }
    }

    findPlayer() {
        const player = find('GameObjects/Player');
        if (player) {
            this.target = player;
        }
    }

    update(dt: number) {
        if (!this.target) {
            this.findPlayer();
            return;
        }

        const targetPos = this.target.position;
        const desiredPosition = new Vec3(
            targetPos.x + this.offset.x,
            targetPos.y + this.offset.y,
            this.node.position.z
        );

        const clampedPosition = new Vec3(
            Math.max(this.minX, Math.min(this.maxX, desiredPosition.x)),
            Math.max(this.minY, Math.min(this.maxY, desiredPosition.y)),
            desiredPosition.z
        );

        const smoothedPosition = new Vec3(
            this.lerp(this.node.position.x, clampedPosition.x, this.smoothSpeed * dt),
            this.lerp(this.node.position.y, clampedPosition.y, this.smoothSpeed * dt),
            clampedPosition.z
        );

        this.node.position = smoothedPosition;
    }

    private lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    setTarget(newTarget: Node) {
        this.target = newTarget;
    }

    setBounds(minX: number, maxX: number, minY: number, maxY: number) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
    }

    snapToTarget() {
        if (!this.target) return;

        const targetPos = this.target.position;
        this.node.position = new Vec3(
            Math.max(this.minX, Math.min(this.maxX, targetPos.x + this.offset.x)),
            Math.max(this.minY, Math.min(this.maxY, targetPos.y + this.offset.y)),
            this.node.position.z
        );
    }

    shake(duration: number = 0.2, magnitude: number = 5) {
        this.scheduleOnce(() => {
            this.node.position = new Vec3(
                this.node.position.x + (Math.random() - 0.5) * magnitude * 2,
                this.node.position.y + (Math.random() - 0.5) * magnitude * 2,
                this.node.position.z
            );
        }, 0.02);
    }
}
