import React from 'react';
import Styles from '../css/wholeCourses.module.css';
import { Row, Col, Divider, Card} from 'antd';
import axios from 'axios';
import baseUrl from '../config/baseUrl.js'

export default class RankSpace extends React.Component {

    state = {
        allCourses: [],
        unpurchased: [],
        bought: []
    }

    componentWillMount = () => {
        this.getStuList();
    }

    /* 获取学生排行榜列表 */

    getStuList = () => {
        let _this = this;
        axios({
            method: 'get',
            url: `${baseUrl}api/lesson/queryList?id=5b039ef4fd65705278332a27`
        }).then(function (response) {
            if (response.data.code === 0) {
                _this.setState({
                    allCourses: response.data.course_catelogies
                })
                _this.getunpAllCourses();
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
    getunpAllCourses = () => {
        const data = this.state.allCourses;
        let bought = [], unpurchased = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i].Lessons;
            let colArr = [];
            let noColArr = [];
            let divider = <Divider>{data[i].name}</Divider>
            if(!element){continue} ;
        
            for (let a = 0; a < element.length; a++) {
                const list = element[a];
                if (list.buy) {
                    //已购买课程
                    colArr.push(<Col className={Styles.buyCoursesList} key={list.id} span={3}><img src={`${baseUrl}${list.icon}`} /><h3>{list.name}</h3></Col>)


                } else {
                    //未购买课程
                    noColArr.push(<Col className={Styles.noCoursesList} key={list.id} span={3}><img src={`${baseUrl}${list.icon}`} /><h3>{list.name}</h3></Col>)

                }

            }
            bought.push(<Row gutter={24} key={data[i].id}>
                {divider}
                {colArr}
            </Row>);

            unpurchased.push(<Row gutter={24} key={i}>
                {divider}
                {noColArr}
            </Row>);
        }
        this.setState({
            unpurchased:unpurchased,
            bought:bought
        })
    }



    render() {
       

        return (
            <div className={Styles.content}>
                <Card title="已购买课程">
                    {this.state.bought}
                </Card>
                <Card title="未购买课程" style={{ marginTop: '20px' }}>
                   {this.state.unpurchased}
                </Card>
            </div>
        );
    }
}
