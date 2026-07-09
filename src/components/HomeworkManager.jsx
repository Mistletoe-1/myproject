import { useState } from 'react';

const PRIORITY_CONFIG = {
  high: { label: '高', className: 'badge-high', color: '#ef4444' },
  medium: { label: '中', className: 'badge-medium', color: '#f97316' },
  low: { label: '低', className: 'badge-low', color: '#22c55e' },
};

export default function HomeworkManager({ homeworks, courses, onAddHomework, onUpdateHomework, onToggleComplete, onDeleteHomework }) {
  const [showModal, setShowModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    courseId: '',
  });

  const getCourseName = (courseId) => {
    const course = courses.find(c => String(c.id) === String(courseId));
    return course ? course.name : '未指定课程';
  };

  const getCourseColor = (courseName) => {
    const colors = [
      { bg: 'rgba(62, 188, 175, 0.2)', text: '#3ebcaf' },
      { bg: 'rgba(86, 156, 214, 0.2)', text: '#569cd6' },
      { bg: 'rgba(197, 134, 192, 0.2)', text: '#c586c0' },
      { bg: 'rgba(206, 145, 120, 0.2)', text: '#ce9178' },
      { bg: 'rgba(220, 220, 170, 0.2)', text: '#dcdcaa' },
      { bg: 'rgba(227, 115, 138, 0.2)', text: '#e3738a' },
    ];
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const isUrgent = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && !isNaN(diffDays);
  };

  const isOverdue = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < now && deadlineDate.getDate() !== now.getDate();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const filteredHomeworks = homeworks
    .filter(hw => {
      if (filter === 'all') return true;
      if (filter === 'pending') return !hw.completed;
      if (filter === 'completed') return hw.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'course') {
        return getCourseName(a.courseId).localeCompare(getCourseName(b.courseId));
      }
      return 0;
    });

  const openAddModal = () => {
    setEditingHomework(null);
    setFormData({
      title: '',
      description: '',
      deadline: '',
      priority: 'medium',
      courseId: '',
    });
    setShowModal(true);
  };

  const openEditModal = (hw) => {
    setEditingHomework(hw);
    setFormData({
      title: hw.title,
      description: hw.description,
      deadline: hw.deadline.replace('T', ' ').slice(0, 16),
      priority: hw.priority,
      courseId: hw.courseId,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.deadline) return;
    
    if (editingHomework) {
      onUpdateHomework({
        ...editingHomework,
        ...formData,
      });
    } else {
      onAddHomework({
        ...formData,
        id: Date.now(),
        completed: false,
        createdAt: new Date().toISOString(),
      });
    }
    setShowModal(false);
    setEditingHomework(null);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">作业管理</h2>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
            共 {homeworks.length} 个作业 · 待完成 {homeworks.filter(h => !h.completed).length} 个
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          添加作业
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: filter === f ? 'rgba(0, 122, 204, 0.2)' : 'rgba(255,255,255,0.05)',
                color: filter === f ? '#00a8e8' : '#9ca3af',
                transition: 'all 0.2s ease',
              }}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待完成' : '已完成'}
            </button>
          ))}
        </div>
        <div style={{ flex: '1' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>排序：</span>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="deadline">截止时间</option>
            <option value="priority">优先级</option>
            <option value="course">课程</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredHomeworks.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h3>暂无作业</h3>
            <p>点击上方按钮添加作业</p>
          </div>
        ) : (
          filteredHomeworks.map((hw) => {
            const courseName = getCourseName(hw.courseId);
            const courseColor = getCourseColor(courseName);
            const urgent = isUrgent(hw.deadline);
            const overdue = isOverdue(hw.deadline);

            return (
              <div
                key={hw.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: `1px solid ${overdue || urgent ? '#fca5a5' : '#e2e8f0'}`,
                  transition: 'all 0.2s ease',
                  opacity: hw.completed ? 0.6 : 1,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  className={`checkbox ${hw.completed ? 'checked' : ''}`}
                  onClick={() => onToggleComplete(hw.id)}
                />

                <div style={{ flex: '1', minWidth: '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      className={`badge ${PRIORITY_CONFIG[hw.priority].className}`}
                    >
                      {PRIORITY_CONFIG[hw.priority].label}优先级
                    </span>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: courseColor.bg,
                        color: courseColor.text,
                      }}
                    >
                      {courseName}
                    </span>
                    {overdue && (
                      <span className="badge badge-high">已逾期</span>
                    )}
                    {urgent && !hw.completed && !overdue && (
                      <span className="badge badge-medium">即将截止</span>
                    )}
                  </div>
                  <h4 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: hw.completed ? '#94a3b8' : '#1e293b',
                    textDecoration: hw.completed ? 'line-through' : 'none',
                    marginBottom: '4px',
                  }}>
                    {hw.title}
                  </h4>
                  {hw.description && (
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                      {hw.description}
                    </p>
                  )}
                  <div style={{ fontSize: '12px', color: overdue ? '#dc2626' : '#94a3b8' }}>
                    📅 {formatDate(hw.deadline)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => openEditModal(hw)}
                    style={{ padding: '8px 12px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => onDeleteHomework(hw.id)}
                    style={{ padding: '8px 12px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingHomework ? '编辑作业' : '添加作业'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div>
              <div className="form-group">
                <label className="form-label">作业标题</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="如：完成第三章习题"
                />
              </div>
              <div className="form-group">
                <label className="form-label">所属课程</label>
                <select
                  className="form-select"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                >
                  <option value="">请选择课程</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">截止时间</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">优先级</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setFormData({ ...formData, priority: key })}
                      style={{
                        flex: '1',
                        padding: '10px',
                        borderRadius: '6px',
                        border: `2px solid ${formData.priority === key ? config.color : '#3c3c3c'}`,
                        backgroundColor: formData.priority === key ? `${config.color}20` : 'rgba(255,255,255,0.05)',
                        color: config.color,
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {config.label}优先级
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">描述（可选）</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="添加作业描述..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingHomework ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}