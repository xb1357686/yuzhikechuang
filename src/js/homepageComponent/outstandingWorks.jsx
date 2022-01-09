import React from 'react';
import { Row, Col, Icon, message, Tabs } from 'antd';
import { Link } from 'react-router-dom'
import Apirequest from './../config/apirequest';
import { baseUrl } from './../config/baseUrl.js';
import { workSelectPage } from '../z_xu_api';
import Styles from '../../css/homepage.module.css';
import $ from "jquery";
const TabPane = Tabs.TabPane;


/* global layer*/
export default class OutstandingWorks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      productData: [],
      userId: '',
      addProductVib: false,
      addData: '',
      showData: [],
      number: 1,
      usersElements: [],
      total: 0,
      addPage: false,
    };
  }

  componentDidMount = () => {
    this.getProduct();
  }

  //获取按浏览量排序的作品
  getProduct = (num) => {
    const _this = this;
    workSelectPage({ current: 1, size: 6, }).then(res => {
      if (res && res.data && res.status === 200) {
        _this.setState({
          productData: res.data.rows,
          total: res.data.total
        })
        return res.data.works;
      }
    })
    // .then(
    //     (data) => {
    //         if (data.length === 6) {
    //             _this.getNextPage(num, data)
    //         }
    //     }
    // )
  }
  // getNextPage = (num, data = '') => {
  //     const _this = this;
  //     Apirequest.get(`/works/sharelist/${num + 1}/6?sortCategory=1`)
  //         .then(res => {
  //             if (res.data.code === 0) {
  //                 if (res.data.works !== null) {
  //                     _this.setState({
  //                         addPage: true,
  //                     })
  //                 }
  //                 let arr = [];
  //                 if (data) {
  //                     arr = arr.concat(data, res.data.works, _this.state.showData);
  //                 } else {
  //                     arr = arr.concat(_this.state.showData, res.data.works);
  //                 }
  //                 _this.setState({
  //                     showData: arr
  //                 })
  //             }else {
  //                 message.error(res.data.message);
  //             }

  //         })
  // }
  //下一页
  // add = (number) => {
  //   const { showData, total } = this.state;
  //   let arr = [];
  //   arr = showData.slice(number * 6, number * 6 + 6);
  //   if (number !== 2 && showData.length !== total) {
  //     this.getNextPage(number + 1)
  //   }
  //   if (number + 1 === 3 || number + 1 === Math.ceil(total / 6)) {
  //     this.setState({
  //       addPage: false
  //     })
  //   } else {
  //     this.setState({
  //       addPage: true
  //     })
  //   }
  //   this.setState({
  //     productData: arr,
  //     number: number + 1,
  //   })
  // }
  // //上一页
  // remove = (number) => {
  //   const { showData } = this.state;
  //   let arr = showData.slice((number - 2) * 6, (number - 2) * 6 + 6);
  //   this.setState({
  //     productData: arr,
  //     addPage: true,
  //     number: number - 1,
  //   })
  // }

  //点赞
  productLike = (elem, e) => {
    const { productData } = this.state;
    var data = elem.data,
      index = elem.index;
    var times = data.laud
    e.stopPropagation()
    let userInfo = JSON.parse(localStorage.getItem("userInfo"));
    let userid = localStorage.getItem("likeId");
    console.log(userid, userInfo.id)
    userid = userid === 'undefined' ? '' : userid;
    Apirequest({
      method: 'POST',
      url: `/works/laud`,
      data: {
        workid: data.id,
        userid: userInfo ? userInfo.id : userid
      }
    }).then((res) => {
      if (res.data.code === 0) {
        if (elem.text === '浏览量') {
          productData[index].laud = times + 1;
          this.setState({
            productData
          })
        }
        if (res.data.userid) {
          this.setState({
            userId: res.data.userid
          })
          localStorage.setItem("likeId", res.data.userId);
        }
        message.success('谢谢您的赞赏！');
      } else {
        message.error(res.data.message);
      }
    })
  }

  // //收藏
  productCollect = (elem, e) => {
    e.stopPropagation()
    const { productData } = this.state;
    let data = elem.data,
      index = elem.index;
    let times = data.favor
    var userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      message.error('请先登录再收藏作品');
      return;
    }
    Apirequest({
      method: 'POST',
      url: `/works/favorite`,
      data: {
        workid: data.id,
        userid: userInfo.id
      }
    }).then((res) => {
      if (res.data.code === 0) {
        if (elem.text === '浏览量') {
          productData[index].favor = times + 1;
          this.setState({
            productData
          })
        }
        message.success('谢谢您的收藏！');
      } else {
        message.error(res.data.message);
      }
    })
  }
  //跳转
  getProductPerview = (id) => {
    Apirequest({
      method: 'put',
      url: `works/browse?workid=${id}`,
    }).then(res => {
      if (res.data.code !== 0) {
        console.log(res.data.message)
      }
    })
    this.props.history.push({ pathname: `/community/applyStl/${id}` })
  }

  //打开个人中心
  goPersonalCenter = (elem, e) => {
    let userID = elem.data.userID
    console.log(userID)
    e.stopPropagation()
    this.props.history.push({ pathname: `/personalCenter/${userID}` })
  }

  render () {
    const { number, productData, addPage } = this.state;
    let usersElements, i = 0
    if (productData && productData.length > 0) {
      usersElements = []
      for (let elem of productData) {
        usersElements.push( // 循环每个用户，构建 JSX，push 到数组中 
          <Col className={Styles.productCard} xs={{ span: 12 }} md={{ span: 6 }} lg={{ span: 4 }} xl={{ span: 4 }} key={elem.workId} onClick={this.getProductPerview.bind(null, elem.workId)} >
            <div className={Styles.cardDiv} >
              <div style={{ overflow: 'hidden', height: '183.3px' }}>
                <img className={Styles.productImg} alt="example" src={elem.workImg} />
              </div>
              <div style={{ backgroundColor: '#21cfda', boxShadow: 'rgba(33, 207, 218, 0.39) 0px 10px 22px 0px' }} >
                <div className={Styles.cardName}>{elem.workTitle} </div>
                {/* <div className={Styles.cardBrowse}>
                  <Icon type="eye" /> {elem.likeNumb}
                  <span className={Styles.cardLaud} onClick={this.productLike.bind(null, { data: elem, index: i, text: '浏览量' })} >
                    <Icon type="eye" theme="outlined" /> {elem.browseNumb}
                  </span>
                  <span className={Styles.cardFavor} onClick={this.productCollect.bind(null, { data: elem, index: i, text: '点赞' })}>
                    <Icon type="copy" theme="outlined" /> {elem.likeNumb}
                  </span>
                </div> */}
                {/* <div className={Styles.cardUserName} onClick={this.goPersonalCenter.bind(null, { data: elem, index: i })}>
                  <Icon type="user" /> {elem.user[0].realname}
                </div> */}
              </div>
            </div>
          </Col>
        )
        i++
      }
    }
    return (
      <div className={Styles.eachPiece} style={{ marginTop: '.2rem' }}>
        <div >
          <img style={{ width: '50px' }} src='./images/coursesIcon.png' alt='课程图标' />
          <span className={Styles.title}>优秀作品</span>
          <Link to="/community" className={Styles.homePage2}>更多作品</Link>
        </div>
        <div className={Styles.productLine} >
          <button onClick={() => this.remove(number)} className={Styles.control} style={{ display: number && number === 1 ? 'none' : 'block', cursor: 'pointer' }}><img src='./images/left.png' className={Styles.lastPage} alt="" /></button >
          <Tabs tabBarStyle={{ display: 'none' }}    >
            <TabPane tab={number} key={number}>
              <Row gutter={20}>
                {usersElements === null ? '社区还没有作品哦,快快分享吧！' : usersElements}
              </Row>
            </TabPane>
          </Tabs>
          <button onClick={() => this.add(number)} className={Styles.control} style={{ display: addPage === false ? 'none' : 'block', right: '0', top: '0', cursor: 'pointer' }}>
            <img src='./images/right.png' className={Styles.nextPage} alt="" />
          </button >

        </div>
      </div>
    )
  }
}
