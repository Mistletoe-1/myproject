import { useState } from 'react';

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarView({ homeworks, courses }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const getHomeworksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return homeworks.filter(hw => {
      const hwDate = new Date(hw.deadline);
      return hwDate.toISOString().split('T')[0] === dateStr;
    });
  };

  const hasHomework = (date) => {
    return getHomeworksForDate(date).length > 0;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : '未指定课程';
  };

  const getCourseColor = (courseName) => {
    const colors = ['#3ebcaf', '#569cd6', '#c586c0', '#ce9178', '#dcdcaa', '#e3738a'];
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const selectedHomeworks = selectedDate ? getHomeworksForDate(selectedDate) : [];

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">作业日历</h2>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
            点击日期查看当天作业
          </p>
        </div>
        <button className="btn btn-secondary" onClick={goToToday}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          今天
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button
              className="btn btn-secondary"
              onClick={prevMonth}
              style={{ padding: '8px 12px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>
              {year}年{month + 1}月
            </h3>
            <button
              className="btn btn-secondary"
              onClick={nextMonth}
              style={{ padding: '8px 12px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            <div style={{
              padding: '12px 8px',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: '600',
              color: '#64748b',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
            }}>
              日
            </div>
            {WEEK_DAYS.slice(1).map((day) => (
              <div key={day} style={{
                padding: '12px 8px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '600',
                color: '#64748b',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
              }}>
                {day}
              </div>
            ))}

            {days.map((date, index) => {
              if (!date) {
                return <div key={index} />;
              }

              const homeworkCount = getHomeworksForDate(date).length;
              const today = isToday(date);
              const selected = isSelected(date);

              return (
                <div
                  key={date.toDateString()}
                  onClick={() => setSelectedDate(selected ? null : date)}
                  style={{
                    aspectRatio: '1',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: selected ? 'rgba(0, 122, 204, 0.15)' : today ? 'rgba(0, 122, 204, 0.08)' : '#ffffff',
                    border: `2px solid ${selected ? '#007acc' : today ? 'rgba(0, 122, 204, 0.3)' : 'transparent'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    boxShadow: selected ? '0 2px 8px rgba(0, 122, 204, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: today ? '#007acc' : selected ? '#007acc' : '#1e293b',
                  }}>
                    {date.getDate()}
                  </span>
                  {homeworkCount > 0 && (
                    <div style={{
                      display: 'flex',
                      gap: '2px',
                    }}>
                      {Array.from({ length: Math.min(homeworkCount, 3) }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                          }}
                        />
                      ))}
                      {homeworkCount > 3 && (
                        <span style={{ fontSize: '10px', color: '#ef4444' }}>+{homeworkCount - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '16px',
          }}>
            {selectedDate
              ? `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 的作业`
              : '选择日期查看作业'}
          </h3>

          {selectedHomeworks.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <h3>暂无作业</h3>
              <p>当天没有需要提交的作业</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedHomeworks.map((hw) => {
                const courseName = getCourseName(hw.courseId);
                const courseColor = getCourseColor(courseName);

                return (
                  <div
                    key={hw.id}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      borderLeft: `3px solid ${courseColor}`,
                      opacity: hw.completed ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        className={`badge ${hw.priority === 'high' ? 'badge-high' : hw.priority === 'medium' ? 'badge-medium' : 'badge-low'}`}
                      >
                        {hw.priority === 'high' ? '高' : hw.priority === 'medium' ? '中' : '低'}优先级
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '500',
                          backgroundColor: `${courseColor}20`,
                          color: courseColor,
                        }}
                      >
                        {courseName}
                      </span>
                    </div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: hw.completed ? '#6b7280' : '#ffffff',
                      textDecoration: hw.completed ? 'line-through' : 'none',
                      marginBottom: '4px',
                    }}>
                      {hw.title}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      ⏰ {new Date(hw.deadline).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}