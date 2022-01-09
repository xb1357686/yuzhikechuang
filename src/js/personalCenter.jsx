import React from 'react';
import Styles from '../css/personalCenter.module.css';
import axiosInstance from "./config/apirequest"
import { baseUrl } from './config/baseUrl.js'
import { Row, Col, Card, Tooltip, Icon, Modal, message, Input, Pagination } from 'antd';
import $ from "jquery";
const { Meta } = Card;
/* global layer*/
export default class personalCenter extends React.Component {
    state = {
        userInfo: "",
        avatarUrl: "",
        role: "student",
        pageHeight: 0,
        product: [],
        favorites: '',
        visible: false,
        addData: '',   //需要添加到个人作品的数据
        addName: '',     //添加作品的名称
        favoriteTxt: { title: '', text: '' },   //编辑需要的文字    
        add: false,
        realname: '',
        gender: '',
        id: '',
        totalNums: 0,
        favorCount: 0,
        laudCount: 0,
        pageNum: 0,
        faTotalNums: 0,
        faPageNum: 0,
    };
    componentWillMount = () => {
        let pageHeight = document.body.clientHeight - 64 - 159;  //减去头部和底部的高度
        this.setState({
            pageHeight,
        })
        let id = this.props.match.params.userID
        this.setState({
            id: id
        })
        this.getUserMessage(id);

        this.getTimes(id);
        this.getProduction(1, id);
    }
    getTimes = (id) => {
        var _this = this;
        axiosInstance({
            method: 'get',
            url: `/works/count?userID=${id}`
        }).then(function (response) {
            if (response.data.code === 0) {
                _this.setState({
                    favorCount: response.data.favorCount,
                    laudCount: response.data.laudCount,
                })
            }
        })
    }

