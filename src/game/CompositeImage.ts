import { GameConfig } from "common/GameConfig";

export default class CompositeImage extends createjs.Container {
    private redImg: createjs.Bitmap;
    private blueImg: createjs.Bitmap;
    private redText: createjs.Text;
    private blueText: createjs.Text;
    private numberTextX: number;
    private numberTextY: number;
    constructor(config:any) {
        super();
        let offset = GameConfig.i.offset;
        let speed = GameConfig.i.moveSpeed;
        let sign = GameConfig.i.fusionTrainingType === 'SEPARATE' ? -1 : 1;
        this.redImg = new createjs.Bitmap(config.redImage);
        this.blueImg = new createjs.Bitmap(config.blueImage);
        this.redImg.x = 0;
        this.blueImg.x = 0;
        this.blueImg.compositeOperation = 'darken';
        this.addChild(this.redImg, this.blueImg);
        this.moveTween({
            target: this.blueImg,
            startX: 0,
            endX: offset / 2 * sign,
            delay: speed * offset / 2
        });
        this.moveTween({
            target: this.redImg,
            startX: 0,
            endX: -offset / 2 * sign,
            delay: speed * offset / 2
        });
        if(config.number) {
            this.numberTextX = this.redImg.image.width / 2 + 20;
            this.numberTextY = this.redImg.image.height / 2 + 10;
            this.redText = new createjs.Text(config.number+'', '60px Arial', '#FF0000');
            this.redText.textAlign = 'center';
            this.redText.textBaseline = 'middle';
            this.redText.x = this.numberTextX;
            this.redText.y = this.numberTextY;

            this.blueText = new createjs.Text(config.number+'', '60px Arial', '#0040FF');
            this.blueText.textAlign = 'center';
            this.blueText.textBaseline = 'middle';
            this.blueText.x = this.numberTextX;
            this.blueText.y = this.numberTextY;
            this.blueText.compositeOperation = 'darken';
            this.addChild(this.redText, this.blueText);
            this.moveTween({
                target: this.redText,
                startX: this.numberTextX,
                endX: -offset / 2 * sign + this.numberTextX,
                delay: speed * offset / 2
            });
            this.moveTween({
                target: this.blueText,
                startX: this.numberTextX,
                endX: offset / 2 * sign + this.numberTextX,
                delay: speed * offset / 2
            });
        }
        this.scaleX = this.scaleY = config.scale;
        let hitArea = new createjs.Shape();
        hitArea.graphics.f('#fff').dr(0, 0, this.redImg.image.width, this.redImg.image.height).ef();
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