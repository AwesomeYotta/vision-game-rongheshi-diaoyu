import { Command } from "../../common/CommandManager/Command";
/**闯关结果，可根据不同游戏，在push该command的时候赋值
 * levelState，timestamp必须要有
 */
export class ResultCmd extends Command {
    constructor() {
        super();
    }
    public execute() { }
}