import React from 'react';
import Styles from '../../css/space.module.css';
import { Row, Col, Card, Icon, Tooltip, Modal, message, Button, Form, LocaleProvider, Switch } from 'antd';
import AxiosInstance from "../config/apirequest";
import { connect } from 'react-redux';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import $ from "jquery";
import uploadProduction from '../personalCenter/uploadProduction.jsx';
const UploadProduction = Form.create()(uploadProduction);
const QRCode = require('qrcode.react');

/* global layer*/
const { Meta } = Card;
class production extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            product: [],
            visible: false,
            delData: '',
            initLoading: true,
            loading: false,
            pageNum: 1,
            shareVisible: false,
            shareId: '',
            sharePhone: false,
            uploadVisible: false,
            editChecked: true
        }
    }

    componentWillMount = () => {
        this.getProduction(1);
        this.props.getProductThis(this)
        window.isLogin = this.isLogin;
    }
    //获取作品
    getProduction = (num) => {
        var { product } = this.state, _this = this;;
        var arr = [...product];
        let userInfo = JSON.parse(localStorage.getItem("userInfo"));
        AxiosInstance({
            method: 'get',
            url: `/works/user/${userInfo.id}/${num}/12`
        }).then(res => {
            if (res.data.code === 0 && res.data.works) {
                arr = arr.concat(res.data.works);
                _this.setState({
                    product: arr,
                    pageNum: num
                })
                if (res.data.works.length === 12) {
                    _this.setState({
                        initLoading: false,
                        loading: false,
                    })
                }
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }
    onLoadMore = () => {
        var { pageNum } = this.state;
        var num = pageNum + 1;
        this.setState({
            loading: true,
        });
        this.getProduction(num);
    }
    isLogin = () => {
        return localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : '';
    }
    goApptools = (data,e) => {
        console.log(data)
        e.stopPropagation()
        if(data.types === '3done'){
            message.warning('请点击预览，下载源文件，并使用3D-one工具自行打开。');
        }else{
        let url = window.location.origin + '/';
        layer.open({
            type: 2,
            title: " ",
            area: ['100%', '100%'],
            anim: 2,
            shade: false,
            shadeClose: false,
            move: false,
            maxmin: true, //开启最大化最小化按钮
            content: `${url}${data.toolURL}?dataID=${data.id}`, //iframe的url，no代表不显示滚动条
            success: () => {

                $('iframe').focus();
            },
            restore: (dom) => {
                $(dom[0]).css('top', '0');
                $(dom[0]).find('iframe').focus();
            },
            cancel: function (index, layero) {
                layer.confirm('真的要离开了吗？', { icon: 3, title: '提示' }, function (i) {
                    //do something
                    layer.close(index);
                    layer.close(i);
                });
                return false
            }

        });
        }
    }
    productDel = () => {
        let { delData } = this.state;
        this.setState({
            confirmLoading: true,
        });
        let _this = this;
        AxiosInstance({
            method: 'delete',
            url: `/works?id=${delData.id}`
        }).then(res => {
            if (res.data.code === 0) {        //返回码为0 则正确
                _this.state.product.splice(delData.index, 1);
                message.success('删除成功！！');
                _this.setState({
                    product: _this.state.product,
                    visible: false,
                });
            } else {
                message.error(res.data.message);
                _this.setState({
                    visible: false,
                });
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }
    showModal = (delData) => {
        this.setState({
            visible: true,
            delData
        });
    }
    handleCancel = () => {
        this.setState({
            visible: false,
        });
    }
    goPreview = (id) => {
        this.props.history.push({ pathname: `/community/applyStl/${id}` })
    }
    porductShare = (id, e) => {
        e.stopPropagation()
        this.setState({ shareVisible: true, shareId: id })
    }
    porductShareWechat = (id, e) => {
        e.stopPropagation()
        this.setState({ sharePhone: true, shareId: id })
    }
    hideModal = () => {
        this.setState({ sharePhone: false })
    }
    closeShare = () => {
        this.setState({ shareVisible: false })
    }
    porductShareNow = () => {
        const { shareId, editChecked } = this.state, _this = this;
        console.log('接口：' + editChecked)
        AxiosInstance({
            method: 'PUT',
            url: `/works/share`,
            data: { id: shareId, public: true, edit: editChecked }
        }).then(res => {

            if (res.data.code === 0) {
                message.success('作品分享成功！！');
                _this.setState({
                    shareVisible: false
                })
            }else {
                message.error(res.data.message);
            }
        })
    }
    goApp = () => {
        this.props.history.push({ pathname: `/apptools` })
    }

    goUpload = () => {
        this.setState({
            uploadVisible: true,
        });
    }
    closeUpload = () => {
        this.setState({
            uploadVisible: false,
        });
    }
    onEditChange = (checked) => {
        console.log('选择：' + checked)
        this.setState({
            editChecked: checked
        })
    }
    render() {
        var usersElements = [];
        const { visible, product, initLoading, loading, shareVisible, sharePhone, shareId, uploadVisible } = this.state;
        if (product.length === 0) {
            usersElements = <Col>
                <div key={404} style={{ height: '548px', textAlign: 'center' }} >
                    <img className={Styles.notFoundImg} alt="404" src='./images/noProduction.png' />
                    <Button className={Styles.turnApp} onClick={() => this.goApp()}>我来创作分享一个</Button>
                </div>
            </Col>
        } else {
            usersElements = [];
        }
        var i = 0;
        for (let data of product) {
            usersElements.push( // 循环每个用户，构建 JSX，push 到数组中
                <Col span={4} key={data.id} style={{ marginBottom: "25px", position: 'relative' }} >
                    <Card
                        actions={[
                            <Tooltip placement="top" title='分享作品'>
                                <div onClick={this.porductShare.bind(this, data.id)}><Icon type="share-alt" theme="outlined" /></div>
                            </Tooltip>,
                            <Tooltip placement="top" title='编辑作品'>
                                <div onClick={this.goApptools.bind(this,data)}><Icon type="edit" theme="outlined" /></div>
                            </Tooltip>,
                            <Tooltip placement="top" title='二维码分享'>
                                <div onClick={this.porductShareWechat.bind(this, data.id)}><Icon type="wechat" theme="outlined" /></div>
                            </Tooltip>,
                        ]}
                        hoverable
                        cover={<div style={{ height: '134px' }}><img style={{ height: '100%', width: '100%' }} alt="example" src={data.picture} /></div>}
                        onClick={() => { this.goPreview(data.id) }}
                    >
                        <Meta
                            style={{ textAlign: 'center' }}
                            description={data.name.length > 9 ? data.name.slice(0, 8) + '···' : data.name}
                        />
                    </Card>
                    <Tooltip placement="top" title='删除作品'>
                        <Icon type="delete" className={Styles.closeBtn} onClick={this.showModal.bind(null, { id: data.id, index: i })} />
                    </Tooltip>
                </Col>
            )
            i++
        }
        const loadMore = !initLoading && !loading ? (
            <div style={{ textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px' }}>
                <Button onClick={this.onLoadMore}>加载更多</Button>
            </div>
        ) : null;
        return (
            <LocaleProvider locale={zhCN}>
                <div>
                    <div style={{ fontSize: '22px', marginBottom: '20px' }}><img src='./images/meCourses.png' alt='作品' /> 我的作品
                    <Button onClick={() => this.goUpload()} style={{ marginLeft: '20px' }} type="primary" ><Icon type="upload" style={{ fontSize: '17px' }} />上传作品</Button>
                    </div>
                    <Row gutter={16} style={{ minHeight: "500px" }}>
                        {usersElements}
                        <Modal title="删除作品"
                            visible={visible}
                            cancelText='取消'
                            okText='确定'
                            onOk={this.productDel}
                            onCancel={this.handleCancel}
                        >
                            <p style={{ color: '#f14242' }}>确定要删除该作品吗？</p>
                        </Modal>
                    </Row>
                    {loadMore}
                    <Modal title="分享至社区"
                        visible={shareVisible}
                        cancelText='取消'
                        okText='确定'
                        onOk={this.porductShareNow}
                        onCancel={this.closeShare}
                    >
                        <p>确定将作品分享至社区吗？</p>
                        <div><span>是否允许他人克隆作品并编辑：</span><Switch defaultChecked onChange={this.onEditChange} /></div>
                    </Modal>
                    <Modal
                        title="作品分享"
                        visible={sharePhone}
                        onCancel={this.hideModal}
                        footer={null}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <QRCode value={`${window.location.origin}#/community/applyStl/${shareId}`} size={200} />
                            <h4 style={{ padding: '10px' }}>请使用手机扫描二维码查看并分享</h4>
                        </div>
                    </Modal>
                    <Modal
                        width='50%'
                        title="作品上传"
                        visible={uploadVisible}
                        onCancel={this.closeUpload}
                        footer={null}
                    >
                        <UploadProduction {...this.props} closeUpload={this.closeUpload} />
                    </Modal>
                </div>
            </LocaleProvider>
        );
    }
}
export default connect()(production);