import Breadcrumb from '@/Components/Breadcrumb';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import moment from 'moment';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import axios from 'axios';

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
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />} >
            <Head title={headWeb} />
            <section className="content">
                <div className="card card-outline card-info shadow-sm">
                    <div className="card-header">
                        <h3 className="card-title">Products Management</h3>
                        <div className="card-tools d-flex align-items-center">
                            <button onClick={openAddModal} className="btn btn-primary btn-sm mr-2"><i className="fas fa-plus"></i> Add Product</button>
                            <form onSubmit={handleSearch} className="input-group input-group-sm" style={{ width: '200px' }}>
                                <input type="text" className="form-control float-right" placeholder="Search title or code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                <div className="input-group-append"><button type="submit" className="btn btn-default"><i className="fas fa-search"></i></button></div>
                            </form>
                        </div>
                    </div>
                    <div className="card-body table-responsive p-0">
                        <table className="table table-hover text-nowrap">
                            <thead>
                                <tr>
                                    <th>Image Preview</th>
                                    <th>Code</th>
                                    <th>Product Title</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datasList.length > 0 ? datasList.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            {item.images && item.images.length > 0 ? (
                                                <img src={getProductImageUrl(item.images[0])} className="img-thumbnail object-cover" style={{ width: '45px', height: '45px' }} alt="product thumbnail" />
                                            ) : (
                                                <div className="bg-gray-100 text-muted rounded text-center d-flex align-items-center justify-content-center border" style={{ width: '45px', height: '45px', fontSize: '10px' }}>No Img</div>
                                            )}
                                        </td>
                                        <td><span className="badge badge-secondary">{item.product_code}</span></td>
                                        <td>{item.product_title}</td>
                                        <td>{item.category?.category_title || item.category?.name || 'N/A'}</td>
                                        <td>${Number(item.product_price).toFixed(2)}</td>
                                        <td>{item.product_stock}</td>
                                        <td>
                                            <span className={`badge ${item.product_status === 1 ? 'badge-success' : 'badge-danger'}`}>{item.product_status === 1 ? 'In Stock' : 'Out of Stock'}</span>
                                        </td>
                                        <td width={'240px'}>
                                            <button onClick={() => openDetailModal(item)} className="btn btn-default btn-xs mr-2"><i className="fas fa-eye"></i> Detail</button>
                                            <button onClick={() => openEditModal(item)} className="btn btn-info btn-xs mr-2"><i className='fas fa-edit'></i> Edit</button>
                                            <button onClick={() => confirmDataDeletion(item)} type="button" className="btn btn-danger btn-xs"><i className='fas fa-trash'></i> Delete</button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={8} className="text-center">No products found!</td></tr>}
                            </tbody>
                        </table>

                        {/* DETAIL MODAL WITH IMAGE GALLERY */}
                        <Modal show={isDetailModalOpen} onClose={closeDetailModal}>
                            <div className="p-6 max-h-[85vh] overflow-y-auto">
                                <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2"><i className="fas fa-info-circle text-info mr-2"></i> Product Specification Details</h2>
                                
                                {productDetail && (
                                    <>
                                        {productDetail.images && productDetail.images.length > 0 && (
                                            <div className="mb-4">
                                                <InputLabel value="Uploaded Product Images" className="mb-2 font-semibold" />
                                                <div className="flex flex-wrap gap-2 p-2 border rounded bg-gray-50">
                                                    {productDetail.images.map((img) => (
                                                        <a href={getProductImageUrl(img)} target="_blank" key={img.id} rel="noreferrer">
                                                            <img src={getProductImageUrl(img)} className="img-thumbnail object-cover shadow-sm hover:opacity-75 transition" style={{ width: '90px', height: '90px' }} alt="Specification product graphics" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <table className="table table-bordered table-striped text-sm">
                                            <tbody>
                                                <tr><th width="35%">Database Record ID</th><td>{productDetail.id}</td></tr>
                                                <tr><th>Product Code / Barcode</th><td><span className="badge badge-secondary font-mono text-sm">{productDetail.product_code}</span></td></tr>
                                                <tr><th>Product Name Title</th><td className="font-weight-bold text-indigo-700">{productDetail.product_title}</td></tr>
                                                <tr><th>Main Category</th><td>{productDetail.category?.category_title || productDetail.category?.name || 'N/A'}</td></tr>
                                                <tr><th>Brand Identity</th><td>{productDetail.brand?.brand_title || 'N/A'}</td></tr>
                                                <tr><th>Manufacturer / Maker</th><td>{productDetail.maker?.maker_title || 'N/A'}</td></tr>
                                                <tr><th>Dimension / Size</th><td>{productDetail.size?.size_title || 'N/A'}</td></tr>
                                                <tr><th>Unit Configuration</th><td>{productDetail.unit?.unit_title || 'N/A'}</td></tr>
                                                <tr><th>Unit Price</th><td className="text-success font-weight-bold">${Number(productDetail.product_price).toFixed(2)}</td></tr>
                                                <tr><th>Current Stock Level</th><td>{productDetail.product_stock} items remaining</td></tr>
                                                <tr><th>Inventory Status</th><td><span className={`badge ${productDetail.product_status === 1 ? 'badge-success' : 'badge-danger'}`}>{productDetail.product_status === 1 ? 'In Stock' : 'Out of Stock'}</span></td></tr>
                                                <tr><th>System Time Registered</th><td>{moment(productDetail.created_at).format("DD/MM/YYYY HH:mm:ss")}</td></tr>
                                                <tr><th>Detailed Description</th><td style={{ whiteSpace: 'pre-line' }}>{productDetail.product_description || <span className="text-muted italic">No extra description logs provided.</span>}</td></tr>
                                            </tbody>
                                        </table>
                                    </>
                                )}
                                <div className="mt-6 flex justify-end"><SecondaryButton onClick={closeDetailModal}>Close View Window</SecondaryButton></div>
                            </div>
                        </Modal>

                        {/* ADD MODAL WITH MULTI-IMAGE UPLOADER */}
                        <Modal show={isModalOpen} onClose={closeAddModal}>
                            <form onSubmit={submitAdd} noValidate className="p-6 max-h-[85vh] overflow-y-auto">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 border-2 border-dashed rounded-md p-3 bg-gray-50 text-center">
                                        <InputLabel value="Upload Product Images (JPEG, PNG, JPG) *" className="font-semibold mb-2" />
                                        <input type="file" multiple accept="image/*" className="form-control-file w-full text-sm" onChange={(e) => handleFileChange(e, false)} />
                                        <InputError message={errors.images} className="mt-2" />
                                        {selectedImages.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3 justify-center border-t pt-2">
                                                {selectedImages.map((src, idx) => <img src={src} key={idx} className="img-thumbnail object-cover shadow-xs" style={{ width: '65px', height: '65px' }} alt="Preview block" />)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <InputLabel value="Product Title *" />
                                        <TextInput type="text" className="mt-1 block w-full" value={data.product_title} onChange={e => setData('product_title', e.target.value)} />
                                        <InputError message={errors.product_title} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Product Code / Barcode *" />
                                        <TextInput type="text" className="mt-1 block w-full" value={data.product_code} onChange={e => setData('product_code', e.target.value)} onBlur={e => handleCheckCodeExists(e.target.value)} />
                                        <InputError message={codeExistsError || errors.product_code} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Category *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.category_title || c.name}</option>)}
                                        </select>
                                        <InputError message={errors.category_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Brand *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={data.brand_id} onChange={e => setData('brand_id', e.target.value)}>
                                            <option value="">Select Brand</option>
                                            {brands.map(b => <option key={b.id} value={b.id}>{b.brand_title}</option>)}
                                        </select>
                                        <InputError message={errors.brand_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Maker *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={data.maker_id} onChange={e => setData('maker_id', e.target.value)}>
                                            <option value="">Select Maker</option>
                                            {makers.map(m => <option key={m.id} value={m.id}>{m.maker_title}</option>)}
                                        </select>
                                        <InputError message={errors.maker_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Size *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={data.size_id} onChange={e => setData('size_id', e.target.value)}>
                                            <option value="">Select Size</option>
                                            {sizes.map(s => <option key={s.id} value={s.id}>{s.size_title}</option>)}
                                        </select>
                                        <InputError message={errors.size_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Unit Configuration *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={data.unit_id} onChange={e => setData('unit_id', e.target.value)}>
                                            <option value="">Select Unit</option>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.unit_title}</option>)}
                                        </select>
                                        <InputError message={errors.unit_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Status *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={data.product_status} onChange={e => setData('product_status', e.target.value)}>
                                            <option value="1">In Stock</option>
                                            <option value="2">Out of Stock</option>
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Price ($) *" />
                                        <TextInput type="number" step="0.01" className="mt-1 block w-full" value={data.product_price} onChange={e => setData('product_price', e.target.value)} />
                                        <InputError message={errors.product_price} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Initial Stock *" />
                                        <TextInput type="number" className="mt-1 block w-full" value={data.product_stock} onChange={e => setData('product_stock', e.target.value)} />
                                        <InputError message={errors.product_stock} className="mt-2" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <InputLabel value="Description" />
                                    <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows="3" value={data.product_description} onChange={e => setData('product_description', e.target.value)}></textarea>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton onClick={closeAddModal}>Cancel</SecondaryButton>
                                    <PrimaryButton className="ms-3" disabled={processing || !!codeExistsError}>Save Product</PrimaryButton>
                                </div>
                            </form>
                        </Modal>

                        {/* EDIT MODAL WITH LIVE FILE MANAGEMENT */}
                        <Modal show={isEditModalOpen} onClose={closeEditModal}>
                            <form onSubmit={submitEdit} className="p-6 max-h-[85vh] overflow-y-auto">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Product</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Handle displaying currently active file assets array for instant storage deletes */}
                                    {dataEdit.images && dataEdit.images.length > 0 && (
                                        <div className="col-span-2 border p-3 rounded-md bg-gray-50">
                                            <InputLabel value="Current Product Images" className="mb-2 text-xs font-semibold" />
                                            <div className="flex flex-wrap gap-2">
                                                {dataEdit.images.map((img) => (
                                                    <div key={img.id} className="relative inline-block border bg-white rounded p-1">
                                                        <img src={getProductImageUrl(img)} className="object-cover rounded" style={{ width: '60px', height: '60px' }} alt="Active grid item" />
                                                        <button type="button" onClick={() => deleteUploadedImage(img.id)} className="absolute -top-1 -right-1 bg-danger text-white rounded-full flex items-center justify-center text-xs shadow hover:bg-red-700" style={{ width: '18px', height: '18px', border: 'none' }}>×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-span-2 border-2 border-dashed rounded-md p-3 bg-gray-50 text-center">
                                        <InputLabel value="Replace Product Images" className="font-semibold mb-1" />
                                        <input type="file" multiple accept="image/*" className="form-control-file w-full text-sm" onChange={(e) => handleFileChange(e, true)} />
                                        <InputError message={editErrors.images} className="mt-2" />
                                        {selectedImages.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3 justify-center border-t pt-2">
                                                {selectedImages.map((src, idx) => <img src={src} key={idx} className="img-thumbnail object-cover shadow-xs" style={{ width: '65px', height: '65px' }} alt="Append staging previews" />)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <InputLabel value="Product Title *" />
                                        <TextInput type="text" className="mt-1 block w-full" value={editData.product_title} onChange={e => setEditData('product_title', e.target.value)} required />
                                    </div>
                                    <div>
                                        <InputLabel value="Product Code / Barcode *" />
                                        <TextInput type="text" className="mt-1 block w-full" value={editData.product_code} onChange={e => setEditData('product_code', e.target.value)} onBlur={e => handleCheckCodeExists(e.target.value, true)} required />
                                        <InputError message={codeExistsError} />
                                    </div>
                                    <div>
                                        <InputLabel value="Category *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={editData.category_id} onChange={e => setEditData('category_id', e.target.value)} required>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.category_title || c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Brand *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={editData.brand_id} onChange={e => setEditData('brand_id', e.target.value)} required>
                                            {brands.map(b => <option key={b.id} value={b.id}>{b.brand_title}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Maker *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={editData.maker_id} onChange={e => setEditData('maker_id', e.target.value)} required>
                                            {makers.map(m => <option key={m.id} value={m.id}>{m.maker_title}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Size *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={editData.size_id} onChange={e => setEditData('size_id', e.target.value)} required>
                                            {sizes.map(s => <option key={s.id} value={s.id}>{s.size_title}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Unit Configuration *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={editData.unit_id} onChange={e => setEditData('unit_id', e.target.value)} required>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.unit_title}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Status *" />
                                        <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" value={editData.product_status} onChange={e => setEditData('product_status', e.target.value)} required>
                                            <option value="1">In Stock</option>
                                            <option value="2">Out of Stock</option>
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Price ($) *" />
                                        <TextInput type="number" step="0.01" className="mt-1 block w-full" value={editData.product_price} onChange={e => setEditData('product_price', e.target.value)} required />
                                    </div>
                                    <div>
                                        <InputLabel value="Stock Count *" />
                                        <TextInput type="number" className="mt-1 block w-full" value={editData.product_stock} onChange={e => setEditData('product_stock', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <InputLabel value="Description" />
                                    <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" rows="3" value={editData.product_description} onChange={e => setEditData('product_description', e.target.value)}></textarea>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton onClick={closeEditModal}>Cancel</SecondaryButton>
                                    <PrimaryButton className="ms-3" disabled={editProcessing || !!codeExistsError}>Update Changes</PrimaryButton>
                                </div>
                            </form>
                        </Modal>

                        {/* DELETE CONFIRMATION */}
                        <Modal show={confirmingDataDeletion} onClose={closeModal}>
                            <form onSubmit={deleteDataRow} className="p-6">
                                <h2 className="text-lg font-medium text-gray-900">Confirmation!</h2>
                                <p className="mt-1 text-sm text-gray-600">Are you sure you want to delete <span className="font-semibold">{dataEdit?.product_title}</span>?</p>
                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton onClick={closeModal}>No</SecondaryButton>
                                    <DangerButton className="ms-3" disabled={deleteProcessing}>Yes, Delete</DangerButton>
                                </div>
                            </form>
                        </Modal>
                    </div>
                    {products?.links && <div className="card-footer clearfix"><Pagination links={products.links} /></div>}
                </div>
            </section>
        </AdminLayout>
    );
}
