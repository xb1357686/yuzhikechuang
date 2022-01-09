import React from 'react';
import Styles from '../../css/space.module.css';
import { Row, Col, Button, Modal, Tabs, Card, Spin, DatePicker, Icon, LocaleProvider,message } from 'antd';
import '../../CalendarHeatmap/CalendarHeatmap.css';
import Month from 'vector-month'
import axiosInstance from "../config/apirequest"
import CoursesPlan from "./coursesPlan"
import StudentSpace from "./studentspace"
import TeacherSpace from "./teacherspace"
import NewsSpace from "./newsspace"
import MedalSpace from "./medalspace"
import RankSpace from "./rankspace"
import Classroom from "./classroom"
import ClassProduction from "./classProduction.jsx"
import Production from "./production"
import SysinfoSpace from "./sysinfo"
import { baseUrl } from '../config/baseUrl.js'
import ApplyTeach from '../user/applyTeach';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

var signBtn;
const TabPane = Tabs.TabPane;
const { MonthPicker } = DatePicker;
export default class Space extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userInfo: "",
            avatarUrl: "",
            signed: "签到",
            role: "student",
            defaultActiveKey: "1",
            loading: false,
            Headvisible: false,
            calVisible: false,
            Headloading: false,
            headimageBase: "",
            loadimg: false,
            month: new Date(),
            collect: false,      //收藏作品的状态
            signedAll: [],
            selected:'1',
            classCode:''
        }
    }

    componentWillMount = () => {
        /* date.format */
        Date.prototype.Format = function (fmt) { //author: meizz
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }
        var userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            this.props.history.push('/');
            return;
        }
        if (this.props.location.state && this.props.location.state.page) {
            this.setState({ defaultActiveKey: this.props.location.state.page })
        }
        this.setState({
            userInfo: userInfo,
            avatarUrl: baseUrl + userInfo.avatar,
        })
        this.getUserMessage();
    }


    //重新获取用户信息
    getUserMessage = () => {
        var _this = this;
        var userInfo = JSON.parse(localStorage.getItem("userInfo"))
        axiosInstance({
            method: 'get',
            url: `/user/query/${userInfo.id}`
        }).then(function (response) {
            if (response.data.code === 0) {
                userInfo = response.data.user;
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                _this.setState({
                    userInfo: userInfo,
                    role: userInfo.role.name,
                    avatarUrl: baseUrl + userInfo.avatar
                })
                _this.getUserSigned();
            } else {
                console.log("获取失败" + response.data.message)
            }
        })
            .catch(function (err) {
                console.log(err.response);
            });
    }


    /*用户签到接口*/
    onSigned = () => {
        var { userInfo } = this.state;
        let _this = this;
        axiosInstance({
            method: 'post',
            url: '/user/signed'
        }).then(function (response) {
            if (response.data.code === 0) {
                Modal.success({
                    title: '签到成功',
                    content: response.data.medal === null ? "获得积分" + response.data.calculus : <img src={baseUrl + response.data.medal} alt="签到" />,
                    onOk() {
                        _this.getUserSigned();
                        userInfo.calculus += response.data.calculus;
                        _this.setState({ signed: "今日已签到", userInfo });
                    }
                });
            } else if (response.data.code === 19) {
               
                Modal.error({
                    title: '签到失败',
                    content: '原因：' + response.data.message,
                    onOk() {
                        _this.setState({ signed: "今日已签到" });
                    }
                });


            } else if (response.data.code === 6) {

                Modal.error({
                    title: '签到失败',
                    content: '原因：' + response.data.message + ' 请您重新登录。',
                    onOk() {
                        localStorage.removeItem("userInfo");
                        localStorage.removeItem("userToken");
                    }
                });


            } else {

                Modal.error({
                    title: '签到失败',
                    content: '原因：' + response.data.message
                });


            }
        })
            .catch(function (error) {
            });;
    }
    /* 签到列表 */
    generateJsonValues = (data) => {
        return data.map(data => {
            return {
                date: data,
                count: 3,
            };
        })
    }
    githubClassForValue = (value) => {
        if (!value) {
            return 'color-empty';
        }
        return `color-github-${value.count}`;
    }
    //获取第一次 签到年月
    generateStartDate = () => {
        let nowYear = (new Date()).getFullYear();
        let nowMonth = (new Date()).getMonth();
        if (nowMonth === 0) {
            nowMonth = 12
        }
        let month = (nowMonth < 10 ? "0" + nowMonth : nowMonth);
        let date = nowYear.toString() + '-' + month.toString();
        return date
    }
    //获取最后一次签到年月
    generateEndDate = () => {
        let nowYear = (new Date()).getFullYear();
        let nowMonth = (new Date()).getMonth() + 3;
        if (nowMonth === 11) {
            nowMonth = 1
        }
        let month = (nowMonth < 10 ? "0" + nowMonth : nowMonth);
        let date = nowYear.toString() + '-' + month.toString();
        return date
    }

    /* 获取用户签到信息 */
    getUserSigned = (signedAll) => {
        let nowYear = (new Date()).getFullYear();
        let nowMonth = (new Date()).getMonth() + 1;
        let month = (nowMonth < 10 ? "0" + nowMonth : nowMonth);
        let nowDay = (new Date()).getDate();
        nowDay = (nowDay < 10 ? "0" + nowDay : nowDay)
        let date = nowYear.toString() + '-' + month.toString() + '-' + nowDay.toString();
        let _this = this;
        axiosInstance({
            method: 'get',
            url: '/user/signedRecords/' + nowYear + '/' + nowMonth
        }).then(function (response) {
            if (response.data.code === 0) {
                signedAll = response.data.signed;
                if (signedAll.indexOf(date) !== -1) {
                    _this.setState({ signed: "已签到" })
                } else {
                    _this.setState({ signed: "签到" })
                }
                _this.setState({
                    signedAll: signedAll,
                });
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    /* 修改用户头像 */

    headJson = {
        gender: "",
        charset: "",
        src: ""
    }

    showHeadModal = () => {
        this.setState({
            Headvisible: true,
        });
        this.getRandomBase();
    }

    getRandomBase = () => {
        let _this = this;
        this.setState({
            loadimg: true
        })
        axiosInstance({
            method: 'get',
            url: '/user/avatar/random'
        }).then(function (response) {
            if (response.data.code === 0) {
                _this.setState({
                    headimageBase: response.data.src,
                    loadimg: false
                });
                _this.headJson.gender = response.data.gender;
                _this.headJson.charset = response.data.charset;
            } else {
                _this.setState({ Headloading: false, Headvisible: false, loadimg: false });
            }
        })
            .catch(function (error) {
                _this.setState({ Headloading: false, Headvisible: false, loadimg: false });
            });
    }

    handleHeadCancel = () => {
        this.setState({ Headvisible: false });
    }

    onsetNewHeadimg = () => {
        let _this = this;
        axiosInstance({
            method: 'post',
            url: '/user/avatar/update',
            data: _this.headJson
        }).then(function (response) {
            if (response.data.code === 0) {
                function success() {
                    Modal.success({
                        title: '修改成功',
                        onOk() {
                            let avatarChan = JSON.parse(localStorage.getItem("userInfo"));
                            avatarChan.avatar = response.data.avatar;
                            _this.props.getUserInfo(avatarChan)
                            localStorage.setItem("userInfo", JSON.stringify(avatarChan))
                            _this.setState({
                                avatarUrl: baseUrl + response.data.avatar
                            })
                            _this.setState({ Headloading: false, Headvisible: false });
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
                            _this.setState({ Headloading: false });
                        }
                    });
                }
                error();
            }
        })
            .catch(function (error) {
                _this.setState({ Headloading: false, Headvisible: false });
            });
    }
    /* 查询签到日期 */
    onsetMonth = (date, dateString = (new Date().Format), signedAll) => {
        if (dateString) {
            let nowYear = dateString.substring(0, 4);
            let nowMonth = dateString.substring(5, 7);
            let _this = this;
            axiosInstance({
                method: 'get',
                url: '/user/signedRecords/' + nowYear + '/' + nowMonth
            }).then(function (response) {
                if (response.data.code === 0) {
                    signedAll = response.data.signed;
                    if (signedAll == null) {
                        _this.setState({
                            signedAll: [],
                        });
                    }
                    else {
                        _this.setState({
                            signedAll: signedAll,
                        });
                    }
                }

            }).catch(function (error) {
                console.log(error);
            });
            this.setState({
                month: new Date(dateString)
            })
        }
    }
    //改tab
    setDefaultActiveKey(defaultActiveKey,code,title) {
        this.setState({
            classCode:code,
            classTitle:title,
            selected:defaultActiveKey,
            defaultActiveKey
        })
        if(defaultActiveKey === '9' && this.pName){
            this.pName.getCourse(code);
        }
    }
    showCalVisible = () => {
        this.setState({
            calVisible: true
        })
    }
    hideCalVisible = () => {
        this.setState({
            calVisible: false
        })
    }
    //收藏状态改变的时候
    changeCollect = () => {
        if (this.productChild) {
            this.productChild.getProduction(1);
        }
    }

    //获取作品组件的this
    getProductThis = (ref) => {
        this.productChild = ref;
    }
    //获取班级作品组件
    // getProductionName = () =>{
    //     if (this.pName) {
    //         this.pName.getCourse();
    //     }
    // }
    getPNameThis = (ref) => {
        this.pName = ref;
    }
    //消息状态改变的时候
    changeNews = () => {
        if (this.getMsgChild) {
            this.getMsgChild.getMsgList();
        }
    }
    //获取作品组件的this
    getMsgThis = (ref) => {
        this.getMsgChild = ref;
    }
    render() {
        const { role, signed, userInfo, signedAll } = this.state;
        var TchTabs, AdmTabs, listTile;
        if (signed === "签到") {
            signBtn = <Col md={{ span: 3 }} className={Styles.listBar} onClick={this.onSigned}><img src="./images/sign.png" alt="签到" /><span>签到</span></Col>
        } else {
            signBtn = <Col md={{ span: 3 }} className={Styles.listBar} onClick={this.onSigned}><img src="./images/signed.png" alt="签到" /><span>签到</span></Col>
        }
        if (role === "teacher" || role === "admin") {
            TchTabs = <TabPane tab="教师" key="2">
                <TeacherSpace  {...this.props} changeNews={this.changeNews} setDefaultActiveKey={this.setDefaultActiveKey.bind(this)}/>
            </TabPane>
        } else {
            TchTabs = <TabPane tab="" key="2">
                <StudentSpace />
            </TabPane>;
            AdmTabs = ""
        }
        if (role === "admin") {
            AdmTabs = <TabPane tab="系统信息" key="7">
                <SysinfoSpace />
            </TabPane>
            listTile = <Col span={3} style={{ borderBottomColor: this.state.selected === '7' ? '#00bcd4': '#fff'}} className={Styles.listBar} onClick={this.setDefaultActiveKey.bind(this, '7')}><img src="./images/system.png" alt="系统信息" /><span>信息</span></Col>
        }
        const headChan = <Modal
            visible={this.state.Headvisible}
            title="修改头像"
            onCancel={this.handleHeadCancel}
            footer={null}
        >
            <div className={Styles.headimg}>
                <Spin spinning={this.state.loadimg}>
                    <img src={this.state.headimageBase} width="100%" alt="头像" />
                </Spin>
            </div>
            <div className={Styles.headbtn}>
                <Button onClick={this.getRandomBase} >刷新头像</Button>
                <Button onClick={this.onsetNewHeadimg} >保存头像</Button>
            </div>

        </Modal>;
        this.generateStartDate();

        const calendar = <Modal
            visible={this.state.calVisible}
            title="签到列表"
            onCancel={this.hideCalVisible}
            footer={null}
        >
            <Card title={<div> <MonthPicker onChange={this.onsetMonth} /></div>} bordered={false}>
                <Month month={this.state.month} dayColor="skyblue" dayTodayColor="orange" dayMarkedColor="pink" marked={(date) => {
                    let time = new Date(date).Format("yyyy-MM-dd");
                    if (signedAll.indexOf(time) !== -1) {
                        return true
                    } else {
                        return false
                    }
                }} />

            </Card>
        </Modal>
        return (
            <LocaleProvider locale={zh_CN}>
                <div >
                    <Row >
                        <div className={Styles.userInfoMenu}>
                            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                           
                            <Col span={4} offset={11}>
                                <div style={{ padding: ' 50px 20px  0  0' }}>
                                    <img src={this.state.avatarUrl} onClick={this.showHeadModal} alt="头像" width="100%" className={Styles.Avatar} />
                                </div>
                                <Col span={24}>
                                    <div style={{  fontSize: '20px',marginTop:'5px'}}>
                                        <img src={this.state.userInfo ? (this.state.userInfo.role.name === 'student' ? './images/student.png' : './images/teacher.png') : ''} style={{ marginRight: '6px' }} alt="角色" />
                                        {this.state.userInfo.realname}
                                        <Icon type={this.state.userInfo.gender === '男' ? 'man' : 'woman'} style={{ color: this.state.userInfo.gender === '男' ? '#2196F3' : '#f94395', fontSize: '22px', marginLeft: '12px' }} />
                                    </div>
                                </Col>
                                <Col>
                                    <Col span={24} style={{  textAlign: 'center', paddingTop: '10px' }}>
                                        <Col span={6}>
                                            <div style={{  margin: '0 auto' }}>
                                                <img src="./images/medal.png" alt="勋章" /> {this.state.userInfo ? this.state.userInfo.medals.length : ''}
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div style={{  margin: '0 auto' }}>
                                                <img src="./images/integral.png" alt="积分" /> {this.state.userInfo ? this.state.userInfo.calculus : ''}
                                            </div>
                                        </Col>
                                    </Col>
                                </Col>
                            </Col>
                                {headChan}

                            </div>
                        </div>
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <Col span={11} >
                                <Row>
                                    <Col md={{ span: 3 }} className={Styles.listBar} style={{ borderBottomColor: this.state.selected === '1' ? '#00bcd4': '#fff'}} onClick={this.setDefaultActiveKey.bind(this, '1')}><img src="./images/homepage.png" alt="个人主页" /><span>个人主页</span></Col>
                                    <Col md={{ span: 3 }} className={Styles.listBar} style={{ borderBottomColor: this.state.selected === '5' ? '#00bcd4': '#fff'}} onClick={this.setDefaultActiveKey.bind(this, '5')}><img src="./images/production.png" alt="作品" /><span>作品</span></Col>
                                    <Col md={{ span: 3 }} className={Styles.listBar} style={{ borderBottomColor: this.state.selected === '2' ? '#00bcd4': '#fff'}} onClick={this.setDefaultActiveKey.bind(this, '2')}><img src="./images/class.png" alt="班级" /><span>班级</span></Col>
                                    <Col md={{ span: 3 }} className={Styles.listBar} style={{ borderBottomColor: this.state.selected === '8' ? '#00bcd4': '#fff'}} onClick={this.setDefaultActiveKey.bind(this, '8')}><img src="./images/classroomall.png" alt="选课" /><span>选课</span></Col>
                                    <Col md={{ span: 3 }} className={Styles.listBar} style={{ borderBottomColor: this.state.selected === '4' ? '#00bcd4': '#fff'}} onClick={this.setDefaultActiveKey.bind(this, '4')}><img src="./images/message.png" alt="消息" /><span>消息</span></Col>
                                    <Col md={{ span: 3 }} className={Styles.listBar} style={{ borderBottomColor: this.state.selected === '3' ? '#00bcd4': '#fff'}} onClick={this.setDefaultActiveKey.bind(this, '3')}><img src="./images/badge.png" alt="徽章" /><span>徽章</span></Col>
                                    <Col md={{ span: 3 }} className={Styles.listBar} style={{ borderBottomColor: this.state.selected === '6' ? '#00bcd4': '#fff'}} onClick={this.setDefaultActiveKey.bind(this, '6')}><img src="./images/rank.png" alt="排行榜" /><span>排行榜</span></Col>
                                    {listTile}
                                </Row>
                            </Col>
                            <Col span={11} >
                            <Row type="flex" justify="end">
                                {signBtn}
                                <Col md={{ span: 3 }} onClick={this.showCalVisible} className={Styles.listBar}><img src="./images/calendar.png" alt="日历" /><span>日历</span></Col>
                                {calendar}
                                <ApplyTeach userInfo={userInfo} />
                                </Row>
                            </Col>
                        </div>
                    </Row>
                    <div style={{ backgroundColor: '#9e9e9e17',height:'10px' }}>
                    </div>
                    <div style={{ maxWidth: '1120px', margin: '0 auto', marginBottom: '50px', marginTop: '90px' }}>
                        <Tabs activeKey={this.state.defaultActiveKey} tabBarStyle={{ display: 'none' }}>
                            <TabPane tab="" key="1">
                                <CoursesPlan {...this.props} changeCollect={this.changeCollect} />
                            </TabPane>
                            {TchTabs}
                            <TabPane tab="" key="3">
                                <MedalSpace />
                            </TabPane>
                            <TabPane tab="" key="4">
                                <NewsSpace  {...this.props} getMsgThis={this.getMsgThis} />
                            </TabPane>
                            <TabPane tab="" key="5">
                                <Production {...this.props} getProductThis={this.getProductThis} />
                            </TabPane>
                            <TabPane tab="" key="6">
                                <RankSpace {...this.props}/>
                            </TabPane>
                            <TabPane tab="" key="8">
                                <Classroom {...this.props} />
                            </TabPane>
                            <TabPane  tab="" key="9">
                                <ClassProduction {...this.props} classCode = {this.state.classCode} classTitle = {this.state.classTitle}  getPNameThis={this.getPNameThis} setDefaultActiveKey={this.setDefaultActiveKey.bind(this)}  />
                            </TabPane>
                            {AdmTabs}
                        </Tabs>
                    </div>
                </div>
            </LocaleProvider>
        );
    }
}