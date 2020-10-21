import { EventCenter } from "@/util/EventCenter";
import { GameEvent } from "./GameEvent";
import { GameConfig } from './GameConfig'
import { CommandManager } from "./CommandManager";
import { CommandName } from "./CommandManager/CommandFactory";
/**玩家信息 */
export default class UserData {
    private static _instance: UserData;
    public static get i(): UserData {
        if (!this._instance) {
            this._instance = new this();
        }
        return this._instance;
    }

    private _level: number;
    private _score: number;
    private _totalScore: number;
    private _chance: number;
    public rightTimes: number;
    public errorTimes: number;

    private constructor() {
        this.addListeners();
    }
    /**必须在游戏开始前初始化 */
    public init() {
        this._level = GameConfig.i.beginLevel;
        this._score = 0;
        this._totalScore = 0;
        this._chance = 0;
        this.rightTimes = 0;
        this.errorTimes = 0;
    }

    public get level(): number {
        return this._level;
    }

    public get score() {
        return this._score;
    }

    public get totalScore() {
        return this._totalScore;
    }

    public get chance() {
        return this._chance;
    }

    public set totalScore(value: number) {
        this._totalScore = value;
    }

    public set score(value: number) {
        if(value >= 0) {
            this._score = value;
            EventCenter.i.emit(GameEvent.scoreChange, this.score);
        }
    }

    public set level(value: number) {
        this._level = value;
    }

    public set chance(value:number) {
        this._chance = value;
        EventCenter.i.emit(GameEvent.chanceChange, this.chance);
        if(value === 0) {
            EventCenter.i.emit(GameEvent.fail);
            CommandManager.i.pushCommandInfo({
                cmdName: CommandName.ReplaceSceneCmd,
                isUpgrade: false
            })
        }
    }

    private addListeners() {
        EventCenter.i.addListener(GameEvent.right, this.handleRight, this);
        EventCenter.i.addListener(GameEvent.wrong, this.handleWrong, this);
        EventCenter.i.addListener(GameEvent.resultDialogConfirmed, this.addLevel, this);
    }

    private handleRight() {
        this.score += GameConfig.i.addScore;
        this.rightTimes++;
    }

    private handleWrong() {
        this.chance--;
        this.errorTimes++;
        this.score -= GameConfig.i.subScore;
    }

    private addLevel(isWin:boolean) {
        this.score = 0;
        this.errorTimes = 0;
        this.rightTimes = 0;
        if(isWin) {
            EventCenter.i.emit(GameEvent.levelChange, this.level);
        }
    }

    public save() {
        localStorage.setItem("UserData", JSON.stringify(this));
    }

     /**非正常手段更改了用户数据，需要调用此函数 */
     public emitChange() {
        EventCenter.i.emit(GameEvent.scoreChange);
        EventCenter.i.emit(GameEvent.levelChange);
    }
}