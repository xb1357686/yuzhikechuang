import React from 'react';
import AxiosInstance from "../config/apirequest";
import Styles from '../../css/courses.module.css';
import { Row, Col, Icon, Drawer, Tree } from 'antd';
import { Link } from 'react-router-dom';
import ToolsMobule from "./tools-module";
import $ from "jquery";
const { TreeNode } = Tree;

/* global layer*/
export default class LefeSide extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: '',
      chapterVisible: false,
      tier: 0,
      sKeys: '',
    }
  }
  componentDidMount = () => {
    this.props.onLeftSideModule(this);
  }
  getToolsChild = (ref) => {
    this.setState({
      sKeys: this.props.sKeys
    })
    this.toolsMobule = ref;
  }
  getTreeData = async (id) => {
    const { lessionData } = this.props;
    let arr = [];
    //获取课程列表
    arr = [...lessionData]
    this.setState({
      treeData: arr,
    });
  }
  //展示章节
  showChapter = () => {
    const { treeData } = this.state;
    if (!treeData) {
      this.getTreeData(this.props.courseInfo.courseID);
    }
    this.setState({
      tier: 3,
      chapterVisible: true,
    });
  };
  onClose = () => {
    var _this = this;
    _this.setState({
      chapterVisible: false,
    });
    setTimeout(() => {
      _this.setState({
        tier: -1,
      });
    }, 280);
  }
  //选择左侧菜单栏
  selectedData = (selectedKeys) => {
    if (selectedKeys.length === 0) return;
    let id = selectedKeys[0];
    this.setState({
      sKeys: id,
      chapterVisible: false
    });
    this.state.treeData.map((elem) => {
      let findData = elem.content.find(res => res.id === id);
      if (findData) {
        //正常切换课程
        this.props.isExercise(elem);
        this.props.toggleCourseInfo(findData, "select", elem);
        return;
      }
    });
  }
  setSkeys = (id) => {
    this.setState({
      sKeys: id,
    });
  }
  render () {
    const { treeData, defaultKeys, sKeys } = this.state;
    const { courseInfo } = this.props;
    console.log('courseInfo--->', treeData)
    return (
      <Row >
        <Col md={{ span: 12, offset: 6 }} >
          <span style={{ fontSize: '30px' }} ><Link to={`/courseslist/${courseInfo.courseId}`}><Icon type="arrow-left" className={Styles.control} /></Link></span>
        </Col>
        <Col style={{ marginTop: '20px' }} md={{ span: 12, offset: 6 }}>
          <span style={{ cursor: 'pointer', textAlign: 'center', color: '#00000073' }}>
            <span onClick={() => this.showChapter()} ><Icon type="menu-unfold" className={Styles.control} /></span>
          </span>
        </Col>

        {/* <ToolsMobule getToolsChild = {this.getToolsChild} /> */}
        <Drawer
          placement="left"
          title="章节列表"
          onClose={this.onClose}
          visible={this.state.chapterVisible}
          zIndex={this.state.tier}
          className='drawerTop'
        >
          {treeData.length
            ? <Tree
              onSelect={this.selectedData}
              showIcon
              defaultExpandAll
              selectedKeys={[sKeys ? sKeys : `${treeData[0].key}`]}
              defaultSelectedKeys={[defaultKeys ? defaultKeys : `${treeData[0].key}`]}
            >
              {this.state.treeData.map(data =>
                <TreeNode icon={<Icon type={"video-camera"} theme="twoTone" />} title={data.title} key={data.key} />
              )
              }
            </Tree>

            : '课程加载失败啦'}
        </Drawer>

      </Row>
    );
  }
}
