import UserData from "common/UserData";
import { ResultMgr } from "@/util/ResultMgr";
import { randomRangeInt } from "@/util/Random";
import { CommandManager } from "common/CommandManager";
import { CommandName } from "common/CommandManager/CommandFactory";
export enum LevelState {
    success = 'success',
    fail = 'fail',
    incomplete = 'incomplete'
}

export function pushResult(levelState:LevelState) {
    ResultMgr.i.pushResultInfo({
        /**当前关卡 */
        levelNum: UserData.i.level,
        /**分数 */
        score: UserData.i.score,
        /**星星 */
        starLevel: levelState == LevelState.success ? randomRangeInt(4, 6) : 0,
        /**刺激等级 */
        stimulusLevel: 1
    })

    let commandInfo = Object.assign({
        cmdName: CommandName.ResultCmd,
        levelState: levelState,
        timestamp: Date.now(),
        rightTimes: UserData.i.rightTimes,
        errorTimes: UserData.i.errorTimes
    }, ResultMgr.i.getThisLevelSummary());
    
    CommandManager.i.pushCommandInfo(commandInfo);
}