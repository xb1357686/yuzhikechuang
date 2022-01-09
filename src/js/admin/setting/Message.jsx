import React from 'react';
import BasicLayout from '../layouts/BasicLayout';
import { message, Table, Button, Input, Modal, Icon, Divider, Select, Popconfirm, Radio, Row, Col, Tabs, Upload, Form } from 'antd';
import { getSchool, putSchool, getParent, rgetegion } from '../../z_xu_api';

const apiUrl = 'http://122.51.68.117:8555'

class Message extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "0": [],
      "1": [],
      "2": [],
      imgUrl: null,
      data: {},
    }
  }

  componentDidMount = () => {
    this.getSchool();
    this.getParent(1, "0");
  }

  // 获取省
  getParent = (code, type) => {
    getParent(code).then(res => {
      if (res && res.data.code === 200 && res.status === 200) {
        this.setState({
          [type]: res.data.data
        })
      }
    })
  }

  handleSelect = (e, type) => {
    const code = e.key;
    const { form } = this.props;
    if (type === '1') {
      this.getParent(code, type)
      form.resetFields('districtId');
      form.resetFields('cityId');
      this.setState({
        '1': [],
        '2': [],
      })
    } else if (type === '2') {
      this.getParent(code, type)
      form.resetFields('cityId');
      this.setState({
        '2': [],
      })
    }
  }

  // 获取列表
  getSchool = () => {
    const { form } = this.props;
    getSchool().then(res => {
      if (res && res.data.code === 200 && res.status === 200) {
        const values = res.data.data;
        form.setFieldsValue({
          schoolName: values.schoolName,
          schoolLogo: values.schoolLogo,
          schoolSite: values.schoolSite,
        })
        this.getParent(values.provinceId, '1');
        this.getParent(values.cityId, '2');
        setTimeout(() => {
          form.setFieldsValue({
            provinceId: { key: values.provinceId, label: values.provinceName },
            districtId: { key: values.districtId, label: values.districtName },
            cityId: { key: values.cityId, label: values.cityName },
          })
        }, 1000)
        this.setState({
          data: res.data.data,
          imgUrl: values.schoolLogo
        })
      }
    })
  }

  // 添加信息
  addMessage = () => {
    const { form } = this.props;
    const { imgUrl, data } = this.state;
    form.validateFields((error, values) => {
      if (!error) {
        const obj = {
          schoolName: values.schoolName,
          schoolLogo: imgUrl || null,
          provinceId: values.provinceId.key,
          provinceName: values.provinceId.label,
          districtId: values.districtId.key,
          districtName: values.districtId.label,
          cityId: values.cityId.key,
          cityName: values.cityId.label,
          schoolSite: values.schoolSite,
          schoolId: data.schoolId,
        }

        putSchool(obj).then(res => {
          if (res && res.data.code === 200 && res.status === 200) {
            message.success('保存成功');
          }
        })
      }
    })
  }

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

  // 更改图片
  handleChange = info => {
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
            this.props.form.setFieldsValue({ 'schoolLogo': imgUrl });
            this.setState({
              imgUrl,
              loading: false,
            });
            return;

          }
        }
      } else {
        message.error(`温馨提示: ${res.message}`);
      }
    }
  };


  render () {
    const { imgUrl } = this.state;
    const { form: { getFieldDecorator } } = this.props;
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
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">图片上传</div>
      </div>
    );

    const ItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };

    console.log(this.state);
    return (
      <div>


        <Form>
          <Form.Item {...ItemLayout} label="机构名称">
            {getFieldDecorator("schoolName", {
              rules: [
                {
                  required: true,
                  message: '请输入机构名称',
                },
              ],
              initialValue: '',
            })(
              <Input type="text" maxLength={50} placeholder="请输入机构名称" style={{ width: '300px' }} />
            )}
          </Form.Item>
          <Form.Item {...ItemLayout} label="机构端logo">
            {getFieldDecorator('schoolLogo', {
              initialValue: '',
            })(
              <Upload
                {...uploadProps}
              >
                {imgUrl ? <img style={{ width: '50px', heihgt: '50px' }} src={imgUrl} alt="logo" /> : uploadButton}
              </Upload>
            )}
          </Form.Item>
          <Form.Item {...ItemLayout} label='省份城市'>
            <Form.Item style={{ display: 'inline-block' }} >
              {this.props.form.getFieldDecorator('provinceId', {

              })(
                <Select placeholder="选择省" style={{ minWidth: 152 }} labelInValue onChange={(e) => {
                  this.handleSelect(e, '1');
                }}>
                  {this.state["0"].map((item, index) => {
                    return (
                      <Select.Option key={index} value={item.areaCode} >
                        {item.regionName}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>

            <Form.Item style={{ display: 'inline-block', marginLeft: '10px' }}>
              {this.props.form.getFieldDecorator('districtId', {

              })(
                <Select placeholder="选择市" style={{ minWidth: 152 }} labelInValue onChange={(e) => {
                  this.handleSelect(e, '2');
                }}>
                  {this.state["1"].map((item, index) => {
                    return (
                      <Select.Option key={index} value={item.areaCode}>
                        {item.regionName}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
            <Form.Item style={{ display: 'inline-block', marginLeft: '10px' }}>
              {this.props.form.getFieldDecorator('cityId', {

              })(
                <Select placeholder="选择区" style={{ minWidth: 152 }} labelInValue onChange={(e) => {
                  this.handleSelect(e, 2);
                }}>
                  {this.state["2"].map((item, index) => {
                    return (
                      <Select.Option key={index} value={item.areaCode}>
                        {item.regionName}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          </Form.Item>
          <Form.Item {...ItemLayout} label="详细地址">
            {getFieldDecorator("schoolSite", {

            })(
              <Input type="text" maxLength={11} placeholder="请输入详细地址" style={{ width: '300px' }} />
            )}
          </Form.Item>
        </Form>
        <div style={{ marginBottom: '20px' }}>
          <Button style={{ margin: '2px 50px' }} type="primary" onClick={this.addMessage} >  保存 </Button>
        </div>
      </div>

    )
  }
}
export default Form.create({ name: 'register' })(Message);