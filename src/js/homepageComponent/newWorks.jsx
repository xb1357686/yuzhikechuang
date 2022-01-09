import React from 'react';
import { Row, Col, Icon, message, Tabs } from 'antd';
import { Link } from 'react-router-dom'
import Apirequest from './../config/apirequest';
import Styles from '../../css/homepage.module.css';
const TabPane = Tabs.TabPane;

/* global layer*/
export default class NewWorks extends React.Component {
    state = {
        newProductData: [],
        userId: '',
        showNewData: [],
        newNumber: 1,
        usersElements2: [],
        newTotal: 0,
        addNewPage: false,
    };
    componentDidMount = () => {
        this.getNewProduct(1);
    }
  
    //获取按时间排序的作品
    getNewProduct = (num) => {
        const _this = this;
        Apirequest.get(`/works/sharelist/${num}/6?sortCategory=2`)
            .then(res => {
                if (res.data.code === 0) {

                    this.setState({
                        newProductData: res.data.works,
                        newTotal: res.data.total
                    })
                    return res.data.works;
                }else {
                    message.error(res.data.message);
                }
            })
            .then(
                (data) => {
                    if (data.length === 6) {
                        _this.getNewNextPage(num, data)
                    }
                }
            )
    }
    getNewNextPage = (num, data = '') => {
        const _this = this;
        Apirequest.get(`/works/sharelist/${num + 1}/6?sortCategory=2`)
            .then(res => {
                if (res.data.code === 0) {
                    if (res.data.works !== null) {
                        _this.setState({
                            addNewPage: true,
                        })
                    }
                    let arr = [];
                    if (data) {
                        arr = arr.concat(data, res.data.works, _this.state.showNewData);
                    } else {
                        arr = arr.concat(_this.state.showNewData, res.data.works);
                    }
                    _this.setState({
                        showNewData: arr
                    })
                }else {
                    message.error(res.data.message);
                }
            })
    }
    //下一页
    newProAdd = (newNumber) => {
        const { showNewData, newTotal } = this.state;
        let arr = [];
        arr = showNewData.slice(newNumber * 6, newNumber * 6 + 6);
        if (newNumber !== 2 && showNewData.length !== newTotal) {
            this.getNewNextPage(newNumber + 1)
        }
        if (newNumber + 1 ===3 || newNumber + 1 === Math.ceil(newTotal / 6)) {
            this.setState({
                addNewPage: false
            })
        } else {
            this.setState({
                addNewPage: true
            })
        }

        this.setState({
            newProductData: arr,
            newNumber: newNumber + 1,
        })
    }
    //上一页
    newProRemove = (newNumber) => {
        const { showNewData } = this.state;
        let arr = showNewData.slice((newNumber - 2) * 6, (newNumber - 2) * 6 + 6);
        this.setState({
            newProductData: arr,
            addNewPage: true,
            newNumber: newNumber - 1,
        })
    }
    //跳转
    getProductPerview = (id) => {
        Apirequest({
            method: 'put',
            url: `works/browse?workid=${id}`,
        }).then(res => {
            if (res.data.code !== 0) {
                console.log(res.data.message)
            }
        })
        this.props.history.push({ pathname: `/community/applyStl/${id}` })
    }

