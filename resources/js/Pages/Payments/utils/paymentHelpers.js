export const money = (value) => Number(value || 0).toFixed(2);

export const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

export const getProductImageUrl = (image) => {
    if (!image) return '';
    return image.image_url || (image.product_image_title ? `/storage/products/${image.product_image_title}` : '');
};

export const getCategoryStyle = (categoryName) => {
    const name = (categoryName || '').toLowerCase().trim();
    if (name.includes('sandwich')) return 'bg-amber-50 text-amber-700 border-amber-100/50';
    if (name.includes('pastry') || name.includes('bakery')) return 'bg-teal-50 text-teal-700 border-teal-100/50';
    if (name.includes('donut')) return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100/50';
    if (name.includes('cake')) return 'bg-rose-50 text-rose-700 border-rose-100/50';
    if (name.includes('bread')) return 'bg-orange-50 text-orange-700 border-orange-100/50';
    if (name.includes('beverage') || name.includes('drink')) return 'bg-sky-50 text-sky-700 border-sky-100/50';
    if (name.includes('snack')) return 'bg-pink-50 text-pink-700 border-pink-100/50';
    if (name.includes('dairy')) return 'bg-indigo-50 text-indigo-700 border-indigo-100/50';
    if (name.includes('pantry')) return 'bg-purple-50 text-purple-700 border-purple-100/50';
    return 'bg-slate-50 text-slate-600 border-slate-100';
};

export const parseKhqrTags = (qrStr) => {
    if (!qrStr) return [];
    const tags = [];
    let index = 0;
    while (index < qrStr.length) {
        const tagId = qrStr.substring(index, index + 2);
        const tagLength = parseInt(qrStr.substring(index + 2, index + 4), 10);
        if (isNaN(tagLength)) break;
        const tagValue = qrStr.substring(index + 4, index + 4 + tagLength);

        let tagDescription = "Unknown Tag";
        if (tagId === "00") tagDescription = "Payload Format Indicator";
        else if (tagId === "01") tagDescription = "Point of Initiation Method";
        else if (tagId === "29") tagDescription = "Merchant Account Information (NBC Bakong)";
        else if (tagId === "52") tagDescription = "Merchant Category Code";
        else if (tagId === "53") tagDescription = "Transaction Currency";
        else if (tagId === "54") tagDescription = "Transaction Amount";
        else if (tagId === "58") tagDescription = "Country Code";
        else if (tagId === "59") tagDescription = "Merchant Name";
        else if (tagId === "60") tagDescription = "Merchant City";
        else if (tagId === "62") tagDescription = "Additional Data Field Template";
        else if (tagId === "63") tagDescription = "CRC16 Checksum";
        else if (tagId === "99") tagDescription = "Merchant Proprietary Template";

        tags.push({
            id: tagId,
            length: tagLength,
            value: tagValue,
            desc: tagDescription,
        });
        index += 4 + tagLength;
    }
    return tags;
};
