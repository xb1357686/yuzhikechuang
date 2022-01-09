import React from 'react';
import { Button, Row, Col, Table, Divider, Modal, Transfer, Radio, message, LocaleProvider, Select, Progress,Icon} from 'antd';
import Apirequest from '../config/apirequest';
import zhCN from 'antd/lib/locale-provider/zh_CN';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
export default class Classroom extends React.Component {

    state = {
        visible: false,
        visible2: false,
        visible3: false,
        visible4: false,
        role: '',
        userId: '',
        courseID: [],
        courseID2: '',
        selectCourseID: '',
        coursesData: [],
        coursesList: [],
        className: [],
        mockData: [],
        changeClass: [],
        targetKeys: [],
        filters: [],
        existClass: [],
        lessionData: [],
        classCode: '',
        sectionId: '',
        lineId: '',
        allStudent: [],
        completion:0,
        studentIcon:[],
        page:'1'
    }
    
    componentWillMount = () => {
        let userInfo = localStorage.getItem("userInfo");
        var role = JSON.parse(userInfo).role.name;
        var userId = JSON.parse(userInfo).id;
        this.getSelectedCoursesList(role);
        this.setState({
            role: role,
            userId: userId
        });
    }
    //班级管理
    addClass = (record, userId) => {
        const targetKeys = [];//存放已选课程code
        let selectClass = [];//对应课程中已选的班级
        for (var j = 0; j < record.class.length; j++) {
            selectClass.push(record.class[j].Code);
        }
        Apirequest.get('/user/class/created/query/' + userId)
            .then(res => {
                if (res.data.code === 0) {
                    let allClassList = [];//该教师的全部班级
                    let creatJson = res.data.classes
                    for (let i = 0; i < creatJson.length; i++) {
                        allClassList.push({
                            key: i.toString(),
                            name: creatJson[i].name,
                            code: creatJson[i].code,
                            courseID: creatJson[i]._id,
                            chosen: selectClass.indexOf(creatJson[i].code) !== -1,
                        });
                        if (allClassList[i].chosen) {
                            targetKeys.push(allClassList[i].key);
                        }
                    }
                    if (allClassList.length === 0) {
                        message.error('您目前没有班级，请先创建自己的班级');
                    }
                    this.setState({
                        mockData: allClassList,
                        targetKeys,
                        courseID2: record.currentRow,
                        visible2: true,
                    });
                }else {
                    message.error(res.data.message);
                }
            }).catch(function (error) {
                console.log(error);
            });
    }
    //班级列表渲染
    renderItem = (item) => {
        const customLabel = (
            <span className="custom-item">
                {item.name}
            </span>
        );
        return {
            label: customLabel,
            value: item.name
        };
    }
    //穿梭框内班级分配
    handleChange = (targetKeys) => {
        const { mockData } = this.state;
        let changeClass = [];
        for (let i = 0; i < targetKeys.length; i++) {
            changeClass.push({
                name: mockData[targetKeys[i]].name,
                code: mockData[targetKeys[i]].code
            })
        }
        this.setState({ targetKeys, changeClass });
    }
    //确认班级分配
    distribution = () => {
        let _this = this;
        const { courseID2, changeClass } = this.state;
        Apirequest({
            method: 'POST',
            url: `/courses/manager/edit`,
            data: {
                courseID: courseID2,
                class: changeClass,
            }
        }).then((res) => {
            if (res.data.code === 0) {
                message.success('班级分配成功！');
                _this.getSelectedCoursesList();
                this.setState({ visible2: false });
            } else {
                message.error(res.data.message);
            }
        })
    }
    //获取已添加课程进Table
    getSelectedCoursesList = (role) => {
        Apirequest.get(`/courses/manager/query`) //获取已选课程列表
            .then(res => {
                let demoList = [];
                let classNameList = [];
                if (res.data.code === 0 && res.data.courses) {
                    for (let i = 0; i < res.data.courses.length; i++) {
                        demoList.push({
                            class: res.data.courses[i].class,
                            key: i,
                            category: res.data.courses[i].course.category,
                            icon: res.data.courses[i].course.icon,
                            currentRow: res.data.courses[i].course.id,
                            name: res.data.courses[i].course.name
                        })
                        if (role === 'student') {
                            classNameList.push({
                                text: res.data.courses[i].class[0].name,
                                value: res.data.courses[i].class[0].name
                            })
                        }
                    }
                    //去重（学生获取通过哪个班级展示出的该课程）渲染进筛选框
                    let response = [classNameList[0]];	//源数组第一个元素
                    for (let p = 1; p < classNameList.length; p++) {
                        let flag = false;	//标记位，标记新数组的元素是否与源数组存在相同的
                        for (let j = 0; j < response.length; j++) {
                            if (classNameList[p].text === response[j].text) {
                                flag = true;
                                break;
                            }
                        }
                        if (!flag) {
                            response.push(classNameList[p]);
                        }
                    }
                    this.setState({
                        className: response,
                        coursesList: demoList
                    })
                }else {
                    message.error(res.data.message);
                }

            })

    }
    // //获取全部课程列表
    // getAllCoursesList = () => {
    //     let _this = this;
    //     Apirequest.get(`/courses`)                      //获取课程列表
    //         .then(res => {
    //             if (res.data.code === 0 && res.data.courses) {
    //                 this.setState({
    //                     data: res.data.courses
    //                 });
    //                 _this.showAllCoursesList(res.data.courses);
    //             }else {
    //                 message.error(res.data.message);
    //             }
    //         })
    //     this.setState({
    //         visible: true,
    //     });
    // }
    //获取全部课程列表
    getAllCoursesList = () => {
        const { page } = this.state;
        let _this = this;
        let article = 8 ;//每页展示的数量
        Apirequest.get(`/courses/${page}/${article}`)                      
            .then(res => {
                if (res.data.code === 0 && res.data.courses) {
                    this.setState({
                        coursesData: res.data.courses
                    });
                    this.setState({
                                visible: true,
                            });
                    console.log(res.data.courses)
                    _this.getCoursesClass();
                } else {
                    message.error('最后一页');
                }
            })
    }
     //获取课程分类标签
     getCoursesClass = () => {
        var radioGroup = [];
        Apirequest.get(`/courses/category`)
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
    //改变课程分类
    onChange = (e) => {
        let select = e.target.value;
        const _this = this;
        if (select === 'all') {
            this.getAllCourses(1);
            _this.setState({
                select: select,
            })
            return;
        } else {
            this.getProductTools(1, select);
            _this.setState({
                select: select,
            })
            return;
        }
    }
     //获取分类后课程列表
     getProductTools = (page, select) => {
        const _this = this;
        let article = 8 ;
        Apirequest.get(`/courses/category/${page}/${article}?category=${select}`)
            .then(res => {
                if (res.data.code === 0) {
                    console.log(res.data)
                    if (!res.data.works) {
                        _this.setState({
                            coursesData: res.data.courses,
                            loading: false,
                        })
                        return
                    }
                    if (res.data.courses.length === article) {
                        _this.setState({
                            initLoading: false,
                            loading: false,
                        })
                    }
                } else {
                    message.error('最后一页');
                }
            })
    }
    //下一页
    onLoadMore = (num) => {
        var { pageNum, select } = this.state;
            var num = pageNum + 1;
            this.setState({
                loading: true,
                pageNum: num
            });
            if (select === 'all') {
                this.getAllCourses(num);
            } else {
                this.getProductTools(num, select);
            }
    }
    
    handleCancel = () => {
        this.setState({ visible: false });
    }
   
    //确定选定的课程
    chooseCourses = (e) => {
        let courseID = []
        courseID.push(e.target.value)
        this.setState({
            courseID: courseID
        });
    }
    //确认添加课程
    confirmCourses = () => {
        let _this = this;
        const { userId, courseID } = this.state;
        Apirequest({
            method: 'POST',
            url: `/courses/manager/add`,
            data: {
                courseID: courseID,
                userID: userId,
            }
        }).then((res) => {
            if (res.data.code === 0) {
                message.success('课程添加成功！');
                _this.getSelectedCoursesList();
                this.setState({ visible: false });
            } else {
                message.error(res.data.message);
            }
        })

    }
    //进入课程详情
    getCoursesList = (record) => {
        //将课程ID sessionStorage
        sessionStorage.setItem("courseId", record.currentRow);
        this.props.history.push({ pathname: `/courseslist/${record.currentRow}`, state: { name: 'classroom' } });
    }

    handleCancel2 = () => {
        this.setState({ visible2: false });
    }

    //查看学生进度

    viewProgress = (record) => {
        let allStudent = [],sectionId
        console.log(record.class.length)
        if(record.class.length !== 0 ){
            let classCode = record.class[0].Code;
        Apirequest.get(`/courses/${record.currentRow}/lessions`) //获取课程列表
            .then(res => {
                if (res.data.code === 0) {
                    console.log(record)
                    sectionId = res.data.course.lessions[0].content[0].id
                    this.setState({
                        sectionId: sectionId,
                        lessionData: res.data.course.lessions,
                        existClass: record.class,
                        visible4: true,
                        lineId: record.currentRow
                    })
                }
                Apirequest.get(`/class/query/` + classCode) //获取班级信息
            .then(res => {
                if (res.data.code === 0) {
                    for (let i = 0; i < res.data.class.students.length; i++) {
                        allStudent.push(res.data.class.students[i])
                    }
                    this.setState({
                        classCode: classCode,
                        allStudent: allStudent
                    })
                }else {
                    message.error(res.data.message);
                }
                this.getCompleteId(sectionId,classCode,allStudent)
            })
            })
        }else{
            message.error('请先为该课程添加班级');
        }
    }
    

    //更换课结id或班级code
    classOptionsChange = (value, constant, text) => {
        const { allStudent } = this.state;
        let sectionId = '';
        let classCode = '';
        let students = allStudent;
        if (text === '修改课节') {
            sectionId = value
            classCode = constant
            this.getCompleteId(sectionId,classCode,students)
            this.setState({
                classCode: classCode,
                sectionId:sectionId
            })
        } else {
            sectionId = constant
            classCode = value
            Apirequest.get(`/class/query/` + classCode) //获取班级信息
                .then(res => {
                    if (res.data.code === 0) {
                        students = []
                        for (let i = 0; i < res.data.class.students.length; i++) {
                            students.push(res.data.class.students[i])
                        }
                        this.getCompleteId(sectionId,classCode,students)
                        this.setState({
                            allStudent: students,
                            classCode: classCode,
                            sectionId:sectionId
                        })
                    }else {
                        message.error(res.data.message);
                    }
                })
        }
      
    }
    //获取完成学生的ID

    getCompleteId = (sectionId,classCode,students) => {
        let completeId = [],
        completion,
        studentIcon = [],
        allStudentId = [];
        Apirequest.get(`/courses/lesson/students/progress?lessonID=` + sectionId + '&classCode=' + classCode) //获取完成学生的ID
            .then(res => {
                if (res.data.code === 0) {
                    for (let i = 0; i < res.data.result.length; i++) {
                        completeId.push(res.data.result[i].students.userID)
                    }

                    completion = Math.ceil((completeId.length/students.length)*100)
                    for (let k = 0; k < students.length; k++) {
                        allStudentId.push(students[k]._id)
                    }
                            for (let h = 0; h < students.length; h++) {
                                if((completeId.indexOf(allStudentId[h])) === -1){
                                    studentIcon.push(
                                    <Col style={{paddingBottom:'8px'}} span={4} key={allStudentId[h]}>
                                    <div style={{width:'50px',margin:'0 auto'}}>
                                    <Icon type="check-circle"     style={{fontSize: '50px',color:'#9e9e9e69'  }}   />
                                    </div>
                                    <div style={{textAlign:'center',paddingTop:'5px'}}>{students[h].realname}</div>
                                    </Col>
                                    )   
                                }else{
                                    studentIcon.push(
                                    <Col style={{paddingBottom:'8px'}} span={4} key={allStudentId[h]}>
                                     <div style={{width:'50px',margin:'0 auto'}}>
                                    <Icon type="check-circle" theme="twoTone"   twoToneColor="#52c41a" style={{ fontSize: '50px'}}  />
                                    </div>
                                    <div style={{textAlign:'center',paddingTop:'5px'}}>{students[h].realname}</div>
                                    </Col>
                                    )
                                }
                            }
                        }else {
                            message.error(res.data.message);
                        }
                    this.setState({
                        completion:completion,
                        studentIcon:studentIcon
                    })
                    
            })
    }

    //关闭学生进度窗口

    handleCancel4 = () => {
        this.setState({ visible4: false });
    }


    //弹出删除确认框
    deleteCourse = (record) => {
        this.setState({
            selectCourseID: record.currentRow,
            visible3: true,
        });
    }
    //确认删除
    confirmDelete = (e) => {
        const { coursesList } = this.state;
       
        let _this = this;
        Apirequest({
            method: 'POST',
            url: `/courses/manager/delete`,
            data: {
                courseID: this.state.selectCourseID,
            }
        }).then(res => {
            if (res.data.code === 0) {        //返回码为0 则正确
                message.success('删除成功！！');
                for( let i = 0;i<coursesList.length;i++){
                    if(this.state.selectCourseID === coursesList[i].currentRow){
                        coursesList.splice(i,1)
                    }
                }
                _this.setState({
                    coursesList:coursesList,
                    visible3: false,
                });
            }else {
                message.error(res.data.message);
            }
        })
    }
    handleCancel3 = (e) => {
        this.setState({
            visible3: false,
        });
    }
    render() {
        const { visible, visible2, visible4, targetKeys, coursesList, mockData, role, className, existClass, lessionData, classCode, sectionId, lineId, completion,studentIcon} = this.state;
        var showList = [], options = [], element,members = [] ;
        if ( studentIcon.length === 0 ){
            members.push(<span key={'noMembers'} style={{ marginLeft: '20px' }}>班级目前没有成员，请前往班级页面邀请同学</span>)
        }else{
            members.push(studentIcon)
        }
        const classOptions = existClass.map(data => <Option key={data.Code}>{data.name}</Option>);
        const lessionOptions = lessionData.map(data => <Option key={data.content[0].id}>{data.name}</Option>);
        var columns = [{
            title: '课程名称',
            dataIndex: 'name',
            key: 'name',
            render: text => <p>{text}</p>,
        }, {
            title: '课程封面',
            dataIndex: 'icon',
            key: 'icon',
            render: text => (
                <img src={text} alt='课程封面' style={{ width: '100px' }} />
            ),
        }, {
            title: '进入课程',
            key: 'start',
            render: (record) => (
                <span >
                    <Button onClick={() => this.getCoursesList(record)}>开始学习</Button>
                </span>
            ),
        }];
        var coursesData = this.state.coursesData;
        for (let i = 0; i < coursesData.length; i++) {
            element = coursesData[i];
            showList.push(<Col span={6}>
                <div>
                    <img style={{ width: '150px', height: '150px' }} alt='课程' src={element.icon}></img>
                </div>
                <p style={{ width: '150px', textAlign: 'center', marginTop: '2px' }}>{element.name}</p>
            </Col>)
        }
        for (let j = 0; j < coursesData.length; j++) {
            options.push(
                { label: showList[j], value: coursesData[j].id },
            )
        }
        if (role === "teacher" || role === "admin") {
            columns.push({
                title: '班级进度',
                key: 'progress',
                render: (record) => (
                    <span >
                        <Button onClick={() => this.viewProgress(record, this.state.userId)}>学生进度</Button>
                    </span>
                ),
            });
            columns.push({
                title: '课程管理',
                key: 'action',
                render: (record) => (
                    <span >
                        <Button onClick={() => this.addClass(record, this.state.userId)}>分配班级</Button>
                        <Divider type="vertical" />
                        <img src='./images/delete.png' alt='删除' style={{
                            width: '20px', paddingBottom: '2px', paddingLeft: '2px'
                        }} onClick={() => this.deleteCourse(record)} />
                    </span>
                ),
            });
        } else {
            columns.splice(2, 0, {
                title: '所属班级',
                dataIndex: 'class[0].name',
                key: 'class[0].name',
                filters: className.length > 0 ? className : null,
                filterConfirm: '确定',
                filterReset: '重置',
                emptyText: '暂无数据',
                onFilter: (value, record) => record.class[0].name.indexOf(value) === 0,
                render: text => <p>{text}</p>,
            });
        }
        return (
            <LocaleProvider locale={zhCN}>
                <div style={{ minHeight: '500px' }}>
                    <div style={{ display: 'flex' }} >
                        <div style={{ fontSize: '22px', marginBottom: '20px' }}><img src='./images/classroom.png' style={{
                            width: '30px', marginBottom: '8px'
                        }} alt='课程信息' /> 课程信息 </div>
                        <Button type="primary" style={{ marginLeft: '20px', display: this.state.role === 'student' ? 'none' : 'inline-block' }} onClick={this.getAllCoursesList}>添加课程</Button>
                        <Modal
                            visible={visible}
                            title="添加课程"
                            onOk={this.confirmCourses}
                            onCancel={this.handleCancel}
                            width={'72%'}
                            footer={[
                                <Button key="back" onClick={this.handleCancel}>取消</Button>,
                                <Button key="submit" type="primary" onClick={this.confirmCourses}> 确定 </Button>,
                            ]}
                        >
                            <Row>
                                <Col span={24}>
                                <RadioGroup defaultValue="all" size="large" onChange={this.onChange}>
                                    <RadioButton value="all" style={{ marginRight: '20px' }}>全部</RadioButton>
                                    {this.state.radioGroup}
                                </RadioGroup>
                                </Col>
                                <RadioGroup options={options} onChange={this.chooseCourses} />

                            </Row>

                        </Modal>
                        <Modal
                            width={'50%'}
                            visible={visible2}
                            title="班级管理"
                            onOk={this.distribution}
                            onCancel={this.handleCancel2}
                            footer={[
                                <Button key="submit" type="primary" onClick={this.distribution}>完成</Button>,
                            ]}
                        >
                            <Transfer
                                listStyle={{
                                    width: '44%',
                                }}
                                dataSource={mockData}
                                titles={['未选班级', '已选班级']}
                                targetKeys={targetKeys}
                                onChange={this.handleChange}
                                render={this.renderItem}
                            />
                        </Modal>
                        <Modal
                            width={'50%'}
                            visible={visible4}
                            title="学生进度"
                            onCancel={this.handleCancel4}
                            key={lineId}
                        >   
                        <div>
                            <span>课节：</span>
                            <Select defaultValue={lessionData[0] !== undefined ? lessionData[0].name : ''} onSelect={(value) => { this.classOptionsChange(value, classCode, '修改课节') }} style={{ width: 220 }}>
                                {lessionOptions}
                            </Select>
                            <span style={{ marginLeft: '30px'}}>班级：</span>
                            <Select defaultValue={existClass[0] !== undefined ? existClass[0].name : ''} onSelect={(value) => { this.classOptionsChange(value, sectionId, '修改班级') }} style={{  width: 220 }}>
                                {classOptions}
                            </Select>
                        </div>
                            <div style={{ marginTop: '30px', marginLeft: '20px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    该课节总进度：
                            </div>
                                <span style={{ marginLeft: '20px' }}>
                                    <Progress type="circle" percent={completion} format={percent => `${percent} %`}  width={120} />
                                </span>
                            </div>
                            <div style={{ marginTop: '40px', marginLeft: '20px',marginRight: '20px' }}>
                                <span >
                                    学生个人完成情况：
                            </span>
                            <Row gutter={16} style={{ marginTop: '20px' }}>
                            {members}
                            </Row>
                            </div>
                        </Modal>
                        <Modal
                            title="删除提示"
                            visible={this.state.visible3}
                            onOk={this.confirmDelete}
                            onCancel={this.handleCancel3}
                            footer={[
                                <Button key="back" onClick={this.handleCancel3}>取消</Button>,
                                <Button key="submit" type="primary" onClick={this.confirmDelete}>确定</Button>,
                            ]}
                        >
                            <p>确认删除该课程吗？</p>
                        </Modal>
                    </div>
                    <Table columns={columns}
                        dataSource={coursesList}
                        pagination={{ defaultPageSize: 4 }}
                        style={{ display: this.state.coursesList.length === 0 ? 'none' : 'block',  antTableWrapper: 'height: 650px !important' }}
                    />
                    <div style={{ display: this.state.coursesList.length === 0 ? 'block' : 'none',  minHeight: '272px' }}><img style={{marginTop : '30px'}} src='./images/noPick.png' alt="暂未选课" /></div>
                </div>
            </LocaleProvider>
        )
    }
}