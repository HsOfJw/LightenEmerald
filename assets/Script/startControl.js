var net = require('net');
cc.Class({
    extends: cc.Component,

    properties: {
        dialogPre: cc.Prefab,
        leftPanel: cc.Prefab,
    },

    onLoad () {
        this.bg = this.node.parent.getChildByName("startBg");
        //开始界面按钮
        this.share = this.node.getChildByName("share");//分享
        this.shareBtn = this.share.getChildByName("shareBtn");
        this.startBtn = this.node.getChildByName("startBtn");//开始游戏
        this.strategy = this.node.getChildByName("strategy");//游戏攻略
        this.moreGame = this.node.getChildByName("moreGame");//更多游戏
        this.out = this.node.getChildByName("out");//弹出侧边栏
        this.ready_login();
        cc.vv.showShareButton();
        cc.vv.bannerAd();
        //注册按钮事件
        this.registerEvent();
    },

    registerEvent() {
        //监听开始游戏事件
        cc.director.on("start_game" , () => {
            this.startBtn.active = true;
            this.node.active = false;
            this.bg.active = false;
        });
        cc.director.on("local_start" , () => {
            this.startBtn.active = true;
        });
        let that = this;
        //分享
        this.shareBtn.on(cc.Node.EventType.TOUCH_END , () => {
            cc.vv.shareofImage();
        } , this);
        //开始游戏
        this.startBtn.on(cc.Node.EventType.TOUCH_END , () => {
          this.node.active = false;
          this.bg.active = false;
          cc.director.emit("start_game");
        } , this);
        //游戏攻略
        this.strategy.on(cc.Node.EventType.TOUCH_END , () => {
            let dialog = cc.instantiate(this.dialogPre);
            dialog.setPosition(0 , 0);
            dialog.getChildByName("strategy").active = true;
            dialog.getChildByName("passStage").active = false;
            that.node.addChild(dialog);
        } , this);
        //更多游戏
        this.moreGame.on(cc.Node.EventType.TOUCH_END , () => {
            cc.vv.jumpToBox();
        } , this);
        //弹出侧边栏
        this.out.on(cc.Node.EventType.TOUCH_END , () => {
            let item = cc.instantiate(this.leftPanel);
            this.node.addChild(item);
        } , this);
    },

    ready_login() {
        let that = this;
        if (window.wx != undefined) {
            let loginobj = {
                timeout : 5000,
                //success: that.test,
                success : that.savecode,
                //fail : that.warnMsg
            }
            this.msgstring = '登录超时'
            wx.login(loginobj);
        }
    },

    savecode(res){
        let that = this;
        cc.sys.localStorage.setItem('code', res.code);
        if (window.wx != undefined) {
            let userInfo = cc.sys.localStorage.getItem('userInfo');
            if(userInfo) {
                //console.log("本地按钮");
                cc.director.emit("local_start");
            }else {
                //console.log("生成按钮");
                // 按钮大小调整
                let obj = {
                    success: (res) => {
                        let wid = res.windowWidth;
                        let hei = res.windowHeight;
                        let ratio = hei / 1334;
                        let setX = (wid - 330*ratio)/2;
                        let setY = hei / 2;
                        let button = wx.createUserInfoButton({
                            type: 'image',
                            image: globalVariable.start_image,

                            style: {
                                left: setX,
                                top: setY,
                                width: 330*ratio,
                                height: 136*ratio,
                                lineHeight: 40,
                                backgroundColor: '#718c00',
                                color: '#ffffff',
                                textAlign: 'center',
                                fontSize: 16,
                                borderRadius: 4
                            }
                        })
                        // 用户信息储存
                        let netsave = function(res){
                            //cc.director.emit("start_game");
                            cc.sys.localStorage.setItem('userInfo', JSON.stringify(res.data.data));
                        }

                        // 加密信息
                        let netInfo = function(encrypt){
                            if(encrypt.errMsg === "getUserInfo:ok") {
                                cc.director.emit("start_game");
                                button.destroy();
                                cc.sys.localStorage.setItem('encrypt', JSON.stringify(encrypt));
                                let code = cc.sys.localStorage.getItem('code');
                                let netobj = {
                                    url	: globalVariable.game_server,           //开发者服务器接口地址	
                                    method : 'POST',
                                    data : {
                                        game_id : globalVariable.game_id,
                                        code : code,
                                        //rawData : encrypt.rawData,
                                        //signature : encrypt.signature,
                                        encryptedData : encrypt.encryptedData,
                                        iv : encrypt.iv
                                    },        	
                                    success : netsave,
                                }
                                net.useNet(netobj)
                            }
                        } 
                    button.onTap(netInfo);
                    }
                }
                wx.getSystemInfo(obj);
            }    
        }
    },
});
