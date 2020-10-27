import { ViewBase } from '@/util/UIManager/ViewBase'
import { GameConfig, PlayMode } from '../common/GameConfig';
import { EventCenter } from '@/util/EventCenter';
import { GameEvent, StageEvent } from 'common/GameEvent';
import { CommandManager } from 'common/CommandManager';
import { CommandName } from 'common/CommandManager/CommandFactory';
import { IDUtil } from '@/util/IDUtil';
import { res, ResId } from 'common/GameRes';
import CompositeImage from './CompositeImage';
import { UIManager } from '@/util/UIManager';
import { MouseMove } from './Cmds/MouseEventCmd';
import { getRandomRect } from './RandomRect';
import CompositeText from './CompositeText';
import UserData from 'common/UserData';
import messager, { ErrorObj, ErrorType } from '@/util/messager';
import { Ripple } from './Ripple';
const CROSSHAIR_SIZE = 46;
const FISH_SPACE = 10;
const HELPBTN_WIDTH = 40;
const HEADER_HEIGHT = 50;
const FOOTER_HEIGHT = 100;
export default class GameScene extends ViewBase {
    private gameObjectID: number;
    private containerWidth: number;
    private containerHeight: number;
    private crosshair: CompositeImage;
    private fishList: Array<CompositeImage>;
    private currentNumber: CompositeText;
    private fishNumber: number;
    private fishScale: number;
    private fishData: Array<any>;
    private numberList: Array<number>;
    private numberIndex: number;
    private ripple: Ripple;
    constructor() {
        super();
        IDUtil.i.setGameObjectID(this);
    }
    
    public enter() {
        let canvas = <HTMLCanvasElement>this.stage.canvas;
        this.containerWidth = this.containerHeight = canvas.height;
        this.x = (canvas.width - canvas.height) / 2;
        UserData.i.chance = GameConfig.i.chance;
        this.fishNumber = GameConfig.i.fishNumber;
        this.fishScale = GameConfig.i.fishScale;
        
        let fish = new createjs.Bitmap(res.getResult(ResId.fishRedPng));
        let fishWidth = fish.image.width * this.fishScale;
        let fishHeight = fish.image.height * this.fishScale;
        this.fishData = getRandomRect(fishWidth + FISH_SPACE, fishHeight + FISH_SPACE, 
            this.containerWidth - HELPBTN_WIDTH, this.containerHeight - (HEADER_HEIGHT + FOOTER_HEIGHT), this.fishNumber);
        if(this.fishNumber !== this.fishData.length) {
            let errObj:ErrorObj = {
                type: ErrorType.GAME_WARNING,
                message: '鱼的个数生成数量未达到需求',
                content: '鱼的缩放比过大或数量过多',
            }
            messager.sendError(errObj);
        }
        this.numberIndex = 0;
        this.addCrosshair();
        this.getRandomNumber();
        this.addFishs();
        this.addNumber();
        
        EventCenter.i.addListener(StageEvent.stagemousemove, this.addMouseCommand, this);
        if(GameConfig.i.playMode === PlayMode.playback) {
            this.ripple = new Ripple();
            this.addChild(this.ripple);
        }
    }

    private addCrosshair() {
        this.crosshair = new CompositeImage({
            redImage: res.getResult(ResId.crossRedPng),
            blueImage: res.getResult(ResId.crossBluePng),
            scale: this.fishScale
        });
        this.crosshair.regX = CROSSHAIR_SIZE / 2;
        this.crosshair.regY = CROSSHAIR_SIZE / 2;
        this.crosshair.set({x: this.containerWidth / 2, y: this.containerHeight / 2});
        this.addChild(this.crosshair);
    }

    private getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    private getRandomNumber() {
        this.numberList = [];
        let n;
        for(let i = 0; i < this.fishNumber; i++) {
            do {
                n = this.getRandomInt(10, 99);
            } while(this.numberList.includes(n));
            this.numberList.push(n);
        }
    }
    // 
    private addNumber() {
        this.currentNumber = new CompositeText({
            number: this.numberList[this.numberIndex],
            scale: this.fishScale
        })
        this.currentNumber.set({x: this.containerWidth / 2, y: this.containerHeight - 60});
        this.addChild(this.currentNumber);
    }
    
    private addFishs() {
        this.fishList = [];
        for(let i = 0; i < this.fishData.length; i++) {
            let fish = new CompositeImage({
                redImage: res.getResult(ResId.fishRedPng),
                blueImage: res.getResult(ResId.fishBluePng),
                scale: this.fishScale,
                number: this.numberList[i]
            });
            fish.name = this.numberList[i]+'';
            fish.x = this.fishData[i].x;
            fish.y = this.fishData[i].y + HEADER_HEIGHT;
            this.addChild(fish);
            this.fishList.push(fish);
            fish.on('mousedown', (ev:any) => {
                CommandManager.i.pushCommandInfo({
                    cmdName: CommandName.MouseClickCmd,
                    gameObjectID: this.gameObjectID,
                    data: { name: fish.name, x: ev.stageX, y: ev.stageY }
                })
            })
        }
    }

    private addMouseCommand(ev: createjs.MouseEvent) {
        let pt = UIManager.i.getCurrentScene().globalToLocal(ev.stageX, ev.stageY);
        CommandManager.i.pushCommandInfo({
            cmdName: CommandName.MouseMove,
            gameObjectID: this.gameObjectID,
            pt: pt.clone()
        })
    }

    // 
    public handleMoveCommand(cmd: MouseMove) {
        let pt = cmd.pt;
        this.crosshair.set({
            x: pt.x,
            y: pt.y
        })
    }

    public handleClickCmd(data:any) {
        let { name, x, y } = data;
        if(GameConfig.i.playMode === PlayMode.playback) {
            this.ripple.set({x, y});
            this.ripple.showRipple();
        }
        if(Number(name) === this.numberList[this.numberIndex]) {
            EventCenter.i.emit(GameEvent.right);
            this.removeChild(this.getChildByName(name));
            this.numberIndex++;
            if(this.numberIndex === this.numberList.length) {
                this.currentNumber.updateNumber('');
                EventCenter.i.emit(GameEvent.completed);
                CommandManager.i.pushCommandInfo({
                    cmdName: CommandName.ReplaceSceneCmd,
                    isUpgrade: true
                })
            } else {
                this.currentNumber.updateNumber(this.numberList[this.numberIndex] + '');
            }
        } else {
            EventCenter.i.emit(GameEvent.wrong);
        }
    }

    public responsive() {
    }

    public leave() {
        IDUtil.i.delete(this.gameObjectID);
        EventCenter.i.removeListener(StageEvent.stagemousemove, this.addMouseCommand, this);
        EventCenter.i.filter();
        this.removeAllChildren();
        this.removeAllEventListeners();
        createjs.Tween.removeAllTweens();
    }
}