import Breadcrumb from '@/Components/Breadcrumb';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import moment from 'moment';
import { useState } from 'react';

const accentStyles = [
    { tile: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    { tile: 'bg-cyan-50', icon: 'text-cyan-600', ring: 'ring-cyan-100' },
    { tile: 'bg-fuchsia-50', icon: 'text-fuchsia-600', ring: 'ring-fuchsia-100' },
    { tile: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
];

const inputClass = (hasError) =>
    `mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
    }`;

const selectClass = (hasError) =>
    `mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
    }`;

const textareaClass = (hasError) =>
    `mt-2 w-full rounded-xl border bg-white p-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
    }`;

export default function ProductsPage({ auth, products, categories, sizes, units, makers, brands, filters }) {
    const datasList = products?.data || products || [];
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [codeExistsError, setCodeExistsError] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});
    const [productDetail, setProductDetail] = useState(null);

    // Image Previews States
    const [selectedImages, setSelectedImages] = useState([]);

    const currentUserId = auth?.user?.id || 1;

    const getProductImageUrl = (image) => {
        if (!image) return '';
        return image.image_url || (image.product_image_title ? `/storage/products/${image.product_image_title}` : '');
    };

    const initialFormState = {
        product_title: '',
        product_code: '',
        product_price: '',
        product_stock: '',
        product_status: '1',
        category_id: '',
        size_id: '',
        unit_id: '',
        maker_id: '',
        brand_id: '',
        product_description: '',
        user_id: currentUserId,
        images: [] // Maps selected files arrays
    };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm(initialFormState);
    const { data: editData, setData: setEditData, post: postEdit, processing: editProcessing, errors: editErrors, reset: editReset, clearErrors: editClearErrors } = useForm({ id: '', _method: 'PATCH', ...initialFormState });
    const { delete: destroy, processing: deleteProcessing } = useForm();

    const headWeb = 'Product List';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('products.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const handleCheckCodeExists = async (value, isEdit = false) => {
        setCodeExistsError('');
        if (!value) return;
        try {
            const response = await axios.post(route('products.check'), { product_code: value });
            if (response.data.exists) {
                if (isEdit && dataEdit.product_code === value) return;
                setCodeExistsError('This product code/barcode already exists.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // File input selection event transformations
    const handleFileChange = (e, isEdit = false) => {
        const files = Array.from(e.target.files);
        if (isEdit) {
            setEditData('images', files);
        } else {
            setData('images', files);
        }

        // Generate immediate base64 graphics blobs for interface previews
        const previews = files.map(file => URL.createObjectURL(file));
        setSelectedImages(previews);
    };

    const openAddModal = () => { reset(); setSelectedImages([]); clearErrors(); setCodeExistsError(''); setIsModalOpen(true); };
    const closeAddModal = () => { setIsModalOpen(false); reset(); setSelectedImages([]); clearErrors(); };
    const submitAdd = (e) => { 
        e.preventDefault(); 
        if (codeExistsError) return; 
        post(route('products.store'), {
            forceFormData: true,
            onSuccess: () => {
                closeAddModal();
                router.reload({ only: ['products'] });
            }
        }); 
    };

    const openEditModal = (item) => {
        setDataEdit(item);
        setSelectedImages([]);
        setEditData({
            id: item.id,
            _method: 'PATCH',
            product_title: item.product_title || '',
            product_code: item.product_code || '',
            product_price: item.product_price || '',
            product_stock: item.product_stock || '',
            product_status: String(item.product_status || '1'),
            category_id: item.category_id || '',
            size_id: item.size_id || '',
            unit_id: item.unit_id || '',
            maker_id: item.maker_id || '',
            brand_id: item.brand_id || '',
            product_description: item.product_description || '',
            user_id: currentUserId,
            images: []
        });
        editClearErrors();
        setCodeExistsError('');
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => { setIsEditModalOpen(false); editReset(); setSelectedImages([]); editClearErrors(); };
    const submitEdit = (e) => { 
        e.preventDefault(); 
        if (codeExistsError) return; 
        // Emulate PATCH mapping configuration over standard validation upload requests via POST
        postEdit(route('products.update', editData.id), {
            forceFormData: true,
            onSuccess: () => {
                closeEditModal();
                router.reload({ only: ['products'] });
            }
        }); 
    };

    // Delete single existing image dynamically
    const deleteUploadedImage = (imgId) => {
        if (confirm('Are you sure you want to remove this image file permanently?')) {
            router.delete(route('products.images.destroy', imgId), {
                preserveScroll: true,
                onSuccess: () => {
                    // Instantly patch the local view context state to avoid modal data refresh jumps
                    const updatedImages = dataEdit.images.filter(img => img.id !== imgId);
                    setDataEdit({ ...dataEdit, images: updatedImages });
                }
            });
        }
    };

    const openDetailModal = (item) => { setProductDetail(item); setIsDetailModalOpen(true); };
    const closeDetailModal = () => { setIsDetailModalOpen(false); setProductDetail(null); };

    const confirmDataDeletion = (item) => { setDataEdit(item); setConfirmingDataDeletion(true); };
    const closeModal = () => { setConfirmingDataDeletion(false); setDataEdit({}); };
    const deleteDataRow = (e) => { e.preventDefault(); destroy(route('products.destroy', dataEdit.id), { preserveScroll: true, onSuccess: () => closeModal() }); };

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                                    <i className="fas fa-box text-[10px]"></i>
                                    Inventory items
                                </div>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">Product List</h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Manage catalog products, pricing, stock levels, and media.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        name="table_search"
                                        className="h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Search title or code..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button type="submit" className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600" aria-label="Search products">
                                        <i className="fas fa-search text-xs"></i>
                                    </button>
                                </form>

                                <button onClick={openAddModal} type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2">
                                    <i className="fas fa-plus text-xs"></i>
                                    Add Product
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-emerald-50 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                            <div className="border-b border-emerald-50 bg-white px-5 py-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-950">Products Management</h2>
                                        <p className="mt-1 text-sm text-slate-500">{datasList.length} products loaded on this page.</p>
                                    </div>
                                    <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline-flex">
                                        Active catalog items
                                    </span>
                                </div>
                            </div>

                            <div className="w-full overflow-x-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-emerald-50 bg-emerald-50/60 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                            <th className="px-3 py-2.5">Image</th>
                                            <th className="px-3 py-2.5 hidden sm:table-cell">Code</th>
                                            <th className="px-3 py-2.5">Product Title</th>
                                            <th className="px-3 py-2.5 hidden md:table-cell">Category</th>
                                            <th className="px-3 py-2.5">Price</th>
                                            <th className="px-3 py-2.5 hidden sm:table-cell">Stock</th>
                                            <th className="px-3 py-2.5 hidden sm:table-cell">Status</th>
                                            <th className="px-3 py-2.5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-50">
                                        {datasList.length > 0 ? (
                                            datasList.map((item, index) => {
                                                const accent = accentStyles[index % accentStyles.length];

                                                return (
                                                    <tr key={item.id} className="transition hover:bg-emerald-50/30">
                                                        <td className="px-3 py-2.5">
                                                            {item.images && item.images.length > 0 ? (
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden ring-1 ring-emerald-100 bg-white shadow-xs">
                                                                    <img src={getProductImageUrl(item.images[0])} className="h-full w-full object-cover" alt="product thumbnail" />
                                                                </div>
                                                            ) : (
                                                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent.tile} ${accent.icon} ring-1 ${accent.ring}`}>
                                                                    <i className="fas fa-box text-xs"></i>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2.5 hidden sm:table-cell">
                                                            <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                                {item.product_code}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex flex-col min-w-0">
                                                                <p className="text-xs sm:text-sm font-bold text-slate-950 truncate" title={item.product_title}>{item.product_title}</p>
                                                                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-400">
                                                                    <span>ID #{item.id}</span>
                                                                    <span className="sm:hidden">• {item.product_code}</span>
                                                                    <span className="md:hidden">• {item.category?.category_title || item.category?.name || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2.5 hidden md:table-cell">
                                                            <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 truncate max-w-full">
                                                                {item.category?.category_title || item.category?.name || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-xs font-bold text-emerald-600">
                                                            ${Number(item.product_price).toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-xs font-semibold text-slate-700 hidden sm:table-cell">
                                                            {item.product_stock}
                                                        </td>
                                                        <td className="px-3 py-2.5 hidden sm:table-cell">
                                                            <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                                                                item.product_status === 1 
                                                                    ? 'bg-emerald-50 text-emerald-700' 
                                                                    : 'bg-rose-50 text-rose-700'
                                                            }`}>
                                                                {item.product_status === 1 ? 'In Stock' : 'Out'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex justify-end gap-1">
                                                                <button onClick={() => openDetailModal(item)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100" type="button" title="Detail">
                                                                    <i className="fas fa-eye text-[10px]"></i>
                                                                </button>
                                                                <button onClick={() => openEditModal(item)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-700 transition hover:bg-cyan-100" type="button" title="Edit">
                                                                    <i className="fas fa-edit text-[10px]"></i>
                                                                </button>
                                                                <button onClick={() => confirmDataDeletion(item)} type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100" title="Delete">
                                                                    <i className="fas fa-trash text-[10px]"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="px-5 py-14 text-center">
                                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                                                        <i className="fas fa-box text-lg"></i>
                                                    </div>
                                                    <p className="mt-4 text-sm font-semibold text-slate-500">There are no records found!</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {products?.links && (
                                <div className="border-t border-emerald-50 px-4 py-3">
                                    <Pagination links={products.links} />
                                </div>
                            )}
                        </div>

                        {/* DETAIL MODAL WITH IMAGE GALLERY */}
                        <Modal show={isDetailModalOpen} onClose={closeDetailModal}>
                            <div className="p-6 max-h-[85vh] overflow-y-auto">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                                        <i className="fas fa-info-circle text-lg"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-950">Product Specification Details</h2>
                                        <p className="mt-1 text-sm text-slate-500">Review detailed information and images of this product.</p>
                                    </div>
                                </div>
                                
                                {productDetail && (
                                    <>
                                        {productDetail.images && productDetail.images.length > 0 && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-slate-800 mb-2">Uploaded Product Images</label>
                                                <div className="flex flex-wrap gap-2 p-2 border border-emerald-50 rounded-xl bg-slate-50/50">
                                                    {productDetail.images.map((img) => (
                                                        <a href={getProductImageUrl(img)} target="_blank" key={img.id} rel="noreferrer">
                                                            <img src={getProductImageUrl(img)} className="object-cover rounded-lg shadow-sm hover:opacity-75 transition border border-slate-105 bg-white" style={{ width: '90px', height: '90px' }} alt="Specification product graphics" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="overflow-hidden rounded-xl border border-emerald-50 bg-white">
                                            <table className="w-full text-left border-collapse text-sm">
                                                <tbody>
                                                    <tr className="border-b border-emerald-50"><th width="35%" className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Database Record ID</th><td className="p-3 text-slate-600">{productDetail.id}</td></tr>
                                                    <tr className="border-b border-emerald-50"><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Product Code / Barcode</th><td className="p-3"><span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{productDetail.product_code}</span></td></tr>
                                                    <tr className="border-b border-emerald-50"><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Product Name Title</th><td className="p-3 font-bold text-slate-800">{productDetail.product_title}</td></tr>
                                                    <tr className="border-b border-emerald-50"><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Main Category</th><td className="p-3 text-slate-600">{productDetail.category?.category_title || productDetail.category?.name || 'N/A'}</td></tr>
                                                    <tr className="border-b border-emerald-50"><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Brand Identity</th><td className="p-3 text-slate-600">{productDetail.brand?.brand_title || 'N/A'}</td></tr>
                                                    <tr className="border-b border-emerald-50"><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Manufacturer / Maker</th><td className="p-3 text-slate-600">{productDetail.maker?.maker_title || 'N/A'}</td></tr>
                                                    <tr className="border-b border-emerald-50"><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Dimension / Size</th><td className="p-3 text-slate-600">{productDetail.size?.size_title || 'N/A'}</td></tr>
                                                    <tr className="border-b border-emerald-50"><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Unit Configuration</th><td className="p-3 text-slate-600">{productDetail.unit?.unit_title || 'N/A'}</td></tr>
                                                    <tr className="border-b border-emerald-50"><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Unit Price</th><td className="p-3 font-bold text-emerald-600">${Number(productDetail.product_price).toFixed(2)}</td></tr>
                                                    <tr className="border-b border-emerald-50"><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Current Stock Level</th><td className="p-3 text-slate-600">{productDetail.product_stock} items remaining</td></tr>
                                                    <tr className="border-b border-emerald-50"><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Inventory Status</th><td className="p-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${productDetail.product_status === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{productDetail.product_status === 1 ? 'In Stock' : 'Out of Stock'}</span></td></tr>
                                                    <tr className="border-b border-emerald-50"><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">System Time Registered</th><td className="p-3 text-slate-505">{moment(productDetail.created_at).format("DD/MM/YYYY HH:mm:ss")}</td></tr>
                                                    <tr><th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Detailed Description</th><td className="p-3 text-slate-600" style={{ whiteSpace: 'pre-line' }}>{productDetail.product_description || <span className="text-slate-400 italic">No extra description logs provided.</span>}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton onClick={closeDetailModal}>Close</SecondaryButton>
                                </div>
                            </div>
                        </Modal>

                        {/* ADD MODAL WITH MULTI-IMAGE UPLOADER */}
                        <Modal show={isModalOpen} onClose={closeAddModal}>
                            <form onSubmit={submitAdd} noValidate className="p-6 max-h-[85vh] overflow-y-auto">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                                        <i className="fas fa-plus text-lg"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-950">Add New Product</h2>
                                        <p className="mt-1 text-sm text-slate-500">Fill in the fields to list a new item in inventory.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1 md:col-span-2 border-2 border-dashed border-emerald-100 rounded-2xl p-4 bg-slate-50/50 text-center hover:bg-slate-50 transition">
                                        <label className="block text-sm font-semibold text-slate-800 mb-2">Upload Product Images (JPEG, PNG, JPG) *</label>
                                        <input type="file" multiple accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" onChange={(e) => handleFileChange(e, false)} />
                                        <InputError message={errors.images} className="mt-2" />
                                        {selectedImages.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4 justify-center border-t border-emerald-50 pt-3">
                                                {selectedImages.map((src, idx) => <img src={src} key={idx} className="object-cover rounded-xl shadow-sm border border-slate-100 bg-white" style={{ width: '65px', height: '65px' }} alt="Preview block" />)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Product Title *</label>
                                        <input type="text" className={inputClass(errors.product_title)} value={data.product_title} onChange={e => setData('product_title', e.target.value)} placeholder="e.g. Organic Milk" />
                                        <InputError message={errors.product_title} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Product Code / Barcode *</label>
                                        <input type="text" className={inputClass(codeExistsError || errors.product_code)} value={data.product_code} onChange={e => setData('product_code', e.target.value)} onBlur={e => handleCheckCodeExists(e.target.value)} placeholder="e.g. 888123456789" />
                                        <InputError message={codeExistsError || errors.product_code} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Category *</label>
                                        <select className={selectClass(errors.category_id)} value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.category_title || c.name}</option>)}
                                        </select>
                                        <InputError message={errors.category_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Brand *</label>
                                        <select className={selectClass(errors.brand_id)} value={data.brand_id} onChange={e => setData('brand_id', e.target.value)}>
                                            <option value="">Select Brand</option>
                                            {brands.map(b => <option key={b.id} value={b.id}>{b.brand_title}</option>)}
                                        </select>
                                        <InputError message={errors.brand_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Maker *</label>
                                        <select className={selectClass(errors.maker_id)} value={data.maker_id} onChange={e => setData('maker_id', e.target.value)}>
                                            <option value="">Select Maker</option>
                                            {makers.map(m => <option key={m.id} value={m.id}>{m.maker_title}</option>)}
                                        </select>
                                        <InputError message={errors.maker_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Size *</label>
                                        <select className={selectClass(errors.size_id)} value={data.size_id} onChange={e => setData('size_id', e.target.value)}>
                                            <option value="">Select Size</option>
                                            {sizes.map(s => <option key={s.id} value={s.id}>{s.size_title}</option>)}
                                        </select>
                                        <InputError message={errors.size_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Unit Configuration *</label>
                                        <select className={selectClass(errors.unit_id)} value={data.unit_id} onChange={e => setData('unit_id', e.target.value)}>
                                            <option value="">Select Unit</option>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.unit_title}</option>)}
                                        </select>
                                        <InputError message={errors.unit_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Status *</label>
                                        <select className={selectClass(false)} value={data.product_status} onChange={e => setData('product_status', e.target.value)}>
                                            <option value="1">In Stock</option>
                                            <option value="2">Out of Stock</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Price ($) *</label>
                                        <input type="number" step="0.01" className={inputClass(errors.product_price)} value={data.product_price} onChange={e => setData('product_price', e.target.value)} placeholder="0.00" />
                                        <InputError message={errors.product_price} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Initial Stock *</label>
                                        <input type="number" className={inputClass(errors.product_stock)} value={data.product_stock} onChange={e => setData('product_stock', e.target.value)} placeholder="0" />
                                        <InputError message={errors.product_stock} className="mt-2" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-slate-800">Description</label>
                                    <textarea className={textareaClass(false)} rows="3" value={data.product_description} onChange={e => setData('product_description', e.target.value)} placeholder="Enter details..."></textarea>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <SecondaryButton onClick={closeAddModal}>Cancel</SecondaryButton>
                                    <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70" disabled={processing || !!codeExistsError} type="submit">
                                        {processing && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                                        Save Product
                                    </button>
                                </div>
                            </form>
                        </Modal>

                        {/* EDIT MODAL WITH LIVE FILE MANAGEMENT */}
                        <Modal show={isEditModalOpen} onClose={closeEditModal}>
                            <form onSubmit={submitEdit} className="p-6 max-h-[85vh] overflow-y-auto">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
                                        <i className="fas fa-edit text-lg"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-950">Edit Product</h2>
                                        <p className="mt-1 text-sm text-slate-500">Update product specifications or manage photo gallery files.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Handle displaying currently active file assets array for instant storage deletes */}
                                    {dataEdit.images && dataEdit.images.length > 0 && (
                                        <div className="col-span-1 md:col-span-2 border border-emerald-50 p-4 rounded-2xl bg-slate-50/50">
                                            <label className="block text-sm font-semibold text-slate-800 mb-2">Current Product Images</label>
                                            <div className="flex flex-wrap gap-2">
                                                {dataEdit.images.map((img) => (
                                                    <div key={img.id} className="relative inline-block border bg-white rounded-xl p-1 border-slate-100 shadow-sm">
                                                        <img src={getProductImageUrl(img)} className="object-cover rounded-lg" style={{ width: '60px', height: '60px' }} alt="Active grid item" />
                                                        <button type="button" onClick={() => deleteUploadedImage(img.id)} className="absolute -top-1.5 -right-1.5 bg-rose-650 text-white rounded-full flex items-center justify-center text-xs font-bold shadow hover:bg-rose-700 transition" style={{ width: '18px', height: '18px', border: 'none' }}>×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-span-1 md:col-span-2 border-2 border-dashed border-cyan-100 rounded-2xl p-4 bg-slate-50/50 text-center hover:bg-slate-50 transition">
                                        <label className="block text-sm font-semibold text-slate-800 mb-2">Replace / Append Product Images</label>
                                        <input type="file" multiple accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer" onChange={(e) => handleFileChange(e, true)} />
                                        <InputError message={editErrors.images} className="mt-2" />
                                        {selectedImages.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4 justify-center border-t border-cyan-50 pt-3">
                                                {selectedImages.map((src, idx) => <img src={src} key={idx} className="object-cover rounded-xl shadow-sm border border-slate-100 bg-white" style={{ width: '65px', height: '65px' }} alt="Append staging previews" />)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Product Title *</label>
                                        <input type="text" className={inputClass(editErrors.product_title)} value={editData.product_title} onChange={e => setEditData('product_title', e.target.value)} placeholder="e.g. Organic Milk" required />
                                        <InputError message={editErrors.product_title} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Product Code / Barcode *</label>
                                        <input type="text" className={inputClass(codeExistsError || editErrors.product_code)} value={editData.product_code} onChange={e => setEditData('product_code', e.target.value)} onBlur={e => handleCheckCodeExists(e.target.value, true)} placeholder="e.g. 888123456789" required />
                                        <InputError message={codeExistsError || editErrors.product_code} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Category *</label>
                                        <select className={selectClass(editErrors.category_id)} value={editData.category_id} onChange={e => setEditData('category_id', e.target.value)} required>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.category_title || c.name}</option>)}
                                        </select>
                                        <InputError message={editErrors.category_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Brand *</label>
                                        <select className={selectClass(editErrors.brand_id)} value={editData.brand_id} onChange={e => setEditData('brand_id', e.target.value)} required>
                                            {brands.map(b => <option key={b.id} value={b.id}>{b.brand_title}</option>)}
                                        </select>
                                        <InputError message={editErrors.brand_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Maker *</label>
                                        <select className={selectClass(editErrors.maker_id)} value={editData.maker_id} onChange={e => setEditData('maker_id', e.target.value)} required>
                                            {makers.map(m => <option key={m.id} value={m.id}>{m.maker_title}</option>)}
                                        </select>
                                        <InputError message={editErrors.maker_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Size *</label>
                                        <select className={selectClass(editErrors.size_id)} value={editData.size_id} onChange={e => setEditData('size_id', e.target.value)} required>
                                            {sizes.map(s => <option key={s.id} value={s.id}>{s.size_title}</option>)}
                                        </select>
                                        <InputError message={editErrors.size_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Unit Configuration *</label>
                                        <select className={selectClass(editErrors.unit_id)} value={editData.unit_id} onChange={e => setEditData('unit_id', e.target.value)} required>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.unit_title}</option>)}
                                        </select>
                                        <InputError message={editErrors.unit_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Status *</label>
                                        <select className={selectClass(false)} value={editData.product_status} onChange={e => setEditData('product_status', e.target.value)} required>
                                            <option value="1">In Stock</option>
                                            <option value="2">Out of Stock</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Price ($) *</label>
                                        <input type="number" step="0.01" className={inputClass(editErrors.product_price)} value={editData.product_price} onChange={e => setEditData('product_price', e.target.value)} required />
                                        <InputError message={editErrors.product_price} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800">Stock Count *</label>
                                        <input type="number" className={inputClass(editErrors.product_stock)} value={editData.product_stock} onChange={e => setEditData('product_stock', e.target.value)} required />
                                        <InputError message={editErrors.product_stock} className="mt-2" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-slate-800">Description</label>
                                    <textarea className={textareaClass(false)} rows="3" value={editData.product_description} onChange={e => setEditData('product_description', e.target.value)} placeholder="Enter details..."></textarea>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <SecondaryButton onClick={closeEditModal}>Cancel</SecondaryButton>
                                    <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70" disabled={editProcessing || !!codeExistsError} type="submit">
                                        {editProcessing && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                                        Update Changes
                                    </button>
                                </div>
                            </form>
                        </Modal>

                        {/* DELETE CONFIRMATION */}
                        <Modal show={confirmingDataDeletion} onClose={closeModal}>
                            <form onSubmit={deleteDataRow} className="p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                                    <i className="fas fa-trash text-lg"></i>
                                </div>
                                <h2 className="text-lg font-bold text-slate-950">Delete product?</h2>
                                <p className="mt-2 text-sm text-slate-600">Are you sure you want to delete <span className="font-bold text-slate-900">{dataEdit?.product_title}</span>? This action cannot be undone.</p>
                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton onClick={closeModal}>No</SecondaryButton>
                                    <DangerButton className="ms-3" disabled={deleteProcessing}>Yes, Delete</DangerButton>
                                </div>
                            </form>
                        </Modal>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
