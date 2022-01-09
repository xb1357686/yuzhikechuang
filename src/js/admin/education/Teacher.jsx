import React from 'react';
import BasicLayout from '../layouts/BasicLayout';
import { message, Table, Button, Input, Modal, Icon, Divider, Select, Popconfirm, Radio, Row, Col, Tabs, Upload, Form } from 'antd';
import { selectPage, addTeacher, putTeacher, deleteTeacher } from '../../z_xu_api';

class Teacher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      Columns: [
        {
          title: '教师名称',
          dataIndex: 'username',
          width: 200,
        },
        {
          title: '手机号',
          dataIndex: 'mobile',
          width: 200,
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
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
    }
  }

  componentDidMount = () => {
    this.selectPage();
  }

  // 获取列表
  selectPage = () => {
    const { size, current } = this.state;
    const obj = {
      current,
      size,
    }
    selectPage(obj).then(res => {
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
      mobile: record.mobile,
      username: record.username,
    })
  }

  // 批量删除
  allDelete = () => {
    const { selectedRowKeys } = this.state;
    deleteTeacher({ userIds: selectedRowKeys }).then(res => {
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
          putTeacher(obj).then(res => {
            if (res && res.data.code && res.status === 200) {
              message.success('修改成功')
              this.okGetInfo();
            }
          })
          return;
        }

        if (editId) {
          const obj = {
            mobile: values.mobile,
            username: values.username,
            userId: editId.userId,
            type: 0
          }
          putTeacher(obj).then(res => {
            if (res && res.data.code === 200 && res.status === 200) {
              message.success('编辑成功')
              this.okGetInfo();
            }
          })
        } else {
          const obj = {
            mobile: values.mobile,
            username: values.username,
            password: values.password,
            account: values.account
          }
          addTeacher(obj).then(res => {
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
      editId: null,
      editPassWord: null
    })
    form.resetFields();
  }

  render () {
    const { Columns, data, selectedRowKeys, total, visible, editId, editPassWord } = this.state;
    const { form: { getFieldDecorator } } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const pagination = {
      total,
      onChange: (current, size) => this.onShowSizeChange(current, size)
    }

    const ItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const title = editId ? '编辑' : editPassWord ? '修改密码' : '新增';
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <Button style={{ margin: '2px 10px' }} type="primary" onClick={this.addTeacher} >  +添加教师 </Button>
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
          <Form>
            <Form.Item {...ItemLayout} label="用户账号" style={{ display: (editId || editPassWord) ? 'none' : 'block' }}>
              {getFieldDecorator("account", {
                rules: [
                  {
                    required: !editId && !editPassWord,
                    message: '请输入用户账号',
                  },
                ],
                initialValue: '',
              })(
                <Input type="text" maxLength={8} placeholder="请输入用户账号" style={{ width: '300px' }} />
              )}
            </Form.Item>
            <Form.Item {...ItemLayout} label="教师名称" style={{ display: editPassWord ? 'none' : 'block' }}>
              {getFieldDecorator("username", {
                rules: [
                  {
                    required: !editPassWord,
                    message: '请输入教师姓名',
                  },
                ],
                initialValue: '',
              })(
                <Input type="text" maxLength={50} placeholder="请输入教师名称" style={{ width: '300px' }} />
              )}
            </Form.Item>
            <Form.Item {...ItemLayout} label="手机号码" style={{ display: editPassWord ? 'none' : 'block' }}>
              {getFieldDecorator("mobile", {
                getValueFromEvent: (event) => {
                  return event.target.value.replace(/\D/g, "")
                },
                rules: [
                  {
                    required: !editPassWord,
                    message: '请输入手机号码',
                  },
                ],
                initialValue: '',
              })(
                <Input type="text" maxLength={11} placeholder="请输入11位手机号码" style={{ width: '300px' }} />
              )}
            </Form.Item>
            <Form.Item {...ItemLayout} label="密码" style={{ display: editId ? 'none' : 'block' }}>
              {getFieldDecorator("password", {
                getValueFromEvent: (event) => {
                  return event.target.value.replace(/\D/g, "")
                },

                initialValue: '',
                rules: [
                  {
                    required: !!editPassWord,
                    message: '请输入密码',
                  },
                ],
              })(
                <Input type="text" maxLength={11} placeholder="请输入密码" style={{ width: '300px' }} />
              )}
              <div style={{ display: editPassWord ? 'none' : 'block' }}>不提供密码则使用默认密码：123456</div>
            </Form.Item>
          </Form>

        </Modal>
      </div>
    )
  }
}
export default Form.create({ name: 'register' })(Teacher);