    //点赞
    productLike = (elem, e) => {

        const { newProductData } = this.state;
        var data = elem.data,
            index = elem.index;
        var times = data.laud
        e.stopPropagation()
        let userInfo = JSON.parse(localStorage.getItem("userInfo"));
        let userid = localStorage.getItem("likeId");
        userid = userid === 'undefined' ? '' : userid;
        Apirequest({
            method: 'POST',
            url: `/works/laud`,
            data: {
                workid: data.id,
                userid: userInfo ? userInfo.id : userid
            }
        }).then((res) => {
            if (res.data.code === 0) {
                if (elem.text === '最新') {
                    newProductData[index].laud = times + 1;
                    this.setState({
                        newProductData
                    })
                }
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
        const { newProductData } = this.state;
        let data = elem.data,
            index = elem.index;
        let times = data.favor
        var userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
            message.error('请先登录再收藏作品');
            return;
        }
        Apirequest({
            method: 'POST',
            url: `/works/favorite`,
            data: {
                workid: data.id,
                userid: userInfo.id
            }
        }).then((res) => {
            if (res.data.code === 0) {
                if (elem.text === '最新') {
                    newProductData[index].favor = times + 1;
                    this.setState({
                        newProductData
                    })
                } 
                message.success('谢谢您的收藏！');
            } else {
                message.error(res.data.message);
            }
        })
    }
      //打开个人中心
      goPersonalCenter = (elem, e) => {
        let userID = elem.data.userID
        e.stopPropagation()
        this.props.history.push({ pathname: `/personalCenter/${userID}` })
    }
    render() {
        const {  newNumber, newProductData, addNewPage } = this.state;
        let usersElements2,  k = 0
        if (newProductData && newProductData.length > 0) {
            usersElements2 = [];
            for (let elem of newProductData) {
                usersElements2.push( // 循环每个用户，构建 JSX，push 到数组中 
                    <Col className={Styles.productCard}  xs={{ span: 12 }} md={{ span: 6 }} lg={{ span: 4 }} xl={{ span: 4 }} key={elem.id} onClick={this.getProductPerview.bind(null, elem.id)} >
                        <div className={Styles.cardDiv}>
                            <div style={{ overflow: 'hidden', height: '183.3px' }}>
                                <img className={Styles.productImg} alt="example" src={elem.picture} />
                            </div>
                            <div style={{ backgroundColor: '#ffc234e8', boxShadow: '0 10px 22px 0 #ffc10747' }} >
                                <div className={Styles.cardName} >{elem.name} </div>
                                <div className={Styles.cardBrowse} >
                                    <Icon type="eye" /> {elem.browse}
                                    <span className={Styles.cardLaud} onClick={this.productLike.bind(null, { data: elem, index: k, text: '最新' })}>
                                        <Icon type="like" theme="outlined" /> {elem.laud}
                                    </span>
                                    <span className={Styles.cardFavor} onClick={this.productCollect.bind(null, { data: elem, index: k, text: '最新' })}>
                                        <Icon type="copy" theme="outlined" /> {elem.favor}
                                    </span>
                                </div>
                                <div className={Styles.cardUserName} onClick={this.goPersonalCenter.bind(null, { data: elem, index: k })}>
                                    <Icon type="user" /> {elem.user[0].realname}
                                </div>
                            </div>
                        </div>
                    </Col>
                )
                k++
            }
        }
      
        return (
                    <div className={Styles.eachPiece}>
                        <div >
                            <img style={{width:'50px'}} src='./images/newProduct.png' alt='最新作品' />
                            <span className={Styles.title}>最新作品</span>
                            <Link to="/community" className={Styles.homePage}>更多作品</Link>
                        </div>
                        <div className={Styles.productLine}  >
                            <button onClick={() => this.newProRemove(newNumber)} className={Styles.control} style={{ display: newNumber && newNumber === 1 ? 'none' : 'block', cursor: 'pointer' }}><img src='./images/left.png' className={Styles.lastPage} alt="" /></button >
                            <Tabs tabBarStyle={{ display: 'none' }}    >
                                <TabPane tab={newNumber} key={newNumber}>
                                    <Row gutter={20}>
                                        {usersElements2 === null ? '社区还没有作品哦,快快分享吧！' : usersElements2}
                                    </Row>
                                </TabPane>
                            </Tabs>
                            <button onClick={() => this.newProAdd(newNumber)} className={Styles.control} style={{ display: addNewPage === false ? 'none' : 'block', right: '0', top: '0', cursor: 'pointer' }}>
                                <img src='./images/right.png' className={Styles.nextPage} alt="" />
                            </button >
                        </div>
                    </div>

        )
    }
}
