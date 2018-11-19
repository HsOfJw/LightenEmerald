module.exports = {
    useNet(net){
        // let net = {
        //     url	: '',           //开发者服务器接口地址	
        //     data : '' ,         //请求的参数	
        //     header : '',        //设置请求的 header，header 中不能设置 Referer。	
        //     method : '',        //（需大写）有效值：OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT	
        //     dataType : '',      //如果设为json，会尝试对返回的数据做一次 JSON.parse	
        //     responseType : '',  //设置响应的数据类型。合法值：text、arraybuffer	1.7.0
        //     success : '',       //收到开发者服务成功返回的回调函数	
        //     fail : '',          //接口调用失败的回调函数	
        //     complete : ''       //接口调用结束的回调函数（调用成功、失败都会执行）
        // }
        if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT_GAME){
            wx.request({
                url: net.url,
                data: net.data,
                header: net.header,
                method: net.method,
                dataType: net.dataType,
                responseType: net.responseType,
                success: net.success,
                fail: net.fail,
                complete: net.complete,
            })
        }else{
            var xhr = cc.loader.getXMLHttpRequest();
            this.streamXHREvents(xhr,net.method,net.success,net.fail);

            xhr.open(net.method, net.url, true);
            if (cc.sys.isNative) {
                xhr.setRequestHeader("Accept-Encoding","gzip,deflate");
            }
            xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");

            // note: In Internet Explorer, the timeout property may be set only after calling the open()
            // method and before calling the send() method.
            xhr.timeout = 5000;// 5 seconds for timeout

            let value = ''
            for(let key in net.data){
                value += key + '=' + net.data[key]
            }
            // console.log(xhr)
            // console.log(value)
            xhr.send(value);
        }
    },
    streamXHREvents: function ( xhr, method, responseHandler, fail) {
        var handler = responseHandler || function (response) {
            return method + " Response (30 chars): " + response.substring(0, 30) + "...";
        };
        // Simple events
        ['loadstart', 'abort', 'error', 'load', 'loadend', 'timeout'].forEach(function (eventname) {
            xhr["on" + eventname] = function () {
                if (eventname === 'timeout') {
                    if(fail){
                        fail()
                    }else{
                        console.log(timeout);   
                    }
                }
            };
        });
    
        // Special event
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                handler(xhr.responseText);
            }
        };
    }
}