import React from 'react';
import { Row, Col, message } from 'antd';
import { Link } from 'react-router-dom'
import Apirequest from './../config/apirequest';
import Styles from '../../css/homepage.module.css';
import { courseSelectPage } from '../z_xu_api';
/* global layer*/
export default class HcoursesList extends React.Component {
  state = {

    showCourses: [],      //显示的课程数据

  };
  componentDidMount = () => {
    this.getMoreCourses();

  }

  //获取课程列表
  getMoreCourses = () => {
    let _this = this;
    courseSelectPage({ current: 1, size: 6 }).then(res => {
      if (res && res.data && res.status === 200) {
        _this.setState({
          showCourses: res.data.rows
        })
      }
    })

  }

  //获取课程详情
  getCoursesList = (res) => {
    sessionStorage.setItem("courseId", res.id);
    this.props.history.push(`/courseslist/${res.id}`);
  }

  render () {
    const { showCourses } = this.state;
    let coursesList = []
    if (showCourses) {
      for (let i = 0; i < showCourses.length; i++) {
        const element = showCourses[i];
        coursesList.push(<Col key={element.courseId} onClick={this.getCoursesList.bind(null, { id: element.courseId, data: element })} md={{ span: 6, offset: 0 }} xs={{ span: 12 }}>
          <div className={Styles.courses_bgc}>
            <div className={Styles.courses_imgBgc}><img src={element.courseImg} alt="" /></div>
            <div className={Styles.courses_title}><span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '17px', color: '#005cb1ba', fontWeight: '600' }}>{element.courseTitle}</span></div>
          </div>
        </Col>)
      }
    }
    return (
      <div className={Styles.eachPiece} style={{ marginTop: '26px' }}>
        <div >
          <img style={{ width: '50px' }} src='./images/productIcon.png' alt='课程图标' />
          <span className={Styles.title}>精选课程</span>
          <Link to="/courses" className={Styles.homePage}>更多课程</Link>
        </div>
        <div className={Styles.eachPiece} >
          <Row gutter={10}>
            {coursesList ? coursesList : '现在还没有课程哦！'}
          </Row>
        </div>
      </div>
    )
  }
}
