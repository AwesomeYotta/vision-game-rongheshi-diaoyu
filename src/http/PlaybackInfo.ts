import { GameConfig } from "common/GameConfig";
import UserData from "common/UserData";
import * as lz from 'lz-string'
import { CommandInfo, CommandName } from "common/CommandManager/CommandFactory";
import { Command } from "common/CommandManager/Command";
import $http from "./HttpRequest";
import { gameGlobal, GameState } from "../main";
/**要获取到的回放信息 */
export interface PlaybackInfo {
    cmds: Array<CommandInfo>
}

enum PlayBackInfoPacketState {
    RECORDING = 'RECORDING',
    RECORDED = 'RECORDED'
}


export interface PlayBackInfoPacket {
    part: number,
    content: string,//PlaybackInfo的序列化
    gameId: string,
    playbackId: string,
    trainingId?: string
    state: PlayBackInfoPacketState
}

const saveKey = 'PlaybackInfo'
let playbackId: string = null;
let part = 1;
export async function savePlaybackInfo(cmds: Array<Command>) {
    console.log('post playbackInfo called-------------')
    UserData.i.save();
    let playbackInfo: PlaybackInfo = {
        cmds: cmds,
    }
    let data = lz.compressToBase64(JSON.stringify(playbackInfo));
    let pucket: PlayBackInfoPacket = {
        part: part,
        content: data,
        gameId: GameConfig.i.gameId,
        playbackId: playbackId,
        state: (gameGlobal.getState() == GameState.end) ? PlayBackInfoPacketState.RECORDED : PlayBackInfoPacketState.RECORDING
    }
    if (GameConfig.i.trainingId) {
        pucket.trainingId = GameConfig.i.trainingId
    }
    let res = await $http.postPlaybackInfoPacket(pucket).catch(() => {
        return false;
    });
    if (res) {
        playbackId = (<any>res).data;
        part++;
        return true;
    } else {
        return false;
    }
}

export async function getPlaybackInfo(): Promise<Array<CommandInfo>> {
    let playbackId = GameConfig.i.playbackId
    let playbackIndex = playbackId.charAt(0) == '-' && parseInt(playbackId);
    if (playbackIndex) {
        let { content } = await $http.getPlaybackList(GameConfig.i.gameId) as any;
        playbackId = content[content.length + playbackIndex].id;
        console.log(content[content.length + playbackIndex]);
    }
    let res: any = await $http.getPlaybackInfo(playbackId);
    let data: Array<string> = res.dataParts;
    let promiseAll = [];
    for (let path of data) {
        let promise = $http.getPlaybackInfoPacket(path);
        promiseAll.push(promise);
    }

    let playbackInfoPacketsString: Array<string> = <any>await Promise.all(promiseAll);
    let playbackInfoPackets: Array<PlaybackInfo> = playbackInfoPacketsString.map((value) => {
        return JSON.parse(lz.decompressFromBase64(value));
    })

    let cmdInfoCollected: Array<CommandInfo> = [];
    playbackInfoPackets.forEach((playBackInfoPacket) => {
        cmdInfoCollected = cmdInfoCollected.concat(playBackInfoPacket.cmds);
    })

    return cmdInfoCollected
}
//本地存储信息临时函数--------------------------------
function saveLocally(pucket: PlayBackInfoPacket) {
    localStorage.setItem(saveKey + part, JSON.stringify(pucket));
    localStorage.setItem('orderTotal', part.toString());
    part++;
}

function getLocally() {
    let index = 1;
    let orderTotal = parseInt(localStorage.getItem('orderTotal'));
    let cmdCollected: Array<CommandInfo> = [];
    let randomSeed
    while (true) {
        if (index > orderTotal) {
            break
        }
        let data = localStorage.getItem(saveKey + index)
        let playBackInfoPacket: PlayBackInfoPacket = JSON.parse(data);
        let playBackInfo: PlaybackInfo = JSON.parse(lz.decompressFromBase64(playBackInfoPacket.content));
        cmdCollected = cmdCollected.concat(playBackInfo.cmds);
        index++;
    }

    return {
        cmds: cmdCollected,
        randomSeed: randomSeed
    }
}