export const accentStyles = [
    { tile: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    { tile: 'bg-cyan-50', icon: 'text-cyan-600', ring: 'ring-cyan-100' },
    { tile: 'bg-fuchsia-50', icon: 'text-fuchsia-600', ring: 'ring-fuchsia-100' },
    { tile: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
];

export const getProductImageUrl = (image) => {
    if (!image) return '';
    return image.image_url || (image.product_image_title ? `/storage/products/${image.product_image_title}` : '');
};

export const inputClass = (hasError) =>
    `mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
    }`;

export const selectClass = (hasError) =>
    `mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
    }`;

export const textareaClass = (hasError) =>
    `mt-2 w-full rounded-xl border bg-white p-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
    }`;
