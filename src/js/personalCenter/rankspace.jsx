import React from 'react';
import Styles from '../../css/space.module.css';
import { Row, Col } from 'antd';
import axiosInstance from "../config/apirequest"
import {baseUrl} from '../config/baseUrl.js'

export default class RankSpace extends React.Component {

    state = {
        stuList: [],
        ClassList: []
    }

    componentWillMount = () => {
        this.getStuList();
    }

    /* 获取学生排行榜列表 */

    getStuList = () => {
        let _this = this;
        axiosInstance({
            method: 'get',
            url: '/user/rank/calculus'
        }).then(function (response) {
            if (response.data.code === 0) {
                _this.setState({
                    stuList: response.data.rank
                })
            } else {
                _this.setState({
                    stuList: ""
                })
            }
        })
            .catch(function (error) {
                console.log(error);
            });

    }
    //进入个人中心
    goPersonalCenter = (data) =>{
        let userID = data._id
        this.props.history.push({ pathname: `/personalCenter/${userID}`, state: { userID } })
    }

    render() {
        var stuRankTop = [],stuRankBottom = [];
        if (this.state.stuList !== []) {
            this.state.stuList.map((data,index) => {
                if (index < 3) {
                    stuRankTop.push(<li key={index} style={{cursor: 'pointer'}} onClick={() => this.goPersonalCenter(data)}><img src={baseUrl + data.avatar}  alt="" /> <span    >{data.realname}</span> <p>积分:{data.calculus ? data.calculus : 0}</p></li>)
                    return stuRankTop;
                } else {
                    stuRankBottom.push(<li  key={index} style={{cursor: 'pointer',marginBottom:'6px'}} onClick={() => this.goPersonalCenter(data)} >
                                <span style={{display:'inline-block',width:'40px' ,height:'54px',padding:'10px'}}>{index +1 }</span>
                                <img src={baseUrl + data.avatar} alt="" />
                                <span >{data.realname}</span>
                                <span style={{marginTop:'12px'}} >积分:{data.calculus ? data.calculus : 0}</span>
                            </li>)
                        return stuRankBottom;
                }
            }
            )
        } else {
            stuRankTop = <span>no data</span>
        }
        return (
            <Row style={{ minHeight: "500px" }}>
                <Col span={6}>
                </Col>
                <Col span={12} style={{ minHeight: "500px", padding: "0 10px" }}>
                    <ul className={`${Styles.rankul} ${Styles.clearfix}`}>{stuRankTop}</ul>
                    <ul className={Styles.rankulBottom}>{stuRankBottom}</ul>
                </Col>
                <Col span={6}>
                </Col>
            </Row>
        );
    }
}
