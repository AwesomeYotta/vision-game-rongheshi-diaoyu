import { Command } from "common/CommandManager/Command";
import { UIManager, LayerType } from "@/util/UIManager";
import { GameConfig, PlayMode } from "common/GameConfig";
import { IDUtil } from "@/util/IDUtil";
import UserData from "common/UserData";
import { LH } from "@/util/LH";
import { UIName } from "common/GameUI";
import { clearAllFrameout, setFrameout } from "@/util/frameUtil";
import { EventCenter } from "@/util/EventCenter";
import { GameEvent } from "common/GameEvent";
import { CommandManager } from "common/CommandManager";
import $http from 'http/HttpRequest'
import { gameGlobal } from "../../main";
import isPad from "@/util/isPad";
/**切换场景命令 */
export class ReplaceSceneCmd extends Command {
    /**游戏场景是否是第一次进入舞台 */
    private isFirstSceneCmd: boolean
    //----以下成员变量，不需要在commandInfo中指定-------
    private userData: any = {};
    /**IDUtil的下一个id */
    private nextID: number;
    /**当前随机数被调的次数 */
    private randomCalled: number;
    /**游戏剩余毫秒数 */
    private countDownRemainMS: number;
    /**是否是升级导致的切换 */
    private isUpgrade: boolean;
    /**下一关的配置 */
    private levelConfig: any;
    private isPad:boolean;
    constructor() {
        super();
    }
    /**只有userplay模式下该方法内才真有异步操作*/
    public async execute() {
        clearAllFrameout();//清除上一个场景的超帧回调
        if (GameConfig.i.playMode == PlayMode.userPlay) {
            if (this.isFirstSceneCmd) {//第一次进入舞台，不弹弹窗
                await this.prepareDataForNextScene();
                this.replaceSceneUserplay();
                if(GameConfig.i.trainingEyeType && GameConfig.i.trainingEyeType !== 'UNKNOWN') {
                    setFrameout(() => {
                        gameGlobal.pause();
                        EventCenter.i.emit(GameEvent.showTrainingTipDialog);
                    }, GameConfig.i.toFrame(200))
                }
            } else {
                gameGlobal.pause();
                let nextScenePreparedPromise: Promise<any>;
                EventCenter.i.once(GameEvent.resultDialogConfirmed, () => {
                    nextScenePreparedPromise.then(() => {
                        this.replaceSceneUserplay();
                        gameGlobal.continue();
                    })
                }, this);
                //准备下一个场景的数据
                EventCenter.i.once(GameEvent.requestNextScene, () => {
                    nextScenePreparedPromise = this.prepareDataForNextScene();
                }, this);

                if(GameConfig.i.medalInfo.hasGotMedal) {
                    EventCenter.i.emit(GameEvent.medalDialogShow, this.isUpgrade);
                    GameConfig.i.medalInfo.hasGotMedal = false;
                } else {
                    EventCenter.i.emit(GameEvent.beforeReplaceScene, this.isUpgrade);
                }
            }
        } else {
            this.replaceScenePlayback();
        }
    }
    /**为下一个场景准备重要数据，回放时从保存的成员变量里取 */
    private async prepareDataForNextScene() {
        this.nextID = IDUtil.i.peekNextID();
        this.randomCalled = LH.getRandomCalled();
        if (this.isUpgrade) {
            UserData.i.level++;
        }
        Object.assign(this.userData, UserData.i);
        //拉下一关配置
        this.levelConfig = await $http.getLevelConfig(GameConfig.i.gameId, UserData.i.level);
        GameConfig.i.levelConfig = this.levelConfig;
        GameConfig.i.isPad = this.isPad = !!isPad;
        CommandManager.i.save();//保存命令
    }
    /**玩家模式的切换 */
    private async replaceSceneUserplay() {
        UIManager.i.replaceScene(UIName.GameScene);
        let resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);//为了保存存储用户舞台大小，回放的时候使用;
    }
    /**回放模式下的切换 */
    private async replaceScenePlayback() {
        IDUtil.i.setNextID(this.nextID);
        LH.setRandomCalled(this.randomCalled, GameConfig.i.randomSeed);
        GameConfig.i.levelConfig = this.levelConfig;
        GameConfig.i.isPad = this.isPad;
        Object.assign(UserData.i, this.userData);//回放时，取之前保存的信息
        UserData.i.emitChange();
        await UIManager.i.replaceScene(UIName.GameScene, null, this.levelConfig);
    }
}