import React from 'react';
import { message, Table, Button, Input, Modal, ConfigProvider, Icon, Select, Popconfirm, Radio, Row, Col, Tabs, Upload, Form } from 'antd';
import { videoSelectPage, deleteVideo, addvVideo } from '../../z_xu_api';
import zhCN from 'antd/es/locale-provider/zh_CN';  // 引入中文包
const apiUrl = 'http://122.51.68.117:8555'

class Video extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      Columns: [
        {
          title: '视频图片',
          dataIndex: 'videoImg',
          width: 200,
          render: (text) => <img alt='图片' style={{ width: '40px', height: '40px' }} src={text} />,
        },
        {
          title: '视频ID',
          dataIndex: 'videoId',
          width: 200,
        },
        {
          title: '视频名称',
          dataIndex: 'videoTitle',
          width: 200,
        },
        {
          title: '大小',
          dataIndex: 'videoSize',
          width: 200,
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          width: 200,
        },
        {
          title: '文件',
          dataIndex: 'videoUrl',
          width: 200,
          render: (text, record) => (
            <div>
              {text ? <a onClick={() => this.playVideo(text)}><Icon type="video-camera" /> 观看</a> : '/'}
            </div>
          )
        },
        {
          title: '操作',
          dataIndex: 'edit',
          width: 200,
          render: (text, record) => {
            return (
              <div>
                <Button style={{ margin: '2px 10px' }} type="primary" onClick={() => this.editTeacher(record)} >  删除 </Button>
              </div>
            )
          },
        }
      ],
      size: 10,
      current: 1,
      total: 0,
      selectedRowKeys: [],
      editId: null,
      editPassWord: null,
      loading: false,
      imgUrl: null,
      videoVisible: false,
      videoUrl: '',
      addVideoUrl: null,
      videoSize: null,
    }
  }

  componentDidMount = () => {
    this.selectPage();
  }

  // 获取列表
  selectPage = () => {
    const obj = this.parameter();
    videoSelectPage(obj).then(res => {
      if (res && res.data && res.status === 200) {
        res.data.rows.map(res => {
          res.key = res.videoId;
        })
        this.setState({
          data: res.data.rows
        })
      }
    })
  }

  // 添加教师
  addTeacher = () => {
    this.setState({
      visible: true,
    })
  }


  // 批量删除
  allDelete = () => {
    const { selectedRowKeys } = this.state;
    deleteVideo({ videoId: selectedRowKeys }).then(res => {
      if (res && res.data.code === 200 && res.status === 200) {
        message.success('删除成功')
        this.selectPage();
      }
    })
  }

  onSelectChange = selectedRowKeys => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  onShowSizeChange = (current, size) => {
    this.setState({
      current,
      size,
    }, () => {
      this.selectPage();
    })
  }

  // 播放视频
  playVideo = (url) => {
    this.setState({
      videoUrl: url,
      videoVisible: true
    })
  }

  // 弹窗
  handleOk = () => {
    const { form } = this.props;
    const { addVideoUrl, imgUrl, videoSize } = this.state;
    form.validateFields((error, values) => {
      if (!error) {
        const obj = {
          videoTitle: values.addvideoTitle,
          videoImg: imgUrl,
          videoUrl: addVideoUrl,
          videoSize,
          classifyId: 1,
        }
        addvVideo(obj).then(res => {
          if (res && res.data.code === 200 && res.status === 200) {
            message.success('新增成功')
            this.okGetInfo();
          }
        })
      }
    })
  }

  okGetInfo = () => {
    this.handleCancel();
    this.selectPage();
  }

  handleCancel = () => {
    const { form } = this.props;
    this.setState({
      visible: false,
      videoVisible: false,
      imgUrl: null,
      addVideoUrl: null,
    })
    form.resetFields();
  }

  // 重置按钮
  handleResetClick = () => {
    const { form } = this.props;
    form.resetFields();
  };

  // 搜索--获取参数
  parameter = () => {
    const { current, size } = this.state;
    const { form } = this.props;
    const values = form.getFieldsValue(['videoTitle'])
    const obj = {
      current,
      size,
      videoTitle: values.videoTitle,
    }; // 默认列表字段数据
    return obj;
  };

  // 图片上传前
  beforeUpload (file) {
    const isJPG = file.type === 'image/jpeg';
    const isPNG = file.type === 'image/png';
    const isGIF = file.type === 'image/gif';
    const isPic = isJPG || isPNG || isGIF;
    if (!isPic) {
      message.error('请上传png/jpg/gif格式的图片');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2M');
    }
    return isPic && isLt2M;
  }

  // 上传视频前
  beforeUploadMp4 = (file) => {
    const isMp4 = file.type === 'video/mp4';
    const isLt20M = file.size / 1024 / 1024 < 100;
    if (!isMp4) {
      message.error('请上传MP4格式的视频');
    }
    if (isMp4 && !isLt20M) {
      message.error('视频大小不能超过100M');
    }
    return isMp4 && isLt20M;
  }

  // 更改图片
  handleChange = (info, type) => {
    const { form } = this.props;
    if (type === 'imgOrMp4') {
      this.setState({
        isUploadClick: true,
      })
      if (info.fileList.length === 0) {
        this.setState({
          isUploadClick: false,
        })
        form.resetFields(['videoUrl']);
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
            if (type) {
              let size = info.file.response.data.size;
              form.setFieldsValue({ 'videoUrl': imgUrl });
              this.setState({
                addVideoUrl: imgUrl,
                loading: false,
                isUploadClick: true,
                videoSize: size
              });
            } else {
              form.setFieldsValue({ 'videoImg': imgUrl });
              this.setState({
                imgUrl,
                loading: false,
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


  render () {
    const { Columns, data, selectedRowKeys, total, visible, editId, editPassWord, size, current, videoVisible, isUploadClick, videoUrl, loading, imgUrl } = this.state;
    const { form: { getFieldDecorator } } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const pagination = {
      showSizeChanger: true,
      current,
      total,
      pageSize: size,
      showQuickJumper: true,
      onShowSizeChange: this.onShowSizeChange,
      showTotal: (total, range) => `当前显示${size}条  共${total}条`,
      onChange: this.onShowSizeChange,
    };

    const ItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };


    const token = localStorage.getItem('userToken');
    const uploadProps = {
      action: `${apiUrl}/video/upload?filetype=2`,
      listType: 'picture-card',
      accept: 'image/*',
      showUploadList: false,
      beforeUpload: this.beforeUpload,
      onChange: this.handleChange,
      headers: { Authorization: token },
    };
    const uploadProps1 = {
      action: `${apiUrl}/video/upload?filetype=0`,
      onChange: this.handleChange,
      beforeUpload: this.beforeUploadMp4,
      showUploadList: false,
      listType: 'picture-card',
      headers: { Authorization: token },
    };
    const uploadButton = (
      <div>
        <Icon type={loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">图片上传</div>
      </div>
    );

    const title = editId ? '编辑' : editPassWord ? '修改密码' : '新增';
    return (
      <ConfigProvider locale={zhCN}>
        <Form layout="inline">
          <div style={{ marginBottom: '20px' }}>
            <Form.Item {...ItemLayout} label="视频名称">
              {getFieldDecorator('videoTitle', {
                initialValue: '',
              })(
                <Input
                  type="text"
                  placeholder="视频名称"
                  maxLength={50}
                  style={{ width: '180px', marginRight: '10px' }}
                />
              )}
            </Form.Item>
            <Button style={{ margin: '2px 10px' }} type="primary" onClick={this.selectPage} >  搜索 </Button>
            <Button
              style={{ marginRight: '20px' }}
              onClick={this.handleResetClick}
            >
              重置
                </Button>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <Button style={{ margin: '2px 10px' }} type="primary" onClick={this.addTeacher} >  +添加视频 </Button>
            <Button style={{ margin: '2px 10px' }} disabled={selectedRowKeys.length === 0} type="primary" onClick={this.allDelete} >  批量删除 </Button>
          </div>
          <Table
            bordered
            loading={this.state.loading}
            style={{ background: 'white' }}
            dataSource={data}
            columns={Columns}
            rowSelection={rowSelection}
            pagination={pagination}
          />
          <Modal
            title={title}
            visible={visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            cancelText="取消"
            okText="确定"
            width={600}
          >
            <Form.Item {...ItemLayout} label="缩略图">
              {getFieldDecorator('videoImg', {
                initialValue: '',
                rules: [
                  {
                    required: true,
                    message: '请输入视频缩略图',
                  },
                ],
              })(
                <Upload
                  {...uploadProps}
                >
                  {imgUrl ? <img style={{ width: '50px', heihgt: '50px' }} src={imgUrl} alt="logo" /> : uploadButton}
                </Upload>
              )}
            </Form.Item>
            <Form.Item {...ItemLayout} label="视频名称">
              {getFieldDecorator("addvideoTitle", {
                rules: [
                  {
                    required: true,
                    message: '请输入视频名称',
                  },
                ],
                initialValue: '',
              })(
                <Input type="text" maxLength={50} placeholder="请输入视频名称" style={{ width: '300px' }} />
              )}
            </Form.Item>
            <Form.Item {...ItemLayout} label="上传视频">
              {getFieldDecorator('videoUrl', {
                rules: [
                  {
                    required: true,
                    message: '请上传视频',
                  },
                ],
              })(
                <Upload {...uploadProps1} listType={null} showUploadList={{ showPreviewIcon: false, showDownloadIcon: false, showRemoveIcon: true }} onChange={(file) => { this.handleChange(file, 'imgOrMp4') }}>
                  <Button disabled={isUploadClick}>
                    <Icon type="upload" /> 上传资源
                    </Button>
                  <span style={{ marginLeft: '10px', color: '#b0b0b0' }}>支持格式：MP4 （视频）</span>
                </Upload>
              )}
            </Form.Item>
          </Modal>
          <Modal
            title='视频预览'
            visible={videoVisible}
            onCancel={this.handleCancel}
            cancelText="取消"
            width='70%'
            footer={
              <Button onClick={this.handleCancel} >
                关闭
              </Button>
            }
          >
            <video width='100%' src={videoUrl} controls="controls" />
          </Modal>
        </Form>
      </ConfigProvider>
    )
  }
}
export default Form.create({ name: 'register' })(Video);