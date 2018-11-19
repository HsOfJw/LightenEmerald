let net = require("net");
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad () {
        this.AdBg = this.node.getChildByName("AdBg");
        this.selfAppId = "wx7b568a6182561e07";
        cc.director.preloadScene("game", function () {
            console.log("preload scene game");
        });

        this.getJumpMethod();
        this.getQuery();

    },

    getJumpMethod() {
        this.query = this.GetGid();
        //this.query = {};
        //this.query.gid = 13;
        if(this.query.gid) {
            console.log("getGid" , this.query.gid);
            this.createAd(this.query.gid);
        }else {
            cc.director.loadScene("game");
        }
    },

    getQuery() {
        if (window.wx != undefined) {
            wx.onShow(res => {//监听小游戏回到前台的事件
                if (res.query.game_id == 31) {
                    //跳到自己的游戏
                    console.log("[loading] 游戏返回到前台的参数中  跳转到自己的游戏中");
                    cc.director.loadScene("game");
                }
                if (res.query.gid) {
                    console.log("游戏返回到前台后，又重新进入到 非正常流程");
                    cc.director.loadScene("game");
                }
            })
        }
    },

    GetGid() {
        if(window.wx) {
            let launchData = wx.getLaunchOptionsSync();
            let query = launchData.query;
            console.log("query" , query);
            return query;
        }
    },

    createAd(gid) {
        let sendData = {
            url: "https://gather.51weiwan.com/hz/general/plan1",	
            method : 'POST',
            data : {
                gid: gid,
            },        	
            success: (res) => {
                this.createImage(res.data.data.img , this.AdBg);
                this.registerEvent(res);
                console.log("returnData" , res);
            }    
        };
        net.useNet(sendData);
    },

    registerEvent(res) {
        let state = res.data.data.state;
        console.log("state " , state);
        this.AdBg.on(cc.Node.EventType.TOUCH_END , () => {
            if(state === 2) {
                this.jumpToBox(res);
            }else if(state === 1) {
                this.jumpToGame(res);
            }    
        } , this);
    },

    jumpToBox(res) {
        let boxAppId = res.data.data.hz_app_id;
        let boxPath = res.data.data.hz_path;
        console.log("this.query.gid" , this.query.gid)
        if(window.wx) {
            let obj = {
                appId: boxAppId,
                path: boxPath,
                envVersion: 'release',
                extraData: {
                    gid: this.query.gid,
                },
                success: () => {
                    console.log("jump box success");
                }
            }
            wx.navigateToMiniProgram(obj);
        }
    },

    jumpToGame(res) {
        let gameAppId = res.data.data.app_id;
        if(this.selfAppId === gameAppId) {
            cc.director.loadScene("game");
        }else {
            let gameParam = res.data.data.param;
            console.log("param" , gameAppId , gameParam);
            let gamePath = res.data.data.path;
            if(window.wx) {
                let obj = {
                    appId: gameAppId,
                    path: gamePath,
                    envVersion: 'release',
                    extraData: gameParam,
                    success: () => {
                        console.log("jump game success");
                    },
                    fail: (err) => {
                        console.log("err" , err);
                    }
                }
                wx.navigateToMiniProgram(obj);
            }
        }
    },

    createImage(avatarUrl , spNode) {
        if(window.wx != undefined) {
            try {
                let image = wx.createImage();
                image.onload = () => {
                    try {
                        let texture = new cc.Texture2D();
                        texture.initWithElement(image);
                        texture.handleLoadedTexture();
                        let sp = new cc.SpriteFrame(texture);
                        spNode.getComponent(cc.Sprite).spriteFrame = sp;
                    }catch(e) {
                        console.log("load image error");
                    }
                }
                image.src = avatarUrl;
            }catch(e) {
                console.log("createImage error");
            }
        }else {
            cc.loader.load({
                url: avatarUrl, type: 'jpg'
            }, (err, texture) => {
                let sp = new cc.SpriteFrame(texture);
                spNode.getComponent(cc.Sprite).spriteFrame = sp;
            });
        }
    },
});
