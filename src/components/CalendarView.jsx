import { useMemo, useState } from 'react';

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function toLocalDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameLocalDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function getCourseColor(courseName) {
  const colors = ['#14b8a6', '#3b82f6', '#a855f7', '#f97316', '#eab308', '#ec4899'];
  let hash = 0;

  for (let index = 0; index < courseName.length; index += 1) {
    hash = courseName.charCodeAt(index) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export default function CalendarView({ homeworks, courses }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const courseMap = useMemo(() => new Map(courses.map((course) => [String(course.id), course])), [courses]);

  const homeworksByDate = useMemo(() => {
    const map = new Map();

    homeworks.forEach((homework) => {
      const deadline = new Date(homework.deadline);
      if (Number.isNaN(deadline.getTime())) return;

      const key = toLocalDateKey(deadline);
      const list = map.get(key) ?? [];
      list.push(homework);
      map.set(key, list);
    });

    return map;
  }, [homeworks]);

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const result = Array.from({ length: firstDay }, () => null);

    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push(new Date(year, month, day));
    }

    return result;
  }, [currentDate]);

  const selectedHomeworks = useMemo(() => {
    const key = toLocalDateKey(selectedDate);
    return (homeworksByDate.get(key) ?? [])
      .slice()
      .sort((left, right) => new Date(left.deadline) - new Date(right.deadline));
  }, [homeworksByDate, selectedDate]);

  const prevMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getCourseName = (courseId) => courseMap.get(String(courseId))?.name ?? '未指定课程';

  return (
    <section className="card calendar-card">
      <div className="card-header page-header calendar-page-header">
        <div>
          <h1 className="page-title">作业日历</h1>
          <p className="page-subtitle">点击日期查看当天需要提交的作业。</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={goToToday}>
          回到今天
        </button>
      </div>

      <div className="calendar-layout">
        <div className="calendar-main">
          <div className="calendar-toolbar">
            <button className="btn btn-secondary btn-sm calendar-arrow" type="button" onClick={prevMonth} aria-label="上个月">‹</button>
            <h2>{currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月</h2>
            <button className="btn btn-secondary btn-sm calendar-arrow" type="button" onClick={nextMonth} aria-label="下个月">›</button>
          </div>

          <div className="calendar-grid">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="weekday-cell">周{day}</div>
            ))}

            {days.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="calendar-empty-cell" />;

              const dateKey = toLocalDateKey(date);
              const homeworkCount = homeworksByDate.get(dateKey)?.length ?? 0;
              const today = isSameLocalDay(date, new Date());
              const selected = isSameLocalDay(date, selectedDate);

              return (
                <button
                  key={dateKey}
                  type="button"
                  className={`calendar-day ${today ? 'today' : ''} ${selected ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(date)}
                  aria-label={`${date.getMonth() + 1}月${date.getDate()}日，${homeworkCount}项作业`}
                >
                  <span>{date.getDate()}</span>
                  {homeworkCount > 0 && (
                    <small>{homeworkCount}项</small>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="day-panel">
          <h2>{selectedDate.getMonth() + 1} 月 {selectedDate.getDate()} 日</h2>
          <p>{selectedHomeworks.length === 0 ? '当天没有待提交作业。' : `共 ${selectedHomeworks.length} 个作业`}</p>

          {selectedHomeworks.length === 0 ? (
            <div className="empty-state compact calendar-empty-state">
              <div className="empty-icon">📭</div>
              <h3>暂无作业</h3>
            </div>
          ) : (
            <div className="day-homework-list">
              {selectedHomeworks.map((homework) => {
                const courseName = getCourseName(homework.courseId);
                const courseColor = getCourseColor(courseName);

                return (
                  <article key={homework.id} className={`day-homework ${homework.completed ? 'completed' : ''}`} style={{ borderLeftColor: courseColor }}>
                    <span>{courseName}</span>
                    <h3>{homework.title}</h3>
                    <time dateTime={homework.deadline}>
                      {new Date(homework.deadline).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </article>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
