export const accentStyles = [
    { tile: 'bg-fuchsia-50', icon: 'text-fuchsia-500', ring: 'ring-fuchsia-100' },
    { tile: 'bg-cyan-50', icon: 'text-cyan-500', ring: 'ring-cyan-100' },
    { tile: 'bg-lime-50', icon: 'text-lime-600', ring: 'ring-lime-100' },
    { tile: 'bg-violet-50', icon: 'text-violet-500', ring: 'ring-violet-100' },
    { tile: 'bg-orange-50', icon: 'text-orange-500', ring: 'ring-orange-100' },
    { tile: 'bg-rose-50', icon: 'text-rose-500', ring: 'ring-rose-100' },
];

export const fieldClass = (hasError) =>
    `mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
    }`;

export const getCategoryName = (item) => item?.category?.category_title || item?.category?.name || 'Unassigned';

export const getStatus = (item) => item?.status === 1 || item?.status === 'active' ? 'active' : 'inactive';
