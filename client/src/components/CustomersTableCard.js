import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  Filter as FilterIcon,
  CalendarDays,
  Search as SearchIcon,
  Info,
  Phone as PhoneIcon,
  User,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const statusStyles = {
  مكتمل: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100',
  ملغي: 'text-rose-700 bg-rose-50 ring-1 ring-rose-100',
  مؤكد: 'text-amber-700 bg-amber-50 ring-1 ring-amber-100',
  معلق: 'text-indigo-700 bg-indigo-50 ring-1 ring-indigo-100',
};

const initialRows = [
  { id: 1, name: 'أسماء محمد', phone: '+33757005467', animal: 'الإبل', vaccine: 'تسمم معوي', date: '2025,يناير,12', status: 'مكتمل' },
  { id: 2, name: 'أسماء محمد', phone: '+33757005467', animal: 'الإبل', vaccine: 'تسمم معوي', date: '2025,يناير,12', status: 'ملغي' },
  { id: 3, name: 'أسماء محمد', phone: '+33757005467', animal: 'الإبل', vaccine: 'تسمم معوي', date: '2025,يناير,12', status: 'مؤكد' },
  { id: 4, name: 'أسماء محمد', phone: '+33757005467', animal: 'الإبل', vaccine: 'تسمم معوي', date: '2025,يناير,12', status: 'معلق' },
  { id: 5, name: 'أسماء محمد', phone: '+33757005467', animal: 'الإبل', vaccine: 'تسمم معوي', date: '2025,يناير,12', status: 'مكتمل' },
];

function formatDateArabic(d) {
  // expects 'YYYY,اسم-شهر,DD'
  const parts = d.split(',');
  if (parts.length !== 3) return d;
  return `${parts[0]},${parts[1]} ${parts[2]}`;
}

const CustomersTableCard = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [sortBy, setSortBy] = useState({ key: 'id', dir: 'asc' });
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    let rows = initialRows;
    if (filterStatus !== 'الكل') rows = rows.filter(r => r.status === filterStatus);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(r =>
        r.name.toLowerCase().includes(q) || r.phone.toLowerCase().includes(q) || r.animal.toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => {
      const { key, dir } = sortBy;
      const va = a[key];
      const vb = b[key];
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [search, filterStatus, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key) => {
    setSortBy(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header toolbar */}
      <div className="flex items-center justify-between mb-4" dir="rtl">
        <div className="flex items-center gap-3">
          {/* Status filter */}
          <button className="inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-2xl px-3 py-2 hover:bg-gray-50">
            <ChevronDown size={16} />
            <span>الكل</span>
            <FilterIcon size={16} />
          </button>
          {/* Month selector (static pill) */}
          <button className="inline-flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-2xl px-3 py-2 hover:bg-gray-50">
            <ChevronDown size={16} />
            <span>2025-أكتوبر</span>
            <CalendarDays size={16} />
          </button>
        </div>
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="بحث"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
            <User className="text-indigo-600" size={18} />
          </div>
          <div className="text-sm font-semibold text-[#1F2757]">إدارة قائمة العملاء</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" dir="rtl">
        <table className="min-w-full">
          <thead>
            <tr className="bg-indigo-50 text-[#1F2757] text-sm">
              <th className="py-3 px-3 text-right font-medium rounded-r-xl">#</th>
              <th className="py-3 px-3 text-right font-medium">
                <div className="inline-flex items-center gap-1 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                  <ArrowUpDown size={14} />
                  إسم العميل
                </div>
              </th>
              <th className="py-3 px-3 text-right font-medium">رقم الهاتف</th>
              <th className="py-3 px-3 text-right font-medium">
                <div className="inline-flex items-center gap-1 cursor-pointer select-none" onClick={() => toggleSort('animal')}>
                  <ArrowUpDown size={14} />
                  نوع الحيوان
                </div>
              </th>
              <th className="py-3 px-3 text-right font-medium">التطعيم</th>
              <th className="py-3 px-3 text-right font-medium">
                <div className="inline-flex items-center gap-2 select-none">
                  <span>تاريخ الحجز</span>
                  <CalendarDays size={14} />
                </div>
              </th>
              <th className="py-3 px-3 text-right font-medium rounded-l-xl">حالة الحجز</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {pageRows.map((row, idx) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="py-4 px-3 text-gray-600">{row.id}</td>
                <td className="py-4 px-3 text-gray-900 flex items-center gap-2">
                  <button className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600">
                    <Info size={14} />
                  </button>
                  <span>{row.name}</span>
                </td>
                <td className="py-4  text-gray-700 items-center gap-2">
                  <div className='flex items-center gap-2'>
                    <PhoneIcon size={16} className="text-amber-500" />
                  <span className="ltr:text-left rtl:text-right flex">{row.phone}</span>
                  </div>
                </td>
                <td className="py-4 px-3 text-gray-700">{row.animal}</td>
                <td className="py-4 px-3 text-gray-700">{row.vaccine}</td>
                <td className="py-4 px-3 text-gray-700 flex items-center gap-2">
                  <CalendarDays size={16} className="text-blue-600" />
                  <span>{formatDateArabic(row.date)}</span>
                </td>
                <td className="py-4 px-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[row.status]}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4" dir="rtl">
        <div className="text-sm text-gray-600">النتيجة {page} من {totalPages} صفحة</div>
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-full bg-indigo-900 text-white flex items-center justify-center disabled:opacity-40"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="السابق"
          >
            <ChevronRight size={16} />
          </button>
          {[...Array(Math.min(4, totalPages)).keys()].map(i => {
            const n = i + 1;
            const active = n === page;
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-full text-sm ${active ? 'bg-indigo-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {n}
              </button>
            );
          })}
          <button
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center"
            aria-label="المزيد"
          >
            …
          </button>
          <button
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="التالي"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomersTableCard;
