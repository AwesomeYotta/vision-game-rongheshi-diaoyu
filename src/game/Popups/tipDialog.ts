import FuseTipDialog from '@/html-components/FuseTipDialog';
import GameAudio from '../../common/GameAudio';
import { GameConfig } from '../../common/GameConfig';
import { EventCenter } from '@/util/EventCenter';
import { GameEvent } from '../../common/GameEvent';
import UserData from '../../common/UserData';
import { gameGlobal } from '../../main';
import isPad from '@/util/isPad';

let tipDialog: FuseTipDialog;
export function addTipDialog() {
    tipDialog = new FuseTipDialog({
        soundOn: false,
        themeColor: '#CC00CC',
        level: UserData.i.level,
        levelTitle: '等级',
        radios : [
            {
                values: [
                    {
                        label: '分开',
                        value: 'on'
                    }, {
                        label: '辐辏',
                        value: 'off'
                    }
                ],
                cb: () => {
                },
    
                checked: 'on',
                ballColor: 'rgb(0, 193, 222)',
                ballUncheckColor: 'rgb(189, 189, 189)'
            }
        ],
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
        _refreshFusionTrainingType();
        gameGlobal.pause();
    }

    function _refreshFusionTrainingType () {
        let separate = GameConfig.i.fusionTrainingType == 'CONVERGE' ? "off" : 'on';
        let converge = GameConfig.i.fusionTrainingType == 'SEPARATE' ? "off" : 'on';
        let radios = [{
            values: [
                {
                    label: '分开',
                    value: separate
                }, {
                    label: '辐辏',
                    value: converge
                }
            ],

            cb: () => {
            },

            checked: 'on',
            ballColor: 'rgb(2, 170, 196)',
            ballUncheckColor: 'rgb(189, 189, 189)',
        }];

        tipDialog.radios = radios;
    }
}

export function getTipDialog() {
    return tipDialog;
}