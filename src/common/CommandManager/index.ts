import { gameGlobal } from '../../main';
import { CommandFactory, CommandInfo, CommandName} from './CommandFactory';
import { Singleton } from '@/types';
import { Command } from './Command';
import { EventCenter } from "@/util/EventCenter";
import { GameEvent } from "../../common/GameEvent";
import { savePlaybackInfo, getPlaybackInfo } from 'http/PlaybackInfo';
import { GameConfig, PlayMode } from 'common/GameConfig';

/**命令管理器 */
export class CommandManager extends Singleton {
    public static get i(): CommandManager {
        return super.getInstance();
    }

    private cmds: Array<Command> = [];
    private currentCmdIndex = 0;
    private ableToExecute: boolean = true;//executeCurrentCmds方法是否可以执行

    private constructor() { super() }
    public async initAsync() {
        CommandFactory.i.init();
        if (GameConfig.i.playMode == PlayMode.playback) {
            let cmdInfoList = await getPlaybackInfo();
            this.cmds = cmdInfoList.map(info => CommandFactory.i.create(info)) || [];
        }
    }
    /**执行命令流 */
    public executeCommandStream() {
        this.currentCmdIndex = 0;
        EventCenter.i.addListener(GameEvent.tick, this.executeCurrentCmds, this);
    }

    /**增加命令 */
    public pushCommandInfo(commandInfo: CommandInfo): any {
        if (GameConfig.i.playMode == PlayMode.playback) {
            return null;
        }
        let cmd = CommandFactory.i.create(commandInfo);
        this.cmds.push(cmd);
        return cmd.execute();
    }

    /**找到当前帧的命令并执行 */
    private executeCurrentCmds() {
        if (!this.ableToExecute) {
            return;
        }
        let frame = gameGlobal.getFrame();
        if (this.currentCmdIndex >= this.cmds.length) {
            return;
        }
        let cmd = this.cmds[this.currentCmdIndex];
        while (cmd && (cmd.frame <= frame)) {
            if ((this.currentCmdIndex == this.cmds.length - 1) && (cmd.cmdName == CommandName.ReplaceSceneCmd)) {
                return;
            }
            if (cmd.cmdName == CommandName.ReplaceSceneCmd) {
                this.ableToExecute = false;
                gameGlobal.setGameFrame(cmd.frame);
                break;
            } else {
                cmd.execute();
                this.currentCmdIndex++;
            }
            cmd = this.cmds[this.currentCmdIndex];
        }
    }

    public getCmds() {
        return this.cmds;
    }
    /**
     * @param filterFn 判断命令是否符合某个条件的函数
     * @param start 起始下标
     * @param step 间隔
     * @returns 满足该条件的命令索引
     */
    public findCmdIndex(filterFn: (cmd: Command) => boolean, start: number = 0, step: number = 1): number {
        let i = start;
        let length = this.cmds.length;
        while (i >= 0 && i < length) {
            let cmd = this.cmds[i];
            if (filterFn(cmd)) {
                return i;
            }
            i += step;
        }
        return -1;
    }
    /**和 findCmdIndex类似，但是返回结果为命令对象 */
    public findCmd(filterFn: (cmd: Command) => boolean, start: number = 0, step: number = 1) {
        let index = this.findCmdIndex(filterFn, start, step);
        return this.cmds[index];
    }
    /**当前执行要检测的命令索引 */
    public getCurrentCmdIndex() {
        return this.currentCmdIndex;
    }
    /**设置当前执行要检测的命令索引 */
    public setCmdIndex(index: number) {
        this.currentCmdIndex = index;
        this.ableToExecute = true;
    }
    /**命令总帧数 */
    public getTotalFrame() {
        return this.cmds[this.cmds.length - 1].frame;
    }
    /**
     * 保存命令，根据配置的最低保存数量进行保存
     * @param force 强制保存,不考虑条数
     */
    public async save(force: boolean = false) {
        if (GameConfig.i.playMode == PlayMode.userPlay) {
            if (force || this.cmds.length > GameConfig.i.cmdSaveThreshold) {
                let cmdsToSave = this.cmds;
                this.cmds = [];
                await savePlaybackInfo(cmdsToSave);
            }
        }
    }
}

(<any>window).cm = CommandManager.i;
