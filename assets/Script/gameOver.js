cc.Class({
    extends: cc.Component,

    properties: {
    },

    start () {
        this.help = this.node.getChildByName("help");//求助
        this.again = this.node.getChildByName("overAgain");//再来一次
        this.close = this.node.getChildByName("close");//关闭
        this.canvas = this.node.parent.parent;


        this.registerEvent();

        let reliveTimes = (cc.sys.localStorage.getItem("relive"));
        //console.log("看视频次数" , reliveTimes);
        if(reliveTimes > 0) {
            this.again.active = true;
            this.help.active = false;
        }else {
            this.again.active = false;
            this.help.active = true;
        }
    },

    registerEvent() {
        this.help.on(cc.Node.EventType.TOUCH_END , () => {
            cc.vv.shareofImage();
            cc.director.emit("again");
        } , this);
        this.again.on(cc.Node.EventType.TOUCH_END , () => {
            cc.vv.rewardVideoAd();
            //cc.director.emit("again");
            //this.node.destroy();
        } , this);
        this.close.on(cc.Node.EventType.TOUCH_END , () => {
            this.canvas.getChildByName("startBg").active = true;
            this.canvas.getChildByName("start").active = true;
            this.canvas.getChildByName("start").getChildByName("startBtn").active = true;
            this.node.parent.getChildByName("notice").active = true;
            this.node.destroy();
        } , this);
    },
});
