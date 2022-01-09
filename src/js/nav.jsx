import React from 'react';
import { Menu, Dropdown, Avatar, Row, Col, Icon } from 'antd';
import { Link } from 'react-router-dom'
import Styles from '../css/nav.module.css';
import LoginForm from './login/loginform';
import axiosInstance from "./config/apirequest"
import { connect } from 'react-redux';
import { expireToken } from '../actions';
import { baseUrl } from './config/baseUrl.js';
import { gotoLogin } from '../actions';
import { getSchool } from './z_xu_api';
let dic = { '/': 1, '/courses': 2, '/courseslist': 2, '/courseschool': 2, '/apptools': 3, '/community': 4 }; // 定义一个字典

class Nav extends React.Component {
  state = {
    color: 1,
    allRoute: []
  }
  constructor(props) {
    super(props);
    this.state = {
      showLoginForm: false,
      userInfo: this.props.userInfo,
      newscounts: 0,
      schoolInfo: {},
    }
    this.onLoginSuccess = this.onLoginSuccess.bind(this);
  }

  loadaUserInfo = async () => {
    let userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : '';
    this.setState({ userInfo: userInfo });
    this.getSchool();
    // if (userInfo) {
    //     await axiosInstance({
    //         method: 'get',
    //         url: `/user/checktoken`
    //     }).then(res => {
    //         if (res) {
    //             this.setState({ userInfo: userInfo });
    //         }
    //     })
    // }
  }

  componentWillMount = () => {
    this.loadaUserInfo();
    // let select = this.props.location.pathname
    // if (select.indexOf('/community/applyStl/') !== -1) {
    //   this.setState({
    //     color: 4,
    //   });
    // } else {
    //   const navKey = dic[select]
    //   this.setState({
    //     color: navKey,
    //   });
    // };
  }

  componentWillReceiveProps (nextProps) {
    let select = nextProps.location.pathname
    if (select.indexOf('/community/applyStl/') !== -1) {
      this.setState({
        color: 4,
      });
    } else {

      const navKey = dic[select]
      this.setState({
        color: navKey,
      });
    };


    this.setState({ showLoginForm: nextProps.gotoLogin });
    if (nextProps.newsIsRead === true) {
      this.getNewsNumber()
    }
  }

  // 获取企业信息
  getSchool = () => {
    getSchool().then(res => {
      if (res && res.data.code === 200 && res.status === 200) {
        this.setState({
          schoolInfo: res.data.data
        })
      }
    })
  }

  showModal = () => {
    const { dispatch } = this.props;
    dispatch(gotoLogin(true));
  }
  onLoginSuccess = () => {
    this.loadaUserInfo();
  }
  onExit = () => {
    const { dispatch } = this.props;
    this.setState({
      userInfo: null,
    });
    dispatch(expireToken());
    dispatch(gotoLogin(false));
    localStorage.removeItem("userInfo");
    localStorage.removeItem('userToken');
    this.props.history.push('/');
  }

  getNewsNumber = () => {
    let _this = this;
    axiosInstance({
      method: 'get',
      url: '/user/message/query/count'
    }).then(function (response) {
      if (response.data.code === 0) {
        _this.setState({
          newscounts: response.data.count.unread
        })
      } else {
        //token 过期
        if (response.data.code === 6) {
          _this.onExit();
        }
        console.log("获取失败" + response.data.message)
      }
    })
      .catch(function (error) {
        console.log(error);
      });
  }

  createUserInfoMenu = (data, size) => {
    console.log(data);
    if (!data) {
      let loginDom = <Row>
        <Col span={12} className={Styles.logining} >
          <a title="登陆" onClick={this.showModal} style={{ color: '#fff' }}>登录</a>
        </Col>
        {/* <Col span={12} className={Styles.signin}>
          <Link title="注册" to="/signup" style={{ color: '#fff' }}>注册</Link>
        </Col> */}
      </Row>
      if (size) {
        loginDom = <Row>
          <Col span={12} >
            <a title="登陆" onClick={this.showModal} style={{ color: '#000' }}>登录</a>
          </Col>
        </Row>
        return (
          <Menu>
            <Menu.Item key="4">
              {loginDom}
            </Menu.Item>
          </Menu>
        )
      } else {
        return loginDom
      }

    } else if (size) {
      return (
        <Menu>
          <Menu.Item key="4">
            <div ><Avatar shape="square" src={baseUrl + data.avatar} /> <span className={Styles.userName}>{this.state.userInfo.username}</span></div>
          </Menu.Item>
          <Menu.Item key="5">
            <Link to={'/admin'}>管理平台</Link>
          </Menu.Item>
          <Menu.Item key="6">
            <Link to="/" onClick={this.onExit}>退出</Link>
          </Menu.Item>
        </Menu>
      );
    } else {
      const userMenu = (
        <Menu>
          <Menu.Item key="0">
            <Link to={'/admin'}>管理平台</Link>
          </Menu.Item>
          <Menu.Item key="1">
            <Link to="/" onClick={this.onExit}>退出</Link>
          </Menu.Item>
        </Menu>
      );
      return (
        <Dropdown overlay={userMenu} trigger={['click']}>
          <Row className={Styles.logined}>
            {/* <Col md={{ span: 12 }}><Avatar shape="square" src={baseUrl + data.avatar} /></Col> */}
            <Col md={{ span: 12 }}><span className={Styles.userName}>{this.state.userInfo.username}</span></Col>
          </Row>
        </Dropdown>
      )
    }
  }

