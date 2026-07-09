import { useState } from 'react';

const COLORS = [
  { bg: 'rgba(62, 188, 175, 0.3)', border: '#3ebcaf', text: '#0d9488', lightBg: '#f0fdfa' },
  { bg: 'rgba(86, 156, 214, 0.3)', border: '#569cd6', text: '#2563eb', lightBg: '#eff6ff' },
  { bg: 'rgba(197, 134, 192, 0.3)', border: '#c586c0', text: '#9333ea', lightBg: '#faf5ff' },
  { bg: 'rgba(206, 145, 120, 0.3)', border: '#ce9178', text: '#c2410c', lightBg: '#fff7ed' },
  { bg: 'rgba(220, 220, 170, 0.3)', border: '#dcdcaa', text: '#854d0e', lightBg: '#fefce8' },
  { bg: 'rgba(227, 115, 138, 0.3)', border: '#e3738a', text: '#db2777', lightBg: '#fdf2f8' },
  { bg: 'rgba(139, 195, 74, 0.3)', border: '#8bc34a', text: '#16a34a', lightBg: '#f0fdf4' },
  { bg: 'rgba(79, 109, 202, 0.3)', border: '#4f6dca', text: '#4338ca', lightBg: '#f5f3ff' },
];

const TIME_SLOTS = [
  { period: 1 },
  { period: 2 },
  { period: 3 },
  { period: 4 },
  { period: 5 },
];

const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const TOTAL_WEEKS = 16;
const SEMESTER_START_DATE = new Date('2026-03-02');

const WEEK_TYPES = [
  { value: 'all', label: '全部' },
];

const getCurrentWeekNum = () => {
  const now = new Date();
  const diffTime = now - SEMESTER_START_DATE;
  const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
  const weekNum = Math.max(1, Math.ceil((diffDays + 1) / 7));
  return Math.min(weekNum, TOTAL_WEEKS);
};

