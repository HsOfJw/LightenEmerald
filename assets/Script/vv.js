cc.Class({
    extends: cc.Component,

    properties: {
    },

    //测试截图
    testShot(ssNode){
        let obj = {
            success: (res) => {
                let screenWidth = res.windowWidth;
                let screenHeight = res.windowHeight;
                let size = ssNode.getContentSize();
                let ratio = screenHeight / 1334;
                if(screenHeight > 800) {
                    size.width = size.width * ratio * 0.8;
                    size.height = size.height * ratio * 0.8;
                }else {
                    size.width = size.width * ratio;
                    size.height = size.height * ratio;
                }
                let screenshotX = (screenWidth - size.width)/2; //屏幕截取左上角X坐标
                let screenshotY = (screenHeight - size.height)/2 - ssNode.y * ratio;//屏幕截取左上角Y坐标
                //判断当手机分辨率进行截图适配
                if (window.wx != undefined) {
                    let image = canvas.toTempFilePathSync({
                        x: screenshotX,
                        y: screenshotY,
                        width:size.width,
                        height:size.height,
                        destWidth: size.width,
                        destHeight: size.height,
                    });
                    window.wx.shareAppMessage({
                        title : "我离大数学家只差一步，看看你能过几关？",
                        imageUrl: image,
                        //success: that.getshareInfo
                    });
                }
            }
        }
        wx.getSystemInfo(obj);
    },

    //截图
    Screenshots(ssNode){
        let that = this;
        let canvas = cc.game.canvas;
        let ratio = canvas.height / 1334
        let size = ssNode.getContentSize();
        // size.width = size.width * ratio*0.8
        // size.height = size.height * ratio*0.8
        // let newHeight = size.height;
        if(canvas.height < 750) {
            size.width = size.width * ratio;
            size.height = size.height * ratio;
        }else if(canvas.height >= 750 && canvas.height < 800) {
            size.width = size.width * ratio * 0.89;
            size.height = size.height * ratio * 0.89;
        }else if(canvas.height >= 800) {
            size.width = size.width * ratio * 0.8;
            size.height = size.height * ratio * 0.8;
        }
        let screenshotX = (canvas.width - size.width)/2; //屏幕截取左上角X坐标
        let screenshotY = (canvas.height - size.height)/2 - ssNode.y * ratio;//屏幕截取左上角Y坐标
        // if(canvas.height >= 800) {
        //     screenshotY += 20;
        // }
        //判断当手机分辨率进行截图适配
        if (window.wx != undefined) {
            let image = canvas.toTempFilePathSync({
                x: screenshotX,
                y: screenshotY,
                width:size.width,
                height:size.height,
                destWidth: size.width,
                destHeight: size.height,
            });
            window.wx.shareAppMessage({
                title : "我离大数学家只差一步，看看你能过几关？",
                imageUrl: image,
                //success: that.getshareInfo
            });
        }
    },

    //分享海报
    shareofImage(event){
        if (window.wx != undefined) {
            window.wx.shareAppMessage({
                title : globalVariable.share_title,
                imageUrl: globalVariable.share_image,
                //success: that.getshareInfo
            });
        }
    },

    //显示微信转发按钮
    showShareButton() {
        if (window.wx != undefined) {
            wx.showShareMenu();
            wx.onShareAppMessage(
                () => {
                   return {
                       title: "xxxxx",
                       imageUrl: globalVariable.shareImage
                   }
                }
            );
        }
    },

    //预览图片
    prevImage(url){
        if(window.wx != undefined){
            wx.previewImage({
                current : this.box_qrcode,
                urls : [url]
            })
        }
    },

    //客服
    jumpToCustomer() {
        if(window.wx != undefined){
            wx.openCustomerServiceConversation();
        }
    },

    //手机震动
    shake() {
        if(window.wx != undefined){
            let obj = {
                success:function(){
                    console.log("shake")
                }
            }
            wx.vibrateLong(obj);
        }
    },
    
    //跳转游戏盒子
    jumpToBox() {
        if(window.wx) {
            let obj = {
                appId: globalVariable.box_appId,
                path: '',
                envVersion: 'release',
                //success: () => {
                //    console.log("jump success");
                //}
            }
            wx.navigateToMiniProgram(obj);
        }
    },

    //激励视频
    rewardVideoAd() {
        cc.director.pause();
        let judge = true;
        if(window.wx) {
            let createRewardVideoAd = function(res) {
                console.log("手机配置信息" , res);
                let SDKVersion = parseInt(res.SDKVersion.replace(/\./g ,""));
                console.log("sdkVersion" , SDKVersion);
                if(SDKVersion >= 204) {
                    let video = wx.createRewardedVideoAd({adUnitId: 'adunit-ea15c1cb41690a20'});
                    video.show()
                    .catch(err => {
                        video.load()
                        .then(() => video.show())
                    });
                    video.onClose(res => {
                        if (res && res.isEnded || res === undefined) {
                            // 正常播放结束，可以下发游戏奖
                            if(judge) {
                                cc.director.emit("again");
                                judge = false;
                            }   
                        }
                        cc.director.resume();  
                    });
                    video.onError(err => {
                        cc.director.emit("again");
                    });
                }
            };

            let obj = {
                success: createRewardVideoAd,
            }

            wx.getSystemInfo(obj);
        }
    },

    //banner广告
    bannerAd() {
        if (window.wx != undefined) {
            let winSize = wx.getSystemInfoSync();
            console.log("winSize", winSize);
            let bannerHeight = 120;
            let bannerWidth = 375;
            let banner = wx.createBannerAd({
                adUnitId: 'adunit-13a21d7c805ed9b2',
                style: {
                    left: (winSize.windowWidth - bannerWidth) / 2,
                    top: winSize.windowHeight - bannerHeight,
                    width: bannerWidth
                }
            });
            banner.show();
            banner.onLoad(() => {
                //console.log('banner 广告加载成功');
            });
        }
    }
});