  changeColor = (num) => {
    this.setState({
      color: num
    })
  }

  render () {
    const { schoolInfo } = this.state;
    let userInfoMenu;
    if (document.body.clientWidth <= 576) {    //小屏幕下
      userInfoMenu = this.createUserInfoMenu(this.state.userInfo, 'xs');
    } else {
      userInfoMenu = this.createUserInfoMenu(this.state.userInfo);
    }

    if (this.props.UserInfo) {
      //如果个人信息有变动
      userInfoMenu = this.createUserInfoMenu(this.props.UserInfo);
    }

    const menu = (
      <Menu>
        <Menu.Item key="0">
          <Link to="/">首页</Link>
        </Menu.Item>
        <Menu.Item key="1">
          <Link to="/courses" >课程</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/apptools" >软件</Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/community">社区</Link>
        </Menu.Item>
        <Menu.Item key="7">
          <a href="https://kms.maiyajia.com/" target="_blank">学院</a>
        </Menu.Item>
        <Menu.Item key="10">
          <a href="/admin" target="_blank">课程</a>
        </Menu.Item>
        <Menu.Divider />
        {userInfoMenu}
      </Menu>
    );
    console.log(schoolInfo);
    return (

      <div className={Styles.menuList} id="navBar">
        <Row style={{ margin: '0 auto', maxWidth: '1200px' }} className={Styles.navCenter}>
          <Col md={{ span: 4 }} sm={{ span: 6 }} xs={{ span: 9 }} style={{ paddingTop: '11px' }}><img style={{ height: '42px', float: 'left' }} src={schoolInfo.schoolLogo || './images/LOGO4.png'} alt="maiyajia" /> <span style={{ fontSize: '24px', color: '#fff' }}>{schoolInfo.schoolName}</span></Col>
          <Col xs={0} sm={18} md={20} lg={20} xl={20}>
            <Col md={{ span: 2, offset: 1 }} xs={{ span: 3 }}><Link style={{ textDecoration: 'none', color: '#fff' }} to="/" title="首页"><div onClick={() => this.changeColor(1)} style={{ backgroundColor: this.state.color === 1 ? 'rgba(255,255,255,.1)' : '#032951' }} className={Styles.homePage}>首页</div></Link></Col>
            <Col md={{ span: 2 }} xs={{ span: 3 }}><Link style={{ textDecoration: 'none', color: '#fff' }} to="/courses" title="课程"><div onClick={() => this.changeColor(2)} style={{ backgroundColor: this.state.color === 2 ? 'rgba(255,255,255,.1)' : '#032951' }} className={Styles.homePage}>课程</div></Link></Col>
            <Col md={{ span: 2 }} xs={{ span: 3 }}><Link style={{ textDecoration: 'none', color: '#fff' }} to="/apptools" title="软件"><div onClick={() => this.changeColor(3)} style={{ backgroundColor: this.state.color === 3 ? 'rgba(255,255,255,.1)' : '#032951' }} className={Styles.homePage}>软件</div></Link></Col>
            <Col md={{ span: 2 }} xs={{ span: 3 }}><Link style={{ textDecoration: 'none', color: '#fff' }} to="/community" title="社区"><div onClick={() => this.changeColor(4)} style={{ backgroundColor: this.state.color === 4 ? 'rgba(255,255,255,.1)' : '#032951' }} className={Styles.homePage}>社区</div></Link></Col>
            {/* <Col md={{ span: 2 }} xs={{ span: 2 }}><a style={{ textDecoration: 'none', color: '#fff' }} href="https://kms.maiyajia.com/" title="学院" target="_blank"><div style={{ backgroundColor: '#032951' }} className={Styles.homePage}>学院</div></a></Col> */}
            {/* <Col md={{ span: 2 }} xs={{ span: 2 }}><Link style={{ textDecoration: 'none', color: '#fff' }} to="/admin" title="课程"><div onClick={() => this.changeColor(10)} style={{ backgroundColor: this.state.color === 10 ? 'rgba(255,255,255,.1)' : '#032951' }} className={Styles.homePage}>课程</div></Link></Col> */}
            <Col md={{ span: 3 }} sm={{ span: 4 }} xl={{ span: 3 }} style={{ float: 'right' }}>{userInfoMenu}</Col>
          </Col>
          <LoginForm show={this.state.showLoginForm} onLoginSuccess={this.onLoginSuccess} />
          <Col xs={2} sm={0} md={0} lg={0} xl={0} style={{ float: 'right' }}>
            <Dropdown overlay={menu} trigger={['click']}>
              <div className={Styles.dropdownBtn} >
                <Icon type="bars" style={{ fontSize: '26px' }} />
              </div>
            </Dropdown>
          </Col>

        </Row>
      </div>

    );
  }
}
const mapStateToProps = (state) => {
  return {
    gotoLogin: state.gotoLogin,
    expireToken: state.expireToken,
    newsIsRead: state.newsIsRead,
    select: state.select
  };
};
export default connect(mapStateToProps)(Nav);


