import MedalDialog from '@/html-components/MedalDialog';
import { EventCenter } from '@/util/EventCenter';
import { GameEvent } from '../../common/GameEvent';
import { GameConfig } from '../../common/GameConfig';
let medalDialog: MedalDialog;
let isSucceed: boolean;
export function addMedalDialog ()  {
    medalDialog = new MedalDialog();
    medalDialog.close = () => {
        EventCenter.i.emit(GameEvent.beforeReplaceScene, isSucceed);
    }

    EventCenter.i.addListener(GameEvent.medalDialogShow, (isUpgrade:boolean) => {
        isSucceed = isUpgrade;
        medalDialog.traningDays = GameConfig.i.medalInfo.trainingDays;
        medalDialog.medalUrl = GameConfig.i.medalInfo.medalUrl;
        medalDialog.show();
    }, null);
}