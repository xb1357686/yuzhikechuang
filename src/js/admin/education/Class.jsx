import React from 'react';
import { Row, Col, Icon, Input, Button, Table, Tag, Modal, Upload, message } from 'antd';

import { getClass, addClass, editClass, deleteClass, exportStudent, importStudent, importStudentTempl } from '../../z_xu_api';

import AddModal from './classModal/addModal'

import moment from 'moment'

class Class extends React.Component {

  columns = [
    {
      title: '编号',
      dataIndex: 'gradeId',
      key: 'gradeId',
    },
    {
      title: '班级名称',
      dataIndex: 'gradeName',
      key: 'gradeName',
    },
    {
      title: '授权系列课',
      dataIndex: 'authorization',
      key: 'authorization',
      render: (text) => {
        return text && text.map((item) => {
          return <Tag>{item.name}</Tag>
        })
      }
    },
    {
      title: '学生人数',
      dataIndex: 'stuNumb',
      key: 'stuNumb',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text) => {
        return text && moment(text).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    {
      title: '操作',
      dataIndex: 'operat',
      key: 'operat',
      render: (text, record) => {
        return <div>
          <Button style={{ marginRight: 5 }} onClick={() => { this.setAddVisible(true, 'edit', record) }}><Icon type="edit" />编辑</Button>
          {/* <Button style={{marginRight: 5}}><Icon type="plus" />添加学生</Button>
                <Button style={{marginRight: 5}}><Icon type="plus" />批量添加</Button> */}
          <Upload beforeUpload={(file) => { this.beforeUpload(file, record); return false }} showUploadList={false}>
            <Button style={{ marginRight: 5 }}><Icon type="cloud-upload" />导入学生</Button>
          </Upload>
          <Button style={{ marginRight: 5 }} onClick={() => { this._exportStudent(record) }}><Icon type="cloud-download" />导出学生</Button>
        </div>
      }
    },
  ];

  beforeUpload = (file, record) => {
    let formData = new FormData();
    formData.append('gradeId', record.gradeId);
    formData.append('file', file);
    this._importStudent(formData);
  }

  state = {
    classList: null,
    gradeName: '',

    addVisible: false,
    addOperat: 'add',
    operatInfo: null,

    selectedRowKeys: [],
    deleteVisible: false,
  }

  componentDidMount () {
    this._getClass()
  }

  _getClass = () => {
    const { gradeName } = this.state;
    getClass({
      current: 1,
      size: 10000,
      gradeName
    }).then((res) => {
      this.setState({
        classList: res.data
      })
    })
  }

  search = () => {
    this._getClass();
  }

  onChange = (e) => {
    this.setState({
      gradeName: e.target.value
    })
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }

  setAddVisible = (visible = false, operat = 'add', operatInfo = null) => {
    this.setState({
      addVisible: visible,
      addOperat: operat,
      operatInfo: operatInfo
    })
  }

  deleteOk = () => {
    const { selectedRowKeys } = this.state;
    deleteClass && deleteClass({
      gradeIds: selectedRowKeys
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          deleteVisible: false,
          selectedRowKeys: []
        })
        message.success('删除成功！')
        this._getClass();
      }
    })
  }

  _exportStudent = (record, suffix = '.xlsx') => {
    exportStudent({
      userIds: record.userIds,
      gradeId: record.gradeId
    }).then(res => {
      var blob = res.data;
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = function (e) {
        var a = document.createElement('a');
        // 获取文件名fileName
        a.download = `导出学生.xls`;
        a.href = e.target.result;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    })
  }

  _importStudent = (formData) => {
    importStudent(formData).then(res => {
      const { data } = res;
      if (data.code !== 200) {
        message.error('导入失败');
      } else {
        message.success('导入成功');
        this._getClass();
      }
    })
  }

  getStudentTemplate = (suffix = '.xlsx') => {
    importStudentTempl().then(res => {
      var blob = res.data;
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = function (e) {
        var a = document.createElement('a');
        // 获取文件名fileName
        a.download = `学生导入模板.xls`;
        a.href = e.target.result;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    })
  }

  render () {
    const { classList,
      addVisible, addOperat, operatInfo,
      selectedRowKeys, deleteVisible
    } = this.state;
    const dataSource = [];
    classList && classList.rows && classList.rows.forEach(element => {
      dataSource.push({
        ...element,
        key: element.gradeId
      })
    });
    console.log(selectedRowKeys)
    return (
      <div className=''>
        <Row className=''>
          <Col span={4} style={{ marginRight: 10 }}> <Input placeholder='班级名称' onChange={this.onChange} /> </Col>
          {/* <Col span={4} style={{marginRight: 10}}> <Input placeholder='班级邀请码'/> </Col> */}
          <Col> <Button onClick={this.search}><Icon type="search" />搜索</Button> </Col>
        </Row>
        <div style={{ marginTop: 20 }}>
          <Button type="primary" style={{ marginRight: 10 }} onClick={() => { this.setAddVisible(true) }}><Icon type="plus" />添加班级</Button>
          <Button type="danger" disabled={selectedRowKeys.length === 0} style={{ marginRight: 10 }} onClick={() => { this.setState({ deleteVisible: true }) }}><Icon type="delete" /> 批量删除</Button>
          <Button style={{ marginRight: 10 }}><Icon type="upload" />导入班级</Button>

          <Button style={{ marginRight: 10, float: 'right' }} onClick={() => { this.getStudentTemplate() }}><Icon type="download" />下载学生导入模板</Button>
        </div>

        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: this.onSelectChange,
          }}
          dataSource={dataSource}
          columns={this.columns}
          style={{ marginTop: 20 }}
          pagination={{
            total: classList && classList.total,
            showTotal: (total) => `${total}条`,
            pageSize: 10,
            defaultCurrent: 1,
          }}
        // onChange={}
        />

        <AddModal visible={addVisible} operat={addOperat} operatInfo={operatInfo}
          setVisible={this.setAddVisible}
          getClass={this._getClass} addClass={addClass} editClass={editClass}
        />

        <Modal
          visible={deleteVisible}
          title='删除班级提示'
          destroyOnClose
          maskClosable={false}
          cancelText='取消'
          okText='确定'
          onCancel={() => { this.setState({ deleteVisible: false }) }}
          onOk={this.deleteOk}
        >
          <div>
            <Icon type="exclamation-circle" style={{ color: 'red', fontSize: 20, marginRight: 10, verticalAlign: 'middle' }} />
            <span style={{ verticalAlign: 'middle' }}>确定要删除选中数据么，删除后不可恢复？</span>
          </div>
        </Modal>
      </div>
    )
  }
}

export default Class