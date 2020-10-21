import { addCountDown } from "./countDownWidget";
import { addHelpBtnWidget } from "./helpBtnWidget";
import { addLevelWidget } from "./levelWidget";
import { addScoreWidget } from "./scoreWidget";
import { addChanceWidget } from "./chanceWidget";
export function addWidgets(){
    addCountDown();
    addHelpBtnWidget();
    addLevelWidget();
    addScoreWidget();
    addChanceWidget();
}