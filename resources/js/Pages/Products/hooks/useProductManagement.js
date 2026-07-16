import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';

export function useProductManagement(auth, filters = {}) {
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
        images: []
    };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm(initialFormState);
    
    const { 
        data: editData, 
        setData: setEditData, 
        post: postEdit, 
        processing: editProcessing, 
        errors: editErrors, 
        reset: editReset, 
        clearErrors: editClearErrors 
    } = useForm({ id: '', _method: 'PATCH', ...initialFormState });

    const { delete: destroy } = useForm();

    const [selectedFilters, setSelectedFilters] = useState({
        category_id: filters?.category_id || '',
        size_id: filters?.size_id || '',
        unit_id: filters?.unit_id || '',
        maker_id: filters?.maker_id || '',
        brand_id: filters?.brand_id || '',
    });

    const handleFilterChange = (name, value) => {
        const newFilters = { ...selectedFilters, [name]: value };
        setSelectedFilters(newFilters);
        router.get(route('products.index'), {
            search: searchQuery,
            ...newFilters
        }, { preserveState: true, replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('products.index'), {
            search: searchQuery,
            ...selectedFilters
        }, { preserveState: true, replace: true });
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

    const handleFileChange = (e, isEdit = false) => {
        const files = Array.from(e.target.files);
        if (isEdit) {
            setEditData('images', files);
        } else {
            setData('images', files);
        }

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
        postEdit(route('products.update', editData.id), {
            forceFormData: true,
            onSuccess: () => {
                closeEditModal();
                router.reload({ only: ['products'] });
            }
        }); 
    };

    const deleteUploadedImage = (imgId) => {
        if (confirm('Are you sure you want to remove this image file permanently?')) {
            router.delete(route('products.images.destroy', imgId), {
                preserveScroll: true,
                onSuccess: () => {
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
    const deleteDataRow = (e) => { 
        e.preventDefault(); 
        destroy(route('products.destroy', dataEdit.id), { 
            preserveScroll: true, 
            onSuccess: () => closeModal() 
        }); 
    };

    return {
        searchQuery,
        setSearchQuery,
        codeExistsError,
        isModalOpen,
        isEditModalOpen,
        isDetailModalOpen,
        confirmingDataDeletion,
        dataEdit,
        productDetail,
        selectedImages,
        selectedFilters,
        handleFilterChange,

        data,
        setData,
        processing,
        errors,

        editData,
        setEditData,
        editProcessing,
        editErrors,

        handleSearch,
        handleCheckCodeExists,
        handleFileChange,
        openAddModal,
        closeAddModal,
        submitAdd,
        openEditModal,
        closeEditModal,
        submitEdit,
        deleteUploadedImage,
        openDetailModal,
        closeDetailModal,
        confirmDataDeletion,
        closeModal,
        deleteDataRow
    };
}
