import React from 'react';
import NormalLoginForm from './WrappedNormalLoginForm.jsx'
import { Modal, Form, Col, Row } from 'antd';
import Styles from '../../css/nav.module.css';
import { connect } from 'react-redux';
import { gotoLogin } from '../../actions';
const WrappedNormalLoginForm = Form.create()(NormalLoginForm)
class LoginForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      show: props.show
    }
    this.onCancel = this.onCancel.bind(this);
    this.onLoginSuccess = this.onLoginSuccess.bind(this);
  }
  componentWillReceiveProps (nextProps) {
    this.setState(
      {
        show: nextProps.show
      }
    );
  }
  onCancel (e) {
    const { dispatch } = this.props;
    dispatch(gotoLogin(false));
  }
  onLoginSuccess () {
    this.setState({ show: false });
    this.props.onLoginSuccess();
  }
  render () {
    return (
      <Modal
        title="登录"
        destroyOnClose={true}
        visible={this.state.show}
        onCancel={this.onCancel}
        bodyStyle={{ maxWidth: '800px', maxHeight: '420px' }}
        footer={null}
        width='800px'
      >
        <Row>
          <Col sm={{ span: 12 }} xs={{ span: 0 }} >
            <img src="./images/login.jpg" style={{ width: '100%' }} alt="login" />
          </Col>
          <Col sm={{ span: 12 }} xs={{ span: 24 }} >
            <div className={Styles.loginResult}>
              <WrappedNormalLoginForm onLoginSuccess={this.onLoginSuccess} />
            </div>
          </Col>
        </Row>
      </Modal>
    )

  }
}
export default connect()(LoginForm);