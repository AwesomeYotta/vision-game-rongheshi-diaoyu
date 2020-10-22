import '#/css/style.scss';
import getToken from '@/util/getToken';
import messager from '@/util/messager';
import { addStageListeners, GameEvent, setUserInputEnabled } from './common/GameEvent'
import { GameConfig, PlayMode } from './common/GameConfig'
import { EventCenter } from '@/util/EventCenter';
import UserData from './common/UserData'
import { loadResAsync } from './common/GameRes'
import { UIManager, LayerType } from '@/util/UIManager'
import GameAudio from './common/GameAudio'
import { CommandManager } from './common/CommandManager'
import { LH } from '@/util/LH';
import { CommandName } from 'common/CommandManager/CommandFactory';
import { addPlaybackPanel } from 'game/Widgets/playbackPanel';
import { ResizeStageCmd } from 'game/Cmds/ResizeStageCmd';
import { setAxiosCommon } from '@/util/Http';
import { Command } from 'common/CommandManager/Command';
import { getCountDown } from 'game/Widgets/countDownWidget';
import { addWidgets } from 'game/Widgets';
import { addPopups } from 'game/Popups';
import { pushResult, LevelState } from './GameUtil';
import quitConfirmBackBtn from "@/components/quitConfirmBackBtn";
import $http from './http/HttpRequest';
import { closeQuitWaitDialog } from 'game/Popups/quitWaitDialog';
export enum GameState {
    pause = 'pause',
    running = 'running',
    end = 'end'
}
export enum GameExitType {
    force = 'CLOSE_GAME_EXIT',
    normal = 'NORMAL_GAME_OVER_EXIT'
}

class GameGlobal {
    // 游戏舞台
    private stage: createjs.Stage;
    // 舞台DOM元素
    public stageCanvas: HTMLCanvasElement;
    // 防抖定时器
    private deferTimer: any;
    //当前状态
    private state: GameState = GameState.running;
    // 当前帧数
    private frame: number = 0;
    // 上一帧时间戳
    private previousTimestamp = 0;
    // 游戏逻辑落后真实时间的时长
    private lag: number = 0;
    // 游戏退出类型
    public gameExitType:GameExitType;
    constructor() {
        // 初始化舞台
        this.stageCanvas = document.createElement('canvas');
        this.stageCanvas.id = 'gameView';
        this.stage = new createjs.Stage(this.stageCanvas);
        this.stageCanvas.style.background = '#FF00FF';
        (<any>createjs.Ticker)._tick = () => { }
        this.stage.tickEnabled = false;
        // 注册舞台事件
        addStageListeners(this.stage);
        window.addEventListener('blur', ()=>{
            window.focus();
        })
        // 游戏初始化
        this.initAsync().then(() => {
            let canvasContainer = null;
            if (GameConfig.i.playMode == PlayMode.playback) {
                (<HTMLElement>document.querySelector('#playback-section')).style.setProperty('display', 'block');
                (<HTMLElement>document.querySelector('#userplay-section')).style.setProperty('display', 'none');
                setUserInputEnabled(false);
                CommandManager.i.getCmds()[0].execute();//第一条命令一定是resize stage
                this.gameStart();
                canvasContainer = document.querySelector('#playback-canvas-container');
                addPlaybackPanel();
                CommandManager.i.executeCommandStream();
            } else {
                createjs.Touch.enable(this.stage);
                this.stage.enableMouseOver(5);
                canvasContainer = document.querySelector('#userplay-section') as HTMLDivElement;
                canvasContainer.style.setProperty('cursor', 'none');
                this.gameStart();
            }
            canvasContainer.appendChild(this.stageCanvas);
            this.gameLoop(0);
            messager.sendLoadFinished();
        });
    }

    private gameLoop(timestamp: number) {
        if (this.state == GameState.end) {
            return;
        }
        let elapsed = timestamp - this.previousTimestamp;
        this.previousTimestamp = timestamp;
        if (elapsed < 200 && this.state == GameState.running) {
            let step = GameConfig.i.frameStep;
            this.lag += elapsed;
            while (this.lag > step) {
                this.update(step);
                this.lag -= step;
            }
        }
        this.stage.update();
        window.requestAnimationFrame((timestamp) => {
            this.gameLoop(timestamp);
        })
    }

    private update(dt: number) {
        let ev = { type: 'tick', delta: dt, frame: this.frame };
        createjs.Ticker.dispatchEvent(ev);
        // (<any>this.stage)._tick(ev);
        EventCenter.i.emit(GameEvent.tick, ev);
        this.frame++;
    }

    /**设置回放帧 */
    public async setGameFrame(frameToGo: number) {
        //不再刷新iframe， 思路是找到在frameToGo之前且最近的切换场景的命令，从切换场景的命令开始跑游戏
        let cmds = CommandManager.i.getCmds()
        let index = cmds.findIndex((cmd) => cmd.frame > frameToGo);
        if (index == -1) {
            index = cmds.length - 1
        }
        let replaceSceneCmdIndex = CommandManager.i.findCmdIndex((cmd: Command) => {
            return cmd.cmdName == CommandName.ReplaceSceneCmd;
        }, index - 1, -1);

        const replaceSceneCmd = cmds[replaceSceneCmdIndex];
        this.frame = replaceSceneCmd.frame;

        let loadingMask = document.querySelector('#loading-mask') as HTMLDivElement;
        loadingMask.style.setProperty('display', 'block');
        await replaceSceneCmd.execute();
        loadingMask.style.setProperty('display', 'none');
        CommandManager.i.setCmdIndex(replaceSceneCmdIndex + 1);

        while (this.getFrame() < frameToGo) {
            this.update(GameConfig.i.frameStep);
        }
    }

