import React from 'react';
import { Row, Col, Divider, message } from 'antd';
import Styles from '../css/courses.module.css';
import AxiosInstance from "./config/apirequest";
import { connect } from 'react-redux';
import { getParam } from "./util/utils";
import $ from "jquery";
import { portalTools } from './z_xu_api';
/* global layer*/
class Appwindow extends React.Component {
  state = { appData: [], appDOMArr: [], pageHeight: 0, dataArr: [] };
  componentDidMount = () => {
    try {
      this.getToolsApp();
    } catch (error) {
      console.log(error);
    }
    let pageHeight = document.body.clientHeight - 64 - 159;  //减去头部和底部的高度
    this.setState({
      pageHeight
    })
  }
  getToolsApp = () => {
    portalTools().then(res => {
      if (res && res.data.code === 200 && res.status === 200) {       //返回码为0 则正确
        this.setAppDOM(res.data.data)
        this.setState({
          appData: res.data.data
        });
      }
    })
    // .then((res) => {
    //   let appId = getParam('toolid'), appTools = [], appTool;
    //   if (!appId) return;
    //   res.map((elem) => {
    //     appTools = appTools.concat(elem.tools);
    //   })
    //   appTool = appTools.find((elem) => {
    //     return elem.id === appId;
    //   });
    //   if (!appTool) { console.log('没找到这个作品'); return };
    //   setTimeout(() => {
    //     this.openIframe(appTool);
    //   }, 600);
    // })
  }
  setAppDOM = (AppData) => {
    if (AppData.length === 0) return;
    let dvArr = [], dataArr = [];
    // let url = window.location.origin + '/';
    for (let i = 0; i < AppData.length; i++) {
      let arr = []
      const element = AppData[i].subclass;
      element.map((data) => {
        dataArr.push(data);
        arr.push(
          <Col
            lg={{ span: 3 }}
            md={{ span: 6 }}
            key={data.id}
            sm={{ span: 8 }}
            xs={{ span: 12 }}
            onClick={() => this.openIframe(data)}
            data-id={data.id}
            className={Styles.Appcard}
          >
            <div>
              <img style={{ width: '80%' }} src={data.classifyImg} alt="软件LOGO" />
              <h4>{data.classifyName}</h4>
            </div>
          </Col>
        )
        return data.id    //箭头函数需要有个返回值，否者会报警告
      });
      dvArr.push(<Row style={{ margin: 0 }} gutter={20} key={`${i}dv`}>
        <h1>{AppData[i].classifyName}</h1>
        <Divider />
        {arr}
      </Row>)
    }
    this.setState({
      appDOMArr: dvArr,
      dataArr
    })
  }
  openAppIframe = (e) => {
    const { dataArr } = this.state;
    let id = e.currentTarget.getAttribute('data-id');
    let data = dataArr.find(item => {
      return item.id === id;
    })
    this.openIframe(data);
  }
  openIframe = (data) => {
    // let url = window.location.origin + '/';
    layer.open({
      type: 2,
      title: `<img src="${data.classifyImg}" style='width:40px'>&nbsp;<span style='font-size: 16px;color: #000;font-weight: bold;'>${data.classifyName}</span>`,
      area: ['100%', '100%'],
      anim: 2,
      shade: false,
      shadeClose: false,
      move: false,
      maxmin: true, //开启最大化最小化按钮
      content: data.classifyUrl, //iframe的url，no代表不显示滚动条
      success: () => {
        $('iframe').focus();
      },
      restore: (dom) => {
        $(dom[0]).css('top', '0');
        $(dom[0]).find('iframe').focus();
      },
      cancel: function (index, layero) {
        layer.confirm('真的要离开了吗？', { icon: 3, title: '提示' }, function (i) {
          //do something
          layer.close(index);
          layer.close(i);
        });
        return false
      }
    });
  }

  render () {
    return (
      <div className={Styles.content} style={{ minHeight: `${this.state.pageHeight}px`, paddingBottom: '20px' }}>
        <div className={Styles.content_bgc}>
          {this.state.appDOMArr}
        </div>
      </div>
    );
  }
}
export default connect()(Appwindow);