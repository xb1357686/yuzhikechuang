import axios from 'axios';
import { apiUrl } from './baseUrl.js';
import { notification, message } from 'antd';
// http request 拦截器
axios
  .interceptors
  .request
  .use(config => {
    config.baseURL = `${apiUrl}`;
    let token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  }, err => {
    return Promise.reject(err);
  });

axios.interceptors.response.use(function (response) {
  // token 已过期，重定向到登录页面
  if (response.data.code === 2006) {
    message.error('登陆已过期，请重新登陆！！！');
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userToken");
    window.location.href = window.location.origin;
    // this.props.history.push("/");
    return false;
  }
  if (response.data && (response.data.code === 201 || response.data.code === 2007)) {
    notification.open({
      message: response.data.message,
      description: "",
      // icon: <Icon type="close-circle" style={{color:'red'}} />,
    });
    return false;
  }
  return response
}, function (error) {
  // Do something with response error
  return Promise.reject(error)
})

export default axios;