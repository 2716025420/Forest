import { _decorator, Component, Node, Vec3, Enum } from 'cc';
const { ccclass, property } = _decorator;

enum CollectibleType {
    Health,
    Energy,
    Coin
}

@ccclass('Collectible')
export class Collectible extends Component {

    @property({ type: Enum(CollectibleType) })
    itemType: CollectibleType = CollectibleType.Health;

    @property
    healAmount: number = 30;

    @property
    energyAmount: number = 25;

    @property
    coinValue: number = 10;

    @property
    autoCollect: boolean = true;

    @property
    bobHeight: number = 10;

    @property
    bobSpeed: number = 2;

    @property
    rotateSpeed: number = 30;

    private startPosition: Vec3 = new Vec3(0, 0, 0);
    private time: number = 0;

    onLoad() {
        this.startPosition = new Vec3(
            this.node.position.x,
            this.node.position.y,
            this.node.position.z
        );
    }

    update(dt: number) {
        this.time += dt;

        if (this.bobHeight > 0) {
            const bobOffset = Math.sin(this.time * this.bobSpeed) * this.bobHeight;
            this.node.position = new Vec3(
                this.startPosition.x,
                this.startPosition.y + bobOffset,
                this.startPosition.z
            );
        }

        if (this.rotateSpeed !== 0) {
            this.node.angle += this.rotateSpeed * dt;
        }
    }

    onCollect(collector: Node) {
        switch (this.itemType) {
            case CollectibleType.Health:
                this.applyHealthPickup(collector);
                break;
            case CollectibleType.Energy:
                this.applyEnergyPickup(collector);
                break;
            case CollectibleType.Coin:
                this.applyCoinPickup(collector);
                break;
        }

        this.playCollectSound();
        this.createCollectEffect();
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 0.1);
    }

    applyHealthPickup(collector: Node) {
        const healthSystem = collector.getComponent('HealthSystem');
        if (healthSystem) {
            (healthSystem as any).heal(this.healAmount);
            console.log('获得生命值: +' + this.healAmount);
        }
    }

    applyEnergyPickup(collector: Node) {
        console.log('获得能量: +' + this.energyAmount);
    }

    applyCoinPickup(collector: Node) {
        console.log('获得金币: +' + this.coinValue);
    }

    playCollectSound() {
    }

    createCollectEffect() {
        console.log('创建收集特效');
    }
}
