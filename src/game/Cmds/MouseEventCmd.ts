import { Command } from "common/CommandManager/Command";
import { IDUtil } from "@/util/IDUtil";
import GameScene from '../GameScene';
export class MouseMove extends Command {
    private _pt: createjs.Point = new createjs.Point;
    constructor() {
        super();
    }
    public execute() {
        let gameObject: GameScene = IDUtil.i.getObject(this.gameObjectID);
        if(gameObject) {
            gameObject.handleMoveCommand(this);
        }
    }
    
    public set pt(value: createjs.Point) {
        this._pt.x = Math.floor(value.x);
        this._pt.y = Math.floor(value.y);
    }

    public get pt() {
        return this._pt
    }
}

export class MouseClickCmd extends Command {
    private data:any;
    constructor() {
        super();
    }
    public execute() {
        let gameScene: GameScene = IDUtil.i.getObject(this.gameObjectID);
        gameScene.handleClickCmd(this.data);
    }
}