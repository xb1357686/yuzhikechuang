import React from 'react';
import { Button, Form, Icon, Input,message } from 'antd';
import axiosInstance from "../config/apirequest";
const FormItem = Form.Item;
export default class resetPassWord extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pageHeight: 0,
            email: '',
            message: '',
            showState: 'form'
        }
    }

    componentWillMount = () => {
        var token = this.GetRequest('token');
        if (token) {
            axiosInstance.get(`passport/mailvalid?token=${token}`).then((res) => {
                if (res.data.code === 0) {
                    this.setState({
                        email: res.data.email
                    })
                } else {
                    this.setState({
                        message: res.data.message,
                        showState: 'err'
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
    handleSubmit = (e) => {
        e.preventDefault();
        if (this.state.message) {
            return;
        }
        this.props.form.validateFields((err, values) => {
            if (!err) {
                var token = this.GetRequest('token');
                axiosInstance({
                    method: 'post',
                    url: 'passport/resetpass',
                    data: {
                        resettoken: token,
                        newPassword: values.password
                    },
                }).then((res) => {
                    console.log(res.data);
                    if (res.data.code === 0) {
                        this.setState({
                            showState: 'okForm'
                        })
                    }else {
                        message.error(res.data.message);
                    }
                })
            }
        });
    }
    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('两次密码输入不一致！');
        } else {
            callback();
        }
    }
    //回到首页
    goback = () => {
        this.props.history.push({ pathname: `/` })
    }
    render() {

        const { getFieldDecorator } = this.props.form;
        var passForm, passSuccess, showDom,passErr

        //密码输入
        passForm = <div style={{ width: '320px', margin: '0 auto' }}>
            <h1>重设密码</h1>
            <p>账号：{this.state.email ? this.state.email : '空'}</p>
            <Form onSubmit={this.handleSubmit} className="login-form">
                <FormItem>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: '密码不能为空！' }],
                    })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="请输入新密码" />
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('confirmPassword', {
                        rules: [{ required: true, message: '两次密码输入不一致！' },
                        {
                            validator: this.compareToFirstPassword,
                        }],
                    })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="请确认新密码" />
                    )}
                </FormItem>
                <FormItem>
                    <div style={{ color: "#EF1300" }}>{this.state.message}</div>
                    <Button style={{ width: '100%' }} type="primary" htmlType="submit" className="login-form-button">
                        提交
          </Button>

                </FormItem>
            </Form>
        </div>

        //密码修改成功

        passSuccess = <div style={{ width: '320px', margin: '0 auto', textAlign: 'center' }}>
            <p><Icon style={{ fontSize: "100px", color: "#008cc8", marginBottom: "8px", marginTop: '30px' }} type="check-circle" theme="outlined" /></p>
            <p style={{ fontWeight: 900, fontSize: '20px' }}>恭喜你，密码设置成功</p>
            <Button onClick={this.goback} style={{ padding: '0 48px', fontSize: '20px' }} type="primary" size='large'>返回首页</Button>
        </div>

        //邮箱验证出现错误
        passErr = <div style={{ width: '320px', margin: '0 auto', textAlign: 'center' }}>
            <p><Icon style={{ fontSize: "100px", color: "rgb(220, 69, 69)", marginBottom: "8px", marginTop: '30px' }} type="close-circle" theme="outlined" /></p>
            <p style={{ fontWeight: 900, fontSize: '20px' }}>{this.state.message}</p>
            <Button onClick={this.goback} style={{ padding: '0 48px', fontSize: '20px' }} type="primary" size='large'>返回首页</Button>
        </div>

        if (this.state.showState === 'form') {
            showDom = passForm
        } else if (this.state.showState === 'okForm') {
            showDom = passSuccess
        } else if (this.state.showState === 'err') {
            showDom = passErr
        }

        return (
            <div style={{ padding: '80px', minHeight: this.state.pageHeight + 'px' }}>
                {showDom}
            </div>
        );
    }
}