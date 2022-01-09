import React from 'react';
import { Row, Col, Card, Icon, Modal, Button, Divider, message, Breadcrumb, Tabs } from 'antd';
import AxiosInstance from "./config/apirequest";
import { baseUrl } from './config/baseUrl';
import { Link } from 'react-router-dom'
import ScratchLoader from './scratchLoader.jsx';
import STLViewer from 'stl-viewer';
import Styles from '../css/courses.module.css';
import { getWork, postWorkLike } from './z_xu_api';
var greenFlag = require("../images/greenFlag.svg")

const QRCode = require('qrcode.react');
const TabPane = Tabs.TabPane;
export default class production extends React.Component {
  state = {
    productInfo: {},
    pageHeight: 0,
    shareUrl: '',
    visible: false,
    userId: '',
    userInfo: '',
    noStl: null,
    download: false,
    time: '',
    hasStl: "",         //stl模型展示
    btnClick: false
  }
  componentWillMount = () => {
    let route = [];
    route.push(
      <Breadcrumb.Item key={1}><Link to="/community">社区</Link></Breadcrumb.Item>
    )
    let userInfo = localStorage.getItem("userInfo");
    let pageHeight = document.body.clientHeight - 64;  //减去头部和底部的高度
    this.setState({
      pageHeight, route
    })
    //如果未登录，则创建用户ID 写入storage.
    if (userInfo) {
      var userId = JSON.parse(userInfo).id;
      this.setState({ userId, userInfo });
    }
  }

  componentDidMount = () => {
    if (!this.props.match.params || !this.props.match.params.id) {
      this.props.history.push({ pathname: `/space`, state: { page: '5' } });
      return;
    }
    try {
      this.getProduct();
    } catch (error) {
      console.log(error);
    }
  }

  greenFlag = () => {

    let productInfo = this.state.productInfo;
    let id = productInfo.id;
    let url = `${baseUrl}${productInfo.toolURL}?dataID=${id}`;
    var win = window.open(url, '_blank');
    win.focus();
  }

