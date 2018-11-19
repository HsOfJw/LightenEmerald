window.globalVariable = {
    shareImage: "http:\/\/gather.51weiwan.com\/uploads\/file\/20180730\/23145243b09bd6d21bcdb6ae169e0fd8.jpg",
    game_id: 7,
    scene_id: 7002,
    game_server: "https://gather.51weiwan.com/api/login/index",
    start_image: "http://gather.51weiwan.com//uploads//file//20180727//6a84f76e222431bb58c0246c6c6ad4e8.png",
    get_config: "https://gather.51weiwan.com/api/app/getConfig",
    get_moreGame: 'https://gather.51weiwan.com/api/app/redirectlist',
    share_image: null,//分享图片
    share_title: null,//分享标题

    current_stage: 1,

    game_config: null,//保存服务器获取的配置

    box_appId: null,//盒子appid
    box_path: null,//盒子页面路径
    box_extraData: null,//传递给盒子的数据
};

const STAGE_INFO = {
    1: {
        goal: 36,
        time: 30
    },
    2: {
        goal: 48,
        time: 55
    },
    3: {
        goal: 56,
        time: 80
    },
    4: {
        goal: 58,
        time: 135
    },
    5: {
        goal: 60,
        time: 200
    },
    6: {
        goal: 62,
        time: 280
    },
    7: {
        goal: 63,
        time: 350
    },
    8: {
        goal: 64,
        time: 600
    },
};

const ROW_NUM = 8;//每行个数
const COLUMN_NUM = 8;//每列个数
export {ROW_NUM , COLUMN_NUM , STAGE_INFO};