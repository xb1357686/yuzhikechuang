import React from 'react';
import Styles from '../../css/space.module.css';
import { Row, Col, Button, Modal, Input, Avatar, List, Popconfirm, message,Select } from 'antd';
import axiosInstance from "../config/apirequest"
import {baseUrl} from '../config/baseUrl.js'
const { TextArea } = Input;
const Option = Select.Option;
export default class TeacherSpace extends React.Component {
        constructor(props) {
        super(props);
        this.state = {
        resetloading: false,
        resetvisible: false,
        resetTchloading: false,
        resetTchvisible: false,
        frozenloading: false,
        frozenvisible: false,
        thawloading: false,
        thawvisible: false,
        Invitevisible: false,
        Inviteloading: false,
        Renamevisible: false,
        Renameloading: false,
        Checkvisible: false,
        Productionvisible: false,
        Checkloading: false,
        Newsvisible: false,
        Newsloading: false,
        classCode: "",
        classList: "",
        CheckJson: "",
        TchClassesList: [],
        }
    }
    componentWillMount = () => {
        let userInfo = JSON.parse(localStorage.getItem("userInfo"));
        this.getTchClass(userInfo.id)
    }
    /* 创建班级 */

    creatJson = {
        className: ""
    }

    onsetClassName = (event) => {
        this.creatJson.className = (event.target.value);
    }

