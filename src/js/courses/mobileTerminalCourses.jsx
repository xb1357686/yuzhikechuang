import React from 'react';
import AxiosInstance from "../config/apirequest";
import Styles from '../../css/courses.module.css';
import { Row, Col, Icon, Breadcrumb, Tabs, Tree, message, Button, Modal, Spin } from 'antd';
import ReactDOM from 'react-dom';
import * as Survey from "survey-react";
import "survey-react/survey.css";
import { Link } from 'react-router-dom';
import Draggable from 'react-draggable'; // The default
import $ from "jquery";
import Markdown from 'react-markdown';
const TabPane = Tabs.TabPane;
const { TreeNode } = Tree;
var basePath;
/* global layer*/
export default class CoursesSchool extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            treeData: [], course: {}, minHeight: 0, drawerVisible: false, appData: [],
            dataArr: [],
            videoUrl: '',
            iframeI: 0,
            progress: {},  //个人学习进度
            defaultKeys: null,
            questionsCss: false,
            noVideo: false,
            questionResult: '',
            nowQuestion_url: '',
            userInfo: '',
            videoEnd: false,
            lastCourse: false,
            videoUrlId: [],
            sKeys: '',
            courseID: "",
            mdCol: 9,
            nextQuestions: false,
            visible: false,
            isHasVideo: false,    //是否已经创建了悬浮视频
            isVideoBtn: false,
            videoLayerDom: null,
            activeDrags: 0,
            iFrameHeight: '0px',
            activeKey: "1",
            loading: true,
        }
    }
    childFrameObj = '';
    json = '';
    moveDate = '';
    componentDidMount() {
        document.body.scrollTop = 0; //切换课程的时候回到顶部
        let route = [], passId, questionUrl;
        if (this.props.location.state && this.props.location.state.name === 'classroom') {
            route.push(
                <Breadcrumb.Item key={1} style={{ cursor: 'pointer', color: '#fff' }} onClick={this.goToCoursesList}>选课</Breadcrumb.Item>
            )
        } else {
            route.push(
                <Breadcrumb.Item key={1} ><Link to="/courses" style={{ cursor: 'pointer', color: '#fff' }}>课程</Link></Breadcrumb.Item>
            )
        }

        if (this.props.location.state && this.props.location.state.questionUrl) {
            questionUrl = this.props.location.state.questionUrl
            this.getQuestion(questionUrl)
        } else {
            if (this.props.location.state && this.props.location.state.lessionId) {
                passId = this.props.location.state.lessionId
                this.setState({
                    defaultKeys: this.props.location.state.lessionId
                })
            }
            try {
                this.getCourseData(passId);
            } catch (error) {
                console.log(error)
            }
        }
        this.childFrameObj = document.getElementById('childFrame');
        var height = document.body.clientHeight - 64 - 159 - 8;   //页面中间可视高度
        let id = sessionStorage.getItem("courseId");
        this.setState({ minHeight: height, route, courseID: id });

    }
    getMDText = (mdUrl) => {
        fetch(mdUrl).then((response) => response.text()).then((text) => {
            this.setState({ terms: text, loading: false })
        })
    }
    getQuestion = async (questionUrl) => {
        let _this = this;
        _this.setState({
            sKeys: questionUrl
        });

        if (questionUrl.indexOf('.json') > -1) {
            $.get(questionUrl, function (res) {
                _this.json = res;
                _this.setState({
                    questionsCss: true,
                    noVideo: true,
                    nowQuestion_url: questionUrl
                });
            })
            let userInfo = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null;
            let id = sessionStorage.getItem("courseId");     //单个课程ID
            if (!id) {
                this.props.history.push('/');
                return;
            }
            this.setState({ userInfo });
            this.getTreeData(id, userInfo)
            return
        }

    }
    //获取所有课程
    getCourseData = (passId) => {

        let userInfo = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null;
        let id = sessionStorage.getItem("courseId");     //单个课程ID
        if (!id) {
            this.props.history.push('/');
            return;
        }
        this.setState({ userInfo });
        this.getCourseList(passId, id, userInfo);
        this.getTreeData(id, userInfo)
    }
    getTreeData = async (id, userInfo) => {
        let arr = [];
        //获取课程列表
        let coursesList = await AxiosInstance.get(`/courses/${id}/lessions`);
        if (coursesList.data.code !== 0) { console.log(coursesList.data.message); return; }
        arr = coursesList.data.course.lessions
        this.setState({
            treeData: arr,
        });
        if (!userInfo || !userInfo.id) return;
        let progress = await AxiosInstance.get(`/user/progress?courseid=${id}`);
        if (progress.data.code !== 0 || progress.data.courseprogress == null) { console.log('个人进度出现问题或者没有进度'); }
        else {
            progress.data.courseprogress.finishItems.map((res) => {
                arr.find(elem => {
                    let newData = elem.content.find(el => el.id === res);
                    if (newData) {
                        newData.states = 2;
                    }
                    return elem
                });
                return res
            })
            this.setState({ progress: progress.data.courseprogress, treeData: arr });
        }
        return;
    }
    //获取课时列表
    getCourseList = async (passId, id, userInfo) => {
        let arr = [], videoUrlArr = [], mdUrl;
        //获取课程列表
        let coursesList = await AxiosInstance.get(`/courses/${id}/lessions`);
        if (coursesList.data.code !== 0) { console.log(coursesList.data.message); return; }
        arr = coursesList.data.course.lessions
        if (passId) {
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].content.length; j++) {
                    videoUrlArr.push(arr[i].content[j].id)
                    if (arr[i].content[j].id === passId) {
                        this.setState({
                            treeData: arr,
                            videoUrl: arr[i].content[j],
                            videoUrlId: videoUrlArr,
                            course: coursesList.data.course,
                        });
                        if (!arr[i].content[j].video_name) {
                            this.setState({
                                noVideo: true,
                                mdCol: 23,
                            });
                        }
                        localStorage.setItem('mdUrl', arr[i].content[j].md_url);
                        mdUrl = arr[i].content[j].md_url;
                    }
                }
            }
        } else {
            mdUrl = localStorage.getItem('mdUrl');
            if (!mdUrl) {
                mdUrl = arr[0].content[0].md_url;
            }
            this.setState({
                videoUrl: arr[0].content[0],
                treeData: arr,
                videoUrlId: videoUrlArr,
                course: coursesList.data.course,
            });

        }
        basePath = mdUrl.lastIndexOf('/');
        basePath = mdUrl.substring(0, basePath + 1);
        this.getMDText(mdUrl);
        this.getTreeData(id, userInfo)
    }
    //返回课程列表
    goToCoursesList = () => {
        //将课程ID sessionStorage
        this.props.history.push({ pathname: `/space`, state: { page: '8' } });
    }

    //选择左侧菜单栏
    selectedData = (selectedKeys) => {
        document.body.scrollTop = 0; //切换课程的时候回到顶部
        let _this = this;
        if (selectedKeys.length === 0) return;
        let id = selectedKeys[0];
        this.setState({
            sKeys: id
        });
        if (id.indexOf('.json') > -1) {
            $.get(id, function (res) {
                _this.json = res;
                _this.setState({ questionsCss: true, noVideo: true, nowQuestion_url: id });
            })
            return
        }
        this.setState({ questionsCss: false, noVideo: false, mdCol: 8 });
        this.state.treeData.map((elem) => {
            if (elem.id === id) {
                this.getMDText(elem.content[0].md_url)
                this.setState({
                    videoUrl: elem.content[0],
                    activeKey: '1',
                });
                return elem;
            } else {
                let findData = elem.content.find(res => res.id === id);
                if (findData) {
                    this.getMDText(findData.md_url)
                    if (!findData.video_name) {
                        //如果没有视频，则只显示课程
                        this.setState({
                            videoUrl: findData,
                            noVideo: true,
                            mdCol: 23,
                            activeKey: '1',
                        });

                        return findData;
                    }
                    this.setState({
                        videoUrl: findData,
                        activeKey: '1',
                    });

                    return findData;
                }
            }
            return elem;
        });
    }

    //播放结束后
    videoOnEnd = () => {
        let id = sessionStorage.getItem("courseId");
        let data = {
            "courseID": id,
            "finishItemID": this.state.videoUrl.id,
            "curItemID": this.state.videoUrl.id,
        }
        AxiosInstance({
            method: 'post',
            url: 'user/progress',
            data: data
        })
        const { course, videoUrl } = this.state, _this = this;
        for (let i = 0; i < course.lessions.length; i++) {
            for (let j = 0; j < course.lessions[i].content.length; j++) {
                if (videoUrl.id === course.lessions[i].content[j].id) {
                    if (course.lessions[i].question_url === '') {
                        _this.setState({
                            nextQuestions: true
                        })
                    } else {
                        _this.setState({
                            nextQuestions: false
                        })
                    }
                }
            }
        }

        this.setState({ videoEnd: true });
    }
    //md完成
    readComplete = () => {
        let id = sessionStorage.getItem("courseId");
        let data = {
            "courseID": id,
            "finishItemID": this.state.videoUrl.id,
            "curItemID": this.state.videoUrl.id,
        }
        AxiosInstance({
            method: 'post',
            url: 'user/progress',
            data: data
        })
            .then((res) => {
                console.log(res);
            })
        message.info('该章节已完成！');
        this.setState({
            visible: false,
        });
        const { course, videoUrl, videoUrlId } = this.state, _this = this;
        let selectedKeys = [], g;
        for (let k = 0; k < videoUrlId.length; k++) {
            g = k + 1.
            if (videoUrl.id === videoUrlId[k]) {
                if (g === videoUrlId.length) {
                    for (let i = 0; i < course.lessions.length; i++) {
                        for (let j = 0; j < course.lessions[i].content.length; j++) {
                            if (videoUrl.id === course.lessions[i].content[j].id) {
                                if (course.lessions[i].question_url === '') {

                                } else {
                                    $.get(course.lessions[i].question_url, function (res) {
                                        _this.json = res;
                                        _this.setState({ questionsCss: true, noVideo: true, nowQuestion_url: course.lessions[i].question_url });
                                    })
                                }
                            }
                        }
                    }
                    this.setState({ lastCourse: true });
                } else {
                    selectedKeys.push(videoUrlId[g])
                    this.selectedData(selectedKeys);
                    this.setState({ videoEnd: false });
                }
            }
        }


    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    }

    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    }
    //视频播放开始
    videoPlay = () => {
        const { progress, course, videoUrl } = this.state, _this = this;
        if (!progress || progress.curItemID !== videoUrl.id) {
            let data = {
                "courseID": course.id,
                "name": course.name,
                "icon": course.icon,
                "curItemID": videoUrl.id,
            }
            AxiosInstance({
                method: 'post',
                url: 'user/progress',
                data: data
            })
                .then((res) => {
                    let curItem = { curItemID: videoUrl.id }
                    _this.setState({ progress: curItem })
                })
        }
    }

    //重新播放
    videoRedo = () => {
        this.refs.courseVideo.play();
        this.setState({ videoEnd: false });
    }
    //下一节
    nextCourse = () => {
        const { videoUrl, videoUrlId, progress, course } = this.state;
        let selectedKeys = [], j;
        for (let i = 0; i < videoUrlId.length; i++) {
            j = i + 1;
            if (videoUrl.id === videoUrlId[i]) {
                if (j === videoUrlId.length) {
                    this.setState({ lastCourse: true });
                } else {
                    selectedKeys.push(videoUrlId[j])
                    this.selectedData(selectedKeys);
                    this.setState({ videoEnd: false });
                }
            }
        }
        if (!progress || progress.curItemID !== videoUrl.id) {
            let data = {
                "courseID": course.id,
                "name": course.name,
                "icon": course.icon,
                "curItemID": videoUrl.id,
            }
            AxiosInstance({
                method: 'post',
                url: 'user/progress',
                data: data
            })
                .then((res) => {
                    let curItem = { curItemID: videoUrl.id }
                    this.setState({ progress: curItem })
                })
        }
    }
    showSuspendVideo = () => {
        if (this.moveDate > 200) {
            return;
        }
        const { videoLayerDom } = this.state;
        if (!videoLayerDom) return;
        videoLayerDom.style.display = 'block';
        this.setState({
            isVideoBtn: false
        })
    }
    onStart = () => {
        this.moveDate = new Date().getTime();
    }
    onStop = () => {
        this.moveDate = new Date().getTime() - this.moveDate;
    }
    callback = (activeKey) => {
        this.setState({ activeKey });
    }


    render() {
        const { treeData, defaultKeys, terms, videoEnd, activeKey, lastCourse, sKeys, noVideo, isVideoBtn } = this.state, dragHandlers = { onStart: this.onStart, onStop: this.onStop };;
        return (
            <div style={{ maxWidth: '1200px', margin: "0 auto", minHeight: `${this.state.minHeight}px` }}>

                <Row>
                    <Col md={24} style={{ height: '100%', display: noVideo ? 'none' : 'block', overflow: 'hidden' }} >
                        <video ref='courseVideo' src={this.state.videoUrl.video_url} controlsList="nodownload" style={{ backgroundColor: '#000', width: '100%', zIndex: '1' }} controls onEnded={this.videoOnEnd} onPlay={this.videoPlay} ></video>
                        <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, .7)', top: 0, display: videoEnd ? 'block' : 'none' }}>
                            <div style={{ position: 'absolute', left: '50%', marginLeft: '-55px', top: '50%', marginTop: '-37px' }}>
                                <div style={{ display: lastCourse ? 'none' : 'block' }}><Button type="primary" icon="vertical-left" onClick={() => this.nextCourse()} >下一节</Button></div>
                                <div style={{ cursor: 'pointer', textAlign: 'center', fontSize: '10px', marginTop: '10px', color: '#eeeeee' }} onClick={() => this.videoRedo()}> <Icon type="redo" style={{ fontSize: '10px', color: '#eeeeee' }} /> 重新播放 </div>
                                {/* <div style={{ display: nextQuestions ? 'none' : 'block' }}><Button style={{ borderRadius: '50%', height: '60px', marginTop: '30px', marginLeft: '13px', backgroundColor: '#faad14', color: '#fff' }} onClick={() => this.goQuestions()} >练习</Button></div> */}
                            </div>
                        </div>
                    </Col>
                    <Col md={24}>

                        <Tabs activeKey={activeKey} onChange={this.callback} tabBarStyle={{ width: '160px', margin: '0 auto' }}>
                            <TabPane tab="课程" key="1" style={{ minHeight: '549px' }}>
                                <Spin spinning={this.state.loading}>
                                    <div className={Styles.courseMD}>
                                        <Markdown source={terms}
                                            transformImageUri={(link) => {
                                                return basePath + link
                                            }}
                                        />
                                    </div>
                                </Spin>

                            </TabPane>
                            <TabPane tab="章节" key="2" style={{ padding: '10px 0 0 20px' }}>
                                {treeData.length
                                    ? <Tree
                                        onSelect={this.selectedData}
                                        showIcon
                                        defaultExpandAll
                                        selectedKeys={[sKeys]}
                                        defaultSelectedKeys={[defaultKeys ? defaultKeys : treeData[0].content[0].id]}
                                    >
                                        {this.state.treeData.map(
                                            (data) => {
                                                let arr = [], coursesComplete = false;
                                                data.content.map(elem => {
                                                    if (elem.states === 2) {
                                                        coursesComplete = true
                                                    }
                                                    let icon = elem.video_name ? <TreeNode icon={<Icon type={coursesComplete ? "check-circle" : "video-camera"} theme="twoTone" twoToneColor={coursesComplete ? "#52c41a" : ''} />} title={elem.video_name} key={elem.id} /> :
                                                        <TreeNode icon={<Icon type={coursesComplete ? "check-circle" : "read"} style={{ color: coursesComplete ? '#52c41a' : '#1890ff' }} />} title={data.name.slice(0, -3)} key={elem.id} />
                                                    arr.push(icon);
                                                    return elem;
                                                });
                                                // if (data.question_url) {
                                                //     arr.push(<TreeNode key={data.question_url} icon={<Icon type="audit" style={{ color: '#f19528' }} />} title='练习' className={Styles.list} />)
                                                // }
                                                return <TreeNode icon={<Icon type="book" />} title={data.name.slice(0, -3)} key={data.id} selectable={false}>{arr}</TreeNode>

                                            })
                                        }
                                    </Tree>
                                    : '课程加载失败啦'}
                            </TabPane>
                        </Tabs>
                    </Col>
                </Row>

                <Draggable
                    {...dragHandlers}
                >

                    <div className={Styles.suspendBtn} style={{ display: isVideoBtn ? 'block' : 'none' }} onClick={this.showSuspendVideo}><Icon type="play-circle" />
                        <div className={Styles.cancelBtn} onClick={this.cancelVideoBtn}><Icon type="close-circle" /></div>
                    </div>
                </Draggable>

            </div>
        );
    }
}
