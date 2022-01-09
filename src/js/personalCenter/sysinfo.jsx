import React from 'react';
import { Pie, Bar } from 'ant-design-pro/lib/Charts';
import 'ant-design-pro/dist/ant-design-pro.css'; // Import whole style
import Styles from '../../css/space.module.css';
import { wsUrl } from '../config/baseUrl.js';
import { Row, Col, Icon, Button, Divider, Modal, Spin, Progress, message, Checkbox,Select} from 'antd';
import axiosInstance from "../config/apirequest";
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
const Option = Select.Option;
export default class SysinfoSpace extends React.Component {

    state = {
        diskInfo: "",
        memory: "",
        diskdata: [
            { x: '已用', y: 40 },
            { x: '未用', y: 60 }
        ],
        memorydata: [
            { x: '已用', y: 40 },
            { x: '未用', y: 60 }
        ],
        account: "",
        ModalText: '',
        visible: false,
        modalBtn: [],
        progressNum: 0,
        progressStyle: 'none',
        confirmLoading: false,
        loading: false,
        loading2: true,
        rebootLoading: false,
        upgradeData: '',   //更新的数据
        allShow: '',
        checkedValues: '', //选择需要更新的数据
        barChart:[]
    }

    componentWillMount = () => {
        this.getSysInfo();
        this.handleChange('1');
    }
    handleChange = (value) => {
        let  timeZone;  let _this = this;
        if(value === '1'){
            timeZone = 6
        }else{
            timeZone = 12
        }
        let data = new Date();
        let nowYear = data.getFullYear()
        let nowMonth  = data.getMonth() + 1
        let year ;
        let month ;
        data.setMonth(data.getMonth()+1, 1)//获取到当前月份,设置月份
        for (let i = 0; i < timeZone; i++) {
            data.setMonth(data.getMonth() - 1);//每次循环一次 月份值减1
            let m = data.getMonth() + 1;
            if( i === timeZone -1 ){
                 year  = data.getFullYear()
                 month = m
            }
        }
        axiosInstance({
            method: 'get',
            url: `/admin/user/liveness/${year}/${month}/${nowYear}/${nowMonth}`
        }).then(function (response) {
            _this.setState({
                loading2: false,
                barChart: response.data,
            })
               
        })
      }
    /* 获取系统信息 */
    getSysInfo = (rebootOk = () => {}) => {
        let _this = this;
        axiosInstance({
            method: 'get',
            url: '/admin/system/info'
        }).then(function (response) {
            if (response.data.code === 0) {
                _this.setState({
                    diskInfo: response.data.disk,
                    memory: response.data.memory,
                    diskdata: [
                        { x: '已用' + response.data.disk.used, y: parseFloat(response.data.disk.usedPercent) },
                        { x: '未用' + response.data.disk.free, y: 100 - Number(parseFloat(response.data.disk.usedPercent)) }
                    ],
                    memorydata: [
                        { x: '已用' + response.data.memory.used, y: parseFloat(response.data.memory.usedPercent) },
                        { x: '未用' + response.data.memory.free, y: 100 - Number(parseFloat(response.data.memory.usedPercent)) }
                    ]
                })
            } else {
                _this.setState({
                    diskInfo: '',
                    memory: ''
                })
            }
           _this.getProductInfo();
           _this.getNewVersion();
            if(typeof rebootOk === 'function'){
                rebootOk();
            }
        })
            .catch(function (error) {
                console.log(error)
                if (!error.response) {
               _this.getSysInfo();
                }
            });

    }
    /* 获取产品信息 */
    getProductInfo = (rebootOk) => {
        let _this = this;
        axiosInstance({
            method: 'get',
            url: '/admin/system/account'
        }).then(function (response) {
            if (response.data.code === 0) {
                _this.setState({
                    account: response.data.account,
                });
            } else {
                _this.setState({
                    account: ""
                })
            }
            if (rebootOk) {
                rebootOk()
            }
        })
            .catch(function (error) {
                console.log(error);

            });
    }

