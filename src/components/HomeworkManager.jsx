import { useMemo, useState } from 'react';

const PRIORITY_CONFIG = {
  high: { label: '高', className: 'badge-high', color: '#ef4444', order: 0 },
  medium: { label: '中', className: 'badge-medium', color: '#f97316', order: 1 },
  low: { label: '低', className: 'badge-low', color: '#22c55e', order: 2 },
};

const emptyForm = {
  title: '',
  description: '',
  deadline: '',
  priority: 'medium',
  courseId: '',
};

function toDateTimeLocalValue(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return offsetDate.toISOString().slice(0, 16);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未设置时间';

  return date.toLocaleString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCourseColor(courseName) {
  const colors = [
    { bg: '#ccfbf1', text: '#0f766e' },
    { bg: '#dbeafe', text: '#1d4ed8' },
    { bg: '#f3e8ff', text: '#7e22ce' },
    { bg: '#ffedd5', text: '#c2410c' },
    { bg: '#fef9c3', text: '#854d0e' },
    { bg: '#fce7f3', text: '#be185d' },
  ];
  let hash = 0;

  for (let index = 0; index < courseName.length; index += 1) {
    hash = courseName.charCodeAt(index) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

function isSameLocalDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function isOverdue(deadline, completed) {
  if (completed) return false;

  const deadlineDate = new Date(deadline);
  return !Number.isNaN(deadlineDate.getTime()) && deadlineDate < new Date();
}

function isUrgent(deadline, completed) {
  if (completed) return false;

  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) return false;

  const diffHours = (deadlineDate - new Date()) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= 48;
}

export default function HomeworkManager({
  homeworks,
  courses,
  onAddHomework,
  onUpdateHomework,
  onToggleComplete,
  onDeleteHomework,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [formData, setFormData] = useState(emptyForm);

  const courseMap = useMemo(() => new Map(courses.map((course) => [String(course.id), course])), [courses]);

  const getCourseName = (courseId) => {
    return courseMap.get(String(courseId))?.name ?? '未指定课程';
  };

  const filteredHomeworks = useMemo(() => (
    homeworks
      .filter((homework) => {
        if (filter === 'pending') return !homework.completed;
        if (filter === 'completed') return homework.completed;
        if (filter === 'today') return isSameLocalDay(new Date(homework.deadline), new Date());
        return true;
      })
      .slice()
      .sort((left, right) => {
        if (sortBy === 'priority') {
          return PRIORITY_CONFIG[left.priority].order - PRIORITY_CONFIG[right.priority].order;
        }
        if (sortBy === 'course') {
          return getCourseName(left.courseId).localeCompare(getCourseName(right.courseId), 'zh-CN');
        }
        return new Date(left.deadline) - new Date(right.deadline);
      })
  ), [homeworks, filter, sortBy, courseMap]);

  const summary = useMemo(() => ({
    total: homeworks.length,
    pending: homeworks.filter((homework) => !homework.completed).length,
    completed: homeworks.filter((homework) => homework.completed).length,
  }), [homeworks]);

  const openAddModal = () => {
    setEditingHomework(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (homework) => {
    setEditingHomework(homework);
    setFormData({
      title: homework.title ?? '',
      description: homework.description ?? '',
      deadline: toDateTimeLocalValue(homework.deadline),
      priority: homework.priority ?? 'medium',
      courseId: homework.courseId ?? '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingHomework(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.deadline) return;

    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      deadline: new Date(formData.deadline).toISOString(),
    };

    if (editingHomework) {
      onUpdateHomework({ ...editingHomework, ...payload });
    } else {
      onAddHomework({
        ...payload,
        id: Date.now(),
        completed: false,
        createdAt: new Date().toISOString(),
      });
    }

    closeModal();
  };

  return (
    <section className="card">
      <div className="card-header page-header">
        <div>
          <h1 className="page-title">作业管理</h1>
          <p className="page-subtitle">
            共 {summary.total} 个作业 · 待完成 {summary.pending} 个 · 已完成 {summary.completed} 个
          </p>
        </div>
        <button className="btn btn-primary" type="button" onClick={openAddModal}>
          添加作业
        </button>
      </div>

      <div className="filters-row">
        <div className="segmented-control" role="group" aria-label="作业筛选">
          {[
            ['all', '全部'],
            ['pending', '待完成'],
            ['completed', '已完成'],
            ['today', '今天'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? 'active' : ''}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="inline-field">
          <span>排序</span>
          <select className="form-select compact-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="deadline">截止时间</option>
            <option value="priority">优先级</option>
            <option value="course">课程</option>
          </select>
        </label>
      </div>

      {filteredHomeworks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧘</div>
          <h2>暂无作业</h2>
          <p>当前筛选条件下没有作业。可以添加一个新作业开始管理。</p>
        </div>
      ) : (
        <div className="homework-list">
          {filteredHomeworks.map((homework) => {
            const courseName = getCourseName(homework.courseId);
            const courseColor = getCourseColor(courseName);
            const priority = PRIORITY_CONFIG[homework.priority] ?? PRIORITY_CONFIG.medium;
            const overdue = isOverdue(homework.deadline, homework.completed);
            const urgent = isUrgent(homework.deadline, homework.completed);

            return (
              <article key={homework.id} className={`homework-item ${homework.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}>
                <button
                  className={`checkbox ${homework.completed ? 'checked' : ''}`}
                  type="button"
                  onClick={() => onToggleComplete(homework.id)}
                  aria-label={homework.completed ? '标记为未完成' : '标记为已完成'}
                />

                <div className="homework-content">
                  <div className="meta-row">
                    <span className={`badge ${priority.className}`}>{priority.label}优先级</span>
                    <span className="course-tag" style={{ backgroundColor: courseColor.bg, color: courseColor.text }}>
                      {courseName}
                    </span>
                    {overdue && <span className="badge badge-high">已逾期</span>}
                    {urgent && <span className="badge badge-medium">即将截止</span>}
                  </div>
                  <h2>{homework.title}</h2>
                  {homework.description && <p>{homework.description}</p>}
                  <time dateTime={homework.deadline}>📅 {formatDate(homework.deadline)}</time>
                </div>

                <div className="item-actions">
                  <button className="btn btn-secondary btn-sm" type="button" onClick={() => openEditModal(homework)}>编辑</button>
                  <button className="btn btn-danger btn-sm" type="button" onClick={() => onDeleteHomework(homework.id)}>删除</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <form className="modal" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingHomework ? '编辑作业' : '添加作业'}</h2>
              <button className="modal-close" type="button" onClick={closeModal} aria-label="关闭">×</button>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="homework-title">作业标题</label>
              <input
                id="homework-title"
                className="form-input"
                type="text"
                value={formData.title}
                onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                placeholder="如：完成第三章习题"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="homework-course">所属课程</label>
              <select
                id="homework-course"
                className="form-select"
                value={formData.courseId}
                onChange={(event) => setFormData((current) => ({ ...current, courseId: event.target.value }))}
              >
                <option value="">请选择课程</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="homework-deadline">截止时间</label>
              <input
                id="homework-deadline"
                className="form-input"
                type="datetime-local"
                value={formData.deadline}
                onChange={(event) => setFormData((current) => ({ ...current, deadline: event.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <span className="form-label">优先级</span>
              <div className="priority-options">
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    className={formData.priority === key ? 'active' : ''}
                    style={{ '--priority-color': config.color }}
                    onClick={() => setFormData((current) => ({ ...current, priority: key }))}
                  >
                    {config.label}优先级
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="homework-description">描述（可选）</label>
              <textarea
                id="homework-description"
                className="form-input"
                rows={3}
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                placeholder="补充要求、提交方式或参考资料"
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" onClick={closeModal}>取消</button>
              <button className="btn btn-primary" type="submit">{editingHomework ? '保存' : '添加'}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
