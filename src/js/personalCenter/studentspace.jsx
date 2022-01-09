import React from 'react';
import Styles from '../../css/space.module.css';
import { Row, Col, Button, Modal, Input, Avatar, List, Popconfirm, message } from 'antd';
import {baseUrl} from '../config/baseUrl.js'
import axiosInstance from "../config/apirequest"

export default class StudentSpace extends React.Component {
    state = {
        loading: false,
        visible: false,
        Checkvisible: false,
        Checkloading: false,
        CheckJson:'',
        classList: []
    }

    componentWillMount = () => {
        let userInfo = JSON.parse(localStorage.getItem("userInfo"));
        let username = userInfo.username
        this.getUserClass(username);
    }

    /* 加入班级接口 */
    classJson = {
        classCode: ""
    }
    onsetClassCode = (event) => {
        this.classJson.classCode = (event.target.value);
    }

    onEnterClass = () => {
        let _this = this;
        let username = JSON.parse(localStorage.getItem("userInfo")).username
        if (_this.classJson.classCode !== "") {
            axiosInstance({
                method: 'post',
                url: '/user/class/join',
                data: _this.classJson
            }).then(function (response) {
                if (response.data.code === 0) {
                    function success() {
                        Modal.success({
                            title: '加入成功',
                            onOk() {
                                _this.getUserClass(username)
                            }
                        });
                    }
                    success();
                } else {
                    function error() {
                        Modal.error({
                            title: '加入失败',
                            content: '原因：' + response.data.message,
                            onOk() {

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

    /* 获取班级接口 */

    getUserClass = (value) => {
        let _this = this;
        axiosInstance({
            method: 'get',
            url: '/user/class/joined/query/' + value,
        }).then(function (response) {
            if (response.data.joinClasses !== null) {
                let classJson = response.data.joinClasses.classesList
                let classlist = [];
                for (var i = 0; i < classJson.length; i++) {
                    classlist[i] = {
                        title: classJson[i].name,
                        code: classJson[i].code,
                        logo: classJson[i].logo
                    }
                }
                _this.setState({
                    classList: classlist
                })
            } else {
                _this.setState({
                    classList: []
                })
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    /* 获取班级详细信息 */
    checkClass = ""
    showCheckModal = (event, value) => {
        if (value === undefined) {
            this.checkClass = (event.target.dataset.code);
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

    /* 退出班级 */

    exitCode = {
        classCode: ""
    }

    getExitClass = (event) => {
        this.exitCode.classCode = (event.target.dataset.code);
    }

    onConfirm = () => {
        let _this = this;
        let username = JSON.parse(localStorage.getItem("userInfo")).username;
        axiosInstance({
            method: 'post',
            url: '/user/class/quit',
            data: _this.exitCode
        }).then(function (response) {
            if (response.data.code === 0) {
                _this.getUserClass(username)
                message.success('退出成功');
            } else {
                _this.getUserClass(username)
                message.error('退出失败');
            }

        }).catch(function (error) {
            console.log(error);
        });
    }
    handleCheckCancel = () => {
        this.setState({ Checkvisible: false });
    }

    render() {
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
                <List.Item >
                    <List.Item.Meta
                        avatar={<Avatar src={baseUrl + item.avatar} />}
                        title={<span>{item.realname}</span>}
                        description={"用户名：" + item.username}
                    />
                </List.Item>
            )}
        />
    </Modal>
        return (
            <Row style={{ minHeight: "500px" }}>
                <Col span={18} style={{ minHeight: "500px", borderRight: "1px solid #ccc" }}>
                    <p className={Styles.classTitle}>您的班级</p>
                    <hr />
                    <List
                        itemLayout="horizontal"
                        dataSource={this.state.classList}
                        locale={{emptyText:''}}
                        renderItem={item => (
                            <List.Item actions={[<a onClick={this.showCheckModal} data-code={item.code}>查看</a>,
                            <Popconfirm title="您确定退出班级吗？" onConfirm={this.onConfirm} okText="确定" cancelText="取消">
                                <a data-code={item.code} onClick={this.getExitClass}>退出</a>
                            </Popconfirm>]}>
                                <List.Item.Meta
                                    avatar={<Avatar src={baseUrl + (item.logo !== "" ? item.logo : "./asset/users/avatar_default.png")} />}
                                    title={<p>{item.title}</p>}
                                    description={"班级代号:" + item.code}
                                />
                            </List.Item>
                        )}
                    />
                    <div style={{width:'453px',margin:'0 auto' }}>
                    <img style={{ display: this.state.classList.length !== 0  ? 'none' : 'flex' }} src='./images/noClass.png' />
                    </div> 
                </Col>
                <Col span={6}>
                    <div className={Styles.classCSS}>
                        <p className={Styles.classTitle}>添加您的班级</p>
                        <span>通过您的教师获取班级代号，加入班级。</span>
                        <Input className={Styles.centerInput} placeholder="班级代号" onBlur={this.onsetClassCode} size='default' />
                        <Button className={Styles.centerBtn} size="default" onClick={this.onEnterClass}>加入</Button>
                    </div>
                </Col>
                {Check}
            </Row>   
        );
    }
}
