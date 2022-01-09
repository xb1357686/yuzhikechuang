import {EXPIRE_TOKEN,GOTO_LOGIN,GOTO_REFRESH_NEWS} from '../actions';
import { combineReducers } from 'redux';

//让token失效维护函数
const expireToken = (state = false,action) => {
    switch(action.type) {
        case EXPIRE_TOKEN:
            localStorage.removeItem("userInfo");
            localStorage.removeItem("userToken");
            return true;
        default:
            return state;            
    }
}
//转去登陆的状态维护函数
const gotoLogin =  (state = false,action) => {
    switch(action.type) {
        case GOTO_LOGIN:
            return action.isLogin;
        default:
            return state;
    }
}
//
const newsIsRead = (state = false,action) => {
    switch (action.type) {
        case GOTO_REFRESH_NEWS:
            return true;
        default:
            return state;
    }
}

const reducer = combineReducers({
    expireToken,
    gotoLogin,
    newsIsRead,
});

export default reducer;