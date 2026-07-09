import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function ExcelImport({ onImportSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file) => {
    setIsLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const courses = parseExcelData(jsonData);
      if (courses.length > 0) {
        onImportSuccess(courses);
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请检查Excel文件格式');
    } finally {
      setIsLoading(false);
    }
  };

  const parseExcelData = (jsonData) => {
    const courses = [];

    for (let row = 0; row < jsonData.length; row++) {
      const rowData = jsonData[row];
      if (!rowData || Object.keys(rowData).length < 2) continue;

      const keys = Object.keys(rowData);
      const firstKey = keys[0];
      const periodLabel = rowData[firstKey];
      
      if (!periodLabel || !periodLabel.includes('大节')) continue;

      const periodNum = parseInt(periodLabel.replace('第', '').replace('大节', ''));

      for (let col = 1; col < keys.length; col++) {
        const cellData = rowData[keys[col]];
        if (!cellData || typeof cellData !== 'string' || cellData.trim() === '') continue;

        const lines = cellData.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 3) continue;

        const courseName = lines[0].trim();
        const teacher = lines[1].trim();
        
        const scheduleLine = lines[2].trim();
        const classroom = lines.length >= 4 ? lines[3].trim() : '';

        const weekMatch = scheduleLine.match(/(\d+)-(\d+)\(\[周\]\)/);
        const periodMatch = scheduleLine.match(/\[(\d+)-(\d+)节\]/);

        if (!periodMatch) continue;

        const startPeriod = parseInt(periodMatch[1]);
        const endPeriod = parseInt(periodMatch[2]);

        let weekType = 'all';
        if (weekMatch) {
          const weekRange = scheduleLine;
          if (weekRange.includes('单周')) {
            weekType = 'odd';
          } else if (weekRange.includes('双周')) {
            weekType = 'even';
          }
        }

        const dayIndex = col - 1;
        if (dayIndex >= WEEK_DAYS.length) continue;

        for (let p = startPeriod; p <= endPeriod; p++) {
          courses.push({
            id: Date.now() + Math.random() + p,
            name: courseName,
            teacher: teacher,
            classroom: classroom,
            day: WEEK_DAYS[dayIndex],
            period: p,
            weekType: weekType,
          });
        }
      }
    }

    return courses;
  };

  const downloadTemplate = () => {
    const templateData = [
      ['学生个人课表', '学年学期：2025-2026-2        班级：计机232        专业：计算机科学与技术        院系：计算机学院'],
      ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
      ['第一大节', '\n课程名\n老师名\n1-8([周])[01-02节]\n教室', '', '', '', '', '', ''],
      ['第二大节', '', '\n课程名\n老师名\n1-8([周])[03-04节]\n教室', '', '', '', '', ''],
      ['第三大节', '', '', '\n课程名\n老师名\n1-8([周])[05-06节]\n教室', '', '', '', ''],
      ['第四大节', '', '', '', '\n课程名\n老师名\n1-8([周])[07-08节]\n教室', '', '', ''],
      ['第五大节', '', '', '', '', '\n课程名\n老师名\n1-8([周])[09-10节]\n教室', '', ''],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '课程表模板');

    const wscols = [
      { wch: 16 },
      { wch: 32 },
      { wch: 32 },
      { wch: 32 },
      { wch: 32 },
      { wch: 32 },
      { wch: 32 },
      { wch: 32 },
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, '课程表模板.xlsx');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">导入课表</h2>
        <button className="btn btn-secondary" onClick={downloadTemplate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          下载模板
        </button>
      </div>

      <div
        className="drop-zone"
        style={{
          border: `2px dashed ${isDragging ? '#007acc' : '#cbd5e1'}`,
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: isDragging ? 'rgba(0, 122, 204, 0.08)' : '#f8fafc',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {isLoading ? (
          <div>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#007acc',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ fontSize: '14px', color: '#64748b' }}>正在解析文件...</p>
          </div>
        ) : (
          <>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: '#007acc', marginBottom: '16px' }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              {isDragging ? '释放文件开始导入' : '拖拽Excel文件到这里'}
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              或点击选择文件
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              fontSize: '13px',
              color: '#64748b',
              border: '1px solid #e2e8f0',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              支持 .xlsx / .xls 格式
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(0, 122, 204, 0.1)' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#00a8e8', marginBottom: '8px' }}>
          使用说明
        </h4>
        <ul style={{ fontSize: '13px', color: '#9ca3af', listStyle: 'none', padding: '0' }}>
          <li style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#00a8e8' }}>•</span>
            下载模板文件并填写课程信息
          </li>
          <li style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#00a8e8' }}>•</span>
            每个单元格填写4行信息，用换行分隔
          </li>
          <li style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#00a8e8' }}>•</span>
            格式：课程名 / 老师名 / 1-8([周])[01-02节] / 教室
          </li>
          <li style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#00a8e8' }}>•</span>
            单周课程：1-8([单周])[01-02节]，双周课程：1-8([双周])[01-02节]
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#00a8e8' }}>•</span>
            也可直接导入学校课表Excel文件
          </li>
        </ul>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}