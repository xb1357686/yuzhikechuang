import React from 'react';
import axiosInstance from "../config/apirequest"
import {
    Form, Modal, Button, Upload, Icon, Input, message
} from 'antd';
const FormItem = Form.Item;

export default class uploadProduction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    state = {
        previewVisible:false,
        loading: false,
        previewImage: '',
        imgPic:''
    };
 
    handleSubmit = (e) => {
        const {imgPic } = this.state;
        var _this = this
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            let fd = new FormData()
            fd.append('name', values.name)
            fd.append('description', values.description)
            fd.append('picture', imgPic)
            fd.append('stlData', values.stlData[0].originFileObj)
            fd.append('Z1Data', values.Z1Data[0].originFileObj)
            fd.append('types', '3done')
            fd.append('category','立体建模')
            axiosInstance({
                method: 'post',
                url: 'works/3d-one/',
                data: fd,

            }).then(function (response) {
                if (response.data.code === 0) {
                    message.success('作品提交成功');
                    _this.props.closeUpload();
                }
            }).catch(function (error) {
                console.log(error);
            });
        })
    };
    normFile = (e) => {
        // 检查图片类型
        // 只能上传三种图片格式
        const isJPG = e.file.type === 'image/jpeg';
        const isPNG = e.file.type === 'image/png';
        const isLt1M = e.file.size / 1024 / 1024 < 1;
        const isPic = isJPG || isPNG ;
        if (!isPic) {
            Modal.error({
                title: '上传失败',
                content: '只能上传jpg、png格式图片'
            });
            return e.fileList.filter((fileItem) => e.file.uid !== fileItem.uid);
        } else if(!isLt1M){
            Modal.error({
                title: '上传失败',
                content: '图片最大为1M'
            });
            return e.fileList.filter((fileItem) => e.file.uid !== fileItem.uid);
        }else {
            if (Array.isArray(e)) {
                return e;
            }
            return e && e.fileList;
        }
    }
    stlFile = (e) => {
        // 检查文件类型(stl)
        const isSTL = e.file.name.substring(e.file.name.lastIndexOf(".")).toLowerCase()
        if (isSTL !== '.stl') {
            Modal.error({
                title: '上传失败',
                content: '只能上传stl格式文件'
            });
            return e.fileList.filter((fileItem) => e.file.uid !== fileItem.uid);
        } else {
            if (Array.isArray(e)) {
                return e;
            }
            return e && e.fileList;
        }
    }

    sourceFile = (e) => {
        // 检查文件类型(Z1)
        const isZ1 = e.file.name.substring(e.file.name.lastIndexOf(".")).toLowerCase()
        if ( isZ1 !== '.z1') {
            Modal.error({
                title: '上传失败',
                content: '只能上传Z1格式文件'
            });
            return e.fileList.filter((fileItem) => e.file.uid !== fileItem.uid);
        } else {
            if (Array.isArray(e)) {
                return e;
            }
            return e && e.fileList;
        }
    }

    beforeUpload = (file) => {
        return false;
    }
    beforeUploadImg= (file,e) => {
        this.setState({
            imgPic:''
            })
        var finalImg = '', _this = this
            const reader = new FileReader();
            reader.readAsDataURL(file)
            reader.onload = function (e) { 
            finalImg = this.result; 
            _this.setState({
                imgPic:finalImg
                })
            }
        return false;
    }
    handlePreview = (file) => {
        this.setState({
          previewImage: file.url || file.thumbUrl,
        });
      }
    render() {
        const {imgPic } = this.state;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 6,
                },
            },
        }
        const uploadButton = (
            <div>
              <Icon type="plus" />
              <div className="ant-upload-text">Upload</div>
            </div>
          );
        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="作品名称："
                >
                    {getFieldDecorator('name', {
                        rules: [{
                            message: "作品名称必填!",
                            required: true
                        }],
                    })(
                        <div className="col-14">
                            <Input />
                        </div>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="作品简介："
                >
                    {getFieldDecorator('description', {
                        rules: [{
                            message: "作品简介必填!",
                            required: true
                        }],
                    })(
                        <div className="col-14">
                            <textarea className="ant-input" id="control-textarea" maxLength={150}></textarea>
                        </div>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="封面图片"
                >
                    {getFieldDecorator('picture', {
                        rules: [{
                            message: "封面图片必填!只能为png或jpg，且小于1M",
                            required: true
                        }],
                        valuePropName: 'fileList',
                        getValueFromEvent: this.normFile,
                    })(<Upload
                        listType="picture-card"
                        beforeUpload={this.beforeUploadImg}
                        showUploadList={false}
                        onPreview={this.handlePreview}
                    >
                    { imgPic === undefined ?uploadButton : <img src={imgPic} style={{ width: '100%' }} alt="avatar"/>  }
                    </Upload>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="上传STL文件"
                >
                    {getFieldDecorator('stlData', {
                        rules: [{
                            message: "STL文件必填!",
                            required: true
                        }],
                        valuePropName: 'fileList',
                        getValueFromEvent: this.stlFile,
                    })(<Upload beforeUpload={this.beforeUpload}>
                        <Button>
                            <Icon type="upload" />上传STL文件
                    </Button>
                    </Upload>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="上传源文件"
                >
                    {getFieldDecorator('Z1Data', {
                        rules: [{
                            message: "源文件必填!",
                            required: true
                        }],
                        valuePropName: 'fileList',
                        getValueFromEvent: this.sourceFile,
                    })(<Upload beforeUpload={this.beforeUpload}>
                        <Button>
                            <Icon type="upload" />上传源文件
                    </Button>
                    </Upload>
                    )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">提交作品</Button>
                </FormItem>
            </Form>
        );
    }
}
