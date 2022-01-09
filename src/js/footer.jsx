import React from 'react';
import { Row, Col, Modal, Form } from 'antd';
import Styles from '../css/footer.module.css';
import FeedModal from './feedModal.jsx';
import { getSchool } from './z_xu_api';

const FeedModalLoginForm = Form.create()(FeedModal);
/* global layer*/
export default class Footer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      feedVisible: false,
      schoolInfo: {}
    }
  }

  loadaUserInfo = async () => {
    this.getSchool();
  }

  termsOfServer () {
    layer.open({
      type: 2,
      title: '服务条款',
      area: ['800px', '500px'],
      anim: 2,
      move: false,
      content: './clause.html',
    });
  }
  showFeedModal = () => {
    this.setState({
      feedVisible: true,
    });
  }
  cancelFeedModal = () => {
    this.setState({
      feedVisible: false,
    });
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

  render () {
    const { schoolInfo } = this.state;
    return (
      <div className={Styles.footer}>
        <Row className={Styles.footerTop} style={{ maxWidth: '1200px', margin: '0px auto' }}>
          <Col>
            <Col xs={{ span: 24 }} md={{ span: 3 }} xl={{ span: 3 }}>
              <div><img style={{ height: '80px' }} src={schoolInfo.schoolLogo || './images/LOGO4.png'} alt="maiyajia" /></div>
            </Col>
            <Col xs={{ span: 24 }} md={{ span: 6, offset: 6 }} xl={{ span: 7, offset: 6 }}>
              <div>
                <p className={Styles.point}>商务咨询：0755-85289674</p>
                <p className={Styles.point}>商务合作：bd@yuzhi-ai.com</p>
              </div>
              <p className={Styles.copyright}>Copyright © 2018 <span className={Styles.label} target='_target'>深圳育智科创科技有限公司</span> 版权所有</p>
              <p className={Styles.point}>Version: 派森乐园3D打印教学管理平台V1.0</p>
              {/* <a className={Styles.label} onClick={this.termsOfServer.bind(this)}>服务条款</a> | <a className={Styles.label} onClick={this.showFeedModal}>意见反馈</a>  */}
            </Col>
            <Col xs={{ span: 24 }} md={{ span: 2, offset: 6 }} xl={{ span: 2, offset: 5 }} className={Styles.twoCode}>
              <div style={{ width: '82px', margin: '0 auto' }}>
                {/* <img style={{ width: '100%' }} src="./images/twocode.jpg" alt="maiyaplus" /> */}
              </div>
            </Col>
          </Col>

        </Row>
        <Modal
          visible={this.state.feedVisible}
          title="意见反馈"
          onCancel={this.cancelFeedModal}
          footer={null}
        >
          <FeedModalLoginForm {...this.props} cancelFeedModal={this.cancelFeedModal} />
        </Modal>
      </div>

    );
  }
}

