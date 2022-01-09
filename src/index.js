import React from 'react';
import ReactDOM from 'react-dom';
import ConfigureStore from './stores';
import {
  Route,
  HashRouter,
  Switch
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { isLogin } from "./js/util/utils";
import Layout from './js/layout'
const store = ConfigureStore();
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null
    };
  }
  componentDidMount = () => {
    window.isLogin = isLogin
  }
  getUserInfo = (data) => {
    this.setState({
      userInfo: data
    })
  }

  render () {

    return (
      <HashRouter>
        <div style={{ height: '100%', width: '100%' }}>
          <Switch>
            <Route path="/" render={(props) => <Layout {...props} UserInfo={this.state.userInfo} />}></Route>
          </Switch>
        </div>
      </HashRouter>
    )
  }
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
