import { Singleton } from "@/types";
import { EventCenter } from "@/util/EventCenter";
import { GameEvent } from "./GameEvent";
import { res, ResId } from './GameRes'

export default class GameAudio extends Singleton {
    public static get i(): GameAudio {
        return super.getInstance();
    }
    private _soundOpen: boolean = false;
    private constructor() {
        super();
    }

    public init() {
        this.addListeners();
    }

    private addListeners() {
        EventCenter.i.addListener(GameEvent.right, () => {
            this.playOnce(ResId.clickMp3)
        }, this);

        EventCenter.i.addListener(GameEvent.wrong, () => {
            this.playOnce(ResId.wrongMp3)
        }, this);


        EventCenter.i.addListener(GameEvent.fail, () => {
            this.playOnce(ResId.failMp3)
        }, this);

        EventCenter.i.addListener(GameEvent.completed, () => {
            this.playOnce(ResId.completeMp3)
        }, this);
    }
    /**播放一次声音 */
    private playOnce(id: ResId) {
        if (this.soundOpen) {
            createjs.Sound.play(id, { interrupt: createjs.Sound.INTERRUPT_ANY });
        }
    }
    /**是否是开启状态 */
    public get soundOpen(): boolean {
        return this._soundOpen;
    }
    /**开启或关闭声音，返回toggle后声音是否是开启状态 */
    public toggleSound() {
        this._soundOpen = !this.soundOpen;
        if (this.soundOpen) {
            let instance = createjs.Sound.play(ResId.bgMp3, { interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1 });
            (<any>window).au = instance;

        } else {
            createjs.Sound.stop();
        }
        return this._soundOpen;
    }
}