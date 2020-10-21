import { Singleton, Class } from "@/types";
import { Command } from './Command';
import { ResizeStageCmd } from 'game/Cmds/ResizeStageCmd';
import { MouseMove, MouseClickCmd } from 'game/Cmds/MouseEventCmd';
import { ReplaceSceneCmd } from 'game/Cmds/ReplaceSceneCmd'
import { GetConfigMemberCmd } from 'game/Cmds/GetConfigMemberCmd';
import { ResultCmd } from "game/Cmds/ResultCmd";
import { ResultTitleCmd } from "game/Cmds/ResultTitleCmd";
export interface CommandInfo {
    cmdName: CommandName,
    gameObjectID?: number,
    [propName: string]: any
}
export enum CommandName {
    MouseMove = "MouseMove",
    MouseClickCmd = "MouseClickCmd",
    ResizeStageCmd = "ResizeStageCmd",
    /**切换场景 */
    ReplaceSceneCmd = 'ReplaceSceneCmd',
    /**获取配置类成员变量 */
    GetConfigMemberCmd = 'GetConfigMemberCmd',
    ResultCmd = 'ResultCmd',
    ResultTitleCmd = 'ResultTitleCmd'
}
export class CommandFactory extends Singleton {
    public static get i(): CommandFactory {
        return super.getInstance();
    }

    private commandTypeMap: Map<string, Class<Command>> = new Map();

    public init() {
        this.reg(CommandName.MouseClickCmd, MouseClickCmd);
        this.reg(CommandName.MouseMove, MouseMove);
        this.reg(CommandName.ResizeStageCmd, ResizeStageCmd);
        this.reg(CommandName.ReplaceSceneCmd, ReplaceSceneCmd);
        this.reg(CommandName.GetConfigMemberCmd, GetConfigMemberCmd);
        this.reg(CommandName.ResultCmd, ResultCmd);
        this.reg(CommandName.ResultTitleCmd, ResultTitleCmd);
    }

    public reg(name: CommandName, clazz: Class<Command>) {
        this.commandTypeMap.set(name, clazz);
    }

    public create(info: CommandInfo): Command {
        let CmdClass = this.commandTypeMap.get(info.cmdName);
        let cmd = new CmdClass();
        cmd.set(info);
        return cmd;
    }
}
