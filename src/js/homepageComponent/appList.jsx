import React from 'react';
import { Row, Col, message } from 'antd';
import { Link } from 'react-router-dom'
// import Apirequest from './../config/apirequest';
import { baseUrl } from './../config/baseUrl.js';
import Styles from '../../css/homepage.module.css';
import $ from "jquery";
import { portalTools } from '../z_xu_api';

/* global layer*/
export default class AppList extends React.Component {
  state = {
    appData: [],         //工具数据
  };
  componentDidMount = () => {
    this.getApp();
  }
  //按权重获取工具
  getApp = () => {
    portalTools().then(res => {
      if (res && res.data.code === 200 && res.status === 200) {
        let arr = [];
        for (let i = 0; i < res.data.data.length; i++) {
          const tools = res.data.data[i].subclass;
          arr = [...arr, ...tools]
        }
        this.setState({
          appData: arr
        })
      }
    });
  }

  //打开应用
  openAppIframe = (element) => {
    // let url = window.location.origin + '/';
    let layerIndex = layer.open({
      type: 2,
      title: " ",
      area: ['100%', '100%'],
      anim: 2,
      shade: false,
      shadeClose: false,
      move: false,
      maxmin: true, //开启最大化最小化按钮
      // content: url + element.relpath, //iframe的url，no代表不显示滚动条
      content: element.classifyUrl, //iframe的url，no代表不显示滚动条
      success: () => {
        $('iframe').focus();
      },
      restore: (dom) => {
        $(dom[0]).css('top', '0');
        $(dom[0]).find('iframe').focus();
      }
    });
    this.props.history.push({ pathname: `/apptools` });
    this.setState({ layerIndex })
  }
  render () {
    const { appData } = this.state;
    let appList = [];
    if (appData && appData.length) {
      for (let j = 0; j < 3; j++) {
        const element = appData[j];
        console.log(element)
        appList.push(
          <Col key={element.classifyName} md={{ span: 7 }} xs={{ span: 12 }}  >
            <div className={Styles.toolCard}>
              <Col md={{ span: 12 }} xs={{ span: 12 }} ><img src={element.classifyImg} alt='icon' style={{ width: '100%' }} /></Col>
              <Col md={{ span: 12 }} xs={{ span: 12 }} style={{ marginTop: '0.3rem' }}>
                <Col md={{ span: 24 }}>
                  <h2 className={Styles.toolName}>{element.classifyName}</h2>
                </Col>
                <Col xs={{ span: 0 }} md={{ span: 24 }}>
                  <button onClick={() => this.openAppIframe(element)} className={Styles.startBtm}>开始创作</button>
                </Col>
              </Col>
            </div>

          </Col>
        )
      }
    }
    return (
      <Row gutter={20} type="flex" justify="space-between">
        {appList === null ? '暂未发现应用' : appList}
        <Col md={{ span: 2 }} xs={{ span: 12 }}>
          <div className={Styles.toolCard} >
            <Link to="/apptools" className={Styles.moreButton}>更多工具</Link>
          </div>
        </Col>
      </Row>
    )
  }
}
