import ResultDialog from '@/html-components/newResultDialog';
import { EventCenter } from '@/util/EventCenter';
import { GameEvent } from '../../common/GameEvent';
import { gameGlobal, GameExitType } from '../../main';
import { GameConfig } from '../../common/GameConfig';
import { ResultMgr } from '@/util/ResultMgr';
import { pushResult, LevelState } from '../../GameUtil';
let resultDialog: ResultDialog
export function addResultDialog() {
    ResultMgr.i.init({
        frameStep: GameConfig.i.frameStep
    });
    resultDialog = new ResultDialog();
    resultDialog.maxLevelCounts = GameConfig.i.gameDesc.totalLevel;
    resultDialog.close = () => {
        EventCenter.i.emit(GameEvent.resultDialogConfirmed, resultDialog.win);
    }

    EventCenter.i.addListener(GameEvent.beforeReplaceScene, (isUpgrade: boolean) => {
        pushResult(isUpgrade ? LevelState.success : LevelState.fail);
        resultDialog.win = isUpgrade;
        resultDialog.thisLevelSummary = ResultMgr.i.getThisLevelSummary();
        resultDialog.summaryList = ResultMgr.i.getSummaryList();
        resultDialog.show();
        EventCenter.i.emit(GameEvent.requestNextScene);
    }, null);

    //游戏结束
    EventCenter.i.once(GameEvent.gameEnd, () => {
        gameGlobal.setGameEnd();
        resultDialog.finished = true;
        resultDialog.close = () => {
            gameGlobal.beforeQuit(GameExitType.normal);
        }
        resultDialog.show();
    }, null);
}
