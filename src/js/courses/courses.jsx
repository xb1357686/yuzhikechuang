import React from 'react';
import Apirequest from '../config/apirequest';
import Styles from '../../css/courses.module.css';
import Banner from '../banner.jsx';
import { Row, Col, Radio, message, Button } from 'antd';
import { courseSelectPage } from '../z_xu_api';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
export default class Courses extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      coursesData: [],
      radioGroup: [],
      pageHeight: 0,
      select: 'all',
      pageNum: 1,
      highest: 0,
      totalNum: 0
    };
    this.handleScroll = this.handleScroll.bind(this)
  }

  componentDidMount = () => {
    let _this = this;
    // _this.getCoursesClass();
    _this.getAllCourses(1)
    window.addEventListener('scroll', this.handleScroll, true)
    let pageHeight = document.body.clientHeight - 64 - 159;  //减去头部和底部的高度
    _this.setState({
      pageHeight,
      highest: document.body.clientHeight
    })
  }
  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScroll, true)
  }

  handleScroll = () => {
    var { pageNum, select, highest, coursesData } = this.state;
    var footerHeight = 285;
    let clientHeight = document.documentElement.clientHeight; // 可视区域高度
    let scrollHeight = document.body.scrollTop; // 滚动高度
    let offsetHeight = document.body.scrollHeight; // 文档高度
    if (highest !== offsetHeight - footerHeight && coursesData.length >= 12) {
      if (clientHeight + scrollHeight >= offsetHeight - footerHeight) {
        var num = pageNum + 1;
        this.setState({
          highest: offsetHeight - footerHeight,
          pageNum: num
        });
        if (select === 'all') {
          this.getAllCourses(num);
        } else {
          this.getProductTools(num, select);
        }
      }
    }
  }
  //获取全部课程列表
  getAllCourses = (page) => {
    var { coursesData } = this.state;
    let article = 12;//每页展示的数量
    var arr = coursesData;
    courseSelectPage({ current: page, size: 12 })
      .then(res => {
        if (res && res.data.rows) {
          arr = arr.concat(res.data.rows);
          this.setState({
            totalNum: res.data.total,
            coursesData: res.data.rows
          });
        }
      })
  }
  //  //获取课程分类标签
  // getCoursesClass = () => {
  //     var radioGroup = [];
  //     Apirequest.get(`/courses/category`)
  //         .then(res => {
  //             if (res.data.code === 0) {
  //                 for (let i = 0; i < res.data.categorys.length; i++) {
  //                     let data = res.data.categorys[i];
  //                     radioGroup.push(<RadioButton key={i} style={{ marginRight: '20px' }} value={data.category}>{data.category}</RadioButton>)
  //                 }
  //                 this.setState({
  //                     radioGroup,
  //                 })
  //             } else {
  //                 message.error(res.data.message);
  //             }
  //         })
  // }
  //进入课节选择页面
  getCoursesList = (res) => {
    //将课程ID sessionStorage
    sessionStorage.setItem("courseId", res.id);
    this.props.history.push(`/courseslist/${res.id}`);
  }
  //改变课程分类
  onChange = (e) => {
    var { coursesData } = this.state;
    // console.log(coursesData)
    coursesData.splice(0);
    let select = e.target.value;
    if (select === 'all') {
      this.setState({
        highest: 0,
        pageNum: 1,
        coursesData: coursesData,
        select: select,
      })
      this.getAllCourses(1);

      return;
    } else {
      this.setState({
        highest: 0,
        pageNum: 1,
        coursesData: coursesData,
        select: select,
      })
      this.getProductTools(1, select);

      return;
    }
  }
  //获取分类后课程列表
  getProductTools = (page, select) => {
    var { coursesData } = this.state;
    const _this = this;
    let article = 12;
    var arr = coursesData;
    Apirequest.get(`/courses/category/${page}/${article}?category=${select}`)
      .then(res => {
        if (res.data.code === 0 && res.data.courses) {
          arr = arr.concat(res.data.courses);
          _this.setState({
            totalNum: res.data.total,
            coursesData: arr,
          })


        } else {
          message.warn('该分类最后一页');
        }
      })
  }

  render () {
    var usersElements = [];
    var coursesData = this.state.coursesData;
    for (let i = 0; i < coursesData.length; i++) {
      const element = coursesData[i];
      // console.log(element)
      usersElements.push(<Col key={element.courseId} onClick={this.getCoursesList.bind(null, { id: element.courseId, data: element })} sm={{ span: 12, offset: 0 }} md={{ span: 6, offset: 0 }} xs={{ span: 16, offset: 4 }}>
        <div className={Styles.courses_bgc}>
          <div className={Styles.courses_imgBgc}><img src={element.courseImg} alt="" /></div>
          <div className={Styles.courses_title}>{element.courseTitle}</div>
        </div>
      </Col>)
    }

    return (
      <div id='scroll'>
        <div className={Styles.content} style={{ minHeight: `${this.state.pageHeight}px` }}>
          <Banner />
          <div className={Styles.content_bgc}  >
            <RadioGroup defaultValue="all" size="large" onChange={this.onChange}>
              <RadioButton value="all" style={{ marginRight: '20px' }}>全部</RadioButton>
              {this.state.radioGroup}
            </RadioGroup>
            <div style={{ display: 'inline-block', float: 'right', marginTop: '19px' }}>课节总量：{this.state.totalNum} 门</div>
            <Row gutter={55}  >
              {usersElements ? usersElements : '现在还没有课程哦！'}
            </Row>
          </div>
        </div>
      </div>
    )
  }
}
