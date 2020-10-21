export default class CompositeImage extends createjs.Container {
    private redImg: createjs.Bitmap;
    private blueImg: createjs.Bitmap;
    private redText: createjs.Text;
    private blueText: createjs.Text;
    private depth: number;
    private sign:number = -1;
    constructor(config:any) {
        super();
        this.depth = config.depth;
        this.redImg = new createjs.Bitmap(config.redImage);
        this.blueImg = new createjs.Bitmap(config.blueImage);
        this.redImg.x = 0;
        this.blueImg.x = 0;
        this.blueImg.compositeOperation = 'darken';
        this.addChild(this.redImg, this.blueImg);

        if(config.number) {
            this.redText = new createjs.Text(config.number+'', '60px Arial', '#FF0000');
            this.redText.textAlign = 'center';
            this.redText.textBaseline= 'middle';
            this.redText.x = this.redImg.image.width / 2 + 30;
            this.redText.y = this.redImg.image.height / 2 + 10;

            this.blueText = new createjs.Text(config.number+'', '60px Arial', '#0040FF');
            this.blueText.textAlign = 'center';
            this.blueText.textBaseline= 'middle';
            this.blueText.x = this.redImg.image.width / 2 + 30;
            this.blueText.y = this.redImg.image.height / 2 + 10;
            this.blueText.compositeOperation = 'darken';
            this.addChild(this.redText, this.blueText);
        }

        this.scaleX = this.scaleY = config.scale;
        let hitArea = new createjs.Shape();
        hitArea.graphics.f('#fff').dr(0, 0, this.redImg.image.width + config.depth, this.redImg.image.height+config.depth).ef();
        this.hitArea = hitArea;
        // this.addChild(hitArea);
    }

    public move() {
        if(this.blueImg.x === 0 || this.blueImg.x - this.redImg.x === this.depth) {
            this.sign *= -1;
        }
        this.blueImg.x += this.sign;
        this.blueImg.y += this.sign;
        if(this.blueText) {
            this.blueText.x += this.sign;
            this.blueText.y += this.sign;
        }
    }
    
}