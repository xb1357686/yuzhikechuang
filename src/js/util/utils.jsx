export const getParam = (name) => {
    let index = window.location.href.indexOf('?');
    let url = window.location.href.substr(index); //获取url中"?"符后的字串
    var theRequest = new Object();
    var strs;
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    if (theRequest[name]) {
        window.location.href = window.location.href.slice(0, index);
        return theRequest[name];
    } else {
        return null
    }
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
export const isLogin = () => {
    return localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : '';
}
