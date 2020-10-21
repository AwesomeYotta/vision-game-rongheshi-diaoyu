import TrainingTipDialog from '@/html-components/TrainingTipDialog';
import { EventCenter } from '@/util/EventCenter';
import { GameEvent } from '../../common/GameEvent';
import { gameGlobal } from '../../main';
import { GameConfig } from 'common/GameConfig';
import { getTipDialog } from './tipDialog';
let trainingTipDialog: TrainingTipDialog;
export function addTrainingTipDialog ()  {
    trainingTipDialog = new TrainingTipDialog();
    trainingTipDialog.close = () => {
        gameGlobal.continue();
        getTipDialog().soundClick();
    }
    EventCenter.i.addListener(GameEvent.showTrainingTipDialog, () => {
        trainingTipDialog.trainingEyeType = GameConfig.i.trainingEyeType;
        trainingTipDialog.show();
    }, null);
}