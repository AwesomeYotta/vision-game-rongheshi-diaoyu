import { EventCenter } from '@/util/EventCenter';
import { GameEvent } from '../../common/GameEvent';
import { GeneralTextWidget } from '@/components/Widgets/GeneralTextWidget';
import { UIManager, LayerType } from '@/util/UIManager';
import UserData from 'common/UserData';

export function addLevelWidget() {
    let levelWidget = new GeneralTextWidget({ right: 300, top: 20 });
    levelWidget.pushView('关卡：')
    let view = levelWidget.pushView(UserData.i.level);
    view.x += 10;
    UIManager.i.addToStageByLayer(levelWidget, LayerType.widget);
    EventCenter.i.addListener(GameEvent.levelChange, () => {
        view.text = UserData.i.level.toString();
    }, null);
}