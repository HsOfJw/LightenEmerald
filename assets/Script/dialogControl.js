cc.Class({
    extends: cc.Component,

    properties: {
    },
    // onLoad () {},
    start () {
        //攻略
        this.strategy = this.node.getChildByName("strategy");
        this.strategy_ok = this.strategy.getChildByName("ok");
        //过关
        this.passStage = this.node.getChildByName("passStage");
        this.passDialog = this.passStage.getChildByName("dialog");
        this.passStage_ok = this.passStage.getChildByName("ok");
        this.showOff = this.passStage.getChildByName("showOff");

        //this.game = this.node
        this.registerEvent();
    },

    registerEvent() {
        let that = this;
        //确定
        this.strategy_ok.on(cc.Node.EventType.TOUCH_END , () => {
            this.node.destroy();
        } , this);
        this.passStage_ok.on(cc.Node.EventType.TOUCH_END , () => {
            cc.director.emit("next_stage");
            this.node.destroy();
        } , this);
        //炫耀
        this.showOff.on(cc.Node.EventType.TOUCH_END , () => {
            //cc.vv.shareofImage();
            cc.vv.Screenshots(that.passDialog);
        } , this);
    },
});
