import { useState } from 'react';
import './Calendar.css';
import { todayISO, formatISO, isValidWordleDate } from '../../utils/dateUtils';
import { WORDLE_START_DATE } from '../../utils/constants';

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function Calendar({ selectedDate, onSelectDate, completedDates }) {
  const today = todayISO();
  const [viewYear, setViewYear] = useState(() => parseInt(selectedDate.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => parseInt(selectedDate.slice(5, 7)) - 1);

  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const todayDate = new Date(today + 'T00:00:00');
  const canGoPrev = !(viewYear === 2021 && viewMonth === 5);
  const canGoNext = !(viewYear === todayDate.getFullYear() && viewMonth === todayDate.getMonth());

  function prevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOffset + 1;
    if (day < 1 || day > daysInMonth) return null;
    const dateStr = formatISO(new Date(viewYear, viewMonth, day));
    const valid = isValidWordleDate(dateStr);
    const result = completedDates[dateStr];
    return { day, dateStr, valid, result };
  });

  return (
    <div className="calendar">
      <div className="calendar-nav">
        <button className="cal-nav-btn" onClick={prevMonth} disabled={!canGoPrev} aria-label="Previous month">‹</button>
        <span className="cal-title">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button className="cal-nav-btn" onClick={nextMonth} disabled={!canGoNext} aria-label="Next month">›</button>
      </div>
      <div className="calendar-grid">
        {DAY_NAMES.map(d => (
          <div key={d} className="cal-day-name">{d}</div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="cal-cell cal-cell--empty" />;
          const isSelected = cell.dateStr === selectedDate;
          const isToday = cell.dateStr === today;
          let cls = 'cal-cell';
          if (!cell.valid) cls += ' cal-cell--disabled';
          if (isSelected) cls += ' cal-cell--selected';
          if (isToday && !isSelected) cls += ' cal-cell--today';
          if (cell.result === 'won') cls += ' cal-cell--won';
          if (cell.result === 'lost') cls += ' cal-cell--lost';
          return (
            <button
              key={i}
              className={cls}
              onClick={() => cell.valid && onSelectDate(cell.dateStr)}
              disabled={!cell.valid}
              aria-label={cell.dateStr}
              aria-pressed={isSelected}
            >
              {cell.day}
              {cell.result && <span className="cal-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
