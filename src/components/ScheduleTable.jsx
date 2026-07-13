import { useMemo, useState } from 'react';

const COLORS = [
  { border: '#14b8a6', text: '#0f766e', lightBg: '#f0fdfa' },
  { border: '#3b82f6', text: '#1d4ed8', lightBg: '#eff6ff' },
  { border: '#a855f7', text: '#7e22ce', lightBg: '#faf5ff' },
  { border: '#f97316', text: '#c2410c', lightBg: '#fff7ed' },
  { border: '#eab308', text: '#854d0e', lightBg: '#fefce8' },
  { border: '#ec4899', text: '#be185d', lightBg: '#fdf2f8' },
  { border: '#22c55e', text: '#15803d', lightBg: '#f0fdf4' },
  { border: '#6366f1', text: '#4338ca', lightBg: '#eef2ff' },
];

const TIME_SLOTS = [1, 2, 3, 4, 5];
const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const TOTAL_WEEKS = 16;
const SEMESTER_START_DATE = new Date('2026-03-02T00:00:00');

const WEEK_OPTIONS = [
  { value: 'all', label: '全部周' },
  { value: '[1,2,3,4]', label: '第 1-4 周' },
  { value: '[5,6,7,8]', label: '第 5-8 周' },
  { value: '[9,10,11,12]', label: '第 9-12 周' },
  { value: '[13,14,15,16]', label: '第 13-16 周' },
  { value: '[1,3,5,7,9,11,13,15]', label: '单周' },
  { value: '[2,4,6,8,10,12,14,16]', label: '双周' },
];

const emptyForm = {
  name: '',
  teacher: '',
  classroom: '',
  weeks: 'all',
};

function getCurrentWeekNum() {
  const now = new Date();
  const diffDays = Math.floor((now - SEMESTER_START_DATE) / (24 * 60 * 60 * 1000));
  const weekNum = Math.max(1, Math.ceil((diffDays + 1) / 7));
  return Math.min(weekNum, TOTAL_WEEKS);
}

