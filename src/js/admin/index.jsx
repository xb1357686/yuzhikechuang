import React from 'react';
import { LocaleProvider } from 'antd';
import BasicLayout from './layouts/BasicLayout'
import Teacher from './education/Teacher'
import Class from './education/Class'
import Student from './education/Student'
import Product from './education/Product'

import Platform from './curriculum/Platform'
import Video from './curriculum/Video'
import My from './curriculum/My'
import Message from './setting/Message'
import zhCN from 'antd/es/locale-provider/zh_CN';
class Admin extends React.Component {
  render () {

    let out = '';
    let breadcrumbs = [];
    let menuKey = '';
    switch (window.location.hash) {
      case '#/admin/education/class':
        out = <Class />;
        menuKey = 'e_class';
        breadcrumbs = ['教务管理', '班级管理'];
        break;

      case '#/admin/education/teacher':
        out = <Teacher />;
        menuKey = 'e_teacher';
        breadcrumbs = ['教务管理', '教师管理'];
        break;

      case '#/admin/education/student':
        out = <Student />;
        menuKey = 'e_student';
        breadcrumbs = ['教务管理', '学生管理'];
        break;

      case '#/admin/education/product':
        out = <Product />;
        menuKey = 'e_product';
        breadcrumbs = ['教务管理', '作品管理'];
        break;

      case '#/admin/curriculum/platform':
        out = <Platform />;
        menuKey = 'e_platform';
        breadcrumbs = ['课程管理', '平台管理'];
        break;

      case '#/admin/curriculum/video':
        out = <Video />;
        menuKey = 'e_video';
        breadcrumbs = ['课程管理', '视频管理'];
        break;

      case '#/admin/curriculum/my':
        out = <My />;
        menuKey = 'e_my';
        breadcrumbs = ['课程管理', '我的课程'];
        break;

      case '#/admin/setting/message':
        out = <Message />;
        menuKey = 's_message';
        breadcrumbs = ['系统设置', '机构信息'];
        break;

      default:
        break;
    }
    return (
      <BasicLayout breadcrumbs={breadcrumbs} menuKey={menuKey}>
        <LocaleProvider locale={zhCN} >
          {out}
        </LocaleProvider>
      </ BasicLayout>
    )
  }
}

export default Admin