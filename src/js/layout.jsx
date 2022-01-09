import React from 'react';
import { Form } from 'antd';
import {
  Route,
  Switch
} from 'react-router-dom';

import Nav from './nav';
import Footer from './footer';
import Loadable from './commom/loadable.jsx';

import { isLogin } from "./util/utils";

const Signup = Loadable(() => import('./login/signup.jsx'));
const apptools = Loadable(() => import('./apptools'));
const Space = Loadable(() => import('./personalCenter/space'));
const HomePage = Loadable(() => import('./homePage'));
const Courses = Loadable(() => import('./courses/courses'));
const CoursesList = Loadable(() => import('./courses/courseslist'));
const CoursesSchool = Loadable(() => import('./courses/courseSchool'));
const MobileTerminalCourses = Loadable(() => import('./courses/mobileTerminalCourses'));
const Activatemail = Loadable(() => import('./user/activatemail'));
const AppList = Loadable(() => import('./homepageComponent/appList'));
const OutstandingWorks = Loadable(() => import('./homepageComponent/outstandingWorks'));
const NewWorks = Loadable(() => import('./homepageComponent/newWorks'));
const HcoursesList = Loadable(() => import('./homepageComponent/hcoursesList'));
const ResetPassWord = Loadable(() => import('./user/resetPassWord'));
const Community = Loadable(() => import('./community'));
const ApplyStl = Loadable(() => import('./applyStl'));
const personalCenter = Loadable(() => import('./personalCenter'));

const Admin = Loadable(() => import('./admin/layouts/BasicLayout'));

const WrappedResetPassWord = Form.create()(ResetPassWord)
class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null
    };
  }
  componentDidMount = () => {
    window.isLogin = isLogin
  }
  getUserInfo = (data) => {
    this.setState({
      userInfo: data
    })
  }

  render () {
    return (
      <React.Fragment>
        <Nav {...this.props} UserInfo={this.state.userInfo} />
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/courses" component={Courses} />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/apptools" component={apptools} />
          <Route exact path="/space" render={(props) => <Space {...props} getUserInfo={this.getUserInfo} />} />
          <Route exact path="/courseslist/:id" render={(props) => <CoursesList {...props} />} />
          <Route exact path="/courseschool" render={(props) => <CoursesSchool {...props} />} />
          <Route exact path="/mobileTerminalCourses" render={(props) => <MobileTerminalCourses {...props} />} />
          <Route exact path="/user/Activatemail" component={Activatemail} />
          <Route exact path="/user/resetPassWord" component={WrappedResetPassWord} />
          <Route exact path="/homepageComponent/appList" component={AppList} />
          <Route exact path="/homepageComponent/outstandingWorks" component={OutstandingWorks} />
          <Route exact path="/homepageComponent/newWorks" component={NewWorks} />
          <Route exact path="/homepageComponent/hcoursesList" component={HcoursesList} />
          <Route exact path="/community" component={Community} />
          <Route exact path="/community/applyStl/:id" component={ApplyStl} />
          <Route exact path="/personalCenter/:userID" component={personalCenter} />
          <Route path="/admin" component={Admin} />
        </Switch>
        <Footer />
      </React.Fragment>
    )
  }
}

export default Layout