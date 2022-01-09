import React from 'react';
import Styles from '../../css/space.module.css';
import { Row, Col,  Popover } from 'antd';
import axiosInstance from "../config/apirequest"
import {baseUrl} from '../config/baseUrl.js'

export default class MedalSpace extends React.Component {
    state = {
        medalList: []
    }

    componentWillMount = () => {
        this.getMedal()
    }


    /* 获取徽章列表 */

    getMedal = () => {
        let _this = this;
        axiosInstance({
            method: 'get',
            url: '/medal/all'
        }).then(function (response) {
            if (response.data.code === 0) {
                _this.setState({
                    medalList: response.data.result.medals
                })
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }

    /* 判断用户是否获得徽章 */

    decidemedals = (value) => {
        let medals = JSON.parse(localStorage.getItem("userInfo")).medals;
        if(medals !== null){
            for (var i = 0; i < medals.length; i++) {
                if (medals[i].name === value) {
                    return true
                } else {
                    return false
                }
            }
        }else{
            return false
        }
        
    }

    render() {
        var medals = []
        for (var i = 0; i < this.state.medalList.length; i++) {
          //  medals.push(<Divider key={this.state.medalList[i].type}>{this.state.medalList[i].type}</Divider>)
            medals.push(this.state.medalList[i].entities.map(data => {
                if (this.decidemedals(data.name) === true) { 
                    return (
                    <div key={data.name} className={Styles.medalcss}>
                        <Popover content={<p>{data.description}</p>} title={data.name}>
                            <img src={baseUrl + data.image} className={Styles.isGet} alt="" />
                        </Popover>
                        <h3>{data.name}</h3>
                    </div>)
                } else { 
                    return (
                    <div key={data.name} className={Styles.medalcss}>
                        <Popover content={<p>{data.description}</p>} title={data.name}>
                            <img src={baseUrl + data.image} alt="" className={Styles.noGet} />
                        </Popover>
                        <h3>{data.name}</h3>
                    </div>)
                }
            }))
        }

        return (
            <Row style={{ minHeight: "500px" }}>
                <Col span={2}></Col>
                <Col span={20}>
                    {medals}
                </Col>
                <Col span={2}></Col>
            </Row>
        );
    }
}
