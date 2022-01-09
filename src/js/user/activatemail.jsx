import React from 'react';
import { Button, Icon } from 'antd';
import axiosInstance from "../config/apirequest";
export default class Activatemail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageHeight: 0,
            emailState: 'okEmail',
            message: ''
        }
    }

    componentWillMount = () => {
        var token = this.GetRequest('token');
        if (token) {
            axiosInstance.get(`/passport/email/activation?token=${token}`).then((res) => {
                if (res.data.code === 0) {
                    this.setState({
                        emailState: 'okEmail'
                    })
                } else {
                    this.setState({
                        emailState: 'err',
                        message: res.data.message
                    })
                }
            })
        }
        let pageHeight = document.body.clientHeight - 64 - 164;  //减去头部和底部的高度
        this.setState({
            pageHeight
        })
    }
    //回到首页
    goback = () => {
        this.props.history.push({ pathname: `/` })
    }

    //获取url参数
    GetRequest(name) {
        var after = window.location.hash.split("?")[1];
        if (after) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = after.match(reg);
            if (r != null) {
                return decodeURIComponent(r[2]);
            }
            else {
                return null;
            }
        }
    }
    render() {

        var emailSuccess, emailErr, showDom

        emailSuccess = <div >
            <p><Icon style={{ fontSize: "100px", color: "#008cc8", marginBottom: "8px", marginTop: '30px' }} type="check-circle" theme="outlined" /></p>
            <p style={{ fontWeight: 900, fontSize: '20px' }}>恭喜你，邮箱验证成功</p>
            <Button onClick={this.goback} style={{ padding: '0 48px', fontSize: '20px' }} type="primary" size='large'>返回首页</Button>
        </div>

        emailErr = <div style={{ width: '320px', margin: '0 auto', textAlign: 'center' }}>
            <p><Icon style={{ fontSize: "100px", color: "rgb(220, 69, 69)", marginBottom: "8px", marginTop: '30px' }} type="close-circle" theme="outlined" /></p>
            <p style={{ fontWeight: 900, fontSize: '20px' }}>{this.state.message}</p>
            <Button onClick={this.goback} style={{ padding: '0 48px', fontSize: '20px' }} type="primary" size='large'>返回首页</Button>
        </div>
        if (this.state.emailState === 'okEmail') {
            showDom = emailSuccess
        } else if (this.state.emailState === 'err') {
            showDom = emailErr
        }

        return (
            <div style={{ textAlign: 'center', padding: '80px', minHeight: this.state.pageHeight + 'px' }}>
                {showDom}
            </div>

        );
    }
}