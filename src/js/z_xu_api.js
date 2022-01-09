import apirequest from "./config/apirequest";
const apiUrl = 'http://122.51.68.117:8555'
const token = localStorage.getItem('userToken');

export const selectPage = (parms) => {
  return apirequest({
    method: 'post',
    data: parms,
    url: `${apiUrl}/teacher/selectPage`
  })
}

export const addTeacher = (parms) => {
  return apirequest({
    method: 'post',
    data: parms,
    url: `${apiUrl}/teacher`,
    headers: {
      Authorization: token,
    },
  })
}

export const putTeacher = (parms) => {
  return apirequest({
    method: 'put',
    data: parms,
    url: `${apiUrl}/teacher`,
    headers: {
      Authorization: token,
    },
  })
}

export const deleteTeacher = (parms) => {
  return apirequest({
    method: 'DELETE',
    data: parms,
    url: `${apiUrl}/teacher`,
    headers: {
      Authorization: token,
    },
  })
}

export const getSchool = (parms) => {
  return apirequest({
    method: 'get',
    url: `${apiUrl}/school`,
    headers: {
      Authorization: token,
    },
  })
}

export const putSchool = (parms) => {
  return apirequest({
    method: 'put',
    data: parms,
    url: `${apiUrl}/school`,
    headers: {
      Authorization: token,
    },
  })
}

export const getParent = (parms) => {
  return apirequest({
    method: 'get',
    url: `${apiUrl}/region/parent/${parms}`,
    headers: {
      Authorization: token,
    },
  })
}

export const rgetegion = (parms) => {
  return apirequest({
    method: 'get',
    url: `${apiUrl}/region/${parms}`,
    headers: {
      Authorization: token,
    },
  })
}


// 班级管理
export const getClass = (parms) => {
  return apirequest({
    method: 'POST',
    data: parms,
    url: `${apiUrl}/grade/selectPage`,
    headers: {
      Authorization: token,
    },
  })
}

export const addClass = (parms) => {
  return apirequest({
    method: 'POST',
    data: parms,
    url: `${apiUrl}/grade`,
    headers: {
      Authorization: token,
    },
  })
}
export const editClass = (parms) => {
  return apirequest({
    method: 'PUT',
    data: parms,
    url: `${apiUrl}/grade`,
    headers: {
      Authorization: token,
    },
  })
}
export const deleteClass = (parms) => {
  return apirequest({
    method: 'DELETE',
    data: parms,
    url: `${apiUrl}/grade`,
    headers: {
      Authorization: token,
    },
  })
}
// excel批量导出学生
export const exportStudent = (parms) => {
  return apirequest({
    method: 'POST',
    data: parms,
    responseType: 'blob',
    url: `${apiUrl}/grade/exportStudent`,
    headers: {
      Authorization: token,
    },
  })
}
export const importStudent = (parms) => {
  return apirequest({
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: parms,
    url: `${apiUrl}/grade/importStudent`,
    headers: {
      Authorization: token,
    },
  })
}
export const importStudentTempl = (parms) => {
  return apirequest({
    method: 'GET',
    data: parms,
    responseType: 'blob',
    url: `${apiUrl}/grade/importStudentTempl`,
    headers: {
      Authorization: token,
    },
  })
}

// 学生管理
export const studentSelectPage = (parms) => {
  return apirequest({
    method: 'POST',
    data: parms,
    url: `${apiUrl}/student/selectPage`,
    headers: {
      Authorization: token,
    },
  })
}

export const deleteStudent = (parms) => {
  return apirequest({
    method: 'DELETE',
    data: parms,
    url: `${apiUrl}/student`,
    headers: {
      Authorization: token,
    },
  })
}


// 获取分类

export const classifysElectPage = (parms) => {
  return apirequest({
    method: 'post',
    data: parms,
    url: `${apiUrl}/classify/selectPage`,
    headers: {
      Authorization: token,
    },
  })
}

// 学生管理 -修改密码
export const putStudent = (parms) => {
  return apirequest({
    method: 'PUT',
    data: parms,
    url: `${apiUrl}/student`,
    headers: {
      Authorization: token,
    },
  })
}

export const addStudent = (parms) => {
  return apirequest({
    method: 'POST',
    data: parms,
    url: `${apiUrl}/student`,
    headers: {
      Authorization: token,
    },
  })
}

// 视频管理
export const videoSelectPage = (parms) => {
  return apirequest({
    method: 'POST',
    data: parms,
    url: `${apiUrl}/video/selectPage`,
    headers: {
      Authorization: token,
    },
  })
}

// 新增视频
export const addvVideo = (parms) => {
  return apirequest({
    method: 'POST',
    data: parms,
    url: `${apiUrl}/video`,
    headers: {
      Authorization: token,
    },
  })
}

// 删除视频
export const deleteVideo = (parms) => {
  return apirequest({
    method: 'DELETE',
    data: parms,
    url: `${apiUrl}/video`,
    headers: {
      Authorization: token,
    },
  })
}

// 作品
export const workSelectPage = (parms) => {
  return apirequest({
    method: 'POST',
    data: parms,
    url: `${apiUrl}/work/selectPage`,
    headers: {
      Authorization: token,
    },
  })
}

export const addWork = (parms) => {
  return apirequest({
    method: 'POST',
    data: parms,
    url: `${apiUrl}/work`,
    headers: {
      Authorization: token,
    },
  })
}

export const putWork = (parms) => {
  return apirequest({
    method: 'PUT',
    data: parms,
    url: `${apiUrl}/work`,
    headers: {
      Authorization: token,
    },
  })
}

export const deleteWork = (parms) => {
  return apirequest({
    method: 'DELETE',
    data: parms,
    url: `${apiUrl}/work`,
    headers: {
      Authorization: token,
    },
  })
}

// 获取工具
export const portalTools = (parms) => {
  return apirequest({
    method: 'GET',
    data: parms,
    url: `${apiUrl}/portal/0`,
    headers: {
      Authorization: token,
    },
  })
}

// 获取课程
export const courseSelectPage = (parms) => {
  return apirequest({
    method: 'POST',
    data: parms,
    url: `${apiUrl}/course/selectPage`,
    headers: {
      Authorization: token,
    },
  })
}


// 添加课程
export const addCourse = (parms) => {
  return apirequest({
    method: 'POST',
    data: parms,
    url: `${apiUrl}/course`,
    headers: {
      Authorization: token,
    },
  })
}

// 获取课程详情
export const getCourse = (parms) => {
  return apirequest({
    method: 'GET',
    url: `${apiUrl}/course/${parms}`,
    headers: {
      Authorization: token,
    },
  })
}

// 修改课程
export const putCourse = (parms) => {
  return apirequest({
    method: 'PUT',
    data: parms,
    url: `${apiUrl}/course`,
    headers: {
      Authorization: token,
    },
  })
}


// 获取工具详情
export const getWork = (parms) => {
  return apirequest({
    method: 'GET',
    url: `${apiUrl}/work/${parms}`,
    headers: {
      Authorization: token,
    },
  })
}

// 点赞
export const postWorkLike = (parms) => {
  return apirequest({
    method: 'GET',
    url: `${apiUrl}/work/like/${parms.type}/${parms.parms}`,
    headers: {
      Authorization: token,
    },
  })
}
