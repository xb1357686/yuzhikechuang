import React from 'react';
import AxiosInstance from "../config/apirequest";
import { Row, Col, Breadcrumb, message, Button, Modal, Tabs } from 'antd';
import TaskModule from "./task-module";
import MDModule from "./md-module";
import TabMdModule from "./tab-module";
import Styles from '../../css/courses.module.css';
import VideoModule from "./video-module";
import LetfSide from "./leftside-module";
import Answer from "./answer-module";
import { Link } from 'react-router-dom';
import $ from "jquery";
import { getCourse } from '../z_xu_api';
const TabPane = Tabs.TabPane;
/* global layer*/
export default class CoursesSchool extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questionsCss: false,
      noVideo: false,
      sKeys: '',
      lessionData: "",
      mdCol: 9,
      visible: false,
      courseInfo: {},   //课程信息
      videoInfo: '',
      videoName: '',
      lessonsId: '',
      moduleHeight: '',
      windowWidth: '',
      videoHeight: 0,
      mdUrl: '',
      activeKey: '1',
      taskUrl: '',
      proportion: 24,
      noTesk: false,
      offsetHeight: 0,
      toolName: '',
      selectData: {},
      course: {},
    }
    this.resize.bind(this);
  }
  componentDidMount () {
    document.body.scrollTop = 0; //切换课程的时候回到顶部
    this.creatRoute();
    this.getCourseParameter();
    window.addEventListener('resize', this.resize);
    // var height = document.body.scrollHeight - 64 - 127 - 8;   //页面中间可视高度
    let offsetHeight = document.body.scrollHeight; // 文档高度
    this.setState({
      offsetHeight: offsetHeight,
    });
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.resize);
  }
  resize = () => {
    this.setState({
      videoHeight: this.refs.moduleHeight.clientHeight - 6
    });
  }
  //處理麵包屑導航
  creatRoute = () => {
    let route = [];
    if (this.props.location.state && this.props.location.state.name === 'classroom') {
      route.push(
        <Breadcrumb.Item key={1} style={{ cursor: 'pointer', color: '#fff' }} onClick={this.goToCoursesList}>选课</Breadcrumb.Item>
      )
    } else {
      route.push(
        <Breadcrumb.Item key={1} ><Link to="/courses" style={{ cursor: 'pointer', color: '#fff' }}>课程</Link></Breadcrumb.Item>
      )
    }
    this.setState({ route });
  }
  //處理url參數
  getCourseParameter = () => {
    let lessionId; let index;
    // if (this.props.location.state && this.props.location.state.questionUrl) {
    //     questionUrl = this.props.location.state.questionUrl;
    //     this.setState({
    //         sKeys: questionUrl
    //     })
    //     this.isExercise(questionUrl);
    // } else {
    if (this.props.location.state && this.props.location.state.lessionId) {
      lessionId = this.props.location.state.lessionId;
      index = this.props.location.state.index;
      localStorage.setItem('lessionId', lessionId);
      localStorage.setItem('courseIndex', index);
    } else {
      lessionId = localStorage.getItem('lessionId');
      index = localStorage.getItem('courseIndex');
    }
    this.setState({
      sKeys: lessionId,
      courseIndex: index
    })
    try {
      this.getCourseData(lessionId, index);
    } catch (error) {
      console.log(error)
    }
    // }
  }

  //获取课程子模块的this的指向
  onMdModule = (ref) => {
    this.mdModule = ref
  }
  onTaskMdModule = (ref) => {
    this.taskMdModule = ref
  }
  // onTabMdModule = (ref) => {
  //     this.tabMdModule = ref
  // }
  onVideoModule = (ref) => {
    this.videoModule = ref;
  }
  onLeftSideModule = (ref) => {
    this.leftSideModule = ref;
  }
  onAnswerModule = (ref) => {
    this.answerModule = ref;
  }

  //获取所有课程
  // getCourseData = (lessionId) => {
  //   // let courseId = sessionStorage.getItem("courseId");     //单个课程ID
  //   // if (!courseId) {
  //   //     this.props.history.push('/');
  //   //     return;
  //   // }
  //   this.getCourseList(courseId, lessionId);
  // }

  //获取课程数据
  getCourseData = (id, index) => {
    const { courseIndex } = this.state;
    let _this = this
    getCourse(id).then(res => {
      if (res && res.data.code === 200) {
        const arr = JSON.parse(res.data.data.courseRelation);
        res.data.data.courseRelation = arr;
        let selectData = arr[index];
        arr.map((res, index) => res.key = index);
        _this.setState({
          lessionData: arr,
          course: res.data.data,
          selectData
        })
        this.toggleCourseInfo(selectData);
        return res.data.data
      }
    })
  }


  //获取课时列表
  getCourseList = async (courseId, lessionId) => {
    //获取课程列表
    let coursesList = await AxiosInstance.get(`/courses/${courseId}/lessions`);
    if (coursesList.data.code !== 0) {
      return;
    };
    let courseInfo = coursesList.data.course;
    this.setState({
      courseInfo: {
        courseID: courseInfo.id,
        courseName: courseInfo.name,
        lession: courseInfo.lessions,
        icon: courseInfo.icon
      }
    })
    let data, lessionData;
    for (let i = 0; i < courseInfo.lessions.length; i++) {
      const elem = courseInfo.lessions[i];
      let lession = elem.content.find((res) => {
        if (res.id === lessionId) {
          return res   //找出点击的那个课程
        }
      });
      if (lession) {
        lessionData = elem
        data = lession
        break;
      };
    }
    this.setState({
      lessonsId: data.id,
      videoName: data.video_name,
      lessionData,
    })
    if (lessionData.task_url !== '') {
      this.setState({
        toolName: lessionData.tool
      })
    }
    if (lessionData.task_url === '') {
      this.setState({
        proportion: 24,
        noTesk: true
      })
    } else {
      this.setState({
        taskUrl: lessionData.task_url
      })
      this.taskMdModule.getMdUrl(lessionData.task_url);
    }
    this.toggleCourseInfo(data);
  }
  tabsChange = (key) => {

    this.setState({
      activeKey: key
    })
  }
  //返回课程列表
  goToCoursesList = () => {
    //将课程ID sessionStorage
    this.props.history.push({ pathname: `/space`, state: { page: '8' } });
  }

  //md完成
  readComplete = () => {
    const { courseInfo, videoInfo } = this.state;
    let data = {
      "courseID": courseInfo.courseID,
      "finishItemID": videoInfo.id,
      "curItemID": videoInfo.id,
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
  }

  //练习
  isExercise = (elem) => {
    // this.answerModule.getExerciseJson(url);
    // this.setState({ questionsCss: true, noVideo: true });
    this.setState({
      lessionData: elem
    })
  }
  //只有课程，没有视频
  isHasMd = (res) => {
    this.mdModule.getMdUrl(res.md_url);
    this.setState({
      noVideo: true,
      questionsCss: false,
      mdCol: 21,
    });
    // this.tabMdModule.getMdUrl(res.md_url);
  }
  //切换视频和md
  toggleCourseInfo = (info, isSelect) => {
    this.setState({
      videoInfo: info,
      activeKey: '1'
    })
    console.log('info --->', info);
    this.setState({
      mdUrl: info.ppturl,
      noVideo: false,
      mdCol: 9,
      questionsCss: false,
    });
    this.mdModule.getMdUrl(info.ppturl);
    this.videoModule.getVideoData(info);
    if (!isSelect) {
      this.leftSideModule.setSkeys(info.id);
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
  goApptools = () => {
    const { lessonsId, toolName } = this.state;
    let url = window.location.origin + '/';
    layer.open({
      type: 2,
      title: "方块大王",
      area: ['100%', '100%'],
      anim: 2,
      shade: false,
      shadeClose: false,
      maxmin: true, //开启最大化最小化按钮
      content: url + 'asset/tools/' + toolName + '/' + toolName + '/index.html?id=' + lessonsId, //iframe的url，no代表不显示滚动条
      success: () => {
        $('iframe').focus();
      },
    });
  }

  render () {
    const { courseInfo, noVideo, sKeys, lessionData, course } = this.state;
    console.log('course-------有啊', course)
    return (
      <div style={{ width: '100%', margin: "0 auto", }}>
        <Row style={{ paddingTop: '10px', width: '100%', margin: '0 auto', backgroundColor: '#313139', minHeight: this.state.offsetHeight }}>
          <Col md={1} id="comeOut" style={{ minHeight: this.state.offsetHeight, marginTop: '10px', zIndex: '3', position: 'relative' }} >
            <LetfSide
              courseInfo={course}
              lessionData={lessionData}
              toggleCourseInfo={this.toggleCourseInfo}
              isExercise={this.isExercise}
              isHasMd={this.isHasMd}
              sKeys={sKeys}
              onLeftSideModule={this.onLeftSideModule}
            />
          </Col>
          <Col md={22} style={{ marginTop: '10px', display: noVideo ? 'none' : 'block', overflow: 'hidden' }} >
            <Col md={{ span: this.state.proportion }} >
              <div ref='moduleHeight'>
                <VideoModule
                  onVideoModule={this.onVideoModule}
                  courseInfo={lessionData}
                  courseInfo={course}
                  videoHeight={this.state.videoHeight}
                  setVideoHeight={this.resize}
                  toggleCourseInfo={this.toggleCourseInfo} />
              </div>
            </Col>
            {/* <Col offset={1} md={6} style={{ display: noTesk ? 'none' : 'block', height: this.state.videoHeight ? this.state.videoHeight : "0", backgroundColor: '#fff', overflow: 'hidden' }}>
              <Col md={24} style={{ boxShadow: '0 4px 8px 0 rgba(28,31,33,.1)' }}>
                <Col md={{ span: 24 }} ><div className={Styles.task} style={{ borderBottomColor: '#f20d0d' }} >任务</div></Col>
              </Col>
              <Col md={{ span: 22, offset: 1 }} className={Styles.taskMDDiv} style={{ overflowY: 'auto', height: this.state.videoHeight ? this.state.videoHeight - 66 - 60 : "0" }}>
                <TaskModule onTaskMdModule={this.onTaskMdModule} />
              </Col>
              <Col md={{ span: 24 }} style={{ height: '60px', marginTop: '10px' }} onClick={() => this.goApptools()}>
                <div style={{ margin: '0 auto', width: '172px' }}>
                  <img src='./images/doit.png' /><div style={{ margin: '0 auto', width: '172px', textAlign: 'center', position: 'absolute', top: '5%', color: '#fff', cursor: 'pointer' }}>开始任务</div>
                </div>
              </Col>
            </Col> */}
          </Col>
          <Col md={{ span: 22 }} style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: '#fff' }}>
            <Tabs defaultActiveKey="1" size={'large'} activeKey={this.state.activeKey} onChange={this.tabsChange} tabBarStyle={{ color: '#1890ff', fontWeight: '500' }}>
              <TabPane tab="文档" key="1" style={{ minHeight: '500px' }}><MDModule onMdModule={this.onMdModule} />    </TabPane>
              {/* <TabPane tab="任务" key="2">
                <TabMdModule
                  taskUrl={this.state.taskUrl}
                />
                <div style={{ margin: '0 auto', width: '172px', textAlign: 'center', color: '#fff', cursor: 'pointer', display: noTesk ? 'none' : 'block', }} onClick={() => this.goApptools()}>
                  <p className={Styles.taskButton}>开始任务</p>
                </div>
              </TabPane> */}
              {/* <TabPane tab="练习" key="3">
                <Col md={20} style={{ height: '100%', }}>
                  <Answer questionUrl={lessionData.question_url} onAnswerModule={this.onAnswerModule} />
                </Col>
              </TabPane> */}
            </Tabs>
          </Col>
          {/* <Col md={{ span: 22, offset: 1 }} style={{ display: noVideo ? 'block' : 'none', backgroundColor: '#313139', height: '50px', overflow: 'hidden' }}>
            <Col md={{ span: 2, offset: 11 }}>
              <Button style={{ margin: '0 auto' }} onClick={() => this.showModal()} >学习完成</Button>
            </Col>
          </Col> */}

        </Row>
        {/* 
        <Modal
          title="提示"
          visible={this.state.visible}
          onOk={this.readComplete}
          onCancel={this.handleCancel}
        >
          <p>确认学习完成并进入下一节？</p>
        </Modal> */}



      </div>

    );
  }
}

