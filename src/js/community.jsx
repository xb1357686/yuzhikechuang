import React from 'react';
import Styles from '../css/courses.module.css';
import { Row, Col, Button, Card, Tooltip, Icon, message, Modal, Input, Spin, Radio, Divider, Pagination } from 'antd';
import Apirequest from './config/apirequest';
import $ from "jquery";
import { workSelectPage } from './z_xu_api';
const { Meta } = Card;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
/* global layer*/
export default class Community extends React.Component {
  state = {
    sort: 1,
    data: [],
    productData: [],
    pageHeight: 0,
    pageNum: 1,
    loading: false,
    userInfo: '',
    userId: '',
    addProductVib: false,
    addData: '',
    favoriteTxt: '',
    addName: '',
    radioGroup: [],
    select: 'all',
    totalNums: 0,
  };
  componentDidMount = () => {
    // this.getClassify();
    this.getMoreProduct(1, 1);

    let pageHeight = document.body.clientHeight - 64 - 159;  //减去头部和底部的高度;
    let userid = localStorage.getItem("likeId");
    this.setState({
      pageHeight,
      loading: true,
      userid
    })
    let userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) return;
    this.setState({
      userInfo
    })

  }
  changeSort = (page, sort) => {
    this.getMoreProduct(page, sort)
    this.setState({
      select: 'all',
      pageNum: 1
    })
  }
  getMoreProduct = (page, sort) => {
    const _this = this;
    var arr = [];
    workSelectPage({ current: page, size: 12 })
      .then(res => {
        if (res && res.data && res.status === 200) {
          if (!res.data.rows) {
            _this.setState({
              productData: null,
              loading: false,
            })
            return
          }
          arr = arr.concat(res.data.rows);
          _this.setState({
            totalNums: res.data.total,
            sort: sort,
            productData: arr,
            loading: false,
          })
          if (res.data.works.length === 12) {
            _this.setState({
              loading: false,
            })
          }
        }
      })
  }
  getClassify = () => {
    var radioGroup = [];
    Apirequest.get(`/tools/category`)
      .then(res => {
        if (res.data.code === 0) {
          for (let i = 0; i < res.data.categorys.length; i++) {
            let data = res.data.categorys[i];
            radioGroup.push(<RadioButton key={i} style={{ marginRight: '20px' }} value={data.category}>{data.category}</RadioButton>)
          }
          this.setState({
            radioGroup,
          })
        } else {
          message.error(res.data.message);
        }
      })
  }
  //改变分类标签
  labelChange = (e) => {
    const { sort } = this.state, _this = this;
    this.setState({
      pageNum: 1
    })
    let select = e.target.value;
    // let coursesData = [];
    if (select === 'all') {
      this.getMoreProduct(1, sort);
      _this.setState({
        select: select,
      })
      return;
    } else {
      this.getProductTools(1, sort, select);
      _this.setState({
        select: select,
      })
    }
  };
  getProductTools = (page, sort, select) => {
    const _this = this;
    var arr = [];
    Apirequest.get(`/works/sharelist/category/${page}/12?sortCategory=${sort}&category=${select}`)
      .then(res => {
        if (res.data.code === 0) {
          if (!res.data.works) {
            _this.setState({
              totalNums: res.data.total,
              productData: null,
              loading: false,
            })
            return
          }
          arr = arr.concat(res.data.works);
          _this.setState({
            totalNums: res.data.total,
            productData: arr,
            pageNum: page,
            loading: false,
          })
          if (res.data.works.length === 12 || res.data.works === null) {
            _this.setState({
              loading: false,
            })
          }
        }
      })
  }
  onChangePage = (page) => {
    var { sort, select } = this.state;
    this.setState({
      loading: true,
      pageNum: page
    });
    if (select === 'all') {
      this.getMoreProduct(page, sort);
      return;
    } else {
      this.getProductTools(page, sort, select);
    }
  }
  //跳转
  getProductPerview = (id) => {
    // Apirequest({
    //     method: 'put',
    //     url: `works/browse?workid=${id}`,
    // }).then(res => {
    //     if (res.data.code !== 0) {
    //         console.log(res.data.message)
    //     }
    // })
    this.props.history.push({ pathname: `/community/applyStl/${id}` })

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
    Apirequest({
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
    Apirequest({
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
    Apirequest({
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
      } else {
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
  goApp = () => {
    this.props.history.push({ pathname: `/apptools` })
  }
  render () {
    const { productData, loading, addProductVib, favoriteTxt, addName } = this.state;
    var usersElements, notFound, i = 0;
    if (productData) {
      usersElements = [];
      for (let elem of productData) {
        usersElements.push( // 循环每个用户，构建 JSX，push 到数组中
          <Col className={Styles.productCard} xs={{ span: 16, offset: 4 }} sm={{ span: 8, offset: 0 }} md={{ span: 6 }} lg={{ span: 4 }} xl={{ span: 4 }} key={elem.id} onClick={this.getProductPerview.bind(null, elem.workId)} >
            <Card
              actions={[
                // <Tooltip placement="top" title='编辑'>
                //     <div style={{ color: elem.edit ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0,0,0,.1)' }}><Icon type="edit" theme="outlined" onClick={this.showAddModal.bind(null, elem)} /></div>
                // </Tooltip>,
                // <Tooltip placement="top" title='喜欢'>
                //     <div onClick={this.productLike.bind(null, { data: elem, index: i })}><Icon type="like" theme="outlined" /><p style={{ marginLeft: '5px', display: 'inline' }} >{elem.laud}</p></div>
                // </Tooltip>,
                // <Tooltip placement="top" title='收藏'>
                //     <div onClick={this.productCollect.bind(null, { data: elem, index: i })} ><Icon type="copy" theme="outlined" /><p style={{ marginLeft: '5px', display: 'inline' }} >{elem.favor}</p></div>
                // </Tooltip>,
              ]}
              hoverable
              cover={<div style={{ overflow: 'hidden', height: '183.3px' }}><img className={Styles.productImg} style={{ width: '100%', height: '100%' }} alt="example" src={elem.workImg} /></div>}
              bodyStyle={{ padding: '8px' }}
            >
              <Meta
                title={elem.name}
                description={<Col span={20} style={{ paddingLeft: '0', paddingRight: '0', width: '100%' }}><div className={Styles.person} ><Icon type="like" /> {elem.likeNumb}</div> <Col style={{ display: 'inline', marginLeft: '10px', paddingLeft: '0', paddingRight: '0' }}>< Icon type="eye" /> {elem.browseNumb}</Col></Col>}
              />
            </Card>
          </Col>
        )
        i++
      }
    } else {
      notFound = [];
      notFound.push(
        <div key={404} style={{ height: '548px', textAlign: 'center' }} >
          <img className={Styles.notFoundImg} alt="404" src='./images/notFound.png' />
          <Button className={Styles.turnApp} onClick={() => this.goApp()}>我来创作分享一个</Button>
        </div>
      )
    }
    return (
      <div>
        <div className={Styles.content} style={{ minHeight: `875px` }}>
          <Spin spinning={loading}>
            <div className={Styles.content_bgc}>
              <Col md={{ span: 24 }}>
                <Col md={{ span: 19 }} >
                  <RadioGroup defaultValue="all" value={this.state.select} size="large" onChange={this.labelChange}>
                    <RadioButton value="all" style={{ marginRight: '20px' }}>全部</RadioButton>
                    {this.state.radioGroup}
                  </RadioGroup>
                </Col>

                {/* <span style={{ marginLeft:'3%' }} >作品数量：{this.state.totalNums}</span> */}
                <Col md={{ span: 10 }} lg={{ span: 5 }} style={{ marginTop: '15px' }}>
                  <Button className={Styles.excellent} onClick={() => this.changeSort(1, 1)}>浏览量<Icon type="caret-down" theme="filled" /></Button>
                  <Divider type="vertical" />
                  <Button className={Styles.newProduct} onClick={() => this.changeSort(1, 2)}>创作时间<Icon type="caret-down" theme="filled" /></Button>
                </Col>
              </Col>
              <Row gutter={10} style={{ marginTop: '70px', minHeight: '548.67px' }}>
                {productData === null ? notFound : usersElements}
              </Row>
            </div>
          </Spin>
          <div style={{ display: this.state.totalNums === 0 ? 'none' : 'block', width: '200px', margin: '0 auto', paddingBottom: '20px' }}>
            <Pagination style={{ display: 'contents' }} className={Styles.pagecss} simple defaultCurrent={1} total={this.state.totalNums} defaultPageSize={12} current={this.state.pageNum} onChange={this.onChangePage} />
          </div>
        </div>

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
    )
  }
}