const isOverlap = (rc1:any, rc2:any) => {
    if (rc1.x + rc1.width  > rc2.x && rc2.x + rc2.width  > rc1.x &&
        rc1.y + rc1.height > rc2.y && rc2.y + rc2.height > rc1.y) {
        return true;
    } else {
        return false;
    }
}

export const getRandomRect = (width:number, height:number, containerWidth:number, containerHeight:number, total:number) => {
    let count = 0;
    let createTimes = 0;
    let rectList = [];
    let isValid;
    while(count < total) {
        createTimes++;
        let x = Math.floor(Math.random() * (containerWidth - width));
        let y = Math.floor(Math.random() * (containerHeight - height));
        if(count === 0) {
            rectList.push({x, y});
            count++;
            continue;
        }

        for(let i = 0; i < rectList.length; i++) {
            let rect = rectList[i];
            isValid = true;
            if(isOverlap({x, y, width: width, height: height}, {x: rect.x, y: rect.y, width: width, height: height})) {
                isValid = false;
                break;
            }
        }
        if(isValid) {
            rectList.push({x, y});
            count++;
        }
        if(createTimes > 300) {
            break;
        }
    }
    return rectList;
}