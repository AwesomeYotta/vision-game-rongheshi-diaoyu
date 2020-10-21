import { CommandManager } from "common/CommandManager";
import { GameConfig } from "common/GameConfig";
import { PlaybackPanel } from "@/components/PlaybackPanel";
import { gameGlobal } from '../../main'

export function addPlaybackPanel() {
    let playbackPanel = new PlaybackPanel({
        frameAll: CommandManager.i.getTotalFrame(),
        frameStep: GameConfig.i.frameStep
    });
    /**监听用户改变进度 */
    playbackPanel.addEventListener(PlaybackPanel.eventProgressChangeByUser, async() => {
        let percent = playbackPanel.getProgress();
        let frameToGo = Math.floor(CommandManager.i.getTotalFrame() * percent);
        await gameGlobal.setGameFrame(frameToGo);
        if(playbackPanel.state == 'pause') {
            gameGlobal.pause();
        }
    })
    /**监听用户点击播放按钮 */
    playbackPanel.addEventListener(PlaybackPanel.eventPlaybackBtnClick, () => {
        gameGlobal.toggleGameState();
    })
    /**监听进度条到头了 */
    playbackPanel.addEventListener(PlaybackPanel.eventProgressEnd, () => {
        gameGlobal.pause();
        let mask = <HTMLElement>document.querySelector('#replay-mask');
        mask.style.setProperty('display', 'block');
        let replayBtn = <HTMLElement>document.querySelector('#replay-btn');
        replayBtn.addEventListener('click', () => {
            gameGlobal.continue();
            gameGlobal.setGameFrame(0);
            mask.style.setProperty('display', 'none');
        }, { once: true })
    })
}
