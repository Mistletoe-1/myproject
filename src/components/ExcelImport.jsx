import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function parseWeeks(value) {
  const text = String(value).replace(/\s/g, '');
  const rangeMatch = text.match(/(\d+)-(\d+)/);

  if (!rangeMatch) {
    return 'all';
  }

  const start = Number(rangeMatch[1]);
  const end = Number(rangeMatch[2]);
  const weeks = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  if (text.includes('单周')) {
    return weeks.filter((week) => week % 2 === 1);
  }

  if (text.includes('双周')) {
    return weeks.filter((week) => week % 2 === 0);
  }

  return weeks;
}

function parsePeriod(periodLabel, fallback) {
  const match = String(periodLabel).match(/(\d+)/);
  return match ? Number(match[1]) : fallback;
}

function parseCell(cellData, fallbackPeriod) {
  const lines = String(cellData).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (lines.length < 2) {
    return null;
  }

  const [name, teacher = '', thirdLine = '', fourthLine = ''] = lines;
  const hasOldScheduleLine = /\[\d+\s*-\s*\d+\s*节\]/.test(thirdLine);
  const classroom = hasOldScheduleLine ? fourthLine : thirdLine;
  const weeksLine = hasOldScheduleLine ? thirdLine : fourthLine;
  const periodMatch = (hasOldScheduleLine ? thirdLine : '').match(/\[(\d+)\s*-\s*(\d+)\s*节\]/);
  const period = periodMatch ? Math.ceil(Number(periodMatch[1]) / 2) : fallbackPeriod;

  return {
    name,
    teacher,
    classroom,
    period,
    weeks: parseWeeks(weeksLine),
  };
}

function parseExcelData(rows) {
  const courses = [];

  rows.forEach((rowData, rowIndex) => {
    const values = Object.values(rowData);
    if (values.length < 2) return;

    const rowPeriod = parsePeriod(values[0], rowIndex + 1);

    values.slice(1, 8).forEach((cellData, dayIndex) => {
      if (!cellData || typeof cellData !== 'string' || !cellData.trim()) return;

      const parsed = parseCell(cellData, rowPeriod);
      if (!parsed) return;

      courses.push({
        id: Date.now() + Math.random(),
        name: parsed.name,
        teacher: parsed.teacher,
        classroom: parsed.classroom,
        day: WEEK_DAYS[dayIndex],
        period: parsed.period,
        weeks: parsed.weeks,
      });
    });
  });

  const unique = new Map();
  courses.forEach((course) => {
    unique.set(`${course.name}-${course.day}-${course.period}-${JSON.stringify(course.weeks)}`, course);
  });

  return Array.from(unique.values());
}

export default function ExcelImport({ onImportSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      const courses = parseExcelData(rows);

      if (courses.length === 0) {
        setError('没有解析到课程。请检查文件是否按模板填写。');
        return;
      }

      onImportSuccess(courses);
    } catch (importError) {
      console.error('导入失败:', importError);
      setError('导入失败，请检查 Excel 文件格式。');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      ['节次', '周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      ['第 1 节', '创新创业\n周老师\n教学楼 C-402\n周次：1-16', '', '操作系统\n王老师\n机房 6\n周次：1-16', '', '', '', ''],
      ['第 2 节', '', '', '', '软件工程\n孙老师\n教学楼 B-204\n周次：1-16', '计算机网络\n赵老师\n实验楼 203\n周次：1-16', '', ''],
      ['第 3 节', '信息安全\n陈老师\n机房 8\n周次：1-16', '', '创新创业\n周老师\n教学楼 C-402\n周次：1-16', '', '', '', ''],
      ['第 4 节', '', '计算机网络\n赵老师\n实验楼 203\n周次：1-16', '', '单片机及嵌入式系统\n刘老师\n实验楼 301\n周次：1-16', '', '', '软件工程\n孙老师\n教学楼 B-204\n周次：1-16'],
      ['第 5 节', '', '', 'Python程序设计\n李老师\n机房 10\n周次：1-16', '', '操作系统\n王老师\n机房 6\n周次：1-16', 'Python程序设计\n李老师\n机房 10\n周次：1-16', ''],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    worksheet['!cols'] = [{ wch: 12 }, ...Array.from({ length: 7 }, () => ({ wch: 32 }))];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '课程表模板');
    XLSX.writeFile(workbook, '课程表模板.xlsx');
  };

  return (
    <section className="card">
      <div className="card-header page-header">
        <div>
          <h1 className="page-title">导入课表</h1>
          <p className="page-subtitle">模板与课程表页面一致：横向是星期，纵向是第 1-5 节。</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={downloadTemplate}>
          下载模板
        </button>
      </div>

      <button
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        type="button"
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          hidden
        />

        <span className="drop-icon">{isLoading ? '⏳' : '📄'}</span>
        <strong>{isLoading ? '正在解析文件...' : isDragging ? '释放文件开始导入' : '拖拽 Excel 文件到这里'}</strong>
        <span>或点击选择文件</span>
      </button>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="help-panel">
        <h2>填写格式</h2>
        <ul>
          <li>每个课程单元格按 4 行填写：课程名、教师、上课地点、周次。</li>
          <li>示例：信息安全 / 陈老师 / 机房 8 / 周次：1-16。</li>
          <li>单周或双周可写为：周次：1-16 单周、周次：1-16 双周。</li>
        </ul>
      </div>
    </section>
  );
}
