
export const GOTO_LOGIN='goto_login';
export const EXPIRE_TOKEN="expire_token";
export const GOTO_REFRESH_NEWS='goto_refresh_news'
export  function gotoLogin(isLogin = false) {
    return {
        type:GOTO_LOGIN,
        isLogin
    }
}
export function expireToken() {
    return {
        type:EXPIRE_TOKEN,
    }
}
export function newsIsRead() {
    return {
        type:GOTO_REFRESH_NEWS,
    }
}