  getProduct = () => {
    let id = this.props.match.params.id;
    getWork(id).then((res) => {
      if (res && res.data.code === 200 && res.status === 200) {
        this.setState({
          productInfo: res.data.data
        }, () => {
          this.productLike(2)  // 加个浏览量
        })
        let img = <img style={{ border: '1px solid #e8e8e8', maxWidth: '362px' }} alt='作品图片' src={res.data.data.workImg} />
        let dom;
        dom =
          <Tabs onChange={this.tabsChange} type="card"
            tabBarStyle={{ borderBottom: 'none' }}
          >
            <TabPane tab="图片" key="1">{img}</TabPane>
            <TabPane tab="模型" key="2">
              <STLViewer
                modelColor='#0B84FF'
                lights={[[1, -1, 1], [0.5, 0, -1, 1]]}
                rotate={true}
                cameraZ={5}
                cameraX={0}
                cameraY={-100}
                model={res.data.data.workUrl}
              />
            </TabPane>

          </Tabs>
        this.setState({
          noStl: dom,
        })
      }
    })
  }
  onShareProduct = () => {
    this.setState({ visible: true })
  }
  hideModal = () => {
    this.setState({ visible: false })
  }
  //点赞
  productLike = (type) => {
    const { productInfo, btnClick } = this.state;
    // let userInfo = JSON.parse(localStorage.getItem("userInfo"));
    // let userid = localStorage.getItem("likeId");
    // userid = userid === 'undefined' ? '' : userid;
    if (btnClick && type === 1) {
      return;
    }
    try {
      postWorkLike({ type: type, parms: productInfo.workId }).then((res) => {
        if (res && res.data.code === 200 && res.status === 200) {
          productInfo.likeNumb = productInfo.likeNumb + 1;
          this.setState({
            productInfo
          })
          if (type === 1) {
            this.setState({ btnClick: true })
            message.success('谢谢您的赞赏！');
          }
        }
      })
    } catch (error) {
      console.log(error);
    }
  }
  //收藏
  productCollect = () => {
    const { productInfo } = this.state;
    let userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      message.error('请先登录再收藏作品');
      return;
    }
    try {
      AxiosInstance({
        method: 'POST',
        url: `/works/favorite`,
        data: {
          workid: productInfo.id,
          userid: userInfo.id
        }
      }).then((res) => {
        if (res.data.code === 0) {
          productInfo.favor = productInfo.favor + 1;
          this.setState({
            productInfo
          })
          message.success('谢谢您的收藏！');
        } else {
          message.error(res.data.message);
        }
      })
    } catch (error) {
      console.log(error);
    }
  }
  goPersonalCenter = (elem, e) => {
    const { productInfo } = this.state;
    let userID = productInfo.userID
    this.props.history.push({ pathname: `/personalCenter/${userID}` })
  }

  downloadFile = (type) => {
    let id = this.props.match.params.id;
    let link = baseUrl + 'asset/works/' + id + type
    window.open(link)
  }
  tabsChange = (key) => {

  }
  render () {
    const { productInfo, visible, noStl, download, hasStl } = this.state;
    return (
      <div className={Styles.content} style={{ minHeight: `${this.state.pageHeight}px` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', minHeight: `${this.state.pageHeight}px` }}>
          <Breadcrumb style={{ paddingTop: '20px' }}>
            {this.state.route}
            <Breadcrumb.Item>作品详情</Breadcrumb.Item>
          </Breadcrumb>
          <Row style={{ padding: '25px 0 0 0 ' }}>
            {/* <Col md={{ span: 2, }} xs={{ span: 5 }} style={{ paddingTop: '6px' }}><img style={{ width: '70px', height: '70px', borderRadius: '6px' }} alt='作品详情' src={productInfo.avatar ? baseUrl + productInfo.avatar : ''}></img>
              <Col md={{ span: 24, }} style={{ marginTop: '15px' }} ><div onClick={this.goPersonalCenter.bind()} className={Styles.person} ><Icon type="user" theme="outlined" /> {productInfo.username}</div></Col>
            </Col> */}
            <Col md={{ span: 20, }} xs={{ span: 12 }} >
              <Col md={{ span: 24, }} ><span style={{ fontSize: '25px' }}>{productInfo.workTitle} </span ></Col>
              <Col md={{ span: 1 }} style={{ marginTop: '10px', fontSize: '13px' }}>简介：</Col><Col md={{ span: 20 }} style={{ marginTop: '10px' }}><span style={{ fontSize: '13px' }}>{productInfo.description || '该作品暂无描述'}</span></Col>

            </Col>
            <Col md={{ span: 24, }} > <span style={{ fontSize: '12px', position: 'relative', bottom: '0' }}>创作时间：{productInfo.createTime} </span ></Col>
          </Row>
          <Divider></Divider>
          <Row style={{ paddingTop: '20px' }}>
            <Col md={{ span: 13, }} lg={{ span: 13, }} xs={{ span: 24, }}>
              <Col md={{ span: 24, }} style={{ padding: '0 10px' }}>
                <div id="viewer" style={{ width: '100%' }}>
                  {noStl}
                </div>
              </Col>
              <Col md={{ span: 6, }} style={{ padding: '20px 10px' }}><Button type="primary" onClick={this.downloadFile.bind(null, '.Z1')} style={{ display: download ? 'block' : 'none' }} ><Icon type="download" style={{ fontSize: '17px' }} />下载源文件</Button></Col>
              <Col md={{ span: 12, }} style={{ padding: '20px 10px' }}><Button type="primary" onClick={this.downloadFile.bind(null, '.stl')} style={{ display: download ? 'block' : 'none' }} ><Icon type="download" style={{ fontSize: '17px' }} />下载STL文件</Button></Col>
            </Col>
            <Col md={{ span: 9, offset: 1 }} xs={{ span: 24 }}>
              <Card style={{ padding: '5px' }}>
                <Col md={{ span: 24, }} xs={{ span: 24, }} style={{ textAlign: 'center', fontSize: '24px', marginTop: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <Col md={{ span: 9, offset: 2 }} xs={{ span: 9, offset: 2 }} style={{ borderRadius: '6px', border: '1px solid #1DA57A' }}>
                    <div style={{ backgroundColor: '#1DA57A', padding: '6px 15px', fontWeight: '900', color: '#fff' }}>{productInfo.likeNumb}</div>
                    <div style={{ padding: '10px 15px', cursor: 'pointer', color: '#1DA57A', fontSize: '16px' }} onClick={() => this.productLike(1)}>
                      <Icon type="like" theme="outlined" /> 点赞
                                    </div>
                  </Col>
                  <Col md={{ span: 9, offset: 2 }} xs={{ span: 9, offset: 2 }} style={{ borderRadius: '6px', border: '1px solid #1DA57A' }}>
                    <div style={{ backgroundColor: '#1DA57A', padding: '6px 15px', fontSize: '24px', fontWeight: '900', color: '#fff' }}>{productInfo.browseNumb}</div>
                    <div style={{ padding: '10px 15px', cursor: 'pointer', fontSize: '16px', color: '#1DA57A' }}>
                      <Icon type="copy" theme="outlined" /> 浏览
                                </div>
                  </Col>
                </Col>
                <Col md={{ span: 20, offset: 2 }} xs={{ span: 20, offset: 2 }} id='shareBtn'>
                  <Button type="primary" style={{ width: '100%', marginTop: '20px' }} onClick={this.onShareProduct}><Icon style={{ fontSize: '20px' }} type="wechat" theme="outlined" /> 分享</Button>
                </Col>

              </Card>
            </Col>
          </Row>
          <Modal
            title="作品分享"
            visible={visible}
            onCancel={this.hideModal}
            footer={null}
          >
            <div style={{ textAlign: 'center' }}>
              <QRCode value={window.location.href} size={200} />
              <h4 style={{ padding: '10px' }}>请使用手机扫描二维码查看并分享</h4>
            </div>
          </Modal>
        </div>
      </div >
    );
  }
}