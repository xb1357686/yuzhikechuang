import React from 'react';
import Apirequest from "../config/apirequest";
import $ from "jquery";
import Styles from '../../css/courses.module.css';
import { Row, Col, Icon, Breadcrumb, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { getCourse } from '../z_xu_api';
export default class CoursesList extends React.Component {
  /* global layer*/
  constructor(props) {
    super(props);
    this.state = {
      lessionData: [], course: {}, minHeight: 0, progress: null, userInfo: null, progressWidth: 0, curItem: null, studyState: '继续学习'
    }
  }
  componentDidMount () {
    // this.setRoutePath();
    let id = '';
    if (this.props.match.params && this.props.match.params.id) {
      id = this.props.match.params.id
    }
    this.getCourseData(id);

    var height = document.body.clientHeight - 64 - 159;   //页面中间可视高度
    this.setState({ minHeight: height })
  }
  //设置路由的显示情况
  setRoutePath = () => {
    let route = [], id = '';
    if (this.props.location.state && this.props.location.state.name === 'classroom') {
      route.push(
        <Breadcrumb.Item key={1} style={{ cursor: 'pointer' }} onClick={this.getCoursesList}>选课</Breadcrumb.Item>
      )
      id = sessionStorage.getItem("courseId");

    } else if (this.props.location.state && this.props.location.state.name === 'space') {
      route.push(
        <Breadcrumb.Item key={1} style={{ cursor: 'pointer' }} onClick={this.goSpace}>个人首页</Breadcrumb.Item>
      )
      id = this.props.location.state.id
    } else {
      route.push(
        <Breadcrumb.Item key={1}><Link to="/courses">课程</Link></Breadcrumb.Item>
      )
      id = sessionStorage.getItem("courseId");
    }
    this.setState({ route });

    if (this.props.match.params && this.props.match.params.id) {
      id = this.props.match.params.id
    } else {
      this.props.history.push('/courses');
      return;
    }
    this.getCourseData(id);
  }
  //获取课程数据
  getCourseData = (id) => {
    let _this = this, userInfo = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null;
    getCourse(id).then(res => {
      if (res && res.data.code === 200 && res.status === 200) {
        const arr = JSON.parse(res.data.data.courseRelation);
        res.data.data.courseRelation = arr;
        _this.setState({
          lessionData: arr,
          course: res.data.data
        })
        return res.data.data
      }
    })
  }
  getCoursesList = () => {
    this.props.history.push({ pathname: `/space`, state: { page: '8' } });
  }
  goSpace = () => {
    this.props.history.push({ pathname: `/space`, state: { page: '1' } });
  }

  goToCoursesMD = (e, data, type) => {
    e.stopPropagation();
    if (type === 'book') {
      layer.open({
        type: 2,
        title: data.title,
        area: ['100%', '100%'],
        anim: 2,
        shade: false,
        shadeClose: false,
        maxmin: true, //开启最大化最小化按钮
        // content: "pdfjs/web/viewer.html?file=" + encodeURIComponent(data.ppturl) + "#page=1",
        content: data.ppturl
      });
    } else {
      layer.open({
        type: 1,
        title: data.title,
        area: ['80%', '80%'],
        shade: false,
        maxmin: true,
        content: `<video src=${data.videourl} style='width: 100%; height: 100%' autoplay controls />`
      });
    }


  }
  goStudy = (curItem) => {
    let id;
    if (!curItem) {
      id = this.state.lessionData[0].content[0].id;
    } else {
      id = curItem.id
    }
    let ispc = this.isPC();
    if (ispc) {
      this.props.history.push({
        pathname: `/courseschool`,
        state: { lessionId: id }
      })
    } else {
      this.props.history.push({
        pathname: `/mobileTerminalCourses`,
        state: { lessionId: id }
      })
    }

  }
  // goToQuestion = (questionUrl) => {
  //     this.props.history.push({
  //         pathname: `/courseschool`,
  //         state: { questionUrl: questionUrl }
  //     })
  // }

  isPC = () => {
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
      return false;
    }
    else {
      return true
    }
  }


  render () {
    const { lessionData, userInfo, progressWidth, progress, curItem, studyState } = this.state;

    let curItemName = '';
    if (curItem) {
      console.log(111, curItem)
      curItemName = curItem.video_name
    }
    var lessionDom = [];
    lessionData.map((elem, index) => {
      let videoDom = [];
      videoDom.push(
        <div>
          <div className={Styles.list} onClick={(e) => this.goToCoursesMD(e, elem, "book")} key={elem.id} >
            <Icon type="read" /> <span>{elem.title}</span>
            {elem.videourl ? <Icon onClick={(e) => this.goToCoursesMD(e, elem, 'video')} style={{ float: 'right', marginLeft: '13px', fontSize: '20px' }} type="video-camera" /> : ''}
            {elem.ppturl ? <Icon onClick={(e) => this.goToCoursesMD(e, elem, 'book')} style={{ float: 'right', fontSize: '20px' }} type="book" /> : ''}
          </div>
        </div>
      )
      lessionDom.push(
        <Col key={elem.title} style={{ padding: '20px 20px', marginBottom: '17px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 16px 0 rgba(7,17,27,.1)' }}>
          <h3>{elem.title}</h3>
          <div style={{ paddingLeft: '25px', fontSize: '14px' }}>
            {videoDom}
          </div>
        </Col>
      )
      return elem.question_url
    })
    return (
      <div style={{ backgroundColor: '#F7F8FA' }}>
        <div style={{ padding: '20px', maxWidth: "1240px", margin: "0 auto", minHeight: `${this.state.minHeight}px`, backgroundColor: '#F7F8FA' }}>
          <Breadcrumb style={{ marginBottom: '15px' }}>
            {this.state.route}
            <Breadcrumb.Item>{this.state.course.name}</Breadcrumb.Item>
          </Breadcrumb>
          <Row gutter={16} style={{ margin: '0', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 16px 0 rgba(7,17,27,.1)', marginBottom: '17px' }}>
            <Col md={24} lg={{ span: 9 }} xl={{ span: 9 }} style={{ padding: 0 }}>
              {this.state.course.courseImg ? <img style={{ borderRadius: '12px 0 0 12px', width: '100%' }} src={this.state.course.courseImg} alt="icon" /> : ''}
            </Col>
            <Col md={{ span: 24 }} lg={{ span: 15 }} xl={{ span: 15 }}>
              <Col span={24} style={{ padding: '0 30px' }}>
                <h1 style={{ fontSize: '0.4rem', margin: 0 }}>{this.state.course.courseTitle}</h1>
                <div style={{ textIndent: '2em' }}>
                  {this.state.course.courseDesc}
                </div>
              </Col>
              {/* <Col span={24} style={{ padding: '2px 0 10px 0' }}>
                <Col span={24} style={{ padding: '0 30px', display: userInfo ? 'block' : 'none' }}>
                  <div style={{ width: '200px' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px', color: '#1c1f21', display: 'inline-block', paddingLeft: '5px' }}>已学：{progress ? Math.floor(progress.finishedLessionCnt / progress.totalLessionCnt * 100) : 0}%</span>
                  </div>
                </Col>
                <Col span={24} style={{ padding: '0 30px', marginTop: '5px', display: userInfo ? 'block' : 'none' }}>
                  <div >
                    <span style={{ borderRadius: '10px', display: 'inline-block', width: '200px', height: '16px', backgroundColor: 'rgb(226, 213, 213)' }}>
                      <span style={{ display: 'inline-block', width: progressWidth + 'px', height: '16px', backgroundColor: 'rgb(255, 77, 79)', borderRadius: '10px' }}></span></span>
                    <span style={{ paddingLeft: '5px', fontSize: '13px', color: '#000', verticalAlign: 'middle', display: curItem ? 'block' : 'none' }}>上次学至:{curItemName} </span>
                  </div>
                </Col>
                <Col span={24} style={{ padding: '0 30px', marginTop: '5px', display: userInfo ? 'block' : 'none' }}>
                  <div style={{ width: '200px' }}>
                    <Button type="danger" className={Styles.start} block onClick={() => this.goStudy(curItem)}>{studyState}</Button>
                  </div>
                </Col>
              </Col> */}
            </Col>
          </Row>
          <Row>
            {lessionDom}
          </Row>
        </div>
      </div>
    );
  }
}
