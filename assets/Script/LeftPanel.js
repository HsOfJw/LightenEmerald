const net = require("./net");
cc.Class({
    extends: cc.Component,

    properties: {
        content: {displayName: "内容节点", default: null, type: cc.Node},
        leftPanelItem: {displayName: "侧拉板子节点", default: null, type: cc.Prefab},
    },


    onLoad() {
        this._initPage();
    },
    //初始化页面信息
    _initPage() {
        this.node.setPosition(-629, 0);
        let moveAction = cc.moveTo(0.2, cc.p(-190, 0));
        this.node.runAction(moveAction);
        this.content.removeAllChildren();

        //发送请求
        if (window.wx !== undefined) {
            wx.request({
                url: globalVariable.get_moreGame,
                data: {
                    game_id: globalVariable.game_id,
                    location: globalVariable.scene_id,
                },
                success: res => {
                    //console.log("服务器获取的游戏列表为",res);
                    this._showData(res);
                },
                fail: function (res) {
                    //console.log("从服务器获取游戏列表失败", res);
                }
            })
        }

    },

    //遍历展示数据
    _showData(recData) {

        if (recData.data.data.state === "10") {
            console.log("游戏列表审核中，不进行遍历展示")
        } else {
            let gameList = recData.data.data.redirect;
            for (let i = 0; i < gameList.length; i++) {
                let item = cc.instantiate(this.leftPanelItem);
                let script = item.getComponent("PanelItem");
                if (script) {
                    let directInfo = {
                        img_url: gameList[i].img_url,
                        game_id: gameList[i].game_id,
                        name: gameList[i].name,
                        app_id: recData.data.data.hz_app_id,
                        path: recData.data.data.hz_path
                    };
                    script.setItemData(directInfo);
                }
                this.content.addChild(item);
            }
        }
    },
    onBtnClickBack() {
        let func = cc.callFunc(() => {
            this.node.destroy();
        })

        let moveAction = cc.moveTo(0.2, cc.p(-629, 0));
        let seq2 = cc.sequence(moveAction, func);
        this.node.runAction(seq2);


    }
    // update (dt) {},
});
