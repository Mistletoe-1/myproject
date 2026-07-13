import { useMemo } from 'react';
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement, Filler);

function toLocalDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getUniqueCourses(courses) {
  return Array.from(new Map(courses.map((course) => [course.name, course])).values());
}

export default function Statistics({ courses, homeworks }) {
  const today = new Date();
  const todayKey = toLocalDateKey(today);

  const metrics = useMemo(() => {
    const completed = homeworks.filter((homework) => homework.completed);
    const pending = homeworks.filter((homework) => !homework.completed);
    const todayPending = pending.filter((homework) => toLocalDateKey(new Date(homework.deadline)) === todayKey);
    const todayCompleted = completed.filter((homework) => toLocalDateKey(new Date(homework.deadline)) === todayKey);
    const onTime = completed.filter((homework) => {
      const completedAt = new Date(homework.completedAt ?? homework.createdAt);
      const deadline = new Date(homework.deadline);
      return !Number.isNaN(completedAt.getTime()) && !Number.isNaN(deadline.getTime()) && completedAt <= deadline;
    });

    return {
      uniqueCourses: getUniqueCourses(courses).length,
      total: homeworks.length,
      completed: completed.length,
      pending: pending.length,
      todayPending: todayPending.length,
      todayCompleted: todayCompleted.length,
      completionRate: homeworks.length ? Math.round((completed.length / homeworks.length) * 100) : 0,
      onTimeRate: completed.length ? Math.round((onTime.length / completed.length) * 100) : 0,
    };
  }, [courses, homeworks, todayKey]);

  const trend = useMemo(() => {
    const labels = [];
    const pendingData = [];
    const completedData = [];

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      const key = toLocalDateKey(date);

      labels.push(index === 0 ? '今天' : date.toLocaleDateString('zh-CN', { weekday: 'short' }));
      pendingData.push(homeworks.filter((homework) => !homework.completed && toLocalDateKey(new Date(homework.deadline)) === key).length);
      completedData.push(homeworks.filter((homework) => homework.completed && toLocalDateKey(new Date(homework.deadline)) === key).length);
    }

    return { labels, pendingData, completedData };
  }, [homeworks]);

  const doughnutData = useMemo(() => ({
    labels: ['已完成', '待完成'],
    datasets: [{
      data: [metrics.completed, metrics.pending],
      backgroundColor: ['rgba(34, 197, 94, 0.85)', 'rgba(239, 68, 68, 0.85)'],
      borderColor: ['#22c55e', '#ef4444'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }), [metrics.completed, metrics.pending]);

  const lineData = useMemo(() => ({
    labels: trend.labels,
    datasets: [
      {
        label: '待完成',
        data: trend.pendingData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
      },
      {
        label: '已完成',
        data: trend.completedData,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
      },
    ],
  }), [trend]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#64748b', font: { size: 13 }, padding: 20 },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
      },
    },
  };

  const statsCards = [
    { title: '课程数量', value: metrics.uniqueCourses, color: '#0ea5e9', icon: '📚' },
    { title: '作业总数', value: metrics.total, color: '#a855f7', icon: '📝' },
    { title: '今日待完成', value: metrics.todayPending, color: metrics.todayPending ? '#f97316' : '#22c55e', icon: '⏰' },
    { title: '今日已完成', value: metrics.todayCompleted, color: '#22c55e', icon: '✅' },
  ];

  return (
    <section className="card">
      <div className="card-header page-header">
        <div>
          <h1 className="page-title">数据统计</h1>
          <p className="page-subtitle">
            {today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat) => (
          <article key={stat.title} className="stat-card">
            <span className="stat-icon" style={{ backgroundColor: `${stat.color}18`, color: stat.color }}>{stat.icon}</span>
            <div>
              <p>{stat.title}</p>
              <strong style={{ color: stat.color }}>{stat.value}</strong>
            </div>
          </article>
        ))}
      </div>

      <div className="charts-grid">
        <article className="chart-card">
          <h2>作业完成状态</h2>
          <div className="chart-box">
            <Doughnut data={doughnutData} options={{ ...chartOptions, cutout: '65%' }} />
          </div>
        </article>

        <article className="chart-card">
          <h2>未来 7 天作业趋势</h2>
          <div className="chart-box">
            <Line
              data={lineData}
              options={{
                ...chartOptions,
                scales: {
                  x: { grid: { color: 'rgba(15, 23, 42, 0.05)' }, ticks: { color: '#64748b' } },
                  y: { beginAtZero: true, ticks: { color: '#64748b', precision: 0 }, grid: { color: 'rgba(15, 23, 42, 0.05)' } },
                },
              }}
            />
          </div>
        </article>
      </div>

      <div className="progress-grid">
        <article className="progress-card">
          <div>
            <span>作业完成率</span>
            <strong>{metrics.completionRate}%</strong>
          </div>
          <div className="progress-bar">
            <div className="progress-fill progress-green" style={{ width: `${metrics.completionRate}%` }} />
          </div>
        </article>
        <article className="progress-card">
          <div>
            <span>按时提交率</span>
            <strong>{metrics.onTimeRate}%</strong>
          </div>
          <div className="progress-bar">
            <div className="progress-fill progress-blue" style={{ width: `${metrics.onTimeRate}%` }} />
          </div>
        </article>
      </div>
    </section>
  );
}
