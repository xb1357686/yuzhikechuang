
import React from 'react';
import Styles from '../../css/courses.module.css';
import { Row, Col, message,Select,Icon,Card,Tooltip,Modal,Input } from 'antd';
import $ from "jquery";
import axiosInstance from "../config/apirequest"
import {baseUrl} from '../config/baseUrl.js'
const { Meta } = Card;
/* global layer*/
const Option = Select.Option;
export default class ClassProduction extends React.Component {
    constructor(props) {
        super(props);
    this.state = {
    selectedCourse:[],
    lessionData:[],
    productData:[],
    favoriteTxt: '',
    addName: '',
    selectValue:'请选择课程',
    selectClassValue:'请选择课节'
    }
    }
    componentDidMount = () => {
        this.getCourse(this.props.classCode)
        this.props.getPNameThis(this)
    }
    restState = ()=>{
        this.setState({  
            Productionvisible: true 
        });
    }
    getCourse = (code) => {
        let _this = this;
        let  Course = []
        axiosInstance({
            method: 'get',
            url:  baseUrl+'api/courses/manager/class?code='+ code
        }).then(function (response) {
            if (response.data.code === 0 && response.data.result) {
                    for(var i = 0;i <response.data.result.length;i++)
                    Course.push(response.data.result[i].course )
                    _this.setState({ 
                        selectedCourse: Course
                    });
            } else {
                _this.setState({ 
                    selectedCourse: []
                });
            }
        })
        
        _this.setState({  
            Productionvisible: true 
        });
    }
    //更换课程
    courseChange = (value) => {
        
        let lessionData = [];
        axiosInstance.get(`/courses/${value}/lessions`) //获取课程列表
        .then(res => {
            if (res.data.code === 0) {
                for(var i=0;i<res.data.course.lessions.length;i++){
                    for(var j=0;j<res.data.course.lessions[i].content.length;j++){
                        lessionData.push({
                            id: res.data.course.lessions[i].content[j].id,
                            name:res.data.course.lessions[i].name
                        })
                    }
                }
                this.setState({
                    selectValue:value,
                    lessionData: lessionData
                })
            }else {
                message.error(res.data.message);
            }
        })
          
        }
        //获取班级作品
        getClassProduction = (value) => {
            var productData = [];
            axiosInstance.get(`works/class/students?classCode=${this.props.classCode}&contentID=${value}`) //获取课程列表
            .then(res => {
                if (res.data.code === 0) {
                    for(var i=0;i<res.data.results.length;i++){
                    
                            productData.push(res.data.results[i].work)
    
                    }
                    this.setState({
                        selectClassValue:value,
                        productData: productData
                    })
                }else {
                    message.error(res.data.message);
                }
            })
        }
        //点赞
    productLike = (elem, e) => {
        const { productData } = this.state;
        var data = elem.data,
            index = elem.index;
        var times = data.laud
        e.stopPropagation()
        let userInfo = JSON.parse(localStorage.getItem("userInfo"));
        let userid = localStorage.getItem("likeId");
        userid = userid === 'undefined' ? '' : userid;
        axiosInstance({
            method: 'POST',
            url: `/works/laud`,
            data: {
                workid: data.id,
                userid: userInfo ? userInfo.id : userid
            }
        }).then((res) => {
            if (res.data.code === 0) {
                productData[index].laud = times + 1;
                this.setState({
                    productData
                })
                if (res.data.userid) {
                    this.setState({
                        userId: res.data.userid
                    })
                    localStorage.setItem("likeId", res.data.userId);
                }
                message.success('谢谢您的赞赏！');
            } else {
                message.error(res.data.message);
            }
        })
    }
    //收藏
    productCollect = (elem, e) => {
        e.stopPropagation()
        const { productData } = this.state;
        var data = elem.data,
            index = elem.index;
        var times = data.favor
        var userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            message.error('请先登录再收藏作品')
            return;
        }
        axiosInstance({
            method: 'POST',
            url: `/works/favorite`,
            data: {
                workid: data.id,
                userid: userInfo.id
            }
        }).then((res) => {
            if (res.data.code === 0) {
                productData[index].favor = times + 1;
                this.setState({
                    productData
                })
                message.success('谢谢您的收藏！');
            } else {
                message.error(res.data.message);
            }
        })
    }
    //编辑作品
    showAddModal = (addData, e) => {
        e.stopPropagation()
        let userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            message.error('请先登录再编辑作品');
            return
        }
        if (!addData.edit) {
            message.warning('当前作品作者不允许克隆和编辑哦！');
            return
        }
        this.setState({
            addProductVib: true,
            addData: addData,
            favoriteTxt: { title: '编辑', text: '需要保存至我的作品才能编辑哦，是否立即添加？' },
            addName: addData.name
        });
        return;
    }
    copyFavorite = (e) => {
        e.stopPropagation()
        const { addData, addName } = this.state, _this = this;
        let id = addData.id;
        let newData = { ...addData };
        if (addName.length === 0) { message.error('请输入作品名称！'); return; }
        axiosInstance({
            method: 'get',
            url: `works/copywork?workid=${id}&name=${addName}`
        }).then(res => {
            if (res.data.code === 0) {        //返回码为0 则正确
                _this.setState({
                    addProductVib: false,
                });
                message.success('添加成功,正在打开编辑！');
                newData.id = res.data.id;
                _this.goApptools(newData)
            }else {
                message.error(res.data.message);
            }
        })
    }
    handleCancel = () => {
        this.setState({
            visible: false,
            addProductVib: false
        });
    }
    goApptools = (data) => {
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
            }

        });
    }
    addNameChang = (e) => {
        let name = e.target.value;
        this.setState({ addName: name });
    }
    goPersonalCenter = (elem, e) => {
        let userID = elem.data.userID
        e.stopPropagation()
        this.props.history.push({ pathname: `/personalCenter/${userID}`, state: { userID } })
    }
         //跳转
    getProductPerview = (id) => {
      
        this.props.history.push({ pathname: `/community/applyStl/${id}` })

    }
    backTeacherSpace = () => {
        this.setState({
            selectValue:'请选择课程',
            selectClassValue:'请选择课节'
        })
            this.props.setDefaultActiveKey('2')
        }
    render() {     
        const { selectedCourse,lessionData,productData ,addProductVib, favoriteTxt, addName } = this.state;
        var usersElements, notFound, i = 0;
        if (productData.length !== 0 ) {
            usersElements = [];
            for (let elem of productData) {
                usersElements.push( // 循环每个用户，构建 JSX，push 到数组中
                    <Col className={Styles.productCard}  lg={{ span: 4 }} xl={{ span:4 }} key={elem.id} onClick={this.getProductPerview.bind(null, elem.id)} >
                        <Card
                            actions={[
                                <Tooltip placement="top" title='编辑'>
                                    <div style={{ color: elem.edit ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0,0,0,.1)' }}><Icon type="edit" theme="outlined" onClick={this.showAddModal.bind(null, elem)} /></div>
                                </Tooltip>,
                                <Tooltip placement="top" title='喜欢'>
                                    <div onClick={this.productLike.bind(null, { data: elem, index: i })}><Icon type="like" theme="outlined" /><p style={{ marginLeft: '5px', display: 'inline' }} >{elem.laud}</p></div>
                                </Tooltip>,
                                <Tooltip placement="top" title='收藏'>
                                    <div onClick={this.productCollect.bind(null, { data: elem, index: i })} ><Icon type="copy" theme="outlined" /><p style={{ marginLeft: '5px', display: 'inline' }} >{elem.favor}</p></div>
                                </Tooltip>,
                            ]}
                            hoverable
                            cover={<div style={{ overflow: 'hidden', height: '140px' }}><img className={Styles.productImg} style={{ width: '100%', height: '100%' }} alt="example" src={elem.picture} /></div>}
                            bodyStyle={{ padding: '8px' }}
                        >
                            <Meta
                                title={elem.name}
                                description={<Col span={20} style={{ paddingLeft: '0', paddingRight: '0', width: '100%' }}><div onClick={this.goPersonalCenter.bind(null, { data: elem, index: i })} className={Styles.person} ><Icon type="user" /> {elem.user[0].realname}</div> <Col style={{ display: 'inline', float: 'right', paddingLeft: '0', paddingRight: '0' }}>< Icon type="eye" /> {elem.browse}</Col></Col>}
                            />
                        </Card>
                    </Col>
                )
                i++
            }
        } else {
            notFound = [];
            notFound.push(
                <div key={404}  >
                    <img className={Styles.notFoundImg} style={{ marginLeft: "10px" }}alt="404" src='./images/noClassPro.png' />
                </div>
            )
        }
        const courseOptions = selectedCourse.map(data => <Option key={data._id}>{data.name}</Option>);
        const lessionOptions = lessionData.map(data => <Option key={data.id}>{data.name}</Option>);
        return (
            <div>
        <Row gutter={20}  style={{ minHeight: "500px" }}>
        <Col md={{ span: 24 }} style={{ marginTop: "10px" }}>
                <span onClick={this.backTeacherSpace}><Icon type="arrow-left" style={{ fontSize: '22px', color: 'rgba(0, 0, 0, 0.65)' }} /></span>
                <span style={{  fontSize: '22px' ,marginLeft:'10px',color: 'rgba(0, 0, 0, 0.65)'}}>{this.props.classTitle}作品</span>
        </Col>
        <Col md={{ span: 24 } }style={{ marginTop: "10px" }}>
        <Select placeholder="请选择课程" autoFocus notFoundContent="请先为该班级添加课程"   value = {this.state.selectValue } onSelect={(value) => { this.courseChange(value) }} style={{  width: '220px' }}>
        
            {courseOptions}
        </Select>
        <Select  placeholder="请选择课节" notFoundContent="该课程无课节" value = {this.state.selectClassValue } onSelect={(value) => { this.getClassProduction(value) }} style={{ width: '220px',marginLeft:'10px' }}>
            {lessionOptions}
        </Select>
        </Col>
        <Col md={{ span: 24 }} style={{ paddingLeft: '0', paddingRight: '0', marginTop: "20px" }}>
            {productData.length === 0 ? notFound : usersElements}
        </Col>
        </Row>
        <Modal title={favoriteTxt.title}
        visible={addProductVib}
        cancelText='取消'
        okText='确定'
        onOk={this.copyFavorite}
        onCancel={this.handleCancel}
    >
        <p style={{ color: '#f14242' }}>{favoriteTxt.text}</p>
        <p>作品名称 : <Input placeholder='请输入作品名称' value={addName} onChange={this.addNameChang} /></p>
        </Modal>
        </div>
        );
    }
}
