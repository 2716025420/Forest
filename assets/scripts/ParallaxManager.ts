import { _decorator, Component, Node, Sprite, Vec3, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

interface ParallaxLayer {
    sprite: Sprite;
    speedRatio: number;
    originalPosition: Vec3;
}

@ccclass('ParallaxManager')
export class ParallaxManager extends Component {

    @property([Node])
    parallaxLayers: Node[] = [];

    @property([CCFloat])
    speedRatios: number[] = [];

    @property(Node)
    cameraTarget: Node | null = null;

    private layers: ParallaxLayer[] = [];
    private camera: Node | null = null;
    private lastCameraX: number = 0;
    private lastCameraY: number = 0;

    onLoad() {
        const cameraComp = this.node.parent?.getComponentInChildren('Camera');
        if (cameraComp) {
            this.camera = cameraComp.node;
        }
        
        if (!this.cameraTarget && this.camera) {
            this.cameraTarget = this.camera;
        }

        this.initLayers();
    }

    start() {
        if (this.cameraTarget) {
            this.lastCameraX = this.cameraTarget.position.x;
            this.lastCameraY = this.cameraTarget.position.y;
        }
    }

    initLayers() {
        for (let i = 0; i < this.parallaxLayers.length; i++) {
            const layerNode = this.parallaxLayers[i];
            const sprite = layerNode.getComponent(Sprite);
            
            if (sprite) {
                const speedRatio = this.speedRatios[i] || 0.5;
                this.layers.push({
                    sprite: sprite,
                    speedRatio: speedRatio,
                    originalPosition: new Vec3(
                        layerNode.position.x,
                        layerNode.position.y,
                        layerNode.position.z
                    )
                });
            }
        }
    }

    update(dt: number) {
        if (!this.cameraTarget) return;

        const cameraX = this.cameraTarget.position.x;
        const cameraY = this.cameraTarget.position.y;

        const deltaX = cameraX - this.lastCameraX;
        const deltaY = cameraY - this.lastCameraY;

        for (const layer of this.layers) {
            const layerNode = layer.sprite.node;
            layerNode.position = new Vec3(
                layerNode.position.x - deltaX * layer.speedRatio,
                layerNode.position.y - deltaY * layer.speedRatio,
                layerNode.position.z
            );
        }

        this.lastCameraX = cameraX;
        this.lastCameraY = cameraY;
    }

    addLayer(layerNode: Node, speedRatio: number) {
        const sprite = layerNode.getComponent(Sprite);
        if (sprite) {
            this.parallaxLayers.push(layerNode);
            this.speedRatios.push(speedRatio);
            this.layers.push({
                sprite: sprite,
                speedRatio: speedRatio,
                originalPosition: new Vec3(
                    layerNode.position.x,
                    layerNode.position.y,
                    layerNode.position.z
                )
            });
        }
    }

    resetLayers() {
        for (const layer of this.layers) {
            layer.sprite.node.position = new Vec3(
                layer.originalPosition.x,
                layer.originalPosition.y,
                layer.originalPosition.z
            );
        }

        if (this.cameraTarget) {
            this.lastCameraX = this.cameraTarget.position.x;
            this.lastCameraY = this.cameraTarget.position.y;
        }
    }

    setCameraTarget(target: Node) {
        this.cameraTarget = target;
        if (target) {
            this.lastCameraX = target.position.x;
            this.lastCameraY = target.position.y;
        }
    }
}
