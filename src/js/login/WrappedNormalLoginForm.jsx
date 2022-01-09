import React from 'react';
import axios from '../config/apirequest.js';
import { gotoLogin } from '../../actions';
import {
  Form,
  Icon,
  Input,
  Button,
  Spin,
  Tooltip,
  Modal,
  AutoComplete,
} from 'antd';

const FormItem = Form.Item;

export default class NormalLoginForm extends React.Component {
  state = {
    loading: false,
    visible: false,
    dataSource: [],
    spanTxt: '',
    bindMessage: 'inputEmail',
    changeEmail: ''
  }
  //异步发送登录请求
  async loginRequest (loginData) {
    try {
      let response = await axios({ method: 'post', url: '/sys/login', data: loginData });
      if (response.data.code === 200 && response.data.data) {
        this.setState({ loading: false });
        localStorage.setItem("userInfo", JSON.stringify(response.data.data));
        localStorage.setItem("userToken", response.data.data.token);
        this
          .props
          .onLoginSuccess();
        const { dispatch } = this.props;
        if (dispatch) {
          dispatch(gotoLogin(false));
        }
      } else {
        Modal.error({ title: '登录失败', content: response.data.message });
        this.setState({ loading: false });
      }
    } catch (error) {
      console.log(error);
    }
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this
      .props
      .form
      .validateFields((err, values) => {
        if (!err) {
          this.setState({ loading: true });
          this.loginRequest(values);
        }
      });
  }
  // 重置密码
  restPassword = () => {
    this.setState({ visible: true, bindMessage: 'inputEmail' });

  }
  restModleCancel = () => {
    this.setState({
      visible: false
    })
  }
  restModleOK = () => {
    var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
    if (!reg.test(this.state.changeEmail)) {
      console.log(213)
      this.setState({ spanTxt: <span style={{ marginLeft: '10px', color: 'rgb(226, 60, 60)' }}>请输入正确的邮箱</span> });
      return;
    }
    axios.get(`/passport/retrieve?account=${this.state.changeEmail}`).then((res) => {
      console.log(res.data);
      if (res.data.code === 0) {
        this.setState({
          bindMessage: 'okEmail',
        });
      } else {
        this.setState({ spanTxt: <span style={{ marginLeft: '10px', color: 'rgb(226, 60, 60)' }}>{res.data.message}</span> });
      }
    })
  }
  handleChange = (value) => {
    this.setState({
      dataSource: !value || value.indexOf('@') >= 0 ? [] : [
        `${value}@gmail.com`,
        `${value}@163.com`,
        `${value}@qq.com`,
      ],
      spanTxt: '',
      changeEmail: value
    });
  }
  render () {
    const { getFieldDecorator } = this.props.form, { dataSource, spanTxt, bindMessage, changeEmail } = this.state;
    var emailText, bindemail, text, emailSuccess, footBtn;

    //输入邮箱
    bindemail = <div><span style={{ marginRight: '10px' }}>请输入邮箱 : </span>
      <AutoComplete
        dataSource={dataSource}
        style={{ width: 200 }}
        onChange={this.handleChange}
        placeholder="Email"
      />
      {spanTxt}</div>


    //已发送至邮箱
    text = <div>
      <p>1、查看邮箱中的“垃圾邮件”或”订阅邮件”，也可能直接被系统拦截；</p>
      <p>2、可再次重新登录，将会有【邮件验证】提示；</p>
      <p>3、如果还是没有收到激活邮件，需要您使用其他邮箱重新注册。</p>
    </div>
    emailSuccess = <div style={{ textAlign: 'center' }}>
      <div><Icon style={{ fontSize: "60px", color: "#008cc8", marginBottom: "8px" }} type="check-circle" theme="outlined" /></div>
      <p style={{ fontWeight: '700', fontSize: '16px' }}>已向<span style={{ color: '#EF1300' }}>{changeEmail}</span>发送邮件</p>
      <p>请登录邮箱点击确认链接完成验证</p>
      <p>
        <Tooltip placement="rightBottom" title={text}>
          <span style={{ color: '#008cc8' }}>收不到邮件怎么办?</span>
        </Tooltip>
      </p>
    </div>


    if (bindMessage === 'inputEmail') {
      footBtn = [<Button key="cance" onClick={this.restModleCancel}>取消</Button>,
      <Button key="ok" type="primary" onClick={this.restModleOK}>确定</Button>];
      emailText = bindemail
    } else if (bindMessage === 'okEmail') {
      emailText = emailSuccess
      footBtn = null;
    }
    return (
      <Spin spinning={this.state.loading} tip="登 陆 中...">
        <Form onSubmit={this.handleSubmit} className="login-form">
          <FormItem>
            {getFieldDecorator('account', {
              rules: [
                {
                  required: true,
                  message: '请输入正确的用户名!'
                }
              ]
            })(
              <Input
                prefix={< Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="请输入用户名" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: '请输入正确的密码!'
                }
              ]
            })(
              <Input
                prefix={< Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="请输入密码" />
            )}
          </FormItem>
          {/* <FormItem style={{marginBottom:0}}>
                        <div
                            className="login-form-forgot"
                            style={{
                                float: 'right',
                                color: "red",
                                cursor: "pointer"
                            }}
                            onClick={this.restPassword}
                        >忘记密码</div>
                    </FormItem> */}
          <FormItem>
            {/* <Tooltip title="请联系您的教师或管理员"> */}

            {/* </Tooltip> */}
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              style={{
                width: "100%",
                display: 'block'
              }}>
              登 录
                        </Button>
          </FormItem>
        </Form>
        <Modal title="重置密码"
          visible={this.state.visible}
          onCancel={this.restModleCancel}
          footer={footBtn}
        >
          {emailText}
        </Modal>

      </Spin>
    );
  }
}
