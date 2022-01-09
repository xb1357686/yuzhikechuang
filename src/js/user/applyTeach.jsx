import React from 'react';
import Styles from '../../css/space.module.css';
import { Row, Col, Button, Modal, Input, Icon, Dropdown, Menu, AutoComplete, Tooltip, message } from 'antd';
import axiosInstance from "../config/apirequest";
const confirm = Modal.confirm;
export default class Activatemail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            userInfo: '',
            role: "student",
            loading: false,
            bindMessage: 'emailList',
            emailVisible: false,
            email: '',
            postEmail: '',
            changeEmail: '',
            spanTxt: '',
            dataSource: [],
            applyTeachVisible: false,
            applyState: 'list',
            applyFoot: null,
            applyData: null,
            teacherAuditVis: false,
            auditTxt: null,
            auditTxtFoot: null,
            qualifylist: [],
        }
    }

    componentWillMount = () => {
        var userInfo = this.props.userInfo;
        if(!userInfo) return;
        if (!userInfo.email) {
            this.setState({ bindMessage: 'inputEmail' })
        }
        this.setState({
            userInfo: userInfo,
            role: userInfo.role.name,
            email: userInfo.email,
        })
    }
    //修改密码
    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    handleCancel = () => {
        this.setState({ visible: false });
    }
    handleOk = () => {
        let _this = this;
        _this.setState({ loading: true });
        axiosInstance({
            method: 'post',
            url: '/passport/chanpass',
            data: _this.pwJson
        }).then(function (response) {
            if (response.data.code === 0) {
                localStorage.setItem("userToken", response.data.token)
                function success() {
                    Modal.success({
                        title: '修改成功',
                        onOk() {
                            _this.setState({ loading: false, visible: false });
                        }
                    });
                }
                success();
            } else {
                function error() {
                    Modal.error({
                        title: '修改失败',
                        content: '原因：' + response.data.message,
                        onOk() {
                            _this.setState({ loading: false });
                        }
                    });
                }
                error();
            }
        })
            .catch(function (error) {
                _this.setState({ loading: false, visible: false });
            });
    }
    onsetOldPassword = (event) => {
        this.pwJson.oldPassword = (event.target.value)
    }
    onsetNewPassword = (event) => {
        this.pwJson.newPassword = (event.target.value)
    }
    pwJson = {
        "oldPassword": "",
        "newPassword": ""
    }
    //邮箱绑定
    bindPassword = () => {
        this.setState({
            emailVisible: true,
        });
    }
    bindModleCancel = () => {
        this.setState({
            emailVisible: false
        })
        if (this.state.email) {
            this.setState({ bindMessage: 'emailList' });
        } else {
            this.setState({ bindMessage: 'inputEmail' });
        }
    }
    bindModleOK = () => {
        var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
        if (!reg.test(this.state.changeEmail)) {
            this.setState({ spanTxt: <span style={{ marginLeft: '10px', color: 'rgb(226, 60, 60)' }}>请输入正确的邮箱</span> });
            return;
        }

        axiosInstance({
            method: 'PUT',
            url: `/passport/email/identification?account=${this.state.changeEmail}`,
        }).then((res) => {
            if (res.data.code === 0) {
                this.setState({
                    bindMessage: 'okEmail',
                    postEmail: this.state.changeEmail
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
    changEmail = () => {
        this.setState({
            bindMessage: 'change'
        })
    }

    //申请教师
    applyTeachData = {
        "name": "",
        "mobile": "",
        "organize": "",
        "reason": ""
    }
    applyTeacher = () => {
       
        const { loading } = this.state, _this = this;
        axiosInstance.get('/user/application/progress').then((res) => {
            if (res.data.code === 0 && res.data.qualify) {
                if (_this.isApply(res.data.qualify)) {
                    this.setState({
                        applyFoot: [<Button key="applyOk" onClick={this.applyTeachCance}>关闭</Button>,
                        <Button key="applyCance" type="primary" loading={loading} onClick={this.applyRestart}>重新申请</Button>]
                    })
                } else {
                    this.setState({ applyFoot: [<Button key="applyOk" onClick={this.applyTeachCance}>关闭</Button>,], })
                }
                _this.setApplyData(res.data.qualify)
                _this.setState({
                    applyState: 'list',
                })
            } else {
                _this.setState({
                    applyState: 'postApply',
                    applyFoot: [
                        <Button key="applyOk" onClick={this.applyTeachCance}>取消</Button>,
                        <Button key="applyCance" type="primary" loading={loading} onClick={this.applyTeachOk}>提交</Button>]
                })
            }
        })
        this.setState({
            applyTeachVisible: true
        })
    }
    //判断是否有正在审核中的数据
    isApply = (data) => {
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.status === 1 || element.status === 2) {
                return false
            } else {
                return true
            }
        }
    }
    //渲染显示申请数据
    setApplyData = (data) => {
        let arr = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            arr.push(<Row key={i} gutter={16}>
                <Col span={8}>{element.name}</Col>
                <Col span={8}>{element.status === 0 ? '拒绝' : (element.status === 1 ? '通过' : '审核中')} </Col>
                <Col span={8}>{this.setCreateTime(element.createTime)}</Col>
            </Row>)
        }
        this.setState({ applyData: arr });
    }
    applyRestart = () => {
        const { loading } = this.state;
        this.setState({
            applyState: 'postApply',
            applyFoot: [<Button key="applyOk" onClick={this.applyTeachCance}>取消</Button>,
            <Button key="applyCance" type="primary" loading={loading} onClick={this.applyTeachOk}>提交</Button>]
        })
    }
    applyTeachCance = () => {
        this.setState({
            applyTeachVisible: false
        })
    }
    //申请教师数据
    onSetApplyName = (event) => {
        this.applyTeachData.name = event.target.value;
    }
    onSetApplyPhone = (event) => {
        this.applyTeachData.mobile = event.target.value;
    }
    onSetApplyClassName = (event) => {
        this.applyTeachData.organize = event.target.value;
    }
    onSetApplyReason = (event) => {
        this.applyTeachData.reason = event.target.value;
    }
    applyTeachOk = () => {
        var _this = this;
        for (const key in this.applyTeachData) {
            const element = this.applyTeachData[key];
            if (!element) {
                message.error('数据不能为空！');
                return;
            }
        }
        axiosInstance({
            method: 'post',
            url: '/user/application/submit',
            data: _this.applyTeachData
        }).then((res) => {
            if (res.data.code === 0) {
                message.success('申请成功，可在申请处查看进度！')
                this.setState({
                    applyTeachVisible: false
                })
            } else {
                message.error(res.data.message);
            }
        })
    }

    //教师审核
    teacherAudit = () => {
        axiosInstance.get('/admin/application/list').then((res) => {
            console.log(res.data);
            if (res.data.code === 0) {
                if (!res.data.qualifylist) {
                    this.setState({
                        auditTxt: '暂时没有申请的数据',
                        teacherAuditVis: true,
                        auditFoot: [<Button key="applyOk" onClick={this.auditCance}>关闭</Button>],
                    })
                    return;
                }
                let arr = [];
                for (let i = 0; i < res.data.qualifylist.length; i++) {
                    let elem = res.data.qualifylist[i];
                    arr.push(<Row key={i} gutter={16}>
                        <Col span={5}>{elem.name}</Col>
                        <Col span={5}>{elem.status === 0 ? '拒绝' : (elem.status === 1 ? '通过' : '审核中')} </Col>
                        <Col span={10}>{this.setCreateTime(elem.createTime)}</Col>
                        <Col span={4}><a onClick={this.examineApply.bind(this, i)}>查看</a></Col>
                    </Row>)
                }
                this.setState({
                    teacherAuditVis: true,
                    auditTxt: arr,
                    auditFoot: [<Button key="applyOk" onClick={this.auditCance}>关闭</Button>],
                    qualifylist: res.data.qualifylist
                })
            } else {
                message.error(res.data.message);
            }
        })
    }
    auditCance = () => {
        this.setState({
            teacherAuditVis: false
        })
    }
    examineApply = (i) => {
        const { qualifylist } = this.state;
        var data = qualifylist[i]
        let Dom = <div style={{ fontSize: '14px', fontWeight: '900' }}>
            <p><span style={{ width: '80px', display: 'inline-block' }}>姓名：</span>  <span style={{ fontWeight: '400' }}>{data.name}</span></p>
            <p><span style={{ width: '80px', display: 'inline-block' }}>联系方式：</span><span style={{ fontWeight: '400' }}>{data.mobile}</span></p>
            <p><span style={{ width: '80px', display: 'inline-block' }}>学校/机构：</span><span style={{ fontWeight: '400' }}>{data.organize}</span></p>
            <p><span style={{ width: '80px', display: 'inline-block' }}>申请理由：</span><span style={{ fontWeight: '400' }}>{data.reason}</span></p>
        </div>
        this.setState({
            auditTxt: Dom,
            auditFoot: [<Button key="applyOk" onClick={this.denyApply.bind(this, data.userID)}>拒绝</Button>, <Button key="okApply" type="primary" onClick={this.consentApply.bind(this, data.userID)}>同意</Button>],
        })
    }
    //拒接申请
    denyApply = (id) => {
        var _this = this;
        confirm({
            title: '是否要拒绝该条申请？',
            cancelText: "取消",
            okText: "确定",
            onOk() {
                axiosInstance({
                    method: 'PUT',
                    url: '/admin/application/review',
                    data: {
                        userid: id,
                        status: 0
                    }
                }).then((res) => {
                    console.log(res);
                    if (res.data.code === 0) {
                        message.success('已拒绝该申请！');
                        _this.setState({ teacherAuditVis: false })
                    } else {
                        message.error(res.data.message);
                    }
                })
            },
            onCancel() {
                console.log('拒绝');
            },
        });

    }
    consentApply = (id) => {
        var _this = this;
        confirm({
            title: '是否同意这条申请？',
            cancelText: "取消",
            okText: "确定",
            onOk() {
                axiosInstance({
                    method: 'PUT',
                    url: '/admin/application/review',
                    data: {
                        userid: id,
                        status: 1,
                    }
                }).then((res) => {
                    console.log(res);
                    if (res.data.code === 0) {
                        message.success('已同意该申请！');
                        _this.setState({ teacherAuditVis: false })
                    } else {
                        message.error(res.data.message);
                    }
                })
            },
            onCancel() {
                console.log('拒绝');
            },
        });
    }
    //时间过滤
    setCreateTime = (time) => {
        if (!time) return;
        let index = time.indexOf('.')
        let newTime = time.substring(0, index);
        newTime = newTime.replace('T', ' ');
        return newTime;
    }

    render() {
        const { role, visible, loading, spanTxt, dataSource, email, bindMessage, postEmail, applyTeachVisible, applyState, applyFoot, applyData, auditTxt, auditFoot, teacherAuditVis } = this.state;
        var applyOraudit, applyModuleTxt, footBtn, eamilTxt;

        //修改密码
        const pwChan = <Modal
            visible={visible}
            title="修改密码"
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={[
                <Button key="back" onClick={this.handleCancel}>取消</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>确认修改</Button>]}
        >
            <div>
                <h3 className={Styles.pwChan}>请输入您的旧密码 :</h3>
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码长度为6~16位" style={{ width: '100%' }} onBlur={this.onsetOldPassword} size='default' />
            </div>
            <div>
                <h3 className={Styles.pwChan}>请输入您的新密码 :</h3>
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码长度为6~16位" style={{ width: '100%' }} onBlur={this.onsetNewPassword} size='default' />
            </div>
        </Modal>;


        if (applyState === 'postApply') {
            //申请教师
            applyModuleTxt = <div>
                <div>
                    <h3 className={Styles.pwChan}>请输入您的姓名 :</h3>
                    <Input placeholder="姓名" style={{ width: '100%' }} onBlur={this.onSetApplyName} size='default' />
                </div>
                <div>
                    <h3 className={Styles.pwChan}>请输入您的联系方式 :</h3>
                    <Input placeholder="联系方式" style={{ width: '100%' }} onBlur={this.onSetApplyPhone} size='default' />
                </div>
                <div>
                    <h3 className={Styles.pwChan}>学校/机构名称 :</h3>
                    <Input placeholder="名称" style={{ width: '100%' }} onBlur={this.onSetApplyClassName} size='default' />
                </div>
                <div>
                    <h3 className={Styles.pwChan}>请输入您的申请理由 :</h3>
                    <Input placeholder="理由" style={{ width: '100%' }} onBlur={this.onSetApplyReason} size='default' />
                </div>
            </div>
        } else if (applyState === 'list') {
            applyModuleTxt = applyData
        }




        //申请教师还是审核教师
        if (role === "admin") {
            applyOraudit = <Menu.Item key="3"><a onClick={this.teacherAudit}>教师审核</a> </Menu.Item>
        } else {
            applyOraudit = <Menu.Item key="3"><a onClick={this.applyTeacher}>申请为教师</a> </Menu.Item>
        }

        //修改密码
        const menu = (
            <Menu>
                <Menu.Item key="0">
                    <a onClick={this.showModal}>修改密码</a>
                </Menu.Item>
                <Menu.Item key="1">
                    <a onClick={this.bindPassword}>邮箱绑定</a>
                </Menu.Item>
                {applyOraudit}
            </Menu>
        );
        //输入邮箱
        var bindemail = <div><span style={{ marginRight: '10px' }}>请输入邮箱 : </span>
            <AutoComplete
                dataSource={dataSource}
                style={{ width: 200 }}
                onChange={this.handleChange}
                placeholder="Email"
            />
            {spanTxt}</div>
        //已发送至邮箱
        var text = <div>
            <p>1、查看邮箱中的“垃圾邮件”或”订阅邮件”，也可能直接被系统拦截；</p>
            <p>2、可再次重新登录，将会有【邮件验证】提示；</p>
            <p>3、如果还是没有收到激活邮件，需要您使用其他邮箱重新注册。</p>
        </div>
        var emailSuccess = <div style={{ textAlign: 'center' }}>
            <div><Icon style={{ fontSize: "60px", color: "#008cc8", marginBottom: "8px" }} type="check-circle" theme="outlined" /></div>
            <p style={{ fontWeight: '700', fontSize: '16px' }}>已向<span style={{ color: '#EF1300' }}>{postEmail}</span>发送邮件</p>
            <p>请登录邮箱点击确认链接完成验证</p>
            <p>
                <Tooltip placement="rightBottom" title={text}>
                    <span style={{ color: '#008cc8' }}>收不到邮件怎么办?</span>
                </Tooltip>
            </p>
        </div>

        //邮箱绑定
        var emailList = <div>
            <span>{email}</span><a onClick={this.changEmail} style={{ float: 'right' }}>更换</a>
        </div>
        if (bindMessage === 'emailList') {
            footBtn = [<Button key="cance" onClick={this.bindModleCancel}>取消</Button>];
            eamilTxt = emailList
        } else if (bindMessage === 'inputEmail' || bindMessage === 'change') {
            footBtn = [<Button key="cance" onClick={this.bindModleCancel}>取消</Button>,
            <Button key="ok" type="primary" onClick={this.bindModleOK}>确定</Button>];
            eamilTxt = bindemail;
        } else if (bindMessage === 'okEmail') {
            footBtn = null;
            eamilTxt = emailSuccess;
        }


        const bindEmail = <Modal title="邮箱绑定"
            visible={this.state.emailVisible}
            onCancel={this.bindModleCancel}
            footer={footBtn}
        >
            {eamilTxt}
        </Modal>

        const applyTeacherModle = <Modal
            visible={applyTeachVisible}
            title="教师申请表"
            onCancel={this.applyTeachCance}
            footer={applyFoot}
        >{applyModuleTxt}</Modal>;


        const teacherAuditModele = <Modal
            visible={teacherAuditVis}
            title="教师申请列表"
            onCancel={this.auditCance}
            footer={auditFoot}
        >{auditTxt}</Modal>
        return (
            <Dropdown overlay={menu} trigger={['click']}>
        <Col md={{ span: 3 }} className={Styles.listBar}>
            
            <img src="./images/install.png" alt="设置" /><span>设置</span>
           
            {pwChan}
            {bindEmail}
            {applyTeacherModle}
            {teacherAuditModele}
        </Col>
        </Dropdown>
        );
    }
}