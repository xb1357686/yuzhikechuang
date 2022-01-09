import React from 'react';
import { message, Drawer, Button, Input, Modal, ConfigProvider, Icon, Select, Popconfirm, Radio, Row, Col, Tabs, Upload, Form } from 'antd';
const apiUrl = 'http://122.51.68.117:8555'

class My extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploadClick: false,
      isUploadClick1: false,
      isUploadClick2: false,
      videoUrl: null,
      jiaoanUrl: null,
      pdfUrl: null
    }
  }

  onClose = () => {
    const { closeModal, form } = this.props;
    this.setState({
      isUploadClick: false,
      isUploadClick1: false,
      isUploadClick2: false,
      videoUrl: null,
      jiaoanUrl: null,
      pdfUrl: null
    })
    form.resetFields(['title', 'video', 'jiaoan', 'pdf']);
    closeModal();
  }


  // 上传视频前
  beforeUploadMp4 = (file, type) => {
    if (type === 'mp4') {
      const isMp4 = file.type === 'video/mp4';
      const isLt20M = file.size / 1024 / 1024 < 100;
      if (!isMp4) {
        message.error('请上传MP4格式的视频');
      }
      if (isMp4 && !isLt20M) {
        message.error('视频大小不能超过100M');
      }
      return isMp4 && isLt20M;
    } else if (type === 'pdf') {
      const isMp4 = file.type === 'application/pdf';
      const isLt20M = file.size / 1024 / 1024 < 50;
      if (!isMp4) {
        message.error('请上传pdf格式的文件');
      }
      if (!isLt20M) {
        message.error('视频大小不能超过50M');
      }
      return isMp4 && isLt20M;
    }
    return true
  }

  // 更改图片
  handleChange = (info, type) => {
    const { form } = this.props;
    if (type === 'mp4') {
      this.setState({
        isUploadClick: true,
      })
      if (info.fileList.length === 0) {
        this.setState({
          isUploadClick: false,
          videoUrl: null,
        })
        form.resetFields(['video']);
      }
    }
    if (type === 'jiaoan') {
      this.setState({
        isUploadClick1: true,
      })
      if (info.fileList.length === 0) {
        this.setState({
          isUploadClick1: false,
          jiaoanUrl: null,
        })
        form.resetFields(['jiaoan']);
      }
    }
    if (type === 'pdf') {
      this.setState({
        isUploadClick2: true,
      })
      if (info.fileList.length === 0) {
        this.setState({
          isUploadClick2: false,
          pdfUrl: null
        })
        form.resetFields(['pdf']);
      }
    }
    if (info.file.response) {
      const res = info.file.response;
      if (res.code == 200) {
        if (info.file.status === 'uploading') {
          this.setState({
            loading: true,
          });
          return;
        }
        if (info.file.status === 'done') {
          if (info.file.response.data) {
            let imgUrl = info.file.response.data.url;
            if (type === 'mp4') {
              form.setFieldsValue({ 'video': imgUrl });
              this.setState({
                loading: false,
                isUploadClick: true,
                videoUrl: imgUrl
              });
            } if (type === 'jiaoan') {
              form.setFieldsValue({ 'jiaoan': imgUrl });
              this.setState({
                loading: false,
                isUploadClick1: true,
                jiaoanUrl: imgUrl
              });
            }
            if (type === 'pdf') {
              form.setFieldsValue({ 'pdf': imgUrl });
              this.setState({
                loading: false,
                isUploadClick2: true,
                pdfUrl: imgUrl
              });
            }
            return;
          }
        }
      } else {
        message.error(`温馨提示: ${res.message}`);
      }
    }
  };

  // 保存
  okbtn = () => {
    const { form, modalOk } = this.props;
    const { videoUrl, jiaoanUrl, pdfUrl } = this.state;
    form.validateFields(['title', 'video', 'jiaoan', 'pdf'], (error, values) => {
      if (!error) {
        const obj = {
          title: values.title,
          ppturl: pdfUrl,
          videourl: videoUrl,
          teachingurl: jiaoanUrl,
        }
        modalOk(obj);
        this.onClose();
      }
    })
  }

  render () {
    const { visible, form: { getFieldDecorator } } = this.props;
    const { isUploadClick, isUploadClick1, isUploadClick2 } = this.state;
    const token = localStorage.getItem('userToken');
    const uploadProps = {
      action: `${apiUrl}/video/upload?filetype=0`,
      showUploadList: false,
      listType: 'picture-card',
      headers: { Authorization: token },
    };
    const uploadProps1 = {
      action: `${apiUrl}/video/upload?filetype=2`,
      // onChange: this.handleChange,
      // beforeUpload: this.beforeUploadMp4,
      showUploadList: false,
      listType: 'picture-card',
      headers: { Authorization: token },
    };
    const ItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    return (
      <Drawer
        title="添加课时"
        placement="right"
        closable={false}
        onClose={this.onClose}
        visible={visible}
        maskClosable={false}
        width='40%'
      >
        <Form>
          <Form.Item {...ItemLayout} label="课时名称">
            {getFieldDecorator('title', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: '请输入课时名称',
                },
              ],
            })(
              <Input
                type="text"
                placeholder="课时名称"
                maxLength={20}
                style={{ width: '180px', marginRight: '10px' }}
              />
            )}
          </Form.Item>
          <Form.Item {...ItemLayout} label="上传视频">
            {getFieldDecorator('video', {
              rules: [
                {
                  required: false,
                  message: '请上传视频',
                },
              ],
            })(
              <Upload {...uploadProps} listType={null} showUploadList={{ showPreviewIcon: false, showDownloadIcon: false, showRemoveIcon: true }} beforeUpload={(file) => this.beforeUploadMp4(file, 'mp4')} onChange={(file) => { this.handleChange(file, 'mp4') }}>
                <Button disabled={isUploadClick}>
                  <Icon type="upload" /> 上传视频
                    </Button>
                <span style={{ marginLeft: '10px', color: '#b0b0b0' }}>支持格式：MP4 （视频）</span>
              </Upload>
            )}
          </Form.Item>
          <Form.Item {...ItemLayout} label="上传教案">
            {getFieldDecorator('jiaoan', {
              rules: [
                {
                  required: false,
                  message: '请上传教案',
                },
              ],
            })(
              <Upload {...uploadProps1} listType={null} showUploadList={{ showPreviewIcon: false, showDownloadIcon: false, showRemoveIcon: true }} beforeUpload={(file) => this.beforeUploadMp4(file, 'jiaoan')} onChange={(file) => { this.handleChange(file, 'jiaoan') }}>
                <Button disabled={isUploadClick1}>
                  <Icon type="upload" /> 上传教案
                    </Button>
              </Upload>
            )}
          </Form.Item>
          <Form.Item {...ItemLayout} label="上传PDF">
            {getFieldDecorator('pdf', {
              rules: [
                {
                  required: true,
                  message: '请上传PDF',
                },
              ],
            })(
              <Upload {...uploadProps1} listType={null} showUploadList={{ showPreviewIcon: false, showDownloadIcon: false, showRemoveIcon: true }} beforeUpload={(file) => this.beforeUploadMp4(file, 'pdf')} onChange={(file) => { this.handleChange(file, 'pdf') }}>
                <Button disabled={isUploadClick2}>
                  <Icon type="upload" /> 上传PDF课程
                    </Button>
                <span style={{ marginLeft: '10px', color: '#b0b0b0' }}>支持格式：.pdf （文件）</span>
              </Upload>
            )}
          </Form.Item>
        </Form>

        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <Popconfirm
            title='返回后不会保存数据哦，确定返回吗？'
            onConfirm={this.onClose}
            okText="确定"
            cancelText="取消"
          >
            <Button style={{ marginRight: 8 }}>
              关闭
            </Button>
          </Popconfirm>

          <Button onClick={this.okbtn} type="primary">
            保存
            </Button>
        </div>
      </Drawer>
    )
  }
}

export default My