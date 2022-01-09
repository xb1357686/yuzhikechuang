import React from 'react';
import AxiosInstance from "../config/apirequest";
import Styles from '../../css/courses.module.css';
import { Row, Col, Drawer,message } from 'antd';
import $ from "jquery";
/* global layer*/
export default class LefeSide extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appData: '',
            drawerVisible: false,
        }
    }

    componentDidMount() {
        this.props.getToolsChild(this);  
    }
    //获取工具
    getTools = () => {
        AxiosInstance.get(`/tools`)
            .then(res => {
                if (res.data.code === 0 && res.data.tools) {        //返回码为0 则正确
                    this.setAppDOM(res.data.tools)
                    this.setState({
                        appData: res.data.tools
                    })
                }else {
                    message.error(res.data.message);
                }
            });
    }
    onClose = () => {
        var _this = this;
        _this.setState({
            chapterVisible: false,
        });
        setTimeout(() => {
            _this.setState({
                tier: -1,
            });
        }, 280);
    }

    //展开工具
    showTools = () => {
        const { appData } = this.state;
        if (!appData) {
            this.getTools();
        }
        this.setState({
            drawerVisible: true,
        });
    };
    onCloseTools = () => {
        this.setState({
            drawerVisible: false,
        });
    };

    //工具列表
    setAppDOM = (AppData) => {
        if (AppData.length === 0) return;
        let dataArr = [], dataAllArr = [];
        let url = window.location.origin + '/';
        for (let i = 0; i < AppData.length; i++) {
            const element = AppData[i].tools;
            element.map((data) => {
                dataAllArr.push(data);
                dataArr.push(
                    <Col
                        md={{ span: 10 }}
                        key={data.id}
                        xs={{ span: 10, offset: 2 }}
                        onClick={this.openAppIframe.bind(this)}
                        data-id={data.id}
                        className={Styles.Appcard}
                        style={{ paddingTop: '10px' }}
                    >
                        <div>
                            <img style={{ width: '80%' }} src={url + data.icon} alt="软件LOGO" />
                        </div>
                    </Col>

                )
                return data;
            });
        }
        this.setState({
            dataArr,
            dataAllArr
        })
    }


    //打开工具
    openAppIframe = (e) => {
        const { dataAllArr } = this.state;
        let url = window.location.origin + '/';
        let id = e.currentTarget.getAttribute('data-id');
        let data = dataAllArr.find(item => {
            return item.id === id;
        })
        var layerIndex = layer.open({
            type: 2,
            title: " ",
            area: ['100%', '100%'],
            anim: 2,
            shade: false,
            shadeClose: false,
            maxmin: true, //开启最大化最小化按钮
            content: url + data.relpath, //iframe的url，no代表不显示滚动条
            success: (layero, index) => {
                console.log(111)
                $('iframe').focus();
                layer.setTop(layero);
            },
            restore: (dom) => {
                $(dom[0]).css('top', '0');
                $(dom[0]).find('iframe').focus();
            }
        });
        this.setState({ layerIndex, drawerVisible: false })
    }

    render() {
        const { dataArr } = this.state;
        return (
                <Drawer
                    title="工具列表"
                    placement='left'
                    mask={false}
                    onClose={this.onCloseTools}
                    completeText='提交'
                    visible={this.state.drawerVisible}
                >
                    <Row> {dataArr}</Row>
                </Drawer>
        );
    }
}
