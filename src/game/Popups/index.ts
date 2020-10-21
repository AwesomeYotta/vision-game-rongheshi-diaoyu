import { addTipDialog } from "./tipDialog";
import { addResultDialog } from "./resultDialog";
import { addMedalDialog } from "./medalDialog";
import { addTrainingTipDialog } from "./trainingTipDialog";
import { addQuitWaitDialog } from "./quitWaitDialog ";
import { GameConfig, PlayMode } from "common/GameConfig";
export function addPopups(){
    if(GameConfig.i.playMode == PlayMode.userPlay) {
        addTipDialog();
        addResultDialog();
        addMedalDialog();
        addTrainingTipDialog();
        addQuitWaitDialog();
    }
}