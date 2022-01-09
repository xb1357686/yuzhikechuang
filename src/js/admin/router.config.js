import Teacher from './education/Teacher'
import Class from './education/Class'
import Student from './education/Student'
import Product from './education/Product'

import Platform from './curriculum/Platform'
import Video from './curriculum/Video'
import My from './curriculum/My'

import Message from './setting/Message'

export default [
  {
    path: '/admin',
    // component: '../layouts/BasicLayout',
    component: '',
    name: '',
    hideInMenu: true,
    redirect: '/admin/education/teacher',
    routes: [
      {
        path: '/admin/education',
        component: '',
        name: '教务管理',
        routes: [
          {
            path: '/admin/education/teacher',
            component: Teacher,
            name: '教师管理',
          },
          {
            path: '/admin/education/class',
            component: Class,
            name: '班级管理',
          },
          {
            path: '/admin/education/student',
            component: Student,
            name: '学生管理',
          },
          {
            path: '/admin/education/product',
            component: Product,
            name: '作品管理',
          },
        ]
      },
      {
        path: '/admin/curriculum',
        component: '',
        name: '课程资源',
        routes: [
          {
            path: '/admin/curriculum/platform',
            component: Platform,
            name: '平台课程',
          },
          // {
          //     path: '/admin/curriculum/my',
          //     component: My,
          //     name: '我的课程',
          // },
          {
            path: '/admin/curriculum/video',
            component: Video,
            name: '视频管理',
          },
        ]
      },
      {
        path: '/admin/setting',
        component: '',
        name: '系统设置',
        routes: [
          {
            path: '/admin/setting/message',
            component: Message,
            name: '机构信息',
          },
        ]
      },
    ]
  },

]