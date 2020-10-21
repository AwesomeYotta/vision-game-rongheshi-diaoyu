export default class CompositeText extends createjs.Container {
    private redText: createjs.Text;
    private blueText: createjs.Text;
    private depth: number;
    private sign: number = -1;
    constructor(config:any) {
        super();
        this.depth = config.depth;
        this.redText = new createjs.Text(config.number+'', '40px Arial', '#FF0000');
        this.blueText = new createjs.Text(config.number+'', '40px Arial', '#0040FF');
        this.blueText.compositeOperation = 'darken';
        this.addChild(this.redText, this.blueText);
    }

    public updateNumber(number:string) {
        this.redText.text = number;
        this.blueText.text = number;
    }

    public move() {
        if(this.blueText.x === 0 || this.blueText.x - this.redText.x === this.depth) {
            this.sign *= -1;
        }
        this.blueText.x += this.sign;
    }
}