const getWeekDates = (weekNum) => {
  const monday = new Date(SEMESTER_START_DATE);
  monday.setDate(SEMESTER_START_DATE.getDate() + (weekNum - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  return `${formatDate(monday)} - ${formatDate(sunday)}`;
};

export default function ScheduleTable({ courses, onAddCourse, onUpdateCourse, onDeleteCourse }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWeekNum, setSelectedWeekNum] = useState(getCurrentWeekNum());

  const [formData, setFormData] = useState({
    name: '',
    teacher: '',
    classroom: '',
    weeks: 'all',
  });

  const filteredCourses = courses.filter(c => {
    if (!c.weeks) return true;
    if (c.weeks === 'all') return true;
    if (Array.isArray(c.weeks)) {
      return c.weeks.includes(selectedWeekNum);
    }
    return true;
  });

  const getCourseAt = (day, period) => {
    return filteredCourses.find(c => c.day === day && c.period === period);
  };

  const getColorForCourse = (courseName) => {
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
  };

  const handleCellClick = (day, period) => {
    const existingCourse = getCourseAt(day, period);
    if (existingCourse) {
      setEditingCourse(existingCourse);
      setFormData({
        name: existingCourse.name,
        teacher: existingCourse.teacher,
        classroom: existingCourse.classroom,
        weeks: existingCourse.weeks || 'all',
      });
    } else {
      setSelectedCell({ day, period });
      setEditingCourse(null);
      setFormData({ name: '', teacher: '', classroom: '', weeks: 'all' });
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return;
    
    if (editingCourse) {
      onUpdateCourse({
        ...editingCourse,
        ...formData,
      });
    } else {
      onAddCourse({
        ...formData,
        day: selectedCell.day,
        period: selectedCell.period,
        id: Date.now(),
      });
    }
    setShowModal(false);
    setSelectedCell(null);
    setEditingCourse(null);
    setFormData({ name: '', teacher: '', classroom: '', weeks: 'all' });
  };

  const handleDelete = () => {
    if (editingCourse) {
      onDeleteCourse(editingCourse.id);
      setShowModal(false);
      setEditingCourse(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">课程表</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            {getWeekDates(selectedWeekNum)} · {selectedWeekNum % 2 === 1 ? '单周' : '双周'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>周次</span>
          <select
            value={selectedWeekNum}
            onChange={(e) => setSelectedWeekNum(Number(e.target.value))}
            style={{
              padding: '8px 32px 8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
              minWidth: '120px',
            }}
          >
            {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week}>
                第 {week} 周
              </option>
            ))}
          </select>
          <button
            onClick={() => setSelectedWeekNum(getCurrentWeekNum())}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: '#f1f5f9',
              color: '#007acc',
              border: '1px solid #007acc',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            回到本周
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minWidth: '800px' }}>
          <div style={{ ...styles.headerCell, borderTopLeftRadius: '10px' }}>节次</div>
          {WEEK_DAYS.map((day, index) => (
            <div 
              key={day} 
              style={{ 
                ...styles.dayHeader,
                borderTopRightRadius: index === 6 ? '10px' : '0',
              }}
            >
              {day}
            </div>
          ))}

          {TIME_SLOTS.map((slot, rowIndex) => {
            return (
              <div key={`row-${rowIndex}`} style={{ display: 'contents' }}>
                <div style={styles.periodCell}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#007acc' }}>
                    {slot.period}
                  </span>
                </div>
                {WEEK_DAYS.map((day) => {
                  const course = getCourseAt(day, slot.period);
                  const color = course ? getColorForCourse(course.name) : null;

                  return (
                    <div
                      key={`${day}-${slot.period}`}
                      style={{
                        ...styles.courseCell,
                        backgroundColor: course ? color.lightBg : '#ffffff',
                        borderColor: course ? color.border : 'transparent',
                        borderLeftWidth: course ? '3px' : '0',
                        borderBottomRightRadius: rowIndex === TIME_SLOTS.length - 1 && day === '周日' ? '10px' : '0',
                      }}
                      onClick={() => handleCellClick(day, slot.period)}
                    >
                      {course ? (
                        <div style={{ padding: '12px 10px', height: '100%', minHeight: '70px' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            marginBottom: '4px',
                          }}>
                            <div style={{ 
                              fontSize: '13px', 
                              fontWeight: '600', 
                              color: color.text, 
                              lineHeight: '1.3',
                            }}>
                              {course.name}
                            </div>
                            {course.weekType !== 'all' && (
                              <span style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: course.weekType === 'odd' 
                                  ? 'rgba(62, 188, 175, 0.2)' 
                                  : 'rgba(86, 156, 214, 0.2)',
                                color: course.weekType === 'odd' ? '#0d9488' : '#2563eb',
                                fontWeight: '600',
                              }}>
                                {course.weekType === 'odd' ? '单周' : '双周'}
                              </span>
                            )}
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontSize: '11px', 
                            color: '#64748b', 
                            marginBottom: '3px',
                          }}>
                            <span style={{ fontSize: '10px' }}>🏫</span>
                            <span>{course.classroom}</span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontSize: '11px', 
                            color: '#94a3b8',
                          }}>
                            <span style={{ fontSize: '10px' }}>👨‍🏫</span>
                            <span>{course.teacher}</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          minHeight: '70px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#cbd5e1',
                          fontSize: '24px',
                        }}>
                          +
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCourse ? '编辑课程' : '添加课程'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div>
              <div className="form-group">
                <label className="form-label">课程名称</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：高等数学"
                />
              </div>
              <div className="form-group">
                <label className="form-label">授课老师</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  placeholder="如：张教授"
                />
              </div>
              <div className="form-group">
                <label className="form-label">教室</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.classroom}
                  onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                  placeholder="如：教学楼A-301"
                />
              </div>
              <div className="form-group">
                <label className="form-label">周次</label>
                <select
                  className="form-input"
                  value={formData.weeks === 'all' ? 'all' : JSON.stringify(formData.weeks)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      weeks: value === 'all' ? 'all' : JSON.parse(value) 
                    });
                  }}
                >
                  <option value="all">全部周</option>
                  <option value="[1,2,3,4]">第1-4周</option>
                  <option value="[5,6,7,8]">第5-8周</option>
                  <option value="[9,10,11,12]">第9-12周</option>
                  <option value="[13,14,15,16]">第13-16周</option>
                  <option value="[1,3,5,7,9,11,13,15]">单周</option>
                  <option value="[2,4,6,8,10,12,14,16]">双周</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              {editingCourse && (
                <button className="btn btn-danger" onClick={handleDelete}>删除</button>
              )}
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                {editingCourse ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  headerCell: {
    padding: '16px 12px',
    backgroundColor: '#007acc',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeader: {
    padding: '16px 12px',
    backgroundColor: '#007acc',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodCell: {
    padding: '16px 8px',
    backgroundColor: '#f8fafc',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #e2e8f0',
  },
  courseCell: {
    padding: '0',
    borderLeft: '1px solid transparent',
    borderBottom: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'stretch',
  },
};
