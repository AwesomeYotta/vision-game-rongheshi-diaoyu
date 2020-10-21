import { ResManager } from '@/util/ResManager';
export enum ResId {
    bgMp3 = 'bg.mp3',
    clickMp3 = 'click.mp3',
    wrongMp3 = 'wrong.mp3',
    failMp3 = 'fail.mp3',
    completeMp3 = 'complete.mp3',
    fishBluePng = 'fish_blue.png',
    fishRedPng = 'fish_red.png',
    crossBluePng = 'cross_blue.png',
    crossRedPng = 'cross_red.png'
}

export let res = ResManager.i.loadQueue;
export async function loadResAsync() {
    let result = await ResManager.i.loadResAsync(ResId);
    return result;
}
(<any>window).res = res;