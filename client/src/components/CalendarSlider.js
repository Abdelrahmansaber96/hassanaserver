import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react';

const monthsAr = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

function clampMonth(date, minDate, maxDate) {
  if (minDate && date < minDate) return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  if (maxDate && date > maxDate) return new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  return date;
}

const CalendarSlider = ({
  value,
  onChange,
  minDate,
  maxDate,
  className = '',
}) => {
  const initial = useMemo(() => {
    const d = value instanceof Date ? value : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, [value]);

  const [current, setCurrent] = useState(initial);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const year = current.getFullYear();
  const month = current.getMonth();

  const setMonth = (y, m) => {
    let next = new Date(y, m, 1);
    next = clampMonth(next, minDate, maxDate);
    setCurrent(next);
    onChange && onChange(next);
  };

  const goPrev = () => setMonth(year, month - 1);
  const goNext = () => setMonth(year, month + 1);

  const canPrev = !minDate || new Date(year, month, 1) > new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const canNext = !maxDate || new Date(year, month, 1) < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className={`relative inline-flex items-center`} dir="rtl" ref={rootRef}>
      {/* Slider pill */}
      <div
        className={`flex items-center gap-3 bg-white text-[#1F2757] border border-gray-200 rounded-2xl shadow-sm px-3 py-2 cursor-pointer select-none ${className}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="اختيار الشهر"
      >
        {/* Dropdown toggle (left side in RTL) */}
        <span className="p-1.5 rounded-lg text-[#1F2757] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          <ChevronDown size={18} />
        </span>

        {/* Month-Year text with slight slide animation */}
        <div className="min-w-[130px] text-sm font-semibold select-none">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${year}-${month}`}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="inline-block"
            >
              {`${monthsAr[month]}-${year}`}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Right icon */}
        <div className="ml-1">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-white text-[#1F2757]">
            <CalendarPlus size={18} />
          </span>
        </div>
      </div>

      {/* Optional prev/next subtle controls (hidden on small if not needed) */}

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute top-9 z-30   w-64 bg-white border border-gray-200 rounded-2xl shadow-lg p-3"
          >
            {/* Year header with nav */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setMonth(year - 1, month)}
                className="p-1.5 rounded-lg hover:bg-gray-50"
                aria-label="السنة السابقة"
              >
                <ChevronRight size={18} />
              </button>
              <div className="text-sm font-bold text-[#1F2757]">{year}</div>
              <button
                type="button"
                onClick={() => setMonth(year + 1, month)}
                className="p-1.5 rounded-lg hover:bg-gray-50"
                aria-label="السنة التالية"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            {/* Months grid */}
            <div className="grid grid-cols-3 gap-2">
              {monthsAr.map((m, idx) => {
                const selected = idx === month;
                const disabled =
                  (minDate && new Date(year, idx, 1) < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) ||
                  (maxDate && new Date(year, idx, 1) > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1));

                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      if (disabled) return;
                      setMonth(year, idx);
                      setOpen(false);
                    }}
                    className={`text-sm px-2 py-2 rounded-xl border transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-[#1F2757] border-gray-200 hover:bg-gray-50'
                    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarSlider;
