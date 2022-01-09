import React from 'react';
import { message, Table, Button, Input, Modal, ConfigProvider, Icon, Drawer, Popconfirm, Radio, Row, Col, Tabs, Upload, Form } from 'antd';
import { courseSelectPage, addCourse, putCourse, deleteStudent, classifysElectPage, getClass } from '../../z_xu_api';
import zhCN from 'antd/es/locale-provider/zh_CN';  // 引入中文包
import AddCourseModal from './addCourseModal';
const { confirm } = Modal;
const apiUrl = 'http://122.51.68.117:8555'

class Platform extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      Columns: [
        {
          title: '编号',
          dataIndex: 'courseId',
          width: 200,
        },
        {
          title: '封面图',
          dataIndex: 'courseImg',
          width: 200,
          render: (text) => <img alt='图片' style={{ width: '40px', height: '40px' }} src={text} />,
        },
        {
          title: '课程名称',
          dataIndex: 'courseTitle',
          width: 200,
        },
        {
          title: '排课计划',
          dataIndex: 'courseDay',
          width: 200,
        },
        // {
        //   title: '操作',
        //   dataIndex: 'edit',
        //   width: 200,
        //   render: (text, record) => {
        //     return (
        //       <div>
        //         <Button style={{ margin: '2px 10px' }} type="primary" onClick={() => this.editTeacher(record)} >  课程管理 </Button>
        //       </div>
        //     )
        //   },
        // }
      ],
      size: 10,
      current: 1,
      total: 0,
      selectedRowKeys: [],
      editId: null,
      editPassWord: null,
      classify: [],
      classList: [],
      imgUrl: '',
      loading: false,
      modalVisible: false,
      childrenList: [],
    }
  }

  componentDidMount = () => {
    this.selectPage();
  }

  // 获取列表
  selectPage = () => {
    const { size, current } = this.state;
    const obj = this.parameter();
    courseSelectPage(obj).then(res => {
      if (res && res.data && res.status === 200) {
        res.data.rows.map(res => {
          res.key = res.userId;
        })
        this.setState({
          data: res.data.rows
        })
      }
    })
  }

  // 获取班级下拉
  getClass = () => {
    getClass({
      current: 1,
      size: 10000,
    }).then(res => {
      if (res && res.data && res.status === 200) {
        this.setState({
          classList: res.data.rows
        })
      }
    })
  }

  // 获取年级下拉
  classifysElectPage = () => {
    classifysElectPage({
      current: 1,
      size: 500,
      classifyType: '2'
    }).then(res => {
      if (res && res.data && res.status === 200) {
        this.setState({
          classify: res.data.rows
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

  // 编辑
  editTeacher = (record, type) => {
    this.setState({
      visible: true,

    })
    if (type) {
      this.setState({
        editPassWord: record
      })
    } else {
      this.setState({
        editId: record,
      })
    }
    this.setFormData(record);
  }

  // 数据回填
  setFormData = (record) => {
    const { form } = this.props;
    form.setFieldsValue({
      addGradeId: { key: record.gradeId, label: record.gradeName },
      stuGrade: { key: record.stuGradeRelationId, label: record.stuGrade },
      username: record.username,
    })
  }

  // 批量删除
  allDelete = () => {
    const { selectedRowKeys } = this.state;
    deleteStudent({ userIds: selectedRowKeys }).then(res => {
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

  // 弹窗
  handleOk = () => {
    const { form } = this.props;
    const { imgUrl, childrenList } = this.state;
    if (childrenList.length === 0) {
      message.error('请添加课时信息');
      return;
    }
    form.validateFields(['courseImg', 'addCourseTitle', 'courseDesc'], (error, values) => {
      if (!error) {
        const obj = {
          // courseId: 1,
          courseImg: imgUrl,
          courseTitle: values.addCourseTitle,
          courseDay: childrenList.length,
          courseDesc: values.courseDesc,
          courseRelationList: [...childrenList]
        }
        putCourse(obj).then(res => {
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
    }, () => {
      this.setState({
        editId: null,
        editPassWord: null
      })
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
    const values = form.getFieldsValue(['courseTitle'])
    const obj = {
      current,
      size,
      courseTitle: values.courseTitle,
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

  // 上传文件前
  beforeUploadMp4 = (file) => {
    console.log(file)
    const isMp4 = file.name && file.name.indexOf('.stl') > 0;
    const isLt20M = file.size / 1024 / 1024 < 100;
    if (!isMp4) {
      message.error('请上传stl格式的文件');
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
              form.setFieldsValue({ 'videoUrl': imgUrl });
              this.setState({
                addVideoUrl: imgUrl,
                loading: false,
                isUploadClick: true
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

  openAddMOdal = () => {
    this.setState({
      modalVisible: true
    })
  }

  closeModal = () => {
    this.setState({
      modalVisible: false
    })
  }

  modalOk = (data) => {
    const { childrenList } = this.state;
    const arr = [...childrenList];
    arr.push(data);
    arr.map((res, index) => {
      res.key = index;
    });
    this.setState({
      childrenList: [...arr]
    })
  }

  deleteList = (key) => {
    const { childrenList } = this.state;
    const filterArr = childrenList.filter(res => res.key !== key);
    const That = this;
    confirm({
      title: '删除课时',
      content: '删除后将无法还原，请确认',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk () {
        That.setState({
          childrenList: [...filterArr]
        })
      },
    });
  }

  render () {
    const { Columns, data, selectedRowKeys, total, visible, editId, editPassWord, size, current, loading, modalVisible, imgUrl, childrenList } = this.state;
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
      action: `${apiUrl}/video/upload?filetype=1`,
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

    const ItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    const ItemLayout1 = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const title = editId ? '编辑' : editPassWord ? '修改密码' : '新增';
    return (
      <ConfigProvider locale={zhCN}>
        <Form layout="inline">
          <div style={{ marginBottom: '20px' }}>
            <Form.Item {...ItemLayout} label="课程名称">
              {getFieldDecorator('courseTitle', {
                initialValue: '',
              })(
                <Input
                  type="text"
                  placeholder="课程名称"
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
            <Button style={{ margin: '2px 10px' }} type="primary" onClick={this.addTeacher} >  +添加课程 </Button>
            {/* <Button style={{ margin: '2px 10px' }} disabled={selectedRowKeys.length === 0} type="primary" onClick={this.allDelete} >  批量删除 </Button> */}
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
          <Drawer
            title={title}
            visible={visible}
            width='50%'
            onClose={this.handleCancel}
          >
            <Form.Item {...ItemLayout1} label="缩略图">
              {getFieldDecorator('courseImg', {
                initialValue: '',
                rules: [
                  {
                    required: true,
                    message: '请输入课程缩略图',
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
            <Form.Item {...ItemLayout1} label="课程名称">
              {getFieldDecorator("addCourseTitle", {
                rules: [
                  {
                    required: true,
                    message: '请输入课程名称',
                  },
                ],
                initialValue: '',
              })(
                <Input type="text" maxLength={50} placeholder="请输入课程名称" style={{ width: '300px' }} />
              )}
            </Form.Item>
            <Form.Item {...ItemLayout1} label="课时">
              <Button style={{ margin: '2px 10px' }} type="primary" onClick={this.openAddMOdal} > 添加课时 </Button><span>共{childrenList.length}节课时</span>
              {childrenList.map(res => (
                <div key={res.key}>
                  <span style={{ marginRight: '30px' }}>第{res.key + 1}节 {res.title}</span><Icon onClick={() => this.deleteList(res.key)} style={{ color: '#018dcc', cursor: 'pointer' }} type="delete" />
                </div>
              ))}

            </Form.Item>
            <Form.Item {...ItemLayout1} label="课程描述">
              {getFieldDecorator("courseDesc", {
                rules: [
                  {
                    required: true,
                    message: '请输入课程描述',
                  },
                ],
                initialValue: '',
              })(
                <Input type="text" maxLength={250} placeholder="请输入课程描述" style={{ width: '300px' }} />
              )}
            </Form.Item>
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
                onConfirm={this.handleCancel}
                okText="确定"
                cancelText="取消"
              >
                <Button style={{ marginRight: 8 }}>
                  关闭
                </Button>
              </Popconfirm>
              <Button onClick={this.handleOk} type="primary">
                保存
            </Button>
            </div>
          </Drawer>
          <AddCourseModal {...this.props} visible={modalVisible} closeModal={this.closeModal} modalOk={this.modalOk} />
        </Form>

      </ConfigProvider>
    )
  }
}
export default Form.create({ name: 'register' })(Platform);