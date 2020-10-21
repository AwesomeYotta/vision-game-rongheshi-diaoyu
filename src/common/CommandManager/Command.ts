import { gameGlobal } from '../../main';
import { CommandName } from "./CommandFactory";

export abstract class Command {
    public frame: number;
    public gameObjectID: number;
    public cmdName:CommandName
    constructor() {
        this.frame = gameGlobal.getFrame();
        // console.log(countDownWidget.remainMs);
    }

    public set(propObject: object) {
        Object.assign(this, propObject)
    }

    abstract execute():any;

    public get(prop:string):any{
        return (<any>this)[prop]
    }
}