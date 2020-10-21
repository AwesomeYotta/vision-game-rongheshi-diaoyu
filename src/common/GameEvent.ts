import { EventCenter } from '@/util/EventCenter'
import { UIManager } from '@/util/UIManager';
import { Input } from '@/util/Input';
export enum GameEvent {
    tick = 'tick',
    /**游戏或者回放结束 */
    gameEnd = 'gameEnd',
    /** 游戏配置初始化完成 */
    gameConfigInited = 'gameConfigInited',
    //----------回放事件-------------
    /**进度条播放暂停按钮被点击 */
    playbackBtnClick = 'playbackBtnClick',
    //---------用户信息---------
    /** 场景快要切换了 */
    beforeReplaceScene = 'beforeReplaceScene',
    /** 等级改变 */
    levelChange = 'levelChange',
    /**分数改变 */
    scoreChange = 'scoreChange',
    // 机会数改变
    chanceChange = 'chanceChange',
    /**弹窗事件 */
    resultDialogConfirmed = 'resultDialogConfirmed',

    medalDialogConfirmed = 'medalDialogConfirmed',
    //-------------游戏逻辑------------
    right = 'right',
    wrong = 'wrong',
    fail = 'fail',
    completed = 'completed',
    finished = 'finished',
    medalDialogShow = 'medalDialogShow',
    requestNextScene = 'requestNextScene',
    showTrainingTipDialog = 'showTrainingTipDialog',
    showQuitWaitDialog = 'showQuitWaitDialog',
}

//封装舞台事件
export enum StageEvent {
    stagemousedown = 'stagemousedown',
    stagemousemove = 'stagemousemove',
    stagemouseup = 'stagemouseup'
}
let stageEventEnabled = true;
/**是否启动用户输入事件 */
export function setUserInputEnabled(enabled: boolean) {
    stageEventEnabled = enabled;
    UIManager.i.stage.mouseEnabled = enabled;
    UIManager.i.stage.mouseChildren = enabled;
    Input.i.setEnabled(enabled);
    Input.i.clear();//清除现有状态
}
const callbackCollection = new Map();
for (let eventName in StageEvent) {
    callbackCollection.set(eventName, (ev: createjs.MouseEvent) => {
        if (stageEventEnabled) {
            EventCenter.i.emit(eventName, ev);
        }
    })
}
export function addStageListeners(stage: createjs.Stage) {
    for (let eventName in StageEvent) {
        stage.addEventListener(eventName, callbackCollection.get(eventName), false)
    }
}
export function removeStageListeners(stage: createjs.Stage) {
    for (let eventName in StageEvent) {
        stage.removeEventListener(eventName, callbackCollection.get(eventName), false);
    }
}