import { Command } from "common/CommandManager/Command";
import { GameConfig, PlayMode, GameDesc } from "common/GameConfig";
import $http from 'http/HttpRequest'
import { randomRangeInt } from "@/util/Random";
/**获取部分配置类的成员变量，非关卡配置 */
export interface MedalInfo {
    hasGotMedal: boolean,
    medalUrl: string,
    trainingDays: number
}
export class GetConfigMemberCmd extends Command {
    private gameDesc: GameDesc;
    private randomSeed: number;
    public modeList: any;
    public beginLevel: number;
    public gameDuration: number;
    public medalInfo: MedalInfo;
    private trainingEyeType:string;
    private fusionTrainingType:string;
    constructor() {
        super();
    }

    public async execute() {
        if (GameConfig.i.playMode == PlayMode.userPlay) {
            this.gameDesc = await $http.getGameInfoById(GameConfig.i.gameId) as any;
            this.randomSeed = randomRangeInt(0, 12345);
            let { level, modeList, gameDuration, hasGotMedal, medalUrl, trainingCount, trainingEyeType, fusionTrainingType } = await $http.getBeginLevel(GameConfig.i.gameId) as any;
            this.beginLevel = level;
            this.modeList = modeList;
            this.gameDuration = gameDuration;
            this.medalInfo = {
                hasGotMedal: hasGotMedal,
                medalUrl: medalUrl,
                trainingDays: trainingCount
            }
            this.trainingEyeType = trainingEyeType;
            this.fusionTrainingType = fusionTrainingType;
        }
        let result = {
            gameDesc: this.gameDesc,
            randomSeed: this.randomSeed,
            beginLevel: this.beginLevel,
            modeList: this.modeList,
            gameDuration: this.gameDuration,
            medalInfo: this.medalInfo,
            trainingEyeType: this.trainingEyeType,
            fusionTrainingType: this.fusionTrainingType
        }
        return result;
    }
}