    goPersonalCenter = (elem, e) => {
        var { id } = this.state;
        console.log(elem.data)
        let userID = elem.data.userID
        if (id !== userID) {
            console.log(id ,userID)
            e.stopPropagation()
            this.props.history.push({ pathname: `/personalCenter/${userID}` })
        }
    }
    //重新获取用户信息
    getUserMessage = (id) => {
        var _this = this;
        var userInfo2;
        axiosInstance({
            method: 'get',
            url: `/user/query/${id}`
        }).then(function (response) {
            if (response.data.code === 0) {
                userInfo2 = response.data.user;
                _this.setState({
                    role: userInfo2.role.name,
                    realname: userInfo2.realname,
                    avatarUrl: baseUrl + userInfo2.avatar,
                    gender: userInfo2.gender
                })

            } else {
                console.log("获取失败" + response.data.message)
            }
        })
            .catch(function (err) {
                console.log(err.response);
            });
    }
    //获取作品
    getProduction = (num, id) => {
        var _this = this;
        var arr = [];
        axiosInstance({
            method: 'get',
            url: `/works/sharelist/person/${num}/6?userID=${id}`
        }).then(res => {
            if (res.data.code === 0 && res.data.works) {
                arr = arr.concat(res.data.works);
                console.log(arr)
                _this.setState({
                    totalNums: res.data.total,
                    product: arr,
                    pageNum: num
                })
                this.getFavorites(1, id);
                if (res.data.works.length === 12) {
                    _this.setState({
                        initLoading: false,
                        loading: false,
                    })
                }
            }else {
                message.error(res.data.message);
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }
    //获取收藏的作品
    getFavorites = (faNum, id) => {
        let _this = this;
        axiosInstance({
            method: 'get',
            url: `works/favorite/${faNum}/6?userID=${id}`
        }).then(res => {
            if (res.data.code === 0 && res.data.favorites) {
                console.log(res.data.favorites)
                _this.setState({
                    favorites: res.data.favorites,
                    faTotalNums: res.data.total,
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
    //生成收藏数据展示
    creatFavoritesList = function (listData) {
        var list = [], _this = this, i = 0;
        for (let data of listData) {
            let elem = data;
            list.push( // 循环每个用户，构建 JSX，push 到数组中
                <Col span={4} key={elem.id} style={{ marginBottom: "25px", position: 'relative' }} >
                    <Card
                        actions={[
                            <Tooltip placement="top" title='喜欢'>
                                <div onClick={this.productLike.bind(null, { data: data, index: i })}><Icon type="like" theme="outlined" /><p style={{ marginLeft: '5px', display: 'inline' }} >{data.laud}</p></div>
                            </Tooltip>,
                            <Tooltip placement="top" title='收藏'>
                                <div onClick={this.productCollect.bind(null, { data: data, index: i })} ><Icon type="copy" theme="outlined" /><p style={{ marginLeft: '5px', display: 'inline' }} >{data.favor}</p></div>
                            </Tooltip>,
                        ]}
                        hoverable
                        cover={<div style={{ overflow: 'hidden', height: '136px' }}><img alt="example" className={Styles.productImg} style={{ width: '100%', height: '100%' }} src={elem.picture} /></div>}
                        onClick={(e) => _this.goPreview(elem.id, e)}
                        bodyStyle={{ padding: '10px' }}
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
        return list;
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
    //跳转
    getProductPerview = (id) => {
        axiosInstance({
            method: 'put',
            url: `works/browse?workid=${id}`,
        }).then(res => {
            if (res.data.code !== 0) {
                console.log(res.data.message)
            }
        })
        this.props.history.push({ pathname: `/community/applyStl/${id}` })
    }
    goPreview = (id, e) => {
        e.stopPropagation()
        this.props.history.push({ pathname: `/community/applyStl/${id}` })
    }
    //点赞
    productLike = (elem, e) => {
        const { product } = this.state;
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
                userid: userInfo.id ? userInfo.id : userid
            }
        }).then((res) => {
            if (res.data.code === 0) {
                product[index].laud = times + 1;
                this.setState({
                    product
                })
                message.success('谢谢您的赞赏！');
            } else {
                message.error(res.data.message);
            }
        })
    }
    //收藏
    productCollect = (elem, e) => {
        e.stopPropagation()
        const { product } = this.state;
        var data = elem.data,
            index = elem.index;
        var times = data.favor
        var userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            message.error('请先登录再收藏作品');
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
                product[index].favor = times + 1;
                this.setState({
                    product
                })
                message.success('谢谢您的收藏！');
            } else {
                message.error(res.data.message);
            }
        })
    }
    onChangePage = (page) => {
        var { id } = this.state;
        this.setState({

            pageNum: page
        });
        this.getProduction(page, id);
    }
    faChangePage = (page) => {
        var { id } = this.state;
        this.setState({
            faPageNum: page
        });
        this.getFavorites(page, id);
    }

    render() {
        const { product, addName, favoriteTxt, favorCount, laudCount } = this.state;
        var usersElements = [], favoritesElement = [];
        if (this.state.favorites.length === 0) {
            favoritesElement = <Col style={{ minHeight: '272px' }}><img style={{marginTop : '30px'}} src='./images/noCollection.png' alt="暂未收藏" /></Col>
        } else {
            favoritesElement = this.creatFavoritesList(this.state.favorites);
        }
        var i = 0;
        if (product) {
            if (product.length === 0) {
                usersElements = <Col style={{ minHeight: '272px' }}>
                 <div key={404} style={{ height: '272px' }} >
                    <img className={Styles.notFoundImg} alt="404" src='./images/notFound.png' />
                </div>
                </Col>
            } else {
                for (let data of product) {
                    console.log(data)
                    usersElements.push( // 循环每个用户，构建 JSX，push 到数组中 
                        <Col className={Styles.productCard} span={4} key={data.id} onClick={this.getProductPerview.bind(null, data.id)} >
                            <Card
                                actions={[
                                    <Tooltip placement="top" title='喜欢'>
                                        <div onClick={this.productLike.bind(null, { data: data, index: i })}><Icon type="like" theme="outlined" /><p style={{ marginLeft: '5px', display: 'inline' }} >{data.laud}</p></div>
                                    </Tooltip>,
                                    <Tooltip placement="top" title='收藏'>
                                        <div onClick={this.productCollect.bind(null, { data: data, index: i })} ><Icon type="copy" theme="outlined" /><p style={{ marginLeft: '5px', display: 'inline' }} >{data.favor}</p></div>
                                    </Tooltip>,
                                ]}
                                hoverable
                                cover={<div style={{ overflow: 'hidden', height: '136px' }}><img className={Styles.productImg} alt="example" src={data.picture} /></div>}
                                bodyStyle={{ padding: '10px' }}
                            >
                                <Meta
                                    title={data.name}
                                    description={<Col span={20} style={{ paddingLeft: '0', paddingRight: '0', width: '100%' }}><div onClick={this.goPersonalCenter.bind(null, { data: data, index: i })} className={Styles.person} ><Icon type="user" /> {data.realname}</div> <Col style={{ display: 'inline', float: 'right', paddingLeft: '0', paddingRight: '0' }}>< Icon type="eye" /> {data.browse}</Col></Col>}
                                />
                            </Card>
                        </Col>
                    )
                    i++
                }
            }
        }
        return (

            <div className={Styles.content} style={{ minHeight: `${this.state.pageHeight}px` }}>
                <Row >
                    <div className={Styles.userInfoMenu}> </div>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', marginTop: '-218px' }}>
                        <Col span={4} offset={11}>
                            <div style={{ padding: ' 0 20px  0  0' }}>
                                <img src={this.state.avatarUrl} alt="头像" width="100%" className={Styles.Avatar} />
                            </div>
                            <Col span={24}>
                                <div style={{ fontSize: '20px',marginTop:'5px'}}>
                                    <img src={this.state.role === 'student' ? './images/student.png' : './images/teacher.png'} style={{ marginRight: '6px' }} alt="角色" />
                                    {this.state.realname}
                                    <Icon type={this.state.gender === '男' ? 'man' : 'woman'} style={{ color: this.state.gender === '男' ? '#43bff9' : '#f94395', fontSize: '22px', marginLeft: '12px' }} />
                                </div>
                            </Col>
                            
                        </Col>
                        <Col span={8} offset={10}>
                        <Col span={24}  >
                            <span style={{ fontSize: '18px', color: '#fff', marginRight: '10px', }}>获得收藏：{favorCount}次</span>
                            <span style={{ fontSize: '18px', color: '#fff', marginRight: '10px', }}>获得点赞：{laudCount}次</span>
                        </Col>
                        </Col>
                    </div>
                    
                </Row >
                <div style={{ maxWidth: '1200px', margin: '0 auto', marginTop: '90px' }}>
                    <div style={{ fontSize: '22px', marginBottom: '20px' }}><img src='./images/meCourses.png' alt='作品' /> TA分享的作品 </div>
                    <div style={{ marginTop: '20px', position: 'relative' }} >
                        <Row gutter={20} >
                            {usersElements}
                        </Row>
                    </div>
                </div>
                <div style={{ display: this.state.totalNums === 0 ? 'none' : 'block', width: '200px', margin: '0 auto', paddingBottom: '20px' }}>
                    <Pagination style={{ display: 'contents' }} className={Styles.pagecss} simple defaultCurrent={1} total={this.state.totalNums} defaultPageSize={6} current={this.state.pageNum} onChange={this.onChangePage} />
                </div>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ fontSize: '22px', marginBottom: '20px' }}><img src='./images/meCourses.png' alt='作品' /> TA收藏的作品 </div>
                    <div style={{ marginTop: '20px', position: 'relative' }} >
                        <Row gutter={20} >
                            {favoritesElement}
                        </Row>
                    </div>
                </div>
                <div style={{ display: this.state.faTotalNums === 0 ? 'none' : 'block', width: '200px', margin: '0 auto', paddingBottom: '20px' }}>
                    <Pagination style={{ display: 'contents' }} className={Styles.pagecss} simple defaultCurrent={1} total={this.state.faTotalNums} defaultPageSize={6} current={this.state.faPageNum} onChange={this.faChangePage} />
                </div>
            </div>
        )
    }
}
