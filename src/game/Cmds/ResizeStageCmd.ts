import { Command } from "common/CommandManager/Command";
import { UIManager } from "@/util/UIManager";
import { gameGlobal } from "../../main";
import { GameConfig, PlayMode } from "common/GameConfig";
/**resize舞台尺寸命令，也可强制执行，resize舞台上的UI */
export class ResizeStageCmd extends Command {
    private stageWidth: number;
    private stageHeight: number;
    constructor() {
        super();
    }
    /**
     * @param force 强制执行，不改变舞台宽高
     */
    public execute(force: boolean = false) {
        if (GameConfig.i.playMode == PlayMode.playback) {
            if (force) {
                this.stageWidth = gameGlobal.stageCanvas.width
                this.stageHeight = gameGlobal.stageCanvas.height;
            } else {
                gameGlobal.stageCanvas.width = this.stageWidth;
                gameGlobal.stageCanvas.height = this.stageHeight;
            }

            let playbackContainer: HTMLElement = document.querySelector('#playback-canvas-container');
            let playbackContainerSize = playbackContainer.getBoundingClientRect();
            let stageRatio = this.stageWidth / this.stageHeight;
            let containerRatio = playbackContainerSize.width / playbackContainerSize.height;
            if (stageRatio > containerRatio) {//宽适应
                gameGlobal.stageCanvas.style.setProperty('width', `${playbackContainerSize.width}px`);
                gameGlobal.stageCanvas.style.setProperty('height', `${playbackContainerSize.width / stageRatio}px`);
            } else {//高适应
                gameGlobal.stageCanvas.style.setProperty('width', `${playbackContainerSize.height * stageRatio}px`);
                gameGlobal.stageCanvas.style.setProperty('height', `${playbackContainerSize.height}px`);
            }
        }
        UIManager.i.responsive();
    }
}