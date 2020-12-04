import { GameConfig } from "common/GameConfig";
import { getDPICoeff } from "@/util/getDPICoeff";

export default class CompositeImage extends createjs.Container {
    private redImg: createjs.Bitmap;
    private blueImg: createjs.Bitmap;
    private redText: createjs.Text;
    private blueText: createjs.Text;
    private numberTextX: number;
    private numberTextY: number;
    constructor(config:any) {
        super();
        let offset = GameConfig.i.offset * getDPICoeff();
        let delay = GameConfig.i.moveDelay * 1000 / 2;
        let sign = GameConfig.i.fusionTrainingType === 'SEPARATE' ? 1 : -1;
        this.redImg = new createjs.Bitmap(config.redImage);
        this.blueImg = new createjs.Bitmap(config.blueImage);
        this.redImg.x = 0;
        this.blueImg.x = 0;
        this.redImg.compositeOperation = 'darken';
        this.blueImg.compositeOperation = 'darken';
        this.blueImg.scaleX = this.blueImg.scaleY = config.scale;
        this.redImg.scaleX = this.redImg.scaleY = config.scale;
        this.addChild(this.redImg, this.blueImg);
        this.moveTween({
            target: this.blueImg,
            startX: 0,
            endX: offset / 2 * sign,
            delay: delay
        });
        this.moveTween({
            target: this.redImg,
            startX: 0,
            endX: -offset / 2 * sign,
            delay: delay
        });
        if(config.number) {
            this.numberTextX = this.redImg.image.width * config.scale / 2 + 20 * config.scale;
            this.numberTextY = this.redImg.image.height * config.scale / 2 + 10 * config.scale;
            this.redText = new createjs.Text(config.number+'', '100px Arial', '#FF0000');
            this.redText.textAlign = 'center';
            this.redText.textBaseline = 'middle';
            this.redText.x = this.numberTextX;
            this.redText.y = this.numberTextY;

            this.blueText = new createjs.Text(config.number+'', '100px Arial', '#0040FF');
            this.blueText.textAlign = 'center';
            this.blueText.textBaseline = 'middle';
            this.blueText.x = this.numberTextX;
            this.blueText.y = this.numberTextY;
            this.redText.compositeOperation = 'darken';
            this.blueText.compositeOperation = 'darken';
            
            this.blueText.scaleX = this.blueText.scaleY = config.scale;
            this.redText.scaleX = this.redText.scaleY = config.scale;
            this.addChild(this.redText, this.blueText);
            this.moveTween({
                target: this.redText,
                startX: this.numberTextX,
                endX: -offset / 2 * sign + this.numberTextX,
                delay: delay
            });
            this.moveTween({
                target: this.blueText,
                startX: this.numberTextX,
                endX: offset / 2 * sign + this.numberTextX,
                delay: delay
            });
        }
        let hitArea = new createjs.Shape();
        hitArea.graphics.f('#fff').dr(0, 0, this.redImg.image.width * config.scale, this.redImg.image.height * config.scale).ef();
        this.hitArea = hitArea;
        // this.addChild(hitArea);
    }

    private moveTween(config:any) {
        createjs.Tween.get(config.target, {override: true})
            .to({x: config.endX}, config.delay)
            .to({x: config.startX}, config.delay)
            .call(() => {
                this.moveTween(config);
            })
    }
}