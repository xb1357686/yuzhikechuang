import React from 'react';
import AxiosInstance from "../config/apirequest";
import Styles from '../../css/courses.module.css';
import { Row, Col, Icon, Button } from 'antd';
import "survey-react/survey.css";
import Draggable from 'react-draggable'; // The default
/* global layer*/
export default class VideoModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoData: {},
      noVideo: false,
      videoEnd: false,
      lastCourse: false,
      isHasVideo: false,    //是否已经创建了悬浮视频
      isVideoBtn: false,
      videoLayerDom: null,
      allCourse: [],   //拿出所有的單節課程出來
      courseArrIndex: 0,  //当前播放所在所有课程中的索引
      videoHeight: 0,
      openVideo: false,
      closeVideo: false,
    }
    this.handleScroll = this.handleScroll.bind(this)
  }
  moveDate = '';
  componentDidMount () {
    window.addEventListener('scroll', this.handleScroll, true)
    this.props.onVideoModule(this);
  }
  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScroll, true)
    layer.closeAll()
  }
  componentWillReceiveProps = (nextProps) => {
    this.setState({
      videoHeight: nextProps.videoHeight
    });
  }
  handleScroll = () => {
    const { videoData, videoHeight, openVideo, closeVideo } = this.state;
    if (videoData.id !== undefined) {
      let scrollHeight = document.body.scrollTop; // 滚动高度

      var myVideo = document.getElementById("courseVideo")
      var suspendVideo = document.getElementById("suspendVideo")
      if (scrollHeight >= videoHeight / 2 + 64 + 20) {
        if (!openVideo) {
          var currentTime = myVideo.currentTime     //普通视频进度
          this.videoSuspend(currentTime);
          myVideo.pause();
          this.setState({
            openVideo: true,
            closeVideo: true
          });
        }
      } else {
        if (closeVideo) {

          var suspendVideoTime = suspendVideo.currentTime       //小窗口视频进度
          myVideo.play();
          myVideo.currentTime = suspendVideoTime
          layer.closeAll()
          this.setState({
            openVideo: false,
            closeVideo: false,
          });
        }
      }
    }

  }
  getVideoData = (videoData) => {
    console.log('拿到了吧--》', videoData)
    this.setState({
      videoData,
      videoEnd: false,
    })

  }
  //播放结束后
  videoOnEnd = () => {
    const { videoData, allCourse } = this.state, courseInfo = this.props.courseInfo;
    let allCousrsInfo;
    if (!allCourse.length) {
      allCousrsInfo = this.pushAllCourse();
      this.setState({
        allCourse: allCousrsInfo
      })
    } else {
      allCousrsInfo = this.state.allCourse;
    }
    let data = {
      "courseID": courseInfo.courseID,
      "finishItemID": videoData.id,
      "curItemID": videoData.id,
    }
    AxiosInstance({
      method: 'post',
      url: 'user/progress',
      data: data
    });
    let index;    //当前视频所在位置
    allCousrsInfo.map((elem, i) => {
      if (elem.id === videoData.id) {
        index = i;
        this.setState({
          courseArrIndex: i
        })
      }
    })
    if (allCousrsInfo.length - 1 === index) {   //最后一节则不显示下一节按钮
      this.setState({ lastCourse: true })
    }
    this.setState({ videoEnd: true });
  }
  pushAllCourse = () => {
    const courseInfo = this.props.courseInfo; let allCousrsInfo = [];
    courseInfo.lession.map((elem) => {
      allCousrsInfo = allCousrsInfo.concat(elem.content);
    })
    return allCousrsInfo
  }
  //视频播放开始
  videoPlay = (videoData) => {
    let data = {
      "courseID": this.props.courseInfo.courseID,
      "name": this.props.courseInfo.courseName,
      "icon": this.props.courseInfo.icon,
      "curItemID": videoData.id,
    }
    AxiosInstance({
      method: 'post',
      url: 'user/progress',
      data: data
    })
  }

  //重新播放
  videoRedo = () => {
    this.refs.courseVideo.play();
    this.setState({ videoEnd: false });
  }
  //下一节
  nextCourse = () => {
    const { allCourse, courseArrIndex } = this.state;
    let index = courseArrIndex + 1;
    // this.videoPlay(allCourse[index]);
    this.setState({
      courseArrIndex: index,
      videoEnd: false
    });
    this.props.toggleCourseInfo(allCourse[index])
  }
  //视频悬浮
  videoSuspend = (currentTime) => {
    const { videoData } = this.state, _this = this;
    layer.open({
      type: 1,
      title: '视频',
      offset: ['30px', '60%'],
      area: ['480px', '312px'], //宽高
      zIndex: 999999999999,
      shade: 0,
      content: `<video id="suspendVideo"  style="width:100%;height:100%" autoPlay src='${videoData.video_url}' controls ></video>`,
      success: function (layero, index) {
        document.getElementById("suspendVideo").currentTime = currentTime
        layero[0].querySelector('.layui-layer-content').style.overflowY = 'hidden';
        // _this.setState({ isHasVideo: true });
      },
      cancel: function (index, layero) {
        layero[0].style.display = 'none';
        _this.setState({ videoLayerDom: layero[0] });
        // _this.setState({ isVideoBtn: true, videoLayerDom: layero[0] });
        return false;
      }
    });
  }
  cancelVideoBtn = (e) => {
    e.stopPropagation();
    this.setState({
      isVideoBtn: false,
      isHasVideo: false
    })
  }
  //显示视频
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
  render () {
    const { videoEnd, lastCourse, nextQuestions, isVideoBtn, videoData } = this.state, dragHandlers = { onStart: this.onStart, onStop: this.onStop };
    console.log('视频地址', videoData.videourl)
    return (
      <div style={{ height: '100%' }}>
        <video id='courseVideo' ref='courseVideo' src={videoData.videourl} controlsList="nodownload" style={{ backgroundColor: '#000', width: '100%', maxHeight: '720px', zIndex: '1' }} controls
          //  onEnded={this.videoOnEnd} 
          onPlay={() => this.videoPlay(videoData)}
          onCanPlay={() => { this.props.setVideoHeight() }} ></video>
        {/* <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, .7)', top: 0, display: videoEnd ? 'block' : 'none' }}>
                    <div style={{ position: 'absolute', left: '50%', marginLeft: '-55px', top: '50%', marginTop: '-37px' }}>
                        <div style={{ display: lastCourse ? 'none' : 'block' }}><Button type="primary" icon="vertical-left" onClick={() => this.nextCourse()} >下一节</Button></div>
                        <div style={{ cursor: 'pointer', textAlign: 'center', fontSize: '10px', marginTop: '10px', color: '#eeeeee' }} onClick={() => this.videoRedo()}> <Icon type="redo" style={{ fontSize: '10px', color: '#eeeeee' }} /> 重新播放 </div>
                        <div style={{ display: nextQuestions ? 'none' : 'block' }}><Button style={{ borderRadius: '50%', height: '60px', marginTop: '30px', marginLeft: '13px', backgroundColor: '#faad14', color: '#fff' }} onClick={() => this.goQuestions()} >练习</Button></div>
                    </div>
                </div> */}
        {/* <button style={{ position: 'absolute', bottom: '0', right: '0', display: this.state.isHasVideo ? 'none' : 'block' }} onClick={this.videoSuspend}>视频悬浮</button> */}
        {/* <Draggable
                    {...dragHandlers}
                >
                    <div className={Styles.suspendBtn} style={{ display: isVideoBtn ? 'block' : 'none' }} onClick={this.showSuspendVideo}><Icon type="play-circle" />
                        <div className={Styles.cancelBtn} onClick={this.cancelVideoBtn}><Icon type="close-circle" /></div>
                    </div>
                </Draggable> */}
      </div>
    );
  }
}
