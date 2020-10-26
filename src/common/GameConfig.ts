import { Singleton } from "@/types";
import { GameEvent } from "./GameEvent";
import { msToFrame } from "../../h5-game-util/util/frameUtil";
import { EventCenter } from "@/util/EventCenter";
import { CommandManager } from "./CommandManager";
import { CommandName } from "./CommandManager/CommandFactory";
import { MedalInfo } from "game/Cmds/GetConfigMemberCmd";
const parseUrl = require('query-string').parseUrl;
/**游戏描述 */
export interface GameDesc {
    descriptionWeb: string,
    precautions: string,
    wearGlasses: boolean,
    descriptionPad: string,
    totalLevel: number
}
/**关卡配置 */
export interface LevelConfig {
    resource: any;
    modeList: Array<any>;
}

export enum PlayMode {
    userPlay = 'userPlay',
    playback = 'playback'
}

export class GameConfig extends Singleton {
    public static get i(): GameConfig {
        return super.getInstance();
    }
    //--------------------回放功能相关配置------------------------
    /**回放id */
    public get playbackId() {
        return <string>parseUrl(location.href).query['playbackId'] || null
    }
    /**训练id */
    public get trainingId() {
        return <string>parseUrl(location.href).query['trainingId'] || null
    }
    //===========通用配置=============
    public gameDesc: GameDesc;
    public randomSeed: number;
    public modeList: Array<any>;
    public beginLevel: number;
    public gameDuration: number;
    public medalInfo: MedalInfo;
    public trainingEyeType:string;
    public fusionTrainingType: string;
    //----以下由场景切换命令赋值---------------
    public levelConfig: LevelConfig;
    public isPad:boolean;
    public async initAsync() {
        let result;
        if (this.playMode == PlayMode.userPlay) {
            result = await CommandManager.i.pushCommandInfo({ cmdName: CommandName.GetConfigMemberCmd })
        } else {
            let cmd = CommandManager.i.findCmd((cmd) => {
                return cmd.cmdName == CommandName.GetConfigMemberCmd
            }, 0, 1);
            result = await cmd.execute()
        }
        this.randomSeed = result.randomSeed;
        this.gameDesc = result.gameDesc;
        this.modeList = result.modeList;
        this.beginLevel = result.beginLevel;
        this.gameDuration = result.gameDuration;
        this.medalInfo = result.medalInfo;
        this.trainingEyeType = result.trainingEyeType;
        this.fusionTrainingType = result.fusionTrainingType;
        EventCenter.i.emit(GameEvent.gameConfigInited);
    }

    public get playMode(): PlayMode {
        let mode = PlayMode.userPlay;
        if (this.playbackId) {
            mode = PlayMode.playback
        }
        return mode;
    }
    /**游戏id */
    public get gameId() {
        return '3FA99E88-972B-4D0D-A545-26BC9CCFC8F3';
    }
    /**存储命令条数的最小值 */
    public get cmdSaveThreshold() {
        return 20;
    }
    /**多久跑一帧 */
    public get frameStep(): number {
        return 1000/60; // 约为 16.66666
    }
    /** ms转换为frame */
    public toFrame(ms: number) {
        return msToFrame(ms, this.frameStep);
    }
    //===================具体游戏配置===================
    //-------------------后端给的配置-------------------
    /**游戏逻辑配置表 */
    public get configTable() {
        return this.levelConfig.resource.config;
    }

    public get fishNumber(): number {
        return this.configTable.fishNumber.value;
    }

    public get fishScale(): number {
        return this.configTable.fishScale.value;
    }

    public get moveSpeed(): number {
        return this.configTable.moveSpeed.value;
    }

    public get offset(): number {
        return this.configTable.offset.value;
    }

    public get chance(): number {
        return this.configTable.chance.value;
    }

    public get addScore(): number {
        return this.configTable.addScore.value;
    }

    public get subScore(): number {
        return this.configTable.subScore.value;
    }
}

(<any>window).GameConfig = GameConfig