    private async initAsync() {
        let token = await getToken();
        setAxiosCommon('x-auth-token', token);
        //资源初始化
        await loadResAsync();
        //UI管理器初始化
        UIManager.i.init(this.stage);
        //命令管理器初始化
        await CommandManager.i.initAsync();
        this.responsive();//确保第一条命令是resize stage
        console.log('CommandManager inited')
        CommandManager.i.pushCommandInfo({//发送结果表
            cmdName: CommandName.ResultTitleCmd
        })
        //游戏配置初始化
        await GameConfig.i.initAsync();
        LH.overrideRandom(GameConfig.i.randomSeed);//获取配置后立即设置随机种子，防止背景中有使用
        console.log('GameConfig inited')
        //玩家数据初始化
        UserData.i.init();
        //音效初始化
        GameAudio.i.init();
        //初始化控件
        this.initComponents();
        this.addListeners();
        // await UIManager.i.replaceDisplayByLayer(UIName.GameBg, LayerType.bg, null, GameConfig.i.modeList);
    }

    private addListeners() {
        //侦听窗口尺寸变化
        window.addEventListener('resize', () => {
            if (this.deferTimer) {
                clearTimeout(this.deferTimer);
            }
            this.deferTimer = setTimeout(() => {
                this.responsive();
            }, 100);
        });
    }

    public gameStart() {
        let countDownWidget = getCountDown();
        countDownWidget.start(GameConfig.i.gameDuration * 1000);
        CommandManager.i.pushCommandInfo({
            cmdName: CommandName.ReplaceSceneCmd,
            isFirstSceneCmd: true
        })
    }
    // 响应窗口变化
    private responsive() {
        if (GameConfig.i.playMode == PlayMode.userPlay) {
            this.stageCanvas.width = window.innerWidth;
            this.stageCanvas.height = window.innerHeight;
            CommandManager.i.pushCommandInfo({
                cmdName: CommandName.ResizeStageCmd,
                stageWidth: this.stageCanvas.width,
                stageHeight: this.stageCanvas.height
            })
        } else {
            let cmd = new ResizeStageCmd();
            cmd.execute(true);
        }
    }
    // 初始化控件
    private initComponents() {
        addWidgets();
        addPopups();
        if (GameConfig.i.playMode == PlayMode.userPlay) {
            let backBtn = new quitConfirmBackBtn(); // 返回按钮 新的返回按钮
            UIManager.i.addToStageByLayer(backBtn, LayerType.widget);
            backBtn.show = this.pause.bind(this);
            backBtn.confirm = this.beforeQuit.bind(this);
            backBtn.cancel = this.continue.bind(this);
        } else {
            let backBtn = <HTMLElement>document.querySelector('#back-btn');
            backBtn.onclick = messager.sendQuit.bind(messager);
        }
    }

    public getFrame() {
        return this.frame;
    }

    private sendGameExitType() {
        let data = {
            trainingId: GameConfig.i.trainingId,
            type: this.gameExitType
        }
        $http.postGameExitType(data).catch(() => {
            return false;
        });
    }
    
    public async beforeQuit(exitType:GameExitType = GameExitType.force) {
        this.gameExitType = exitType;
        EventCenter.i.emit(GameEvent.showQuitWaitDialog);
        pushResult(LevelState.incomplete);
        this.setGameEnd();
        GameConfig.i.trainingId && this.sendGameExitType();
        await CommandManager.i.save(true);
        closeQuitWaitDialog();
    }
    
    public quit () {
        createjs.Tween.removeAllTweens();
        EventCenter.i.removeAllListeners();
        UIManager.i.popScene();
        messager.sendQuit();
    }
    
    public pause() {
        this.state = GameState.pause;
        createjs.Ticker.paused = true
        setUserInputEnabled(false);
    }

    public continue() {
        this.state = GameState.running;
        createjs.Ticker.paused = false
        let enabled = GameConfig.i.playMode == PlayMode.userPlay//只有userplay模式才开启输入
        setUserInputEnabled(enabled)
    }

    public toggleGameState() {
        if (this.state == GameState.running) {
            this.pause();
        } else if (this.state == GameState.pause) {
            this.continue();
        }
        this.stage.update();
    }

    public setGameEnd() {
        this.state = GameState.end;
    }

    public getState(){
        return this.state
    }
}

export const gameGlobal: GameGlobal = new GameGlobal();
(<any>window).gameGlobal = gameGlobal;
(<any>window).EventCenter = EventCenter;
(<any>window).UserData = UserData;
(<any>window).GameAudio = GameAudio;
(<any>window).UIManager = UIManager;