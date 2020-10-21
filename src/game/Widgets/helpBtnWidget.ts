import { HelpBtn } from '@/components/index';;
import { UIManager, LayerType } from '@/util/UIManager';
import { getTipDialog } from 'game/Popups/tipDialog';
let helpBtnWidget: HelpBtn;
export function addHelpBtnWidget() {
    helpBtnWidget = new HelpBtn();
    helpBtnWidget.setBgColor('#CC00CC');
    helpBtnWidget.addEventListener('mousedown', () => {
        let tipDialog = getTipDialog()
        tipDialog.show();
    }, true)
    UIManager.i.addToStageByLayer(helpBtnWidget, LayerType.widget);
}

export function getHelpBtnWidget(){
    return helpBtnWidget;
}
