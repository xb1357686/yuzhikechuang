import React from 'react';
import AxiosInstance from "../config/apirequest";
import { message} from 'antd';
import * as Survey from "survey-react";
import "survey-react/survey.css";

export default class AnswerModule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answerJson:''
        }
    }

    componentDidMount() {
        this.props.onAnswerModule(this);
        if(this.props.questionUrl){
            this.getExerciseJson(this.props.questionUrl);
        }
    }
    //答案提交
    onComplete = (result) => {
        const { course, treeData, nowQuestion_url, userInfo } = this.state;
        if (!userInfo) {
            message.info('只有登录了才会记录答案哦！');
            return
        }
        let lession = treeData.find(res => res.question_url === nowQuestion_url);
        let data = {
            "courseID": course.id,
            "lessonID": lession.id,
            "couerseName": course.name,
            "lessonName": lession.name,
            "answer": JSON.stringify(result.data)
        }
        AxiosInstance({
            method: 'post',
            url: '/exercise',
            data: data
        })
            .then((res) => {
                console.log(res);
            })
    }
    getExerciseJson = (url)=>{
        fetch(url).then((response) => response.text()).then((text) => {
            this.setState({
                answerJson:text
            })
        })
    }
    componentWillReceiveProps = (nextProps) =>{
        if(nextProps.questionUrl){
            this.getExerciseJson(nextProps.questionUrl);
        }else{
            this.setState({
                answerJson:""
            })
        }
        
    }
    //答案选择切换
    onValueChanged = (result) => {
        console.log("value changed!");
    }

    render() {
        var model = new Survey.Model(this.state.answerJson);
        return (
           <div style={{marginLeft: '2%',minHeight:'500px'}} >
               {this.props.questionUrl?<Survey.Survey
                model={model}
                completeText='提交'
                pageNextText='下一题'
                pagePrevText='上一题'
                startSurveyText='开始答题'
                onComplete={this.onComplete}
                onValueChanged={this.onValueChanged}
            />:'本小节暂时还没有练习哦'}
           </div>
            
        );
    }
}
