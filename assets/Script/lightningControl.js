cc.Class({
    extends: cc.Component,

    properties: {
     
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.layout = this.node.parent;

        let that = this;
        //点击之后携带点击节点标签分发事件
        this.node.on(cc.Node.EventType.TOUCH_END , () => {
            cc.director.emit("clicked" , {
                msg : that.node.tag,
            });
        } , this);
    },
});
