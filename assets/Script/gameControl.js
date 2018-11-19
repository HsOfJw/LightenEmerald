import { ROW_NUM , COLUMN_NUM , STAGE_INFO} from "./config";
var net = require('net');
cc.Class({
    extends: cc.Component,

    properties: {
        lightningPre: cc.Prefab, //亮灯预制体
        dialogPre: cc.Prefab, //过关对话框预制体
        gameOverPre: cc.Prefab,//游戏结束的预制体
    },

    onLoad: function () {
        //初始化全局变量
        cc.vv = {};
        let vvUtils = require("vv");
        cc.vv = new vvUtils();

        let that = this;
        this.game = this.node.parent;
        this.canvas = this.game.parent;
        this.layout = this.game.getChildByName("layout");
        this.buttons = this.game.getChildByName("buttons");
        this.displaySave = this.game.getChildByName("displaySave");
        this.noticeDelay = true;
        this.stateData = [];//本地数据库
        //关卡显示信息
        this.stageInfo = this.game.getChildByName("stageInfo");
        this.stageDisplay = this.stageInfo.getChildByName("stage").getChildByName("display");//关卡显示节点
        this.timeline = this.stageInfo.getChildByName("timeline").getChildByName("label");//倒计时显示
        this.lightNumber = 0;//点亮数量
        this.targetLabel = this.game.getChildByName("target").getChildByName("label");//目标显示
        
        //开始游戏界面
        this.startBg = this.canvas.getChildByName("startBg");
        this.startPanel = this.canvas.getChildByName("start");
        this.startBtn = this.startPanel.getChildByName("startBtn");
        this.share = this.startPanel.getChildByName("share");//分享

        //监听点击的事件
        cc.director.on("clicked" , (event) => {
            that.changeState(event.detail.msg);
        });
        this.getConfigFromServer();
        this.getReliveTime();
        this.loadStageRes();
        this.registerEvent();
    },

    //每天复活次数
    getReliveTime() {
        //初始化每天复活次数
        let localTime = cc.sys.localStorage.getItem("saveTime");
        let nowTime = new Date().toLocaleDateString();
        //console.log("time" , nowTime)
        if(!localTime) {
            cc.sys.localStorage.setItem("saveTime" , nowTime);
            cc.sys.localStorage.setItem("relive" , 9999);
        }else if(localTime !== nowTime) {
            //console.log("不同天");
            cc.sys.localStorage.setItem("saveTime" , nowTime);
            cc.sys.localStorage.setItem("relive" , 9999);
        }else if(localTime === nowTime) {
            //console.log("同一天");
        }
    },

    //加载关卡显示资源
    loadStageRes() {
        cc.loader.loadResDir("stage" , cc.SpriteFrame , (err , spriteFrame) => {
            this.sp = spriteFrame;
            cc.director.on("start_game" , () => {
                cc.director.pause();
                this.initGame();
            });
        });
        cc.loader.loadResDir("acheivement" , cc.SpriteFrame , (err , spriteFrame) => {
            this.acheiveSp = spriteFrame;
        });
    },

    //初始化游戏场景
    initGame(againGame) {
        this.layout.removeAllChildren();
        this.lightNumber = 0;
        this.updateTarget();
        /* 读取本地数据：
            数据不为空且未传入参数againGame：根据本地数据进行渲染游戏场景
            数据为空或传入参数againGame：初始化游戏场景
        */
        let local_data = cc.sys.localStorage.getItem("state_data");
        let local_stage = cc.sys.localStorage.getItem("stage");
        let local_number = cc.sys.localStorage.getItem("lightNumber");
        if(local_stage && !againGame) {
            globalVariable.current_stage = JSON.parse(local_stage);
            if(local_number) {
                this.lightNumber = JSON.parse(local_number);
            }else {
                this.lightNumber = 0;
            }
            this.updateTarget();
        }
        let display_data = 0;
        if(local_data) {
            display_data = JSON.parse(local_data);
        }
        for(let i = 0 ; i < COLUMN_NUM ; i++) {
            let tmpData = [];
            for(let j = 0 ; j < ROW_NUM ; j++) {
                let item = cc.instantiate(this.lightningPre);
                item.tag = i * 10 + j;
                if(local_data && !againGame) {
                    if(display_data[i][j] === 1) {
                        item.colorState = true;
                        item.getChildByName("gray").active = false;
                        item.getChildByName("green").active = true;
                    }else {
                        item.colorState = false;
                        item.getChildByName("gray").active = true;
                        item.getChildByName("green").active = false;
                    }
                }else {
                    item.colorState = false;
                    item.getChildByName("gray").active = true;
                    item.getChildByName("green").active = false;
                }
                tmpData[j] = 0;
                this.layout.addChild(item);
            }
            this.stateData[i] = tmpData;
        }
        let current_stage = globalVariable.current_stage;
        for(let i = 0 ; i < this.sp.length ; i++) {
            if(current_stage === parseInt(this.sp[i].name)) {
                this.stageDisplay.getComponent(cc.Sprite).spriteFrame = this.sp[i];
            }else {
                continue;
            }
        }

        this.countTime();
    },

    //注册按钮事件
    registerEvent() {
        let that = this;
        //再来一次
        let again = this.buttons.getChildByName("again");
        again.on(cc.Node.EventType.TOUCH_END , () => {
            let againGame = true;
            that.initGame(againGame);
        } , this);

        ////求助
        //let help = this.buttons.getChildByName("help");
        //help.on(cc.Node.EventType.TOUCH_END , () => {
        //    cc.vv.shareofImage();
        //} , this);

        //下一关
        let nextStage = this.buttons.getChildByName("nextStage");
        nextStage.on(cc.Node.EventType.TOUCH_END , () => {
            cc.vv.shareofImage();
        } , this);

        //休息一下
        let jump = this.buttons.getChildByName("jump");
        jump.on(cc.Node.EventType.TOUCH_END , ()=> {
            cc.vv.jumpToBox();
        } , this);

        //存档
        let saveData = this.buttons.getChildByName("save");
        saveData.on(cc.Node.EventType.TOUCH_END , () => {
            if(that.noticeDelay) {
                that.saveNotice();
                that.noticeDelay = false;
            }
        } , this);


        //监听下一关事件
        cc.director.on("next_stage" , () => {
            if(globalVariable.current_stage < 8) {
                let againGame = true;
                globalVariable.current_stage++;
                this.initGame(againGame);
                this.save_data();
            }else {
                this.startBg.active = true;
                this.startPanel.active = true;
                globalVariable.current_stage = 1;
                for(let i = 0 ; i < COLUMN_NUM ; i++) {
                    for(let j = 0 ; j < ROW_NUM ; j++) {
                        this.stateData[i][j] = 0;
                    }
                }
                let data = cc.sys.localStorage.getItem("state_data");
                data = JSON.stringify(this.stateData);
                cc.sys.localStorage.setItem("state_data" , data);
                cc.sys.localStorage.setItem("stage" , JSON.stringify(globalVariable.current_stage));
            }
        });
        //监听再来一次
        cc.director.on("again" , () => {
            this.game.getChildByName("gameOver").destroy();
            let againGame = true;
            that.initGame(againGame);

            let reliveTimes = (cc.sys.localStorage.getItem("relive"));
            if(reliveTimes > 0) {
                cc.sys.localStorage.setItem("relive" , reliveTimes - 1);
            }
        });
    },

    closeNotice() {
        //提示框确定按钮
        cc.director.resume();
        let notice = this.game.getChildByName("notice");
        let notice_ok = notice.getChildByName("ok");
        notice.active = false;
        //notice_ok.on(cc.Node.EventType.TOUCH_END , ()=> {
        //    notice.destroy();
        //} , this);
    },

    test() {
        let child = this.layout.children;
        for(let i = 0 ; i < child.length-1 ; i++) {
            child[i].getChildByName("gray").active = false;
            child[i].getChildByName("green").active = true;
            child[i].colorState = true;
        }

        //判断是否过关
        //let child = this.layout.children;
        let judgeIndex = false;
        for(let i = 0 ; i < child.length ; i++) {
            let colorState = child[i].colorState;
            if(colorState) {
                judgeIndex = true;
            }else {
                judgeIndex = false;
                break;
            }
        }
        if(judgeIndex) {
            let dialog = cc.instantiate(this.dialogPre);
            dialog.setPosition(0 , 0);
            dialog.getChildByName("strategy").active = false;
            dialog.getChildByName("passStage").active = true;
            this.game.addChild(dialog);
        }
    },

    //根据tag获取改变颜色的节点
    changeState(tag) {
        //播放音效
        let voice = this.canvas.getChildByName("voiceControl");
        voice.getComponent(cc.AudioSource).play();

        let topTag = tag - 10;
        let leftTag = tag - 1;
        let rightTag = tag + 1;
        let bottomTag = tag + 10;

        let clickNode = this.layout.getChildByTag(tag);
        let topNode = this.layout.getChildByTag(topTag);
        let bottomNode = this.layout.getChildByTag(bottomTag);
        let leftNode = this.layout.getChildByTag(leftTag);
        let rightNode = this.layout.getChildByTag(rightTag);

        if(clickNode) {
            let colorState = clickNode.colorState;
            let grey = clickNode.getChildByName("gray");
            let green = clickNode.getChildByName("green");
            if(colorState) {
                green.active = false;
                grey.active = true;
                clickNode.colorState = false;
                this.lightNumber--;//点亮宝石数量减一
            }else {
                green.active = true;
                grey.active = false;
                clickNode.colorState = true;
                this.lightNumber++;//点亮数量加一
            }
        }

        if(topNode) {
            let colorState = topNode.colorState;
            let grey = topNode.getChildByName("gray");
            let green = topNode.getChildByName("green");
            if(colorState) {
                green.active = false;
                grey.active = true;
                topNode.colorState = false;
                this.lightNumber--;//点亮宝石数量减一
            }else {
                green.active = true;
                grey.active = false;
                topNode.colorState = true;
                this.lightNumber++;//点亮数量加一
            }
        }
        if(bottomNode) {
            let colorState = bottomNode.colorState;
            let grey = bottomNode.getChildByName("gray");
            let green = bottomNode.getChildByName("green");
            if(colorState) {
                green.active = false;
                grey.active = true;
                bottomNode.colorState = false;
                this.lightNumber--;//点亮宝石数量减一
            }else {
                green.active = true;
                grey.active = false;
                bottomNode.colorState = true;
                this.lightNumber++;//点亮数量加一
            }
        }
        if(leftNode) {
            let colorState = leftNode.colorState;
            let grey = leftNode.getChildByName("gray");
            let green = leftNode.getChildByName("green");
            if(colorState) {
                green.active = false;
                grey.active = true;
                leftNode.colorState = false;
                this.lightNumber--;//点亮宝石数量减一
            }else {
                green.active = true;
                grey.active = false;
                leftNode.colorState = true;
                this.lightNumber++;//点亮数量加一
            }
        }
        if(rightNode) {
            let colorState = rightNode.colorState;
            let grey = rightNode.getChildByName("gray");
            let green = rightNode.getChildByName("green");
            if(colorState) {
                green.active = false;
                grey.active = true;
                rightNode.colorState = false;
                this.lightNumber--;//点亮宝石数量减一
            }else {
                green.active = true;
                grey.active = false;
                rightNode.colorState = true;
                this.lightNumber++;//点亮数量加一
            }
        }

        this.updateTarget();//更新显示点亮数量
        this.checkPassStatus();
        // //判断是否过关
        // let child = this.layout.children;
        // let judgeIndex = false;
        // for(let i = 0 ; i < child.length ; i++) {
        //     let colorState = child[i].colorState;
        //     if(colorState) {
        //         judgeIndex = true;
        //     }else {
        //         judgeIndex = false;
        //         break;
        //     }
        // }
        // if(judgeIndex) {
        //     let dialog = cc.instantiate(this.dialogPre);
        //     dialog.setPosition(0 , 0);
        //     dialog.getChildByName("strategy").active = false;
        //     dialog.getChildByName("passStage").active = true;
        //     this.game.addChild(dialog);
        //}
    },

    //保存数据到本地
    save_data() {
        //let child = this.layout.children;
        let tag = 0;
        let child = 0;
        let color_state = false;
        for(let i = 0 ; i < COLUMN_NUM ; i++) {
            for(let j = 0 ; j < ROW_NUM ; j++) {
                tag = i * 10 + j;
                child = this.layout.getChildByTag(tag);
                color_state = child.colorState;
                if(color_state) {
                   this.stateData[i][j] = 1;
                }else {
                    this.stateData[i][j] = 0;
                }
            }
        }
        let data = cc.sys.localStorage.getItem("state_data");
        data = JSON.stringify(this.stateData);
        cc.sys.localStorage.setItem("state_data" , data);
        let current_stage = globalVariable.current_stage;
        cc.sys.localStorage.setItem("stage" , JSON.stringify(current_stage));
        cc.sys.localStorage.setItem("lightNumber" , JSON.stringify(this.lightNumber));
    },

    //提示信息
    saveNotice() {
        if(this.noticeDelay) {
            let that = this;
            this.save_data();//保存数据
            this.displaySave.stopAllActions();
            let move = cc.moveBy(1 , 0 , 100);
            let fade = cc.fadeTo(1 , 0);
            let moveResume = cc.moveBy(0 , 0 , -100);
            let fadeResume = cc.fadeTo(0 , 255);
            let seq = cc.sequence(fadeResume , cc.spawn(move , fade) , moveResume, cc.callFunc(() => {
                that.noticeDelay = true;
             }));
             this.displaySave.runAction(seq.clone());
        }
    },

    //判断是否过关
    checkPassStatus() {
        let countNum = 0;
        let tag = 0;
        let child = 0;
        let color_state = false;
        for(let i = 0 ; i < COLUMN_NUM ; i++) {
            for(let j = 0 ; j < ROW_NUM ; j++) {
                tag = i * 10 + j;
                child = this.layout.getChildByTag(tag);
                color_state = child.colorState;
                if(color_state) {
                   countNum++;
                }else {
                    continue;
                }
            }
        }
        let current_stage = globalVariable.current_stage;
        if(countNum >= STAGE_INFO[current_stage].goal) {
            this.passStage();
        }
        
    },

    //点亮数量更新
    updateTarget() {
        let current_stage = globalVariable.current_stage;
        this.targetLabel.getComponent(cc.Label).string = `${this.lightNumber}/${STAGE_INFO[current_stage].goal}`;
    },

    //过关
    passStage() {
        cc.director.getScheduler().unscheduleAllForTarget(this.timeline);
        let dialog = cc.instantiate(this.dialogPre);
        dialog.setPosition(0 , 0);
        let current_stage = globalVariable.current_stage;
        for(let i = 0 ; i < this.acheiveSp.length ; i++) {
            if(current_stage === parseInt(this.acheiveSp[i].name)) {
                dialog.getChildByName("passStage").getChildByName("display").getComponent(cc.Sprite).spriteFrame = this.acheiveSp[i];
            }else {
                continue;
            }
        }
        dialog.getChildByName("strategy").active = false;
        dialog.getChildByName("passStage").active = true;
        this.game.addChild(dialog);
    },

    //倒计时
    countTime() {
        cc.director.getScheduler().unscheduleAllForTarget(this.timeline);
        let current_stage = globalVariable.current_stage;
        let totalTime = STAGE_INFO[current_stage].time;
        let minutes = parseInt(totalTime / 60);
        let minutes_first = 0;
        let minutes_second = 0;
        let judgeNum = totalTime;
        if(minutes < 10) {
            minutes_first = 0;
            minutes_second = minutes;
        }else {
            minutes_first = parseInt(minutes / 10);
            minutes_second = parseInt(minutes % 10);
        } 
        let seconds = parseInt(totalTime % 60);
        let seconds_first = 0;
        let seconds_second = 0;
        if(seconds < 10) {
            seconds_first = 0;
            seconds_second = seconds;
        }else {
            seconds_first = parseInt(seconds / 10);
            seconds_second = parseInt(seconds % 10);
        } 
        this.timeline.getComponent(cc.Label).string = `${minutes_first}${minutes_second}:${seconds_first}${seconds_second}`;
        cc.director.getScheduler().schedule(() => {

            judgeNum--;
            if(judgeNum === 0) {
                this.showGameOver();
                cc.director.getScheduler().unscheduleAllForTarget(this.timeline);
            };

            seconds_second--
            if(seconds_second < 0) {
                seconds_second = 9;
                seconds_first--;
                if(seconds_first < 0) {
                    seconds_first = 5;
                    minutes_second--;
                    if(minutes_second < 0) {
                        minutes_second = 9;
                        minutes_first --;
                        if(minutes_first < 0) {
                            minutes_first = 0;
                            minutes_second = 0;
                            seconds_first = 0;
                            seconds_second = 0;
                        }
                    }
                }
            }
            this.timeline.getComponent(cc.Label).string = `${minutes_first}${minutes_second}:${seconds_first}${seconds_second}`;
        }, this.timeline, 1 , totalTime -1 , 1 , false);
    },

    //游戏结束
    showGameOver() {
        let dialog = cc.instantiate(this.gameOverPre);
        dialog.setPosition(0 , 0);
        this.game.addChild(dialog);
    },

    //获取服务器配置
    getConfigFromServer() {
        let that = this;
        let saveConfig = function(res) {
            //console.log("res",res);
            globalVariable.game_config = res.data.data;//保存服务器获取配置
            let config = globalVariable.game_config;

            globalVariable.box_appId = config.app_id;//保存appId

            //保存分析信息
            let type = 1;
            let shareInfo = config.share[type].info;
            globalVariable.share_image = shareInfo.share_img;
            globalVariable.share_title = shareInfo.share_title;

            if(config.ad_banner === 1) {
                that.share.active = true;
            }else if(config.ad_banner === 0) {
                that.share.active = false;
            }
        };
        let netobj = {
            url	: globalVariable.get_config,           //请求配置地址	
            method : 'POST',
            data : {
                game_id : globalVariable.game_id,
            },        	
            success : saveConfig,
        }
        net.useNet(netobj);
    },
});
