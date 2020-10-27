import { GameConfig } from "common/GameConfig";

export default class CompositeText extends createjs.Container {
    private redText: createjs.Text;
    private blueText: createjs.Text;
    constructor(config:any) {
        super();
        let offset = GameConfig.i.offset;
        let speed = GameConfig.i.moveSpeed;
        let sign = GameConfig.i.fusionTrainingType === 'SEPARATE' ? -1 : 1;
        this.redText = new createjs.Text(config.number+'', `${60 * config.scale}px Arial`, '#FF0000');
        this.blueText = new createjs.Text(config.number+'', `${60 * config.scale}px Arial`, '#0040FF');
        this.blueText.compositeOperation = 'darken';
        this.addChild(this.redText, this.blueText);

        this.moveTween({
            target: this.redText,
            startX: 0,
            endX: -offset * sign / 2,
            delay: speed * offset / 2
        })

        this.moveTween({
            target: this.blueText,
            startX: 0,
            endX: offset * sign / 2,
            delay: speed * offset / 2
        })
    }

    public updateNumber(number:string) {
        this.redText.text = number;
        this.blueText.text = number;
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