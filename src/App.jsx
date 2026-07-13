import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';

const ScheduleTable = lazy(() => import('./components/ScheduleTable'));
const ExcelImport = lazy(() => import('./components/ExcelImport'));
const HomeworkManager = lazy(() => import('./components/HomeworkManager'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const Statistics = lazy(() => import('./components/Statistics'));

const STORAGE_KEYS = {
  activeTab: 'schedule-calendar-v3-active-tab',
  courses: 'schedule-calendar-v3-courses',
  homeworks: 'schedule-calendar-v3-homeworks',
};

const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const SUBJECTS = [
  { id: 1, name: '创新创业', teacher: '周老师', classroom: '教学楼 C-402' },
  { id: 2, name: '信息安全', teacher: '陈老师', classroom: '机房 8' },
  { id: 3, name: '单片机及嵌入式系统', teacher: '刘老师', classroom: '实验楼 301' },
  { id: 4, name: '计算机网络', teacher: '赵老师', classroom: '实验楼 203' },
  { id: 5, name: '操作系统', teacher: '王老师', classroom: '机房 6' },
  { id: 6, name: 'Python程序设计', teacher: '李老师', classroom: '机房 10' },
  { id: 7, name: '软件工程', teacher: '孙老师', classroom: '教学楼 B-204' },
];

const WEEKLY_SLOT_PATTERNS = [
  [
    [{ dayIndex: 0, period: 1 }, { dayIndex: 2, period: 3 }],
    [{ dayIndex: 0, period: 3 }, { dayIndex: 3, period: 1 }],
    [{ dayIndex: 1, period: 1 }, { dayIndex: 4, period: 4 }],
    [{ dayIndex: 1, period: 4 }, { dayIndex: 5, period: 2 }],
    [{ dayIndex: 2, period: 1 }, { dayIndex: 4, period: 5 }],
    [{ dayIndex: 3, period: 2 }, { dayIndex: 6, period: 4 }],
    [{ dayIndex: 4, period: 2 }, { dayIndex: 6, period: 1 }],
  ],
  [
    [{ dayIndex: 0, period: 2 }, { dayIndex: 3, period: 5 }],
    [{ dayIndex: 0, period: 4 }, { dayIndex: 4, period: 1 }],
    [{ dayIndex: 1, period: 2 }, { dayIndex: 5, period: 5 }],
    [{ dayIndex: 1, period: 5 }, { dayIndex: 4, period: 3 }],
    [{ dayIndex: 2, period: 2 }, { dayIndex: 5, period: 1 }],
    [{ dayIndex: 2, period: 4 }, { dayIndex: 6, period: 2 }],
    [{ dayIndex: 3, period: 1 }, { dayIndex: 6, period: 5 }],
  ],
  [
    [{ dayIndex: 0, period: 5 }, { dayIndex: 4, period: 2 }],
    [{ dayIndex: 1, period: 1 }, { dayIndex: 3, period: 4 }],
    [{ dayIndex: 1, period: 3 }, { dayIndex: 5, period: 1 }],
    [{ dayIndex: 2, period: 1 }, { dayIndex: 6, period: 3 }],
    [{ dayIndex: 2, period: 5 }, { dayIndex: 4, period: 4 }],
    [{ dayIndex: 3, period: 2 }, { dayIndex: 5, period: 5 }],
    [{ dayIndex: 0, period: 2 }, { dayIndex: 6, period: 1 }],
  ],
  [
    [{ dayIndex: 0, period: 4 }, { dayIndex: 5, period: 2 }],
    [{ dayIndex: 1, period: 2 }, { dayIndex: 4, period: 5 }],
    [{ dayIndex: 2, period: 3 }, { dayIndex: 6, period: 5 }],
    [{ dayIndex: 3, period: 1 }, { dayIndex: 5, period: 4 }],
    [{ dayIndex: 4, period: 1 }, { dayIndex: 6, period: 3 }],
    [{ dayIndex: 0, period: 1 }, { dayIndex: 2, period: 5 }],
    [{ dayIndex: 1, period: 5 }, { dayIndex: 3, period: 3 }],
  ],
  [
    [{ dayIndex: 0, period: 3 }, { dayIndex: 4, period: 1 }],
    [{ dayIndex: 1, period: 4 }, { dayIndex: 6, period: 2 }],
    [{ dayIndex: 2, period: 2 }, { dayIndex: 5, period: 5 }],
    [{ dayIndex: 3, period: 5 }, { dayIndex: 6, period: 1 }],
    [{ dayIndex: 4, period: 4 }, { dayIndex: 0, period: 1 }],
    [{ dayIndex: 5, period: 2 }, { dayIndex: 1, period: 1 }],
    [{ dayIndex: 2, period: 5 }, { dayIndex: 3, period: 2 }],
  ],
  [
    [{ dayIndex: 0, period: 2 }, { dayIndex: 5, period: 4 }],
    [{ dayIndex: 1, period: 5 }, { dayIndex: 3, period: 1 }],
    [{ dayIndex: 2, period: 1 }, { dayIndex: 6, period: 4 }],
    [{ dayIndex: 3, period: 3 }, { dayIndex: 5, period: 1 }],
    [{ dayIndex: 4, period: 2 }, { dayIndex: 6, period: 5 }],
    [{ dayIndex: 0, period: 5 }, { dayIndex: 2, period: 3 }],
    [{ dayIndex: 1, period: 2 }, { dayIndex: 4, period: 5 }],
  ],
  [
    [{ dayIndex: 0, period: 1 }, { dayIndex: 6, period: 3 }],
    [{ dayIndex: 1, period: 3 }, { dayIndex: 4, period: 5 }],
    [{ dayIndex: 2, period: 4 }, { dayIndex: 5, period: 1 }],
    [{ dayIndex: 3, period: 2 }, { dayIndex: 6, period: 5 }],
    [{ dayIndex: 4, period: 1 }, { dayIndex: 0, period: 4 }],
    [{ dayIndex: 5, period: 3 }, { dayIndex: 1, period: 5 }],
    [{ dayIndex: 2, period: 1 }, { dayIndex: 3, period: 4 }],
  ],
  [
    [{ dayIndex: 0, period: 5 }, { dayIndex: 3, period: 2 }],
    [{ dayIndex: 1, period: 1 }, { dayIndex: 5, period: 3 }],
    [{ dayIndex: 2, period: 5 }, { dayIndex: 6, period: 1 }],
    [{ dayIndex: 3, period: 4 }, { dayIndex: 0, period: 2 }],
    [{ dayIndex: 4, period: 3 }, { dayIndex: 6, period: 5 }],
    [{ dayIndex: 5, period: 1 }, { dayIndex: 1, period: 4 }],
    [{ dayIndex: 2, period: 2 }, { dayIndex: 4, period: 5 }],
  ],
];

const HOMEWORK_PLANS = [
  ['创新创业', '商业模式画布', '完成一个校园服务类项目的商业模式画布，并写出核心用户画像。', 3, 'medium'],
  ['信息安全', '密码学基础练习', '完成对称加密、非对称加密和哈希算法的对比表。', 4, 'high'],
  ['单片机及嵌入式系统', 'GPIO 控制实验', '完成 LED 流水灯程序，整理电路连接图和实验现象。', 5, 'high'],
  ['计算机网络', '网络分层分析', '绘制 TCP/IP 分层结构图，说明每层协议职责。', 7, 'medium'],
  ['操作系统', '进程调度实验', '模拟先来先服务与时间片轮转调度算法。', 9, 'high'],
  ['Python程序设计', '文件处理练习', '读取 CSV 数据并完成清洗、统计和结果导出。', 11, 'medium'],
  ['软件工程', '需求分析文档', '整理课程管理系统的功能需求和非功能需求。', 13, 'low'],
];

const NAV_ITEMS = [
  { id: 'schedule', label: '课程表', icon: '📅' },
  { id: 'import', label: '导入课表', icon: '📥' },
  { id: 'homework', label: '作业管理', icon: '✅' },
  { id: 'calendar', label: '日历视图', icon: '🗓️' },
  { id: 'statistics', label: '数据统计', icon: '📊' },
];

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(23, 59, 0, 0);
  return date.toISOString();
}

function createSampleCourses() {
  const courses = [];

  for (let week = 1; week <= 16; week += 1) {
    const pattern = WEEKLY_SLOT_PATTERNS[(week - 1) % WEEKLY_SLOT_PATTERNS.length];

    pattern.forEach((slotPair, slotPairIndex) => {
      const subject = SUBJECTS[(slotPairIndex + week - 1) % SUBJECTS.length];

      slotPair.forEach((slot, sessionIndex) => {
        courses.push({
          id: week * 1000 + subject.id * 10 + sessionIndex,
          subjectId: subject.id,
          name: subject.name,
          teacher: subject.teacher,
          classroom: subject.classroom,
          day: WEEK_DAYS[slot.dayIndex],
          period: slot.period,
          weeks: [week],
        });
      });
    });
  }

  return courses;
}

function createSampleHomeworks(courses) {
  return HOMEWORK_PLANS.map(([subjectName, title, description, days, priority], index) => {
    const course = courses.find((item) => item.name === subjectName);

    return {
      id: index + 1,
      title,
      description,
      deadline: addDays(days),
      priority,
      courseId: course?.id ?? '',
      completed: false,
      createdAt: new Date().toISOString(),
    };
  });
}

const SAMPLE_COURSES = createSampleCourses();
const SAMPLE_HOMEWORKS = createSampleHomeworks(SAMPLE_COURSES);

function readJsonStorage(key, fallback) {
  const raw = localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    const value = JSON.parse(raw);
    return Array.isArray(fallback) && !Array.isArray(value) ? fallback : value;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem(STORAGE_KEYS.activeTab) ?? 'schedule');
  const [courses, setCourses] = useState(() => readJsonStorage(STORAGE_KEYS.courses, SAMPLE_COURSES));
  const [homeworks, setHomeworks] = useState(() => readJsonStorage(STORAGE_KEYS.homeworks, SAMPLE_HOMEWORKS));
  const [toast, setToast] = useState(null);

  const pendingCount = useMemo(() => homeworks.filter((homework) => !homework.completed).length, [homeworks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.activeTab, activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.homeworks, JSON.stringify(homeworks));
  }, [homeworks]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const handleResetData = useCallback(() => {
    if (!window.confirm('确定要重置所有课程和作业吗？')) {
      return;
    }

    const nextCourses = createSampleCourses();
    setCourses(nextCourses);
    setHomeworks(createSampleHomeworks(nextCourses));
    showToast('课程和作业已重置');
  }, [showToast]);

  const handleAddCourse = useCallback((course) => {
    setCourses((current) => [...current, course]);
    showToast('课程添加成功');
  }, [showToast]);

  const handleUpdateCourse = useCallback((updatedCourse) => {
    setCourses((current) => current.map((course) => (course.id === updatedCourse.id ? updatedCourse : course)));
    showToast('课程更新成功');
  }, [showToast]);

  const handleDeleteCourse = useCallback((id) => {
    setCourses((current) => current.filter((course) => course.id !== id));
    showToast('课程已删除', 'info');
  }, [showToast]);

  const handleImportCourses = useCallback((importedCourses) => {
    setCourses(importedCourses);
    showToast(`成功导入 ${importedCourses.length} 条课程安排`);
    setActiveTab('schedule');
  }, [showToast]);

  const handleAddHomework = useCallback((homework) => {
    setHomeworks((current) => [...current, homework]);
    showToast('作业添加成功');
  }, [showToast]);

  const handleUpdateHomework = useCallback((updatedHomework) => {
    setHomeworks((current) => current.map((homework) => (homework.id === updatedHomework.id ? updatedHomework : homework)));
    showToast('作业更新成功');
  }, [showToast]);

  const handleToggleComplete = useCallback((id) => {
    setHomeworks((current) => current.map((homework) => (
      homework.id === id
        ? {
          ...homework,
          completed: !homework.completed,
          completedAt: homework.completed ? null : new Date().toISOString(),
        }
        : homework
    )));
  }, []);

  const handleDeleteHomework = useCallback((id) => {
    setHomeworks((current) => current.filter((homework) => homework.id !== id));
    showToast('作业已删除', 'info');
  }, [showToast]);

  const renderContent = () => {
    switch (activeTab) {
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
      case 'schedule':
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
            <div className="logo-icon">课</div>
            <div>
              <span className="logo-text">课表助手</span>
              <p className="logo-subtitle">{pendingCount} 个待完成作业</p>
            </div>
          </div>
        </div>

        <nav className="nav-list" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-secondary btn-sm full-width" type="button" onClick={handleResetData}>
            重置课程与作业
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Suspense fallback={<div className="card loading-card">正在加载...</div>}>
          {renderContent()}
        </Suspense>
      </main>

      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
}
