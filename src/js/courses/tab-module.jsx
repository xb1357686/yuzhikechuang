import React from 'react';
import Styles from '../../css/courses.module.css';
import Markdown from "react-markdown";
export default class TabMdModule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            terms: null,
            basePath:'',
            noTask:false
        }
    }
    componentDidMount() {
        if(this.props.taskUrl === ''){
            this.state = {
                noTask:true
            }
        }
        else{
            this.getMdUrl(this.props.taskUrl)
        }
        
    }
    componentWillReceiveProps = (nextProps) =>{
        this.getMdUrl(nextProps.taskUrl)
        // this.setState({ 
        //     videoHeight:nextProps.videoHeight 
        // }); 
    }
    //父节点调用获取mdurl；
    getMdUrl = (mdUrl) => {
        let index = mdUrl.lastIndexOf('/');
        let path = mdUrl.substring(0, index + 1);
        this.setState({
            basePath:path
        })
        this.getMDText(mdUrl);
    }
    getMDText = (mdUrl) => {
        fetch(mdUrl).then((response) => response.text()).then((text) => {
            this.setState({ terms: text });
        })
    }
    render() {
        const { terms,basePath } = this.state;
        return (
            <div>
            <div className={Styles.courseMD}   style={{ display: this.state.noTask ? 'block' : 'none'}}>
                {terms ? <Markdown source={this.state.terms}
                    transformImageUri={(link) => {
                        return basePath + link
                    }}
                /> : '该课程无任务！'}
            
            </div>
            <div style={{ display: this.state.noTask ? 'none' : 'block',marginLeft: '2%',minHeight:'500px'}} >该课程无任务</div>
            </div>
           
        );
    }
}