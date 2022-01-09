import React from 'react';
import axios from './config/apirequest';
import {feedUrl} from './config/baseUrl.js'; 
import {
    Form, Modal, Button, Upload, Icon, Input, message
} from 'antd';
const FormItem = Form.Item;

export default class FeedModal extends React.Component {
    constructor(props) {
        super(props);
        this.state={};
    }

    beforeUpload = (file,e) => {
        console.log('111')
        console.log(file)
        return false;
    }
    handleSubmit = (e) => {
        var _this = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            console.log(values.images.originFileObj)
            if (err) {
                return;
            }
            if (values.desc === undefined) {
                message.error('问题反馈内容不能为空');
            }

            let fd = new FormData()
            fd.append('desc', values.desc)
            if (values.images !== undefined) {
                for (const k in values.images) {
                    fd.append('images', values.images[k].originFileObj)
                }
            } else {
                fd.append('images', {})
            }
            fd.append('mobile', values.mobile)

            axios.post(feedUrl + 'api/feedback', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(function (response) {
                if (response.data.code === 0) {
                    message.success('问题反馈成功');
                    _this.props.cancelFeedModal();
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
        const isPic = isJPG || isPNG;
        if (!isPic) {
            Modal.error({
                title: '上传失败',
                content: '只能上传jpg、png格式图片'
            });
            console.log(e.fileList);
            return e.fileList.filter((fileItem) => e.file.uid !== fileItem.uid);
        } else {
            if (Array.isArray(e)) {
                return e;
            }
            return e && e.fileList;
        }
    }
    render() {
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
                    offset: 10,
                },
            },
        }
        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem className="ant-form-item"
                    {...formItemLayout}
                    label="意见反馈："
                >
                    {getFieldDecorator('desc', {
                        rules: [
                            {
                                required: true, message: '请输入您的意见反馈内容!',
                            }],
                    })(
                        <div className="col-14">
                            <textarea className="ant-input" id="control-textarea" ></textarea>
                        </div>)}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="选择截图"
                >
                    {getFieldDecorator('images', {
                        valuePropName: 'fileList',
                        getValueFromEvent: this.normFile,
                    })(<Upload beforeUpload={this.beforeUpload}>
                        <Button>
                            <Icon type="upload" />上传图片
                    </Button>
                    </Upload>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="手机号码"
                >
                    {getFieldDecorator(`mobile`, {
                        rules: [{
                            pattern: /^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/,
                            message: '手机号码格式错误！',
                        }],
                    })(
                        <Input placeholder="（选填）" maxLength="11" />,
                    )}

                </FormItem>
                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">提交问题</Button>
                </FormItem>
            </Form>
        );
    }
}
