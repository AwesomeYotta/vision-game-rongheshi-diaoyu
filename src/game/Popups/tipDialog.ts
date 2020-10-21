import TipDialog from '@/html-components/TipDialog';
import GameAudio from '../../common/GameAudio';
import { GameConfig } from '../../common/GameConfig';
import { EventCenter } from '@/util/EventCenter';
import { GameEvent } from '../../common/GameEvent';
import UserData from '../../common/UserData';
import { gameGlobal } from '../../main';
import isPad from '@/util/isPad';

let tipDialog: TipDialog;
export function addTipDialog() {
    tipDialog = new TipDialog({
        soundOn: false,
        themeColor: '#CC00CC',
        level: UserData.i.level,
        levelTitle: '等级',
        confirm: () => {
            tipDialog.dismiss();
            gameGlobal.continue();
        },
        soundClick: () => {
            tipDialog.soundOn = GameAudio.i.toggleSound()
        }
    });

    //游戏配置init后，可以获取游戏描述
    let { descriptionWeb, precautions, wearGlasses, descriptionPad } = GameConfig.i.gameDesc
    tipDialog.desc = isPad ? descriptionPad : descriptionWeb;
    tipDialog.tips = precautions.split(';');
    tipDialog.wearGlasses = wearGlasses;

    EventCenter.i.addListener(GameEvent.completed, () => {
        UserData.i.totalScore += UserData.i.score;
        tipDialog.score = UserData.i.totalScore;
    }, null)
    
    EventCenter.i.addListener(GameEvent.levelChange, () => {
        tipDialog.level = UserData.i.level;
    }, null);


    tipDialog.beforeShow = () => {
        gameGlobal.pause();
    }
}

export function getTipDialog() {
    return tipDialog;
}