import QuitWaitDialog from '@/html-components/quitWaitDialog';
import { EventCenter } from '@/util/EventCenter';
import { GameEvent } from '../../common/GameEvent';
import { gameGlobal } from '../../main';
let quitWaitDialog: QuitWaitDialog;

export function addQuitWaitDialog ()  {
    quitWaitDialog = new QuitWaitDialog();
    quitWaitDialog.confirm = () => {
        gameGlobal.quit();
    }

    EventCenter.i.addListener(GameEvent.showQuitWaitDialog, () => {
        quitWaitDialog.show();
    }, null);
}

export function closeQuitWaitDialog() {
    setTimeout(() => {
        quitWaitDialog.waitFinished();
    }, 1000);
}