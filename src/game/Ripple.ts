import { GameConfig, PlayMode } from "common/GameConfig";

/**点击波纹 */
export class Ripple extends createjs.Container {
    private ripple: createjs.Shape;
    constructor() {
        super();
        this.buildContent();
    }
    public buildContent() {
        this.ripple = new createjs.Shape();
        this.ripple.graphics.s('red').ss(2).dc(0, 0, 10);
        this.ripple.visible = false;
        this.addChild(this.ripple);
    }

    public showRipple() {
        if (GameConfig.i.playMode == PlayMode.userPlay) {
            return;
        }
        this.ripple.visible = true;
        createjs.Tween.get(this.ripple, { override: true })
            .to({ scaleX: 3, scaleY: 3 }, 200).call(() => {
                this.ripple.visible = false;
                this.ripple.scaleX = this.ripple.scaleY = 1;
            })
    }
}