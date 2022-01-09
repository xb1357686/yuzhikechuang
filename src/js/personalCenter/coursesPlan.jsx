import React from 'react';
import { Row, Col, Card, Progress, Tooltip, Icon, Modal, message, Input,Pagination } from 'antd';
import Styles from '../../css/space.module.css';
import AxiosInstance from "../config/apirequest";
import $ from "jquery";
const { Meta } = Card;
/* global layer*/
export default class coursesPlan extends React.Component {

    state = {
        coursesPlan: [],    //我的课程
        userInfo: '',
        favorites: '',    //收藏的作品
        visible: false,
        delData: '',    //需要删除的ID
        addProductVib: false,
        addData: '',   //需要添加到个人作品的数据
        addName: '',     //添加作品的名称
        favoriteTxt: { title: '', text: '' },   //编辑需要的文字    
        add: false,
        faPageNum:1, 
        faTotalNums:0,
    }

    componentWillMount = () => {
        let userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) return;
        this.setState({
            userInfo
        })
        try {
            this.getCoursesPlan(userInfo);
            this.getFavorites(1,userInfo);
        } catch (error) {
            console.log(error);
        }
    }

    getCoursesPlan = (userInfo) => {
        let _this = this;
        AxiosInstance({
            method: 'get',
            url: `user/progress?userid=${userInfo.id}`
        }).then(res => {
            if (res.data.code === 0 && res.data.courseprogress) {        //返回码为0 则正确
                _this.setState({
                    coursesPlan: res.data.courseprogress
                })
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }
    getFavorites = (faNum,userInfo) => {
        let _this = this;
        AxiosInstance({
            method: 'get',
            url: `works/favorite/${faNum}/6?userID=${userInfo.id}`
        }).then(res => {
            if (res.data.code === 0 && res.data.favorites) {        //返回码为0 则正确
                _this.setState({
                    faTotalNums:res.data.total,
                    favorites: res.data.favorites,
                    faPageNum: faNum
                })
            }else {
                message.error(res.data.message);
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }
    faChangePage = (page) => {
        const  {userInfo} = this.state;
        this.setState({
            faPageNum:page
        });
        this.getFavorites(page,userInfo);
    }
    //删除收藏
    showModal = (delData) => {
        this.setState({
            visible: true,
            delData
        });
    }
    delFavorite = () => {
        const { delData, favorites } = this.state, _this = this;
        let delId = delData.data.id;
        AxiosInstance({
            method: 'delete',
            url: `works/favorite?workid=${delId}`
        }).then(res => {
            if (res.data.code === 0) {        //返回码为0 则正确
                favorites.splice(delData.index, 1);
                message.success('删除成功！！');
                _this.setState({
                    favorites: favorites,
                    visible: false,
                });
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
    //复制作品
    showAddModal = (addData, e) => {
        e.stopPropagation()
        if (addData.data && addData.add) {
            if(!addData.edit){
                message.warning('当前作品作者不允许克隆和编辑哦！');
                return
            };
            this.setState({
                addProductVib: true,
                addData: addData.data,
                add: true,
                favoriteTxt: { title: '编辑', text: '需要保存至我的作品才能编辑哦，是否立即添加？' },
                addName: addData.data.name
            });
            return;
        }
        this.setState({
            addProductVib: true,
            addData,
            favoriteTxt: { title: '保存', text: '需要立即将收藏保存至我的作品吗？' },
            addName: addData.name
        });

    }
    addNameChang = (e) => {
        let name = e.target.value;
        this.setState({ addName: name });
    }
    copyFavorite = (e) => {
        e.stopPropagation()
        const { addData, addName, add } = this.state, _this = this;
        let id = addData.id;
        let newData = { ...addData };
        if (addName.length === 0) { message.error('请输入作品名称！'); return; }
        AxiosInstance({
            method: 'get',
            url: `works/copywork?workid=${id}&name=${addName}`
        }).then(res => {
            if (res.data.code === 0) {        //返回码为0 则正确
                _this.setState({
                    addProductVib: false,
                });
                if (add) {
                    message.success('添加成功,正在打开编辑！');
                    newData.id = res.data.id;
                    _this.goApptools(newData)

                } else {
                    message.success('添加成功,可在作品中查看！');
                }
                _this.props.changeCollect();
            }else {
                message.error(res.data.message);
            }
        })
    }
    goPersonalCenter = (elem,e) =>{
        let userID = elem.data.userID
        e.stopPropagation()
        this.props.history.push({ pathname: `/personalCenter/${userID}` })
    }
    getCoursesList = (id) => {
        this.props.history.push({ pathname: `/courseslist/${id}`, state: {name: 'space' ,id: id } })
    }
    //生成课程数据展示
    creatCoursesList = (listData => {
        var list = [];
        for (let data of listData) {
            list.push( // 循环每个用户，构建 JSX，push 到数组中
             
                <Col span={4} key={data.courseID} style={{ marginBottom: "25px", position: 'relative' }} onClick={this.getCoursesList.bind(null, data.courseID)}>
                    <Card
                        hoverable
                        cover={<img style={{ height: '171.3px' }} alt="example" src={data.icon} />}
                        bodyStyle={{ padding: '18px' }}
                    >
                        <Meta
                            style={{
                                width: '97px',
                                height: '42px'
                            }}
                            description={data.name}
                        />
                    </Card>
                    <Progress type="circle" style={{ position: 'absolute', right: '12px', bottom: '4px' }} width={50} percent={data.finishedLessionCnt / data.totalLessionCnt * 100} format={percent => percent === 100 ? '完成' : `${data.finishedLessionCnt}/${data.totalLessionCnt}`} />
                </Col>
            )
        }
        return list;
    })
    //生成收藏数据展示
    creatFavoritesList = function (listData) {
        var list = [], _this = this, i = 0;
        for (let data of listData) {
            let elem = data;
            list.push( // 循环每个用户，构建 JSX，push 到数组中
                <Col span={4} key={elem.id} style={{ marginBottom: "25px", position: 'relative' }} >
                    <Card
                        actions={[
                            <Tooltip placement="top" title='编辑'>
                                <div style={{color:elem.edit?'rgba(0, 0, 0, 0.45)':'rgba(0,0,0,.1)'}} onClick={_this.showAddModal.bind(_this, { data: elem, add: true })}><Icon type="edit" theme="outlined" /></div>
                            </Tooltip>,
                            <Tooltip placement="top" title='添加至我的作品'>
                                <div onClick={_this.showAddModal.bind(_this, elem)}><Icon type="plus" theme="outlined" /></div>
                            </Tooltip>,
                        ]}
                        hoverable
                        cover={<div style={{ height: '134px' }}><img alt="example" style={{ width: '100%' }} src={elem.picture} /></div>}
                        onClick={(e) => _this.goPreview(elem.id, e)}
                        bodyStyle={{ padding: '10px' }}
                    >
                        <Meta
                        title={elem.name}
                        description={<Col span={20} style={{ paddingLeft: '0', paddingRight: '0', width: '100%' }}><div onClick={this.goPersonalCenter.bind(null, { data: elem, index: i })}    className={Styles.person} ><Icon type="user" /> {elem.user[0].realname}</div> <Col style={{ display: 'inline', float: 'right', paddingLeft: '0', paddingRight: '0' }}>< Icon type="eye" /> {elem.browse}</Col></Col>}
                        />
                    </Card>
                    <Tooltip placement="top" title='删除作品'>
                        <Icon type="delete" className={Styles.closeBtn} onClick={_this.showModal.bind(_this, { data: elem, index: i })} />
                    </Tooltip>
                </Col>
            )
            i++
        }
        return list;
    }
    goPreview = (id, e) => {
        this.props.history.push({ pathname: `/community/applyStl/${id}` })
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
            content: `${url}${data.toolURL}?dataID=${data._id}`, //iframe的url，no代表不显示滚动条
            success: () => {
                $('iframe').focus();
            },
            restore: (dom) => {
                $(dom[0]).css('top', '0');
                $(dom[0]).find('iframe').focus();
            }

        });
    }
    render() {
        var usersElements = [], favoritesElement = [], { visible, addProductVib, addName, favoriteTxt } = this.state;
        if (this.state.coursesPlan.length === 0) {
            usersElements = <Col  ><img style={{marginTop : '30px'}} src='./images/noProgress.png' alt="没有进度" /></Col>
        } else {
            usersElements = this.creatCoursesList(this.state.coursesPlan);
        }
        if (this.state.favorites.length === 0) {
            favoritesElement = <Col><img style={{marginTop : '30px'}} src='./images/noCollection.png' alt="暂未收藏" /></Col>
        } else {
            try {
                favoritesElement = this.creatFavoritesList(this.state.favorites);
            } catch (error) {
                console.log(error);
            }
        }

        return (
            <div>
                <div style={{ fontSize: '22px', marginBottom: '20px' }}><img src='./images/myprogress.png' alt="进度" /><span style={{ margin: '0 0 0 8px' }}>学习进度</span> </div>
                <Row gutter={16} style={{ minHeight: "300px" }}>
                    {usersElements}
                </Row>
                <div style={{ fontSize: '22px', marginBottom: '20px' }}><img src='./images/mycollection.png' alt="进度" /><span style={{ margin: '0 0 0 8px' }}>我的收藏</span> </div>
                <Row gutter={16} style={{ minHeight: "300px" }}>
                    {favoritesElement}
                </Row>
                <Modal title="删除收藏"
                    visible={visible}
                    cancelText='取消'
                    okText='确定'
                    onOk={this.delFavorite}
                    onCancel={this.handleCancel}
                >
                    <p style={{ color: '#f14242' }}>确定要删除该作品吗？</p>
                </Modal>
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
                <div style={{ display: this.state.faTotalNums === 0 ? 'none' : 'block', width: '200px', margin: '0 auto', paddingBottom: '20px'}}>
                <Pagination style={{ display: 'contents' }} className={Styles.pagecss} simple defaultCurrent={1} total={this.state.faTotalNums} defaultPageSize={6} current={this.state.faPageNum} onChange={this.faChangePage} />
                </div>
            </div>
             

        );
    }
}