    sortingData = () =>{
        axiosInstance({
            method: 'get',
            url: `/admin/user/liveness`
        }).then(function (response) {
            if (response.data.code === 0) {
                console.log('数据更新成功')
                }
            })
    }

    onChange = (checkedValues) => {
        this.setState({ checkedValues })
    }
    //查看是否有新版本更新
    getNewVersion = () => {
        let _this = this, arr = [], checkedValues = [];
        axiosInstance({
            method: 'get',
            url: '/admin/system/upgrade/check'
        }).then(function (response) {
            if (response.data.code === 0 && (response.data.courses || response.data.system || response.data.tools)) {
                if (response.data.courses) {
                    arr.push(<Col key='2' span={8}><Checkbox value="courses">课程更新</Checkbox> <a onClick={_this.showData.bind(null, 'courses')}>详情</a></Col>)
                    checkedValues.push('courses')
                }
                if (response.data.tools) {
                    arr.push(<Col key='3' span={8}><Checkbox value="tools">工具更新</Checkbox> <a onClick={_this.showData.bind(null, 'tools')}>详情</a></Col>)
                    checkedValues.push('tools')
                }
                if (response.data.system) {
                    arr.push(<Col key='1' span={8}><Checkbox value="system">系统升级</Checkbox> <a onClick={_this.showData.bind(null, 'system')}>详情</a></Col>)
                    checkedValues.push('system')
                }
                let group = <Checkbox.Group style={{ width: '100%' }} onChange={_this.onChange} defaultValue={checkedValues}>
                    <p>发现有的更新,是否立即升级？</p>
                    <Row>
                        {arr}
                    </Row>
                </Checkbox.Group>
                _this.setState({
                    ModalText: group,
                    allShow: group,
                    checkedValues,
                    visible: true,
                    upgradeData: response.data,
                    modalBtn: [
                        <Button key="ok" onClick={_this.handleCancel}>取消</Button>,
                        <Button key="back" type="primary" onClick={_this.handleOk}>确定</Button>,
                    ]
                });
            } else {
                // message.error(response.message);
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }
    showData = (data) => {
        const { upgradeData } = this.state;
        let showData;

        if (data === 'courses') {
            showData = <div>
                <p>新增课程升级：</p>
                {upgradeData[data].map((e, i) => { return <p key={i}>{i + 1}. {e.name} v{e.version}</p> })}
            </div>
        }
        if (data === 'tools') {
            showData = <div>
                <p>新增工具升级：</p>
                {upgradeData[data].map((e, i) => { return <p key={i}>{i + 1}. {e.title} v{e.version}</p> })}
            </div>
        }
        if (data === 'system') {
            showData = <div>
                <h2>新功能</h2>
                <p>版本： v{upgradeData[data].version} 本次更新信息如下:</p>
                <p>{upgradeData[data].changelog}</p>
            </div>
        }
        this.setState({
            ModalText: showData,
            modalBtn: [
                <Button key="callback" onClick={this.moduleCallback}>返回</Button>,
            ]
        })
    }
    //返回按钮
    moduleCallback = () => {
        const { allShow } = this.state;
        this.setState({
            ModalText: allShow,
            modalBtn: [
                <Button key="ok" onClick={this.handleCancel}>取消</Button>,
                <Button key="back" type="primary" onClick={this.handleOk}>确定</Button>,
            ]
        })
    }
    transitionTime = (time) => {
        return new Date(time).Format("yyyy-MM-dd")
    }
    handleCancel = () => {
        this.setState({
            visible: false,
            progressNum: 0,
            progressStyle: 'none'
        });
    }
    handleOk = () => {
        //下载API 
        const API = {
            courses: 'api/courses/upgrade/launch',
            tools: 'api/tools/upgrade/launch',
            system: 'api/admin/system/upgrade/launch'
        }
        const { checkedValues } = this.state;

        let length = checkedValues.length, i = 0;
        if (i === length) {
            message.error('请选择需要更新的内容!');
            return;
        }

        //将系统升级放在最后
        if (checkedValues.length > 1) {
            checkedValues.map((e, i) => {
                if (e === 'system') {
                    let sys = checkedValues.splice(i, 1);
                    checkedValues.push(sys[0]);
                    return false;
                }
                return e;
            });
        }
        //下载
        let gradeDom = <div style={{ paddingBottom: '16px' }}><Spin indicator={antIcon} style={{ marginRight: '10px' }} /> <span>正在下载资源中，请勿关闭电脑~</span></div>
        this.setState({
            ModalText: gradeDom,
            modalBtn: null,
            progressStyle: 'block'
        });
        this.websockProgress(API, checkedValues, i, length);
    }
    websockProgress = (API, value, i, length) => {
        let _this = this;
        let websocket = new WebSocket(`${wsUrl}${API[value[i]]}`);
        websocket.onopen = function (evt) {
            websocket.send('launch');
        };
        websocket.onerror = (err) => {
            console.log(err);
        }
        websocket.onmessage = function (evt) {
            let data = JSON.parse(evt.data);
            if (data.code !== 0) {
                message.error(data.message);
                _this.setState({
                    ModalText: <div>
                        <div style={{ paddingBottom: '16px' }}><span>{data.message} 请点击刷新按钮重试！</span></div>
                    </div>,
                    progressStyle: 'none',
                    modalBtn: [
                        <Button key="ok" type="primary" onClick={_this.handleCancel}>关闭</Button>,
                    ]
                });
                return;
            }
            if (data.state.stage === 1) {
                _this.setState({
                    progressNum: data.state.progress,
                    ModalText: <div >
                        <div style={{ paddingBottom: '16px' }}><Spin indicator={antIcon} style={{ marginRight: '10px' }} /> <span>正在更新资源中，请勿关闭电脑~</span></div>
                        <div>下载{data.state.name}</div>
                    </div>
                })
            };
            if (data.state.stage === 2) {
                _this.setState({
                    progressNum: data.state.progress,
                    ModalText: <div >
                        <div style={{ paddingBottom: '16px' }}><Spin indicator={antIcon} style={{ marginRight: '10px' }} /> <span>正在更新资源中，请勿关闭电脑~</span></div>
                        <div>解压安装{data.state.name}</div>
                    </div>
                })
            };
            if (data.state.stage === 3) {
                i++;
                if (i === length) {
                    if (value[i - 1] === 'system') {
                        _this.setState({
                            ModalText: <div>
                                <div style={{ paddingBottom: '16px' }}><span>解压完成，重启服务后生效，是否立即重启？</span></div>
                                <div>安装完成</div>
                            </div>,
                            modalBtn: [
                                <Button key="ok" onClick={_this.handleCancel}>取消</Button>,
                                <Button key="back" type="primary" onClick={_this.reboot}>立即重启</Button>,
                            ]
                        });
                    } else {
                        _this.setState({
                            ModalText: <div>
                                <div style={{ paddingBottom: '16px' }}><span>恭喜，升级成功！</span></div>
                                <div>安装完成</div>
                            </div>,
                            modalBtn: [
                                <Button key="ok" onClick={_this.handleCancel}>确定</Button>,
                            ]
                        });
                    }
                } else {
                    _this.websockProgress(API, value, i, length);
                }
            }
        }
    }
    reboot = () => {
        let _this = this;
        this.setState({ loading: true, rebootLoading: true });
        let gradeDom = <div style={{ paddingBottom: '16px' }}><span>请稍等，正在重启服务，请勿关闭电脑~</span></div>
        axiosInstance({
            method: 'get',
            url: '/admin/system/upgrade/reboot'
        }).then(function (response) {
            if (response.status === 200) {
                _this.setState({
                    confirmLoading: true,
                    ModalText: gradeDom,
                })
                window.location.reload();
                _this.getSysInfo(() => {
                    _this.setState({
                        visible: false,
                        confirmLoading: false,
                        ModalText: '',
                        loading: false,
                        rebootLoading: false
                    });
                    message.success('重启成功！！');
                });
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }
    render() {
        const { visible, ModalText, modalBtn, rebootLoading,barChart } = this.state;
        var persionTime = [];
        if(  barChart && barChart.length !== 0 ){
        for (let i = 0; i <barChart.liveness.length; i++) {
            var d = new Date(barChart.liveness[i].time)  ;
            var month=d.getMonth() + 1
             persionTime.push({
                x :   month + `月`,
                y :  barChart.liveness[i].total,
             })
        }
        }
        return (
            <Spin spinning={this.state.loading} size="large">
                <Row style={{ minHeight: "340px" }}>
                    <Col span={7}>
                        
                        <h2 className={Styles.systitle}>产品信息</h2>
                        <Divider />
                        <div className={Styles.info}>
                            <p><span>产品名字:</span>{this.state.account.name ? this.state.account.name : '未获取到产品信息'}</p>
                            <p><span>产品版本:</span>{this.state.account.version ? this.state.account.version : '未获取到产品信息'}</p>
                            <p><span>产品Key:</span>{this.state.account.key ? this.state.account.key : '未获取到产品信息'}</p>
                            <p><span>产品序号:</span>{this.state.account.serial ? this.state.account.serial : '未获取到产品信息'}</p>
                            <p><span>产品日期:</span>{this.state.account.createTime ? this.transitionTime(this.state.account.createTime) : '未获取到产品信息'}</p>
                        </div>
                        <Button type="primary" loading={rebootLoading} onClick={this.reboot}>重启服务</Button>
                    </Col>
                    <Col span={16} offset={1}>
                        <h2 className={Styles.systitle}>注册用户数：{barChart.usersCount}</h2>
                        <h3 className={Styles.systitle}>活跃用户统计：</h3>
                        <Col span={20} style={{ paddingBottom: '20px'}} >
                        <Select defaultValue="1" style={{ width: 120 }} onChange={this.handleChange}>
                            <Option value="1">最近6个月</Option>
                            <Option value="2">最近12个月</Option>
                        </Select>
                        </Col>
                        <Col span={4} >
                        <Button style={{ marginLeft: '5%',display:'none' }}  onClick={this.sortingData}></Button>
                        </Col>
                        <Divider />
                        <Spin spinning={this.state.loading2}  style={{ marginLeft: '50%',marginTop:'20px' }}/>
                        <Bar
                            height={200}
                            data={persionTime}
                        />
                    </Col>
                </Row>
                <Row style={{ minHeight: "500px" , paddingTop:'20px' }}>
                    <Col span={8} offset={8}>
                        <h2 className={Styles.systitle}>系统磁盘使用情况</h2>
                        <Divider />
                        <Pie
                            hasLegend
                            title="磁盘大小"
                            subTitle="磁盘大小"
                            total={() => (
                                <span>{this.state.diskInfo.total}</span>
                            )}
                            data={this.state.diskdata}
                            valueFormat={val => <span />}
                            height={250}
                        />
                    </Col>
                    <Col span={8}>
                        <h2 className={Styles.systitle}>系统内存使用情况</h2>
                        <Divider />
                        <Pie
                            hasLegend
                            title="内存大小"
                            subTitle="内存大小"
                            total={() => (
                                <span>{this.state.memory.total}</span>
                            )}
                            data={this.state.memorydata}
                            valueFormat={val => <span />}
                            height={250}
                        />
                        <div className={Styles.reload} onClick={this.getSysInfo}>
                            <Icon type="reload" />刷新
                    </div>
                    </Col>
                    <Modal title="系统更新"
                        visible={visible}
                        onOk={this.handleOk}
                        confirmLoading={this.confirmLoading}
                        onCancel={this.handleCancel}
                        footer={modalBtn}
                    >
                        {ModalText}
                        <Progress percent={this.state.progressNum} status="active" style={{ display: this.state.progressStyle }} />
                    </Modal>
                </Row>
            </Spin>
        );
    }
}
