import React from 'react';
import {  Input, Modal, Form , message } from 'antd';

const FormItem = Form.Item;

class AddModal extends React.Component{

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
          if (!err) {
            const {operat} = this.props;
            if(operat==='add') {
                this._addClass(values);
            }else if(operat==='edit') {
                this._editClass(values);
            }
          }
        });
    };

    _addClass = (values)=> {
        const {addClass, getClass} = this.props;
        addClass && addClass({
            ...values
        }).then(res=> {
            if(res.data.code === 200){
                message.success('添加成功！')
                getClass && getClass();
                this.onCancel()
            }
            
        })
    }

    _editClass = (values)=> {
        const {editClass, getClass, operatInfo} = this.props;
        editClass && editClass({
            ...values,
            gradeId: operatInfo && operatInfo.gradeId
        }).then(res=> {
            if(res.data.code === 200){
                message.success('编辑成功！')
                getClass && getClass();
                this.onCancel()
            }
        })
    }

    onCancel = ()=> {
        const {setVisible} = this.props;
        setVisible && setVisible();
    }

    render(){
        const {visible, operat, operatInfo, form: {getFieldDecorator}} = this.props;
        let title = '';
        switch (operat) {
            case 'add':
                title='添加班级';
                break;
            case 'edit':
                title='编辑班级';
                break;
            default:
                break;
        }

        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 4 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 20 },
            },
        };
        return(
            <Modal
                visible={visible}
                title={title}
                destroyOnClose
                maskClosable={false}
                cancelText='取消'
                okText='确定'
                onCancel={this.onCancel}
                onOk={this.handleSubmit}
            >
                <Form >
                    <Form.Item label="班级名称" {...formItemLayout}>
                        {getFieldDecorator('gradeName', {
                            rules: [{
                                required: true,
                                message: '请输入班级!',
                            }],
                            initialValue: operatInfo && operatInfo.gradeName
                        })(<Input />)}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create({ name: 'AddModal' })(AddModal)