import { EventCenter } from '@/util/EventCenter';
import { GameEvent } from '../../common/GameEvent';
import { GeneralTextWidget } from '@/components/Widgets/GeneralTextWidget';
import { UIManager, LayerType } from '@/util/UIManager';
import UserData from 'common/UserData';

export function addChanceWidget() {
    let chanceWidget = new GeneralTextWidget({ right: 400, top: 20 });
    chanceWidget.pushView('机会：')
    let view = chanceWidget.pushView(UserData.i.chance);
    view.x += 10;
    UIManager.i.addToStageByLayer(chanceWidget, LayerType.widget);
    EventCenter.i.addListener(GameEvent.chanceChange, () => {
        view.text = UserData.i.chance.toString();
    }, null);
}