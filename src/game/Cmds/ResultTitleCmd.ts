import { Command } from "../../common/CommandManager/Command";
/**前端根据该命令的content的，显示resultCmd字段的汉语解释 */
export class ResultTitleCmd extends Command {
    private content: string;
    constructor() {
        super();
        let content = {
            levelNum: '关卡',
            levelState: "闯关结果",
            passTime: "闯关时间",
            score: "得分",
            rightTimes: "点对次数",
            errorTimes: "点错次数"
        }
        this.content = JSON.stringify(content);
    }
    public execute() {

    }
}