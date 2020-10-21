import { EventCenter } from '@/util/EventCenter';
import { GameEvent } from '../../common/GameEvent';
import { GameConfig } from 'common/GameConfig';
import { CountDownWidget } from '@/components/Widgets/CountDownWidget'
import { UIManager, LayerType } from '@/util/UIManager';
let countDownWidget: CountDownWidget
export function addCountDown() {
    countDownWidget = new CountDownWidget(1000 * GameConfig.i.gameDuration, { showCountDownText: true });
    countDownWidget.on('end', () => {
        EventCenter.i.emit(GameEvent.gameEnd);
    })
    UIManager.i.addToStageByLayer(countDownWidget, LayerType.widget);
}

export function getCountDown(){
    return countDownWidget;
}