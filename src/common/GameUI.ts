import GameScene from '../game/GameScene';
import GameBg from '@/components/GameBg';
import {UIFactory}from '@/util/UIManager'

export enum UIName {
	GameBg = 'GameBg',
	GameScene = 'GameScene',
}

UIFactory.i.regUI(UIName.GameBg,GameBg);
UIFactory.i.regUI(UIName.GameScene,GameScene);