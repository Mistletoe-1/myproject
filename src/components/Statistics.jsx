import { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement, Filler } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement, Filler);

export default function Statistics({ courses, homeworks }) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const trendRef = useRef(null);
  const trendChartRef = useRef(null);

  const uniqueCourses = [...new Map(courses.map(c => [c.name, c])).values()];
  
  const completedCount = homeworks.filter(h => h.completed).length;
  const pendingCount = homeworks.filter(h => !h.completed).length;
  
  const todayHomeworks = homeworks.filter(hw => {
    const hwDate = new Date(hw.deadline);
    return hwDate.toISOString().split('T')[0] === todayStr && !hw.completed;
  });

  const todayCompleted = homeworks.filter(hw => {
    const hwDate = new Date(hw.deadline);
    return hwDate.toISOString().split('T')[0] === todayStr && hw.completed;
  }).length;

  const onTimeCount = homeworks.filter(h => {
    if (!h.completed) return false;
    const deadline = new Date(h.deadline);
    return deadline >= new Date(h.completedAt || h.createdAt);
  }).length;

  const completionRate = homeworks.length > 0 ? Math.round((completedCount / homeworks.length) * 100) : 0;
  const onTimeRate = completedCount > 0 ? Math.round((onTimeCount / completedCount) * 100) : 0;

  const getHomeworkTrend = () => {
    const days = [];
    const pendingData = [];
    const completedData = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayName = i === 0 ? '今天' : date.toLocaleDateString('zh-CN', { weekday: 'short' });
      days.push(dayName);
      
      const dayPending = homeworks.filter(hw => {
        const hwDate = new Date(hw.deadline);
        return hwDate.toISOString().split('T')[0] === dateStr && !hw.completed;
      }).length;
      pendingData.push(dayPending);
      
      const dayCompleted = homeworks.filter(hw => {
        const hwDate = new Date(hw.deadline);
        return hwDate.toISOString().split('T')[0] === dateStr && hw.completed;
      }).length;
      completedData.push(dayCompleted);
    }
    
    return { days, pendingData, completedData };
  };

  const { days, pendingData, completedData } = getHomeworkTrend();

  useEffect(() => {
    if (trendChartRef.current) {
      trendChartRef.current.destroy();
      trendChartRef.current = null;
    }

    if (trendRef.current) {
      setTimeout(() => {
        trendChartRef.current = new ChartJS(trendRef.current, {
          type: 'line',
          data: {
            labels: days,
            datasets: [
              {
                label: '待完成',
                data: pendingData,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
              },
              {
                label: '已完成',
                data: completedData,
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#22c55e',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#64748b',
                  font: { size: 13 },
                  padding: 20,
                },
              },
              tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#ffffff',
                bodyColor: '#cbd5e1',
                borderColor: '#475569',
                borderWidth: 1,
              },
            },
            scales: {
              x: {
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#64748b', font: { size: 12 } },
              },
              y: {
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#64748b', font: { size: 12 }, stepSize: 1 },
                beginAtZero: true,
              },
            },
          },
        });
      }, 0);
    }

    return () => {
      if (trendChartRef.current) {
        trendChartRef.current.destroy();
        trendChartRef.current = null;
      }
    };
  }, [homeworks, days, pendingData, completedData]);

  const doughnutData = {
    labels: ['已完成', '待完成'],
    datasets: [{
      data: [completedCount, pendingCount],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      borderColor: ['#22c55e', '#ef4444'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#64748b',
          font: { size: 13 },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
      },
    },
    cutout: '65%',
  };

  const statsCards = [
    {
      title: '课程数量',
      value: uniqueCourses.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      color: '#00a8e8',
    },
    {
      title: '作业总数',
      value: homeworks.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      color: '#c586c0',
    },
    {
      title: '今日待完成',
      value: todayHomeworks.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      color: todayHomeworks.length > 0 ? '#f97316' : '#22c55e',
    },
    {
      title: '今日已完成',
      value: todayCompleted,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: '#22c55e',
    },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">数据统计</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            {today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          {statsCards.map((stat, index) => (
            <div
              key={index}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = stat.color;
                e.currentTarget.style.boxShadow = `0 4px 16px ${stat.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{stat.title}</p>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>作业完成状态</h3>
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut key={`doughnut-${completedCount}-${pendingCount}`} data={doughnutData} options={doughnutOptions} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{completedCount}</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>已完成</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{pendingCount}</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>待完成</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>作业截止趋势</h3>
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <canvas ref={trendRef} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>作业完成率</span>
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#22c55e' }}>{completionRate}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill progress-green"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>按时提交率</span>
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#007acc' }}>{onTimeRate}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill progress-blue"
                style={{ width: `${onTimeRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
