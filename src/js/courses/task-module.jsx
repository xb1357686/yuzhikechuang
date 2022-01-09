import React from 'react';
import Styles from '../../css/courses.module.css';
import Markdown from "react-markdown";

export default class TaskModule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            terms: null,
            basePath:'',
        }
    }
    componentDidMount() {
        this.props.onTaskMdModule(this);
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
            <div className={Styles.taskMD}>
                {terms ? <Markdown source={this.state.terms}
                    transformImageUri={(link) => {
                        return basePath + link
                    }}
                /> : '该课程无任务！'}
            </div>
        );
    }
}