import { _decorator, Component, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {

    @property
    musicVolume: number = 0.5;

    @property
    soundVolume: number = 0.7;

    private static instance: AudioManager | null = null;

    public static getInstance(): AudioManager | null {
        return AudioManager.instance;
    }

    onLoad() {
        if (AudioManager.instance && AudioManager.instance !== this) {
            this.node.destroy();
            return;
        }
        AudioManager.instance = this;
        director.addPersistRootNode(this.node);
    }

    playBGM(bgmType: string = 'game') {
        console.log('播放背景音乐:', bgmType);
    }

    stopBGM() {
        console.log('停止背景音乐');
    }

    playSound(soundType: string) {
        console.log('播放音效:', soundType);
    }

    setMusicVolume(volume: number) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    setSoundVolume(volume: number) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }

    pauseAll() {
        console.log('暂停所有音频');
    }

    resumeAll() {
        console.log('恢复所有音频');
    }

    stopAll() {
        this.stopBGM();
        console.log('停止所有音效');
    }
}
