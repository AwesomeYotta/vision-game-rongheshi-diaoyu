import { Singleton } from "@/types";
import { EventCenter } from "@/util/EventCenter";
import { GameEvent } from "./GameEvent";
import { res, ResId } from './GameRes'
import messager, { ErrorType, ErrorObj } from '@/util/messager';
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
        let errObj: ErrorObj = {
            type: ErrorType.GAME_WARNING,
            code: 'SHOW_ALERT',
            message: '音效打开失败，请点击[操作说明]窗口的音效开关重试',
            content: ''
        };
        if (!this.soundOpen) {
            let instance = createjs.Sound.play(ResId.bgMp3, { interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1 });
            (<any>window).au = instance;
            if (instance.playState !== 'playSucceeded') {
                messager.sendError(errObj);
            } else {
                this._soundOpen = true;
            }
        } else {
            createjs.Sound.stop();
            if((<any>window).au.playState !== 'playFinished') {
                errObj.message = errObj.message.replace('打开', '关闭');
                messager.sendError(errObj);
            } else {
                this._soundOpen = false;
            }
        }
        return this._soundOpen;
    }
}