function formatWeekDates(weekNum) {
  const monday = new Date(SEMESTER_START_DATE);
  monday.setDate(SEMESTER_START_DATE.getDate() + (weekNum - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return `${monday.getMonth() + 1}/${monday.getDate()} - ${sunday.getMonth() + 1}/${sunday.getDate()}`;
}

function getColorForCourse(courseName) {
  let hash = 0;
  for (let index = 0; index < courseName.length; index += 1) {
    hash = courseName.charCodeAt(index) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function normalizeWeeks(value) {
  if (value === 'all') return 'all';
  if (Array.isArray(value)) return value;

  try {
    return JSON.parse(value);
  } catch {
    return 'all';
  }
}

function getWeeksValue(weeks) {
  return weeks === 'all' ? 'all' : JSON.stringify(weeks);
}

export default function ScheduleTable({ courses, onAddCourse, onUpdateCourse, onDeleteCourse }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWeekNum, setSelectedWeekNum] = useState(getCurrentWeekNum);
  const [formData, setFormData] = useState(emptyForm);

  const filteredCourses = useMemo(() => (
    courses.filter((course) => {
      if (!course.weeks || course.weeks === 'all') return true;
      return Array.isArray(course.weeks) ? course.weeks.includes(selectedWeekNum) : true;
    })
  ), [courses, selectedWeekNum]);

  const courseMap = useMemo(() => {
    const map = new Map();
    filteredCourses.forEach((course) => {
      map.set(`${course.day}-${course.period}`, course);
    });
    return map;
  }, [filteredCourses]);

  const handleCellClick = (day, period) => {
    const existingCourse = courseMap.get(`${day}-${period}`);

    if (existingCourse) {
      setEditingCourse(existingCourse);
      setFormData({
        name: existingCourse.name ?? '',
        teacher: existingCourse.teacher ?? '',
        classroom: existingCourse.classroom ?? '',
        weeks: existingCourse.weeks ?? 'all',
      });
    } else {
      setSelectedCell({ day, period });
      setEditingCourse(null);
      setFormData(emptyForm);
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCell(null);
    setEditingCourse(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) return;

    const payload = {
      ...formData,
      name: formData.name.trim(),
      teacher: formData.teacher.trim(),
      classroom: formData.classroom.trim(),
      weeks: normalizeWeeks(formData.weeks),
    };

    if (editingCourse) {
      onUpdateCourse({ ...editingCourse, ...payload });
    } else {
      onAddCourse({
        ...payload,
        day: selectedCell.day,
        period: selectedCell.period,
        id: Date.now(),
      });
    }

    closeModal();
  };

  const handleDelete = () => {
    if (!editingCourse) return;
    onDeleteCourse(editingCourse.id);
    closeModal();
  };

  return (
    <section className="card">
      <div className="card-header page-header">
        <div>
          <h1 className="page-title">课程表</h1>
          <p className="page-subtitle">
            {formatWeekDates(selectedWeekNum)} · 第 {selectedWeekNum} 周 · {selectedWeekNum % 2 === 1 ? '单周' : '双周'}
          </p>
        </div>
        <div className="toolbar">
          <label className="inline-field">
            <span>周次</span>
            <select className="form-select compact-select" value={selectedWeekNum} onChange={(event) => setSelectedWeekNum(Number(event.target.value))}>
              {Array.from({ length: TOTAL_WEEKS }, (_, index) => index + 1).map((week) => (
                <option key={week} value={week}>第 {week} 周</option>
              ))}
            </select>
          </label>
          <button className="btn btn-secondary" type="button" onClick={() => setSelectedWeekNum(getCurrentWeekNum())}>
            回到本周
          </button>
        </div>
      </div>

      <div className="schedule-scroll">
        <div className="schedule-grid">
          <div className="schedule-header">节次</div>
          {WEEK_DAYS.map((day) => (
            <div key={day} className="schedule-header">{day}</div>
          ))}

          {TIME_SLOTS.map((period) => (
            <div key={`period-${period}`} className="schedule-row">
              <div className="period-cell">
                <span>第 {period} 节</span>
              </div>
              {WEEK_DAYS.map((day) => {
                const course = courseMap.get(`${day}-${period}`);
                const color = course ? getColorForCourse(course.name) : null;

                return (
                  <button
                    key={`${day}-${period}`}
                    type="button"
                    className={`course-cell ${course ? 'has-course' : ''}`}
                    style={course ? {
                      backgroundColor: color.lightBg,
                      borderLeftColor: color.border,
                    } : undefined}
                    onClick={() => handleCellClick(day, period)}
                  >
                    {course ? (
                      <span className="course-card">
                        <strong style={{ color: color.text }}>{course.name}</strong>
                        <small>🏫 上课地点：{course.classroom || '未设置'}</small>
                        <small>👨‍🏫 授课教师：{course.teacher || '未设置'}</small>
                      </span>
                    ) : (
                      <span className="add-course">+</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <form className="modal" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCourse ? '编辑课程' : '添加课程'}</h2>
              <button className="modal-close" type="button" onClick={closeModal} aria-label="关闭">×</button>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-name">课程名称</label>
              <input
                id="course-name"
                className="form-input"
                type="text"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                placeholder="如：信息安全"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="course-teacher">授课教师</label>
              <input
                id="course-teacher"
                className="form-input"
                type="text"
                value={formData.teacher}
                onChange={(event) => setFormData((current) => ({ ...current, teacher: event.target.value }))}
                placeholder="如：陈老师"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="course-classroom">上课地点</label>
              <input
                id="course-classroom"
                className="form-input"
                type="text"
                value={formData.classroom}
                onChange={(event) => setFormData((current) => ({ ...current, classroom: event.target.value }))}
                placeholder="如：机房 8"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="course-weeks">上课周次</label>
              <select
                id="course-weeks"
                className="form-select"
                value={getWeeksValue(formData.weeks)}
                onChange={(event) => setFormData((current) => ({ ...current, weeks: normalizeWeeks(event.target.value) }))}
              >
                {WEEK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="modal-footer">
              {editingCourse && (
                <button className="btn btn-danger" type="button" onClick={handleDelete}>删除</button>
              )}
              <button className="btn btn-secondary" type="button" onClick={closeModal}>取消</button>
              <button className="btn btn-primary" type="submit">{editingCourse ? '保存' : '添加'}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
