import { useState, useEffect } from 'react';
import ScheduleTable from './components/ScheduleTable';
import ExcelImport from './components/ExcelImport';
import HomeworkManager from './components/HomeworkManager';
import CalendarView from './components/CalendarView';
import Statistics from './components/Statistics';

const MOCK_COURSES = [
  { id: 1, name: '移动应用开发', teacher: '李明', classroom: '机房8', day: '周一', period: 2, weeks: [1,2,3,4] },
  { id: 2, name: 'Python程序设计', teacher: '王芳', classroom: 'IT实训中心', day: '周一', period: 3, weeks: [5,6,7,8] },
  { id: 3, name: '计算机网络', teacher: '张伟', classroom: '二东101', day: '周一', period: 5, weeks: [9,10,11,12] },
  { id: 4, name: 'Linux操作系统', teacher: '赵强', classroom: '机房10', day: '周一', period: 2, weeks: [13,14,15,16] },
  
  { id: 5, name: '计算机系统结构', teacher: '孙磊', classroom: '二东102', day: '周二', period: 1, weeks: [1,2,3,4,5,6,7,8] },
  { id: 6, name: '信息安全', teacher: '陈静', classroom: '二东102', day: '周二', period: 3, weeks: [9,10,11,12,13,14,15,16] },
  { id: 7, name: '单片机及嵌入式系统', teacher: '刘洋', classroom: '机房7', day: '周二', period: 4, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16] },
  { id: 8, name: '创新与创业', teacher: '周婷', classroom: '机房10', day: '周二', period: 2, weeks: [1,3,5,7,9,11,13,15] },
  
  { id: 9, name: '移动应用开发', teacher: '李明', classroom: '机房8', day: '周三', period: 4, weeks: [1,2,3,4] },
  { id: 10, name: 'Python程序设计', teacher: '王芳', classroom: 'IT实训中心', day: '周三', period: 1, weeks: [5,6,7,8] },
  { id: 11, name: '计算机网络', teacher: '张伟', classroom: '二东101', day: '周三', period: 5, weeks: [9,10,11,12] },
  { id: 12, name: 'Linux操作系统', teacher: '赵强', classroom: '机房10', day: '周三', period: 3, weeks: [13,14,15,16] },
  
  { id: 13, name: '计算机系统结构', teacher: '孙磊', classroom: '二东103', day: '周四', period: 3, weeks: [1,2,3,4,5,6,7,8] },
  { id: 14, name: '信息安全', teacher: '陈静', classroom: '二西401', day: '周四', period: 2, weeks: [9,10,11,12,13,14,15,16] },
  { id: 15, name: '单片机及嵌入式系统', teacher: '刘洋', classroom: '机房7', day: '周四', period: 5, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16] },
  { id: 16, name: '创新与创业', teacher: '周婷', classroom: '机房10', day: '周四', period: 4, weeks: [2,4,6,8,10,12,14,16] },
  
  { id: 17, name: '移动应用开发', teacher: '李明', classroom: '机房8', day: '周五', period: 1, weeks: [1,2,3,4] },
  { id: 18, name: 'Python程序设计', teacher: '王芳', classroom: 'IT实训中心', day: '周五', period: 4, weeks: [5,6,7,8] },
  { id: 19, name: '计算机网络', teacher: '张伟', classroom: '二东101', day: '周五', period: 2, weeks: [9,10,11,12] },
  { id: 20, name: 'Linux操作系统', teacher: '赵强', classroom: '机房10', day: '周五', period: 5, weeks: [13,14,15,16] },
  
  { id: 21, name: '计算机系统结构', teacher: '孙磊', classroom: '二东102', day: '周六', period: 2, weeks: [1,3,5,7] },
  { id: 22, name: '信息安全', teacher: '陈静', classroom: '二东102', day: '周六', period: 4, weeks: [9,11,13,15] },
  
  { id: 23, name: '单片机及嵌入式系统', teacher: '刘洋', classroom: '机房7', day: '周日', period: 1, weeks: [2,4,6,8] },
  { id: 24, name: '创新与创业', teacher: '周婷', classroom: '机房10', day: '周日', period: 3, weeks: [10,12,14,16] },
];

