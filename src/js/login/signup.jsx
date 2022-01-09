import React from 'react';
import { Row, Radio, Select, Input, Button, Modal,Col } from 'antd';
//import axios from 'axios';
import Styles from '../../css/sign.module.css';
import { connect } from 'react-redux';
import {gotoLogin} from '../../actions';
import axios from '../config/apirequest.js';

// const TabPane = Tabs.TabPane;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


var ClassList = [
  {
    "index": "0",
    "className": "小学",
    "class": [
      {
        "classindex": "0",
        "classList": "一年级",
        "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      },
      {
        "classindex": "1",
        "classList": "二年级",
        "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      },
      {
        "classindex": "2",
        "classList": "三年级",
        "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      },
      {
        "classindex": "3",
        "classList": "四年级",
        "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      },
      {
        "classindex": "4",
        "classList": "五年级",
        "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      },
      {
        "classindex": "5",
        "classList": "六年级",
        "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      }]
  },
  {
    "index": "1",
    "className": "初中",
    "class": [{
      "classindex": "0",
      "classList": "一年级",
      "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    },
    {
      "classindex": "1",
      "classList": "二年级",
      "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    },
    {
      "classindex": "2",
      "classList": "三年级",
      "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    }]
  },
  {
    "index": "2",
    "className": "高中",
    "class": [{
      "classindex": "0",
      "classList": "一年级",
      "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    },
    {
      "classindex": "1",
      "classList": "二年级",
      "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    },
    {
      "classindex": "2",
      "classList": "三年级",
      "list": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    }]
  }
]

class Signup extends React.Component {
  StuJson = {
    "username": "",
    "password": "",
    "realname": "",
    "gender": 0,
    "grade": 1,
    "class": 1,
    "role": "student"
  }
  TchJson = {
    "username": "",
    "password": "",
    "realname": "",
    "gender": 0,
    "prodKey": "",
    "role": "teacher"
  }
  state = {
    grades: ClassList[0].class[0].classList, //选择的年级名称
    classes: ClassList[0].class[0].list[0], //选择的班名称
    index: ClassList[0],  // 选择的学校级别
    classlists: ClassList[0].class[0].list, //班列表
    level: 0,
    secondLevel: 1,   //选择的年纪级别
    Role: "student",
    minHeight:0,
  }
  componentWillMount = () => {
    var height = document.body.clientHeight - 64 -164 + 'px';   //页面中间可视高度
    this.setState({minHeight:height})
}
  //更改学校级
  handleSchoolLevelChange = (value) => {
    this.setState({
      index: ClassList[value],
      grades: ClassList[value].class[0].classList,
      classes: ClassList[value].class[0].list[0]
    });
  }
  //改变年级
  ongradesChange = (value) => {
    this.setState({
      grades: this.state.index.class[value].classList,
      classes: this.state.index.class[value].list[0],
      classlists: ClassList[0].class[value].list,
      secondLevel : Number(value) + 1
    });

  }
  //改变班
  onclassesChange = (value) => {
    this.setState({
      classes: this.state.classlists[value - 1],
    })
  }
  //计算年级 
  calcGrade(level,secondLevel) {
    if (level === 0) {
      return secondLevel;
    } else if (level === 1) {
      return secondLevel+6;

    } else if (level === 2) {
      return secondLevel + 9;
    }    
  }
  onsetUserName = (event) => {
    this.StuJson.username = (event.target.value);
  }

  onsetRealName = (event) => {
    this.StuJson.realname = (event.target.value);
  }

  onsetGender = (event) => {
    this.StuJson.gender = Number(event.target.value);
  }

  onsetPassword = (event) => {
    this.StuJson.password = (event.target.value);
  }

  onsetTchName = (event) => {
    this.TchJson.username = (event.target.value);
  }

  onsetTchRealname = (event) => {
    this.TchJson.realname = (event.target.value);
  }

  onsetTchGender = (event) => {
    this.TchJson.gender = Number(event.target.value);
  }

  onsetTchPassWord = (event) => {
    this.TchJson.password = (event.target.value);
  }

  onsetprodKey = (event) => {
    this.TchJson.prodKey = (event.target.value)
  }

  onsetRole = (key) => {
    this.setState({
      Role : key
    })
  }
  
  signup = () => {
    const { dispatch } = this.props;
    var _this = this;
    // 发送 POST 请求
    if(this.state.Role === "student") {
      this.StuJson.grade = this.calcGrade(Number(this.state.index.index),this.state.secondLevel);
      this.StuJson.class = Number(this.state.classes);
    }
    let data = this.state.Role === "student"?this.StuJson:this.TchJson;

    axios({
      method: 'post',
      url: '/passport/register',
      data: data
    }).then(function (response) {
      if (response.data.code === 0) {
        localStorage.setItem("userIsSign", true);
        function success() {
          Modal.success({
            title: '注册成功',
            content: '请点击OK按钮前往登录！',
            onOk() {
              _this.props.history.push('/');
              dispatch(gotoLogin(true));
            }
          });
        }
        success();
      } else {
        function error() {
          Modal.error({
            title: '注册失败',
            content: '原因：' + response.data.message,
          });
        }
        error();
      }
    })
      .catch(function (error) {
        console.log(error);
      });
  }
  render() {
    const levelOptions = ClassList.map(data => <Option key={data.index}>{data.className}</Option>);
    const gradeOptions = this.state.index.class.map(data => <Option key={data.classindex}>{data.classList}</Option>);
    const classOptions = this.state.classlists.map(data => <Option key={data}>{data}</Option>);
    return (
      <div style={{minHeight:this.state.minHeight}}>
        <Row className={Styles.signContent}>
            <Col sm={{span:12}} xs={{span:24}}>
              <img src="./images/signBG.png" alt=""/>
            </Col>
            <Col sm={{span:12}} xs={{span:24}} >
              <div className={Styles.signRightContent}>
                {/* <h3>用以下身份加入创客教育 :</h3> */}
                {/* <Tabs  defaultActiveKey="student" tabBarStyle={{  width: '60px', margin: '0 auto' }} type="line" onChange={this.onsetRole}> */}
                  {/* <TabPane tab="学生" key="student"> */}
                  <div >
                    <div>
                      <h3>输入一个用户名 :</h3>
                      <Input placeholder="长度为4~20位，仅能使用字母，数字，'-'，'_'" onBlur={this.onsetUserName} size='default' maxLength='20' />
                    </div>
                    <div>
                      <h3>请输入您的名字 :</h3>
                      <Input placeholder="长度为1-5个字符" onBlur={this.onsetRealName} size='default' maxLength='5'/>
                    </div>
                    <div>
                      <h3>请选择您的性别 :</h3>
                      <RadioGroup defaultValue="0" size='default' onChange={this.onsetGender} style={{ width: '80%', margin: '0 auto' }}>
                        <RadioButton value="0">男生</RadioButton>
                        <RadioButton value="1">女生</RadioButton>
                      </RadioGroup>
                    </div>
                    <div>
                      <h3>请选择您的年级与班级 :</h3>
                      <Select defaultValue={ClassList[0].className} onSelect={this.handleSchoolLevelChange} size='default'>
                        {levelOptions}
                      </Select>
                      <Select value={this.state.grades} onChange={this.ongradesChange} size='default'>
                        {gradeOptions}
                      </Select>
                      <Select value={this.state.classes} style={{paddingRight:'12px'}} onChange={this.onclassesChange} size='default'>
                        {classOptions}
                      </Select>
                    </div>
                    <div>
                      <h3>请输入您的密码 :</h3>
                      <Input placeholder="密码长度为6~16位"  type="password" onBlur={this.onsetPassword} size='default' maxLength='16'/>
                    </div>
                  </div>
                  {/* </TabPane> */}
                  {/* <TabPane tab="教师" key="teacher"><div >
                    <div>
                      <h3>输入一个用户名 :</h3>
                      <Input placeholder="长度为4~20位，仅能使用字母，数字，'-'，'_'" onBlur={this.onsetTchName} size='default' />
                    </div>
                    <div>
                      <h3>请输入您的名字 :</h3>
                      <Input placeholder="名字" size='default' onBlur={this.onsetTchRealname} />
                    </div>
                    <div>
                      <h3>请选择您的性别 :</h3>
                      <RadioGroup defaultValue="0" size='default' onChange={this.onsetTchGender} style={{ width: '80%', margin: '0 auto' }}>
                        <RadioButton value="0">男生</RadioButton>
                        <RadioButton value="1">女生</RadioButton>
                      </RadioGroup>
                    </div>
                    <div>
                      <h3>请输入密钥(key) :</h3>
                      <Input placeholder="产品密钥" size='default' onBlur={this.onsetprodKey}/>
                    </div>
                    <div>
                      <h3>请输入您的密码 :</h3>
                      <Input placeholder="密码" size='default' type="password" onBlur={this.onsetTchPassWord}/>
                    </div>
                  </div></TabPane> */}
                {/* </Tabs> */}
                <Button type="primary" size='large' onClick={this.signup}>注册</Button>
              </div>
            </Col>
        </Row>
      </div>
    );
  }
}

export default connect()(Signup);