    onCreateClass = () => {
        let _this = this;
        let TchID = JSON.parse(localStorage.getItem("userInfo")).id
        if (_this.creatJson.className !== "") {
            axiosInstance({
                method: 'post',
                url: '/class/create',
                data: _this.creatJson
            }).then(function (response) {
                if (response.data.code === 0) {
                    function success() {
                        Modal.success({
                            title: '创建成功',
                            onOk() {
                                _this.getTchClass(TchID)
                            }
                        });
                    }
                    success();
                } else {
                    function error() {
                        Modal.error({
                            title: '创建失败',
                            content: '原因：' + response.data.message,
                            onOk() {
                                _this.getTchClass(TchID)                                
                            }
                        });
                    }
                    error();
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
    }

    /* 获取教师班级信息 */

    getTchClass = (value) => {
         let _this = this;
         axiosInstance({
             method: 'get',
             url: '/user/class/created/query/' + value,
         }).then(function (response) {
             if (response.data.code === 0) {
                 let creatJson = response.data.classes
                 let creatlist = [];
                 for (var i = 0; i < creatJson.length; i++) {
                     creatlist[i] = {
                         title: creatJson[i].name,
                         code: creatJson[i].code,
                         id: creatJson[i]._id,
                         logo: creatJson[i].logo
                     }
                 }
                 _this.setState({
                     TchClassesList: creatlist
                 })
             } else {
                 _this.setState({
                     TchClassesList: []
                 })
             }
         }).catch(function (error) {
             console.log(error);
         });
     }

    /* 重置学生密码Model按钮 */

    showResetModal = () => {
        this.setState({
            resetvisible: true,
        });
    }
    ResethandleCancel = () => {
        this.setState({ resetvisible: false });
    }
    onResetUsername = (event) => {
        this.resetJson.username = (event.target.value)
    }
    onResetPassword = (event) => {
        this.resetJson.newPassword = (event.target.value)
    }

    /* 重置学生密码接口 */

    resetJson = {
        username: "",
        newPassword: ""
    }

    handleReset = () => {
        let _this = this;
        _this.setState({ resetloading: true });
        axiosInstance({
            method: 'post',
            url: '/admin/repass/student',
            data: _this.resetJson
        }).then(function (response) {
            if (response.data.code === 0) {
                function success() {
                    Modal.success({
                        title: '修改成功',
                        onOk() {
                            _this.setState({ resetloading: false, resetvisible: false });
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
                            _this.setState({ resetloading: false });
                        }
                    });
                }
                error();
            }
        })
            .catch(function (error) {
                console.log(error);
                _this.setState({ resetloading: false, resetvisible: false });
            });
    }

    /* 重置教师密码Model按钮 */

    showTchResetModal = () => {
        this.setState({
            resetTchvisible: true,
        });
    }
    ResetTchhandleCancel = () => {
        this.setState({ resetTchvisible: false });
    }
    onResetTchUsername = (event) => {
        this.resetTchJson.username = (event.target.value)
    }
    onResetTchPassword = (event) => {
        this.resetTchJson.newPassword = (event.target.value)
    }
    onResetTchKey = (event) => {
        this.resetTchJson.key = (event.target.value)
    }

    /* 重置教师密码接口 */

    resetTchJson = {
        username: "",
        newPassword: "",
        key: ""
    }

    handleTchReset = () => {
        let _this = this;
        _this.setState({ resetTchloading: true });
        axiosInstance({
            method: 'post',
            url: '/admin/repass/teacher',
            data: _this.resetTchJson
        }).then(function (response) {
            if (response.data.code === 0) {
                function success() {
                    Modal.success({
                        title: '修改成功',
                        onOk() {
                            _this.setState({ resetTchloading: false, resetTchvisible: false });
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
                            _this.setState({ resetTchloading: false });
                        }
                    });
                }
                error();
            }
        })
            .catch(function (error) {
                console.log(error);
                _this.setState({ resetTchloading: false, resetTchvisible: false });
            });
    }

    /* 冻结用户Model按钮 */

    showFrozenModal = () => {
        this.setState({
            frozenvisible: true,
        });
    }
    FrozenhandleCancel = () => {
        this.setState({ frozenvisible: false });
    }
    onFrozenUsername = (event) => {
        this.frozenJson.username = (event.target.value)
    }

    /* 冻结用户接口 */

    frozenJson = {
        username: "",
        blocked: true
    }

    handleFrozen = () => {
        let _this = this;
        _this.setState({ frozenloading: true });
        axiosInstance({
            method: 'post',
            url: '/admin/blocked',
            data: _this.frozenJson
        }).then(function (response) {
            if (response.data.code === 0) {
                function success() {
                    Modal.success({
                        title: '冻结成功',
                        onOk() {
                            _this.setState({ frozenloading: false, frozenvisible: false });
                        }
                    });
                }
                success();
            } else {
                function error() {
                    Modal.error({
                        title: '冻结失败',
                        content: '原因：' + response.data.message,
                        onOk() {
                            _this.setState({ frozenloading: false });
                        }
                    });
                }
                error();
            }
        })
            .catch(function (error) {
                console.log(error);
                _this.setState({ frozenloading: false, frozenvisible: false });
            });
    }

    /* 解封用户Model按钮 */

    showthawModal = () => {
        this.setState({
            thawvisible: true,
        });
    }
    ThawhandleCancel = () => {
        this.setState({ thawvisible: false });
    }
    onThawUsername = (event) => {
        this.thawJson.username = (event.target.value)
    }

    /* 解封用户接口 */

    thawJson = {
        username: "",
        blocked: false
    }

    handleThaw = () => {
        let _this = this;
        _this.setState({ thawloading: true });
        axiosInstance({
            method: 'post',
            url: '/admin/blocked',
            data: _this.thawJson
        }).then(function (response) {
            if (response.data.code === 0) {
                function success() {
                    Modal.success({
                        title: '解封成功',
                        onOk() {
                            _this.setState({ thawloading: false, thawvisible: false });
                        }
                    });
                }
                success();
            } else {
                function error() {
                    Modal.error({
                        title: '冻结失败',
                        content: '原因：' + response.data.message,
                        onOk() {
                            _this.setState({ thawloading: false });
                        }
                    });
                }
                error();
            }
        })
            .catch(function (error) {
                console.log(error);
                _this.setState({ thawloading: false, thawvisible: false });
            });
    }

    /* 注销班级 */

    delCode = {
        classCode: ""
    }
    getDelCode = (event) => {
        this.delCode.classCode = (event.target.dataset.code);
    }
    onDelClass = () => {
        let _this = this;
        let TchID = JSON.parse(localStorage.getItem("userInfo")).id
        axiosInstance({
            method: 'post',
            url: '/class/destroy',
            data: _this.delCode
        }).then(function (response) {
            if (response.data.code === 0) {
                message.success('注销成功');
                _this.getTchClass(TchID)
            } else {
                message.error('注销失败,原因:' + response.data.message);
                _this.getTchClass(TchID)
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    /* 邀请学生加入班级 */

    showInviteModal = (event) => {
        this.InviteJson.classCode = (event.target.dataset.code);
        this.setState({
            Invitevisible: true,
        });
    }
    handleInviteCancel = () => {
        this.setState({ Invitevisible: false });
    }
    getInviteName = (event) => {
        this.InviteJson.username = (event.target.value)
    }

    /* 邀请用户接口 */

    InviteJson = {
        classCode: "",
        username: ""
    }

    handleInviteOk = () => {
        let _this = this;
        _this.setState({ Inviteloading: true });
        axiosInstance({
            method: 'post',
            url: '/class/invite',
            data: _this.InviteJson
        }).then(function (response) {
            if (response.data.code === 0) {
                function success() {
                    Modal.success({
                        title: '邀请成功',
                        onOk() {
                            _this.setState({ Inviteloading: false, Invitevisible: false });
                        }
                    });
                }
                success();
            } else {
                function error() {
                    Modal.error({
                        title: '邀请失败',
                        content: '原因：' + response.data.message,
                        onOk() {
                            _this.setState({ Inviteloading: false });
                        }
                    });
                }
                error();
            }
        })
            .catch(function (error) {
                console.log(error);
                _this.setState({ Inviteloading: false, Invitevisible: false });
            });
    }

    /* 修改班级名称 */

    showRenameModal = (event) => {
        this.RenameJson.classCode = (event.target.dataset.code);
        this.setState({
            Renamevisible: true,
        });
    }
    handleRenameCancel = () => {
        this.setState({ Renamevisible: false });
    }
    getRenameJson = (event) => {
        this.RenameJson.className = (event.target.value)
    }

    /* 修改班级名称接口 */

    RenameJson = {
        classCode: "",
        className: ""
    }

    handleRenameOk = () => {
        let _this = this;
        let TchID = JSON.parse(localStorage.getItem("userInfo")).id
        _this.setState({ Renameloading: true });
        axiosInstance({
            method: 'post',
            url: '/class/rename',
            data: _this.RenameJson
        }).then(function (response) {
            if (response.data.code === 0) {
                function success() {
                    Modal.success({
                        title: '修改成功',
                        onOk() {
                            _this.setState({ Renameloading: false, Renamevisible: false });
                            _this.getTchClass(TchID);
                        }
                    });
                }
                success();
            } else {
                function error() {
                    Modal.error({
                        title: '修改成功',
                        content: '原因：' + response.data.message,
                        onOk() {
                            _this.setState({ Renameloading: false });
                            _this.getTchClass(TchID);                            
                        }
                    });
                }
                error();
            }
        })
            .catch(function (error) {
                console.log(error);
                _this.setState({ Renameloading: false, Renamevisible: false });
            });
    }

    /* 获取班级详细信息 */
    checkClass = ""
    showCheckModal = (event, value) => {
        if (value === undefined) {
            this.checkClass = (event.target.dataset.code);
            this.DelStudent.classCode = (event.target.dataset.code);
        }
        let _this = this;
        _this.setState({ Checkloading: true });
        axiosInstance({
            method: 'get',
            url: '/class/query/' + this.checkClass
        }).then(function (response) {
            if (response.data.code === 0) {
                _this.setState({
                    CheckJson: response.data.class,
                    Checkvisible: true,
                });
            } else {
            }
        })
            .catch(function (error) {
                console.log(error);
                _this.setState({ Checkloading: false, Checkvisible: false });
            });
    }
    showProduction = (event, value) => {
      
        if (value === undefined) {
            this.checkClass = (event.target.dataset.code);
            this.classTitle = (event.target.dataset.title);
        }
        this.props.setDefaultActiveKey('9',this.checkClass,this.classTitle)
    }
    handleProductionCancel = () => {
        this.setState({ Productionvisible: false });
    }
    handleCheckCancel = () => {
        this.setState({ Checkvisible: false });
    }
    /* 移除学员 */
    DelStudent = {
        classCode: "",
        username: ""
    }
    getDelStudent = (event) => {
        this.DelStudent.username = (event.target.dataset.name);
    }
    onDelStudent = () => {
        let _this = this;
        axiosInstance({
            method: 'post',
            url: '/class/kickout',
            data: this.DelStudent
        }).then(function (response) {
            if (response.data.code === 0) {
                message.success('移除成功');
                _this.showCheckModal(1, 1)
            } else {
                message.error('移除失败,原因：' + response.data.message);
                _this.showCheckModal(1, 1)
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    /* 发送消息 */

    showNewsModal = (event) => {
        this.NewsJson.logo = (event.target.dataset.logo);
        this.NewsJson.className = (event.target.dataset.title);
        this.NewsJson.classID = (event.target.dataset.id);
        this.setState({
            Newsvisible: true,
        });
    }
    handleNewsCancel = () => {
        this.setState({ Newsvisible: false });
    }
    getNewsTitle = (event) => {
        this.NewsJson.title = (event.target.value)
    }
    getNewsCon = (event) => {
        this.NewsJson.content = (event.target.value)
    }

    /* 发送消息接口 */

    NewsJson = {
        logo:"",
        className:"",
        classID: "",
        title: "",
        content: "",  
    }

    handleNewsOk = () => {    
        let _this = this;
        _this.setState({ Newsloading: true });
        axiosInstance({
            method: 'post',
            url: '/class/message/publish',
            data: _this.NewsJson
        }).then(function (response) {
            if (response.data.code === 0) {
                function success() {
                    Modal.success({
                       
                        title: '发送成功',
                        onOk() {
                            _this.setState({ Newsloading: false, Newsvisible: false });
                            
                        }
                       
                    });
                    _this.props.changeNews();
                }
                success();
            } else {
                function error() {
                    Modal.error({
                        title: '发送失败',
                        content: '原因：' + response.data.message,
                        onOk() {
                            _this.setState({ Newsloading: false });
                        }
                    });
                }
                error();
            }
        })
            .catch(function (error) {
                console.log(error);
                _this.setState({ Newsloading: false, Newsvisible: false });
            });
    }
    goPersonalCenter = (item,e) => {
        let userID = item.data._id
        e.stopPropagation()
        this.props.history.push({ pathname: `/personalCenter/${userID}`, state: { userID } })
    }
    //更换课程
    courseChange = (value) => {

    let lessionData = [];
    axiosInstance.get(`/courses/${value}/lessions`) //获取课程列表
    .then(res => {
        if (res.data.code === 0) {
            for(var i=0;i<res.data.course.lessions.length;i++){
                for(var j=0;j<res.data.course.lessions[i].content.length;j++){
                    lessionData.push({
                        id: res.data.course.lessions[i].content[j].id,
                        name:res.data.course.lessions[i].content[j].video_name
                    })
                }
            }
            this.setState({
                lessionData: lessionData
            })
        }else {
            message.error(res.data.message);
        }
    })
      
    }
    //获取班级作品
    getClassProduction = (value) => {
        axiosInstance.get(`works/class/students?classCode=${this.checkClass}&contentID=${value}`) //获取课程列表
        .then(res => {
            if (res.data.code === 0) {

                // this.setState({
                //     lessionData: res.data
                // })
            }else {
                message.error(res.data.message);
            }
        })
    }
    render() {
        const inviteName = <Modal
            title="邀请学生加入"
            visible={this.state.Invitevisible}
            onOk={this.handleInviteOk}
            onCancel={this.handleInviteCancel}
            footer={[
                <Button key="back" onClick={this.handleInviteCancel}>取消</Button>,
                <Button key="submit" type="primary" loading={this.state.Inviteloading} onClick={this.handleInviteOk}>确认邀请</Button>]}
        >
            <p>输入想要邀请的学生用户名</p>
            <Input type="text" onBlur={this.getInviteName} style={{ width: '80%' }} />
        </Modal>

        const Rename = <Modal
            title="修改班级名称"
            visible={this.state.Renamevisible}
            onOk={this.handleRenameOk}
            onCancel={this.handleRenameCancel}
            footer={[
                <Button key="back" onClick={this.handleRenameCancel}>取消</Button>,
                <Button key="submit" type="primary" loading={this.state.Renameloading} onClick={this.handleRenameOk}>确认修改</Button>]}
        >
            <p>输入想要修改的班级名</p>
            <Input type="text" onBlur={this.getRenameJson} style={{ width: '80%' }} />
        </Modal>

        const News = <Modal
            title="发送班级消息"
            visible={this.state.Newsvisible}
            onOk={this.handleNewsOk}
            onCancel={this.handleNewsCancel}
            footer={[
                <Button key="back" onClick={this.handleNewsCancel}>取消</Button>,
                <Button key="submit" type="primary" loading={this.state.Newsloading} onClick={this.handleNewsOk}>确认发送</Button>]}
        >
            <p>标题</p>
            <Input type="text" onBlur={this.getNewsTitle} style={{ width: '80%' }} maxLength={23} />
            <p>内容</p>
            <TextArea onBlur={this.getNewsCon} style={{ width: '80%' , minHeight:"100px"}} maxLength={150} />
        </Modal>

        const Check = <Modal
            className="demo-infinite-container"
            bodyStyle={{ maxHeight: "350px", overflowY: "scroll", overflowX: "auto" }}
            title={this.state.CheckJson.name}
            visible={this.state.Checkvisible}
            onOk={this.handleCheckOk}
            onCancel={this.handleCheckCancel}
            footer={[
                <Button key="back" onClick={this.handleCheckCancel}>关闭</Button>]}
        >
            <List
                itemLayout="horizontal"
                dataSource={this.state.CheckJson.students}
                renderItem={item => (
                    <List.Item actions={[
                        <Popconfirm title="您确定移除该成员？" onConfirm={this.onDelStudent} okText="确定" cancelText="取消">
                            <a data-code={item.username} onClick={this.getDelStudent} data-name={item.username}>移除</a>
                        </Popconfirm>]}>
                        <List.Item.Meta  style={{cursor:'default'}}
                            avatar={<Avatar src={baseUrl + item.avatar} />}
                            title={<span style={{cursor:'pointer'}}  onClick={this.goPersonalCenter.bind(null, { data: item })}>{item.realname}</span>}
                            description={"用户名：" + item.username}
                        />
                    </List.Item>
                )}
            />
        </Modal>
        
        return (
            <Row style={{ minHeight: "500px" }}>
                <Col span={18} style={{ minHeight: "500px", borderRight: "1px solid #ccc" }}>
                    <p className={Styles.classTitle}>班级管理</p>
                    <hr />
                    <List
                        itemLayout="horizontal"
                        dataSource={this.state.TchClassesList}
                        renderItem={item => (
                            <List.Item actions={[
                                <Button onClick={this.showInviteModal} data-code={item.code}>邀请</Button>,
                                <Button onClick={this.showCheckModal} data-code={item.code}>成员</Button>,
                                <Button onClick={this.showProduction} data-code={item.code} data-title={item.title}>作品</Button>,
                                <Button onClick={this.showNewsModal} data-title={item.title} data-logo={item.logo} data-id={item.id}>消息</Button>,
                                <Popconfirm title="您确定注销班级吗？" onConfirm={this.onDelClass} okText="确定" cancelText="取消">
                                <Button data-code={item.code} onClick={this.getDelCode}>注销</Button>
                                </Popconfirm>]}>
                                <List.Item.Meta
                                    avatar={<Avatar src={baseUrl + (item.logo !== "" ? item.logo :"./asset/users/avatar_default.png")} />}
                                    title={<span style={{cursor:'pointer'}}   onClick={this.showRenameModal}   data-code={item.code} >{item.title}
                                    <img src='./images/amend.png' alt='身份' style={{ width: '18px',position: 'relative',left: '2px',bottom: '2px'}} data-code={item.code} /> </span>   
                                    }
                                    description={"班级代号:" + item.code}
                                />
                            </List.Item>
                        )}
                    />
                    {inviteName}
                    {Rename}
                    {Check}
                    {News}
                </Col>
                <Col span={6}>
                    <div className={Styles.classCSS}>
                        <p className={Styles.classTitle}>创建您的班级</p>
                        <span>输入您想要创建班级的名称。</span>
                        <Input className={Styles.centerInput}  maxLength={5} placeholder="班级代号" onBlur={this.onsetClassName} size='default' />
                        <Button className={Styles.centerBtn} size="default" onClick={this.onCreateClass}>创建</Button>
                    </div>
                    <Button size="large" type="primary" className={Styles.adminBtn} onClick={this.showResetModal}>重置学生密码</Button>
                    <Modal
                        visible={this.state.resetvisible}
                        title="重置学生密码"
                        onOk={this.handleReset}
                        onCancel={this.ResethandleCancel}
                        footer={[
                            <Button key="back" onClick={this.ResethandleCancel}>取消</Button>,
                            <Button key="submit" type="primary" loading={this.state.resetloading} onClick={this.handleReset}>确认重置</Button>]}
                    >
                        <div>
                            <h3 className={Styles.pwChan}>请输入学生的用户名 :</h3>
                            <Input  placeholder="学生用户名" style={{ width: '100%' }} onBlur={this.onResetUsername} size='default' />
                        </div>
                        <div>
                            <h3 className={Styles.pwChan}>请输入学生的新密码 :</h3>
                            <Input type="password" placeholder="密码长度为6~16位" style={{ width: '100%' }} onBlur={this.onResetPassword} size='default' />
                        </div>
                    </Modal>
                    <Button size="large" type="primary" className={Styles.adminBtn} onClick={this.showTchResetModal}>重置教师密码</Button>
                    <Modal
                        visible={this.state.resetTchvisible}
                        title="重置教师密码"
                        onOk={this.handleTchReset}
                        onCancel={this.ResetTchhandleCancel}
                        footer={[
                            <Button key="back" onClick={this.ResetTchhandleCancel}>取消</Button>,
                            <Button key="submit" type="primary" loading={this.state.resetTchloading} onClick={this.handleTchReset}>确认重置</Button>]}
                    >
                        <div>
                            <h3 className={Styles.pwChan}>请输入教师的用户名 :</h3>
                            <Input placeholder="教师用户名" style={{ width: '100%' }} onBlur={this.onResetTchUsername} size='default' />
                        </div>
                        <div>
                            <h3 className={Styles.pwChan}>请输入教师的新密码 :</h3>
                            <Input type="password" placeholder="密码长度为6~16位" style={{ width: '100%' }} onBlur={this.onResetTchPassword} size='default' />
                        </div>
                        <div>
                            <h3 className={Styles.pwChan}>请输入产品的密钥key :</h3>
                            <Input type="password" placeholder="产品密钥" style={{ width: '100%' }} onBlur={this.onResetTchKey} size='default' />
                        </div>
                    </Modal>
                    <Button size="large" className={Styles.adminBtn} type="primary" onClick={this.showFrozenModal}>冻结学生账号</Button>
                    <Modal
                        visible={this.state.frozenvisible}
                        title="冻结学生账号"
                        onOk={this.handleFrozen}
                        onCancel={this.FrozenhandleCancel}
                        footer={[
                            <Button key="back" onClick={this.FrozenhandleCancel}>取消</Button>,
                            <Button key="submit" type="primary" loading={this.state.frozenloading} onClick={this.handleFrozen}>确认冻结</Button>]}
                    >
                        <div>
                            <h3 className={Styles.pwChan}>请输入冻结用户账号 :</h3>
                            <Input placeholder="学生用户名" style={{ width: '100%' }} onBlur={this.onFrozenUsername} size='default' />
                        </div>
                    </Modal>
                    <Button size="large" className={Styles.adminBtn} type="primary" onClick={this.showthawModal}>解封学生账号</Button>
                    <Modal
                        visible={this.state.thawvisible}
                        title="解封学生账号"
                        onOk={this.handleThaw}
                        onCancel={this.ThawhandleCancel}
                        footer={[
                            <Button key="back" onClick={this.ThawhandleCancel}>取消</Button>,
                            <Button key="submit" type="primary" loading={this.state.thawloading} onClick={this.handleThaw}>确认解封</Button>]}
                    >
                        <div>
                            <h3 className={Styles.pwChan}>请输入解封用户账号 :</h3>
                            <Input placeholder="学生用户名" style={{ width: '100%' }} onBlur={this.onThawUsername} size='default' />
                        </div>
                    </Modal>
                </Col>
            </Row>
        );
    }
}