const MOCK_HOMEWORKS = [
  {
    id: 1,
    title: 'React Native组件封装',
    description: '封装一个可复用的下拉刷新组件，支持自定义刷新动画',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    courseId: 1,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: '数据可视化实战',
    description: '使用matplotlib绘制销售数据趋势图，分析季度增长情况',
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    courseId: 2,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'HTTP协议分析',
    description: '抓包分析浏览器与服务器的HTTP交互过程，分析请求头和响应头',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    courseId: 3,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'ADC采集实验',
    description: '使用ADC模块采集模拟信号，实现温度传感器数据采集和显示',
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    courseId: 7,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: '防火墙规则配置',
    description: '配置iptables防火墙规则，实现端口转发和访问控制',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    courseId: 6,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    title: '进程管理实验',
    description: '实现进程创建、调度和销毁，观察进程状态变化',
    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'low',
    courseId: 4,
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const NAV_ITEMS = [
  { id: 'schedule', label: '课程表', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )},
  { id: 'import', label: '导入课表', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )},
  { id: 'homework', label: '作业管理', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )},
  { id: 'calendar', label: '日历视图', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )},
  { id: 'statistics', label: '数据统计', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  )},
];

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab');
    return savedTab || 'schedule';
  });
  const [courses, setCourses] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCourses = localStorage.getItem('courses');
    const savedHomeworks = localStorage.getItem('homeworks');
    
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      setCourses(MOCK_COURSES);
      localStorage.setItem('courses', JSON.stringify(MOCK_COURSES));
    }
    
    if (savedHomeworks) {
      setHomeworks(JSON.parse(savedHomeworks));
    } else {
      setHomeworks(MOCK_HOMEWORKS);
      localStorage.setItem('homeworks', JSON.stringify(MOCK_HOMEWORKS));
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('courses', JSON.stringify(courses));
    }
  }, [courses, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('homeworks', JSON.stringify(homeworks));
    }
  }, [homeworks, isLoaded]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleResetData = () => {
    if (confirm('确定要重置所有数据吗？这将恢复到初始状态。')) {
      localStorage.removeItem('courses');
      localStorage.removeItem('homeworks');
      setIsLoaded(false);
      setTimeout(() => {
        setCourses(MOCK_COURSES);
        setHomeworks(MOCK_HOMEWORKS);
        localStorage.setItem('courses', JSON.stringify(MOCK_COURSES));
        localStorage.setItem('homeworks', JSON.stringify(MOCK_HOMEWORKS));
        setIsLoaded(true);
        showToast('数据已重置');
      }, 0);
    }
  };

  const handleAddCourse = (course) => {
    setCourses([...courses, course]);
    showToast('课程添加成功');
  };

  const handleUpdateCourse = (updatedCourse) => {
    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    showToast('课程更新成功');
  };

  const handleDeleteCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id));
    showToast('课程已删除', 'info');
  };

  const handleImportCourses = (importedCourses) => {
    setCourses(importedCourses);
    showToast(`成功导入 ${importedCourses.length} 门课程`);
  };

  const handleAddHomework = (homework) => {
    setHomeworks([...homeworks, homework]);
    showToast('作业添加成功');
  };

  const handleUpdateHomework = (updatedHomework) => {
    setHomeworks(homeworks.map(hw => hw.id === updatedHomework.id ? updatedHomework : hw));
    showToast('作业更新成功');
  };

  const handleToggleComplete = (id) => {
    setHomeworks(homeworks.map(hw => 
      hw.id === id 
        ? { ...hw, completed: !hw.completed, completedAt: !hw.completed ? new Date().toISOString() : null }
        : hw
    ));
  };

  const handleDeleteHomework = (id) => {
    setHomeworks(homeworks.filter(hw => hw.id !== id));
    showToast('作业已删除', 'info');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return (
          <ScheduleTable
            courses={courses}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        );
      case 'import':
        return <ExcelImport onImportSuccess={handleImportCourses} />;
      case 'homework':
        return (
          <HomeworkManager
            homeworks={homeworks}
            courses={courses}
            onAddHomework={handleAddHomework}
            onUpdateHomework={handleUpdateHomework}
            onToggleComplete={handleToggleComplete}
            onDeleteHomework={handleDeleteHomework}
          />
        );
      case 'calendar':
        return <CalendarView homeworks={homeworks} courses={courses} />;
      case 'statistics':
        return <Statistics courses={courses} homeworks={homeworks} />;
      default:
        return (
          <ScheduleTable
            courses={courses}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo">
            <div className="logo-icon">📅</div>
            <span className="logo-text">课程表助手</span>
          </div>
        </div>
        <nav className="nav-list">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={handleResetData}
            style={{ width: '100%' }}
          >
            重置数据
          </button>
        </div>
      </aside>

      <main className="main-content">
        {renderContent()}
      </main>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}