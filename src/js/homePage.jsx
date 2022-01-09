import React from 'react';
import Styles from '../css/homepage.module.css';
import AppList from './homepageComponent/appList';
import OutstandingWorks from './homepageComponent/outstandingWorks';
import NewWorks from './homepageComponent/newWorks';
import HcoursesList from './homepageComponent/hcoursesList';
/* global layer*/
export default class HomePage extends React.Component {
  state = {
    pageHeight: 0,
    userInfo: '',
    userId: '',
  };
  componentDidMount = () => {
    let pageHeight = document.body.clientHeight - 64 - 159;  //减去头部和底部的高度
    this.setState({
      pageHeight,
      loading: true
    })
    let userInfo = localStorage.getItem("userInfo");
    //如果未登录，则创建用户ID 写入storage.
    if (userInfo) {
      let userId = JSON.parse(userInfo).id;
      this.setState({ userId, userInfo });
    }
  }
  render () {
    return (
      <div className={Styles.content} style={{ minHeight: `${this.state.pageHeight}px` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', minHeight: `${this.state.pageHeight}px` }}>
          <img className={Styles.homePageBanner} src='./images/banner3.png' alt="" />
          <AppList {...this.props} />
          <HcoursesList   {...this.props} />
          <OutstandingWorks {...this.props} />
          {/* <NewWorks {...this.props} /> */}
        </div>
      </div>
    )
  }
}

