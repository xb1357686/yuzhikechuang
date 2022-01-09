import React from 'react';
import { message, Table, Button, Input, Modal, ConfigProvider, Divider, Select, Popconfirm, Radio, Row, Col, Tabs, Upload, Form } from 'antd';
import { studentSelectPage, addStudent, putStudent, deleteStudent, classifysElectPage, getClass } from '../../z_xu_api';
import zhCN from 'antd/es/locale-provider/zh_CN';  // 引入中文包

class Student extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      Columns: [
        {
          title: '学生姓名',
          dataIndex: 'username',
          width: 200,
        },
        {
          title: '班级名称',
          dataIndex: 'gradeName',
          width: 200,
        },
        {
          title: '年级名称',
          dataIndex: 'stuGrade',
          width: 200,
        },
        {
          title: '操作',
          dataIndex: 'edit',
          width: 200,
          render: (text, record) => {
            return (
              <div>
                <Button style={{ margin: '2px 10px' }} type="primary" onClick={() => this.editTeacher(record)} >  编辑 </Button>
                <Button style={{ margin: '2px 10px' }} type="primary" onClick={() => this.editTeacher(record, true)}>  修改密码 </Button>
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
      classify: [],
      classList: [],
    }
  }

  componentDidMount = () => {
    this.selectPage();
    this.getClass();
    this.classifysElectPage();
  }

  // 获取列表
  selectPage = () => {
    const { size, current } = this.state;
    const obj = this.parameter();
    studentSelectPage(obj).then(res => {
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
    const { editId, editPassWord } = this.state;
    form.validateFields((error, values) => {
      if (!error) {
        console.log(editId, editPassWord)
        if (editPassWord) {
          const obj = {
            password: values.password,
            userId: editPassWord.userId,
            type: 1
          }
          putStudent(obj).then(res => {
            if (res && res.data.code && res.status === 200) {
              message.success('修改成功')
              this.okGetInfo();
            }
          })
          return;
        }

        if (editId) {
          const obj = {
            stuGradeRelationId: values.classifyId.key,
            stuGrade: values.classifyId.label,
            gradeId: values.addGradeId.key,
            gradeName: values.addGradeId.label,
            username: values.username,
            userId: editId.userId,
            type: 0,
          }
          console.log(values)
          putStudent(obj).then(res => {
            if (res && res.data.code === 200 && res.status === 200) {
              message.success('编辑成功')
              this.okGetInfo();
            }
          })
        } else {
          const obj = {
            stuGradeRelationId: values.classifyId.key,
            stuGrade: values.classifyId.label,
            gradeId: values.addGradeId.key,
            gradeName: values.addGradeId.label,
            username: values.username,
            password: values.password,
            account: values.account,
          }
          addStudent(obj).then(res => {
            if (res && res.data.code === 200 && res.status === 200) {
              message.success('新增成功')
              this.okGetInfo();
            }
          })

        }
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
    const values = form.getFieldsValue(['keyWord', 'gradeId'])
    const obj = {
      current,
      size,
      keyWord: values.keyWord,
      gradeId: values.gradeId
    }; // 默认列表字段数据
    return obj;
  };


  render () {
    const { Columns, data, selectedRowKeys, total, visible, editId, editPassWord, size, current, classify, classList } = this.state;
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
            <Form.Item {...ItemLayout} label="学生姓名/账号">
              {getFieldDecorator('keyWord', {
                initialValue: '',
              })(
                <Input
                  type="text"
                  placeholder="学生姓名/账号"
                  maxLength={50}
                  style={{ width: '180px', marginRight: '10px' }}
                />
              )}
            </Form.Item>
            <Form.Item {...ItemLayout} label="班级">
              {getFieldDecorator('gradeId', {})(
                <Select placeholder="班级筛选" style={{ width: '180px', marginRight: '30px' }}>
                  {classList.map((item, index) => {
                    return (
                      <Select.Option key={index} value={item.gradeId}>
                        {item.gradeName}
                      </Select.Option>
                    );
                  })}
                </Select>
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
            <Button style={{ margin: '2px 10px' }} type="primary" onClick={this.addTeacher} >  +添加学生 </Button>
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
          >
            <Form.Item {...ItemLayout1} label="用户账号" style={{ display: (editId || editPassWord) ? 'none' : 'block' }}>
              {getFieldDecorator("account", {
                rules: [
                  {
                    required: !editId && !editPassWord,
                    message: '请输入用户账号',
                  },
                ],
                initialValue: '',
              })(
                <Input type="text" maxLength={50} placeholder="请输入用户账号" style={{ width: '300px' }} />
              )}
            </Form.Item>
            <Form.Item {...ItemLayout1} label="年级" style={{ display: editPassWord ? 'none' : 'block' }}>
              {getFieldDecorator('classifyId', {
                rules: [
                  {
                    required: !editPassWord,
                    message: '请选择年级',
                  },
                ],
              })(
                <Select placeholder="请选择年级" style={{ width: '180px', marginRight: '30px' }} labelInValue>
                  {classify.map((item, index) => {
                    return (
                      <Select.Option key={index} value={item.classifyId}>
                        {item.classifyName}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
            <Form.Item {...ItemLayout1} label="班级" style={{ display: editPassWord ? 'none' : 'block' }}>
              {getFieldDecorator('addGradeId', {
                rules: [
                  {
                    required: !editPassWord,
                    message: '请选择班级',
                  },
                ],
              })(
                <Select placeholder="班级筛选" style={{ width: '180px', marginRight: '30px' }} labelInValue>
                  {classList.map((item, index) => {
                    return (
                      <Select.Option key={index} value={item.gradeId}>
                        {item.gradeName}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
            <Form.Item {...ItemLayout1} label="学生名称" style={{ display: editPassWord ? 'none' : 'block' }}>
              {getFieldDecorator("username", {
                rules: [
                  {
                    required: !editPassWord,
                    message: '请输入学生姓名',
                  },
                ],
                initialValue: '',
              })(
                <Input type="text" maxLength={50} placeholder="请输入学生名称" style={{ width: '300px' }} />
              )}
            </Form.Item>
            <Form.Item {...ItemLayout1} label="密码" style={{ display: editId ? 'none' : 'block' }}>
              {getFieldDecorator("password", {
                getValueFromEvent: (event) => {
                  return event.target.value.replace(/\D/g, "")
                },

                initialValue: '',
                rules: [
                  {
                    required: !editId,
                    message: '请输入密码',
                  },
                ],
              })(
                <Input type="text" maxLength={11} placeholder="请输入密码" style={{ width: '300px' }} />
              )}
              {/* <div style={{ display: editPassWord ? 'none' : 'block' }}>不提供密码则使用默认密码：123456</div> */}
            </Form.Item>
          </Modal>
        </Form>
      </ConfigProvider>
    )
  }
}
export default Form.create({ name: 'register' })(Student);