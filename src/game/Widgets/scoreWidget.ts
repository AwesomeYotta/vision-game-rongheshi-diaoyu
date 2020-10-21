import { EventCenter } from '@/util/EventCenter';
import { GameEvent } from '../../common/GameEvent';
import { GeneralTextWidget } from '@/components/Widgets/GeneralTextWidget';
import { UIManager, LayerType } from '@/util/UIManager';
import UserData from 'common/UserData';

export function addScoreWidget() {
    let scoreWidget = new GeneralTextWidget({ right: 210, top: 20 });
    scoreWidget.pushView('得分：')
    let view = scoreWidget.pushView(UserData.i.score);
    view.x += 10;
    UIManager.i.addToStageByLayer(scoreWidget, LayerType.widget);
    EventCenter.i.addListener(GameEvent.scoreChange, () => {
        view.text = UserData.i.score.toString();
    }, null);
}