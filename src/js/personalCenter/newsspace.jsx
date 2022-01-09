import React from 'react';
import Styles from '../../css/space.module.css';
import { Row, Col, Pagination, List, Popconfirm,message } from 'antd';
import axiosInstance from "../config/apirequest"
import { connect } from 'react-redux';
import { newsIsRead } from '../../actions';
import { baseUrl } from '../config/baseUrl.js';
var isRead = true;

class NewsSpace extends React.Component {

    state = {
        current: 1,
        MsgList: [],
        code: 0,
        title: "标题",
        content: "内容",
        totalNums: 0,
        time: "",
    }

    componentWillMount = () => {
        this.props.getMsgThis(this)
        this.getMsgList();
        this.getNewsNumber();
        Date.prototype.format = function (fmt) { //author: meizz
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            }
            };
    }
    /* 获取消息列表 */
    getMsgList = (value = this.state.current) => {
        let _this = this;
        axiosInstance({
            method: 'get',
            url: '/user/message/query/' + value + '/5'
        }).then(function (response) {
            if (response.data.code === 0 && isRead) {
                if (response.data.messages.length !== 0) {
                    _this.setState({
                        MsgList: response.data.messages,
                        title: response.data.messages[0].message.title,
                        content: response.data.messages[0].message.Content,
                        code: response.data.messages[0].message.code,
                        time: (new Date(response.data.messages[0].message.createTime).format("yyyy-MM-dd hh:mm:ss"))
                    })
                } else {
                    _this.setState({
                        MsgList: [],
                        title: "暂无消息",
                        content: "暂无消息",
                        code: 0,
                    })
                }

            } else if (response.data.code === 0 && isRead === false) {
                if (response.data.messages.length !== 0) {
                    _this.setState({
                        MsgList: response.data.messages
                    })
                } else {
                    _this.setState({
                        MsgList: [],
                        title: "暂无消息",
                        content: "暂无消息",
                        code: 0,
                    })
                }
            } else {
                _this.setState({
                    MsgList: []
                })
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }

    onChangePage = (page) => {
        this.setState({
            current: page,
        });
        isRead = true;
        this.getMsgList(page);
    }

    /* 查看消息接口 */

    messageID = {
        messageID: ""
    }

    onLook = (event) => {
        this.setState({
            code: (event.target.dataset.code),
            title: (event.target.dataset.title),
            content: (event.target.dataset.content),
            time: (new Date(event.target.dataset.time).format("yyyy-MM-dd hh:mm:ss"))
        });
        var _this = this;
        this.messageID.messageID = (event.target.dataset.id);
        axiosInstance({
            method: 'post',
            url: '/user/message/read/new',
            data: _this.messageID
        }).then(function (response) {
            if (response.data.code === 0) {
                isRead = false;
                _this.getMsgList();
                _this.props.dispatch(newsIsRead())

            } else {
                console.log("error：" + response.data.message)
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }
    /* 查看消息数量 */

    getNewsNumber = () => {
        let _this = this;
        axiosInstance({
            method: 'get',
            url: '/user/message/query/count'
        }).then(function (response) {
            if (response.data.code === 0) {
                if (response.data.count !== null) {
                    _this.setState({
                        totalNums: response.data.count.total
                    })
                } else {
                    _this.setState({
                        totalNums: 1
                    })
                }
            } else {
                console.log("获取失败" + response.data.message)
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }
    //删除确认
    onConfirm = (id)=>{
        var {MsgList} = this.state,_this = this;
        var arr = [...MsgList];
        axiosInstance({
            method: 'DELETE',
            url: `/user/message/delete?messageID=${id}`
        }).then(function (response) {
            if(response.data.code === 0){
                for (let i = 0; i < arr.length; i++) {
                    const element = arr[i];
                    if(element.messageID === id){
                        arr.splice(i,1);
                    }
                }
                message.success('删除成功！！');
                _this.setState({MsgList:arr});
            }
        })
    }
    render() {     
        return (
            <Row style={{ minHeight: "567px" }}>
                <Col span={24} style={{ minHeight: "500px", padding: "0 10px" }}>
                    <p className={Styles.classTitle}>您的消息</p>
                    <hr />
                    <List
                        itemLayout="horizontal"
                        locale={{emptyText:''}}
                        dataSource={this.state.MsgList}
                        renderItem={item => (
                            <List.Item actions={[
                            <Popconfirm title="您确定删除消息吗？" onConfirm={()=>this.onConfirm(item.messageID)} okText="确定" cancelText="取消">
                               <img  src='./images/deleteMessage.png' alt='删除' style={{ width: '30px'}} />
                            </Popconfirm>]}>
                                <List.Item.Meta
                                    title={<div>
                                        <img src={baseUrl+item.message.logo} alt='消息图标' style={{ borderRadius: '41px',width: '5%',position:"absolute"}}  />
                                        <span style={{marginLeft:"8%", color: "#BA9777" }}>
                                            [{ item.message.className }]
                                        </span>
                                        <span style={{color:"#499fff"}}  data-id={item.messageID} data-code={item.message.code} data-title={item.message.title} data-content={item.message.Content} data-time={item.message.createTime}> { item.message.title }</span>
                                        <div style={{color: "rgba(0, 0, 0, 0.45)",marginLeft:"8%",marginBottom:"2%",marginTop:"1%"}}>{new Date(item.message.createTime).format("yyyy-MM-dd")}</div>
                                        <div style={{width:'80%',height:'10%',marginLeft:"8%",backgroundColor:'#eeeeee',paddingTop:'2%',paddingBottom:'2%'}}>
                                        <div style={{margin:"0 2%",wordBreak: 'break-all'}} ><span>{item.message.Content }</span></div>
                                        </div>
                                    </div> 
                                    }
                                />
                        </List.Item>
                        )}
                    />
                    <div style={{width:'453px',margin:'0 auto' }}>
                    <img style={{ display: this.state.MsgList.length !== 0  ? 'none' : 'flex' }} src='./images/noNews.png' />
                    </div> 
                    <div style={{width:'200px',margin:'0 auto' }}>
                    <Pagination style={{  display: this.state.MsgList.length !== 0  ? 'contents' : 'none' }}className={Styles.pagecss} simple defaultCurrent={1} total={this.state.totalNums} defaultPageSize={5} current={this.state.current} onChange={this.onChangePage} />
                    </div> 
                </Col>
            </Row>
        );
    }
}
export default connect()(NewsSpace);