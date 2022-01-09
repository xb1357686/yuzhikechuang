import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import './index.less';
import {
  Route,
  Switch,
  Redirect
} from 'react-router-dom';

import routes from '../router.config'


const { Sider, Content } = Layout;
const { SubMenu } = Menu;

const renderMenu = (routes) => {
  return routes.map((item, index) => {
    if (item.routes) {
      if (item.hideInMenu) {
        return renderMenu(item.routes)
      }
      return <SubMenu key={item.path} title={item.name}>
        {renderMenu(item.routes)}
      </SubMenu>
    }

    return <Menu.Item key={item.path}><a href={`#${item.path}`}>{item.name}</a></Menu.Item>
  })
}

const renderRoutes = (routes) => {
  return routes.map((item) => {
    if (item.routes) {
      return renderRoutes(item.routes)
    }
    return <Route exact path={item.path} key={item.path} component={item.component} />
  })
}

const setRoutes = (routes) => {
  const result = {};
  routes.forEach(item => {
    const loop = (data, parentName) => {
      result[data.path] = [parentName, data.name];
      let routes = data.routes
      if (routes) {
        for (let i = 0; i < routes.length; i++) {
          loop(routes[i], data.name)
        }
      }
    }
    loop(item, item.name);
  })

  return result;
}

const Routes = setRoutes(routes);

export default class BasicLayout extends React.PureComponent {
  state = {
    collapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };
  render () {
    const menuKey = window.location.hash.split('#')[1] === '/admin' ? '/admin/education/teacher' : window.location.hash.split('#')[1]
    let openKeys = '';
    if (menuKey.indexOf('/admin/education') !== -1) {
      openKeys = '/admin/education';
    } else if (menuKey.indexOf('/admin/curriculum') !== -1) {
      openKeys = '/admin/curriculum';
    } else if (menuKey.indexOf('/admin/setting') !== -1) {
      openKeys = '/admin/setting';
    }


    return (
      <Layout style={{ minHeight: 'calc(100% - 191px)' }}>
        <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
          {/* <div className="logo" /> */}
          <Menu theme="dark" selectedKeys={[menuKey]} defaultOpenKeys={[openKeys]} mode="inline" >
            {
              renderMenu(routes)
            }

            {/* <SubMenu key="education" title="教务管理">
							<Menu.Item key="e_teacher"><a href="#/admin/education/teacher">教师管理</a></Menu.Item>
							<Menu.Item key="e_class"><a href="#/admin/education/class">班级管理</a></Menu.Item>
							<Menu.Item key="e_student"><a href="#/admin/education/student">学生管理</a></Menu.Item>
							<Menu.Item key="e_product"><a href="#/admin/education/product">作品管理</a></Menu.Item>
						</SubMenu>
            <SubMenu key="curriculum" title="课程管理">
							<Menu.Item key="e_platform"><a href="#/admin/curriculum/platform">平台管理</a></Menu.Item>
							<Menu.Item key="e_my"><a href="#/admin/curriculum/my">我的课程</a></Menu.Item>
							<Menu.Item key="e_video"><a href="#/admin/curriculum/video">视频管理</a></Menu.Item>
						</SubMenu>
            <SubMenu key="setting" title="系统设置">
							<Menu.Item key="s_message"><a href="#/admin/setting/message">机构信息</a></Menu.Item>
						</SubMenu> */}
          </Menu>
        </Sider>
        <Layout>
          {/* <Header style={{ background: '#fff', padding: 0 }}>
						<Icon
              className="trigger"
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
						/>
					</Header> */}
          <Content>
            <Breadcrumb style={{ padding: '16px', background: '#fff', marginTop: 1 }}>
              {
                Routes[menuKey].map((item, index) => (
                  <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>
                ))
              }

            </Breadcrumb>
            <div style={{
              margin: '0 16px 24px',
              minHeight: 280,
              padding: 24,
            }}>
              <Switch>
                {
                  renderRoutes(routes)
                }
                <Redirect from='/admin' to='/admin/education/teacher' />
              </Switch>

              {this.props.children}
            </div>

          </Content>
        </Layout>
      </Layout>
    )
  }
}