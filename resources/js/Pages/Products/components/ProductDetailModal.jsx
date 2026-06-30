import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { getProductImageUrl } from '../utils/productHelpers';
import moment from 'moment';

export function ProductDetailModal({ isOpen, onClose, productDetail }) {
    return (
        <Modal show={isOpen} onClose={onClose}>
            <div className="p-6 max-h-[85vh] overflow-y-auto text-left">
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
                                            <img 
                                                src={getProductImageUrl(img)} 
                                                className="object-cover rounded-lg shadow-sm hover:opacity-75 transition border border-slate-100 bg-white" 
                                                style={{ width: '90px', height: '90px' }} 
                                                alt="Specification product graphics" 
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-xl border border-emerald-50 bg-white">
                            <table className="w-full text-left border-collapse text-sm">
                                <tbody>
                                    <tr className="border-b border-emerald-50">
                                        <th width="35%" className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Database Record ID</th>
                                        <td className="p-3 text-slate-600">{productDetail.id}</td>
                                    </tr>
                                    <tr className="border-b border-emerald-50">
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Product Code / Barcode</th>
                                        <td className="p-3"><span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{productDetail.product_code}</span></td>
                                    </tr>
                                    <tr className="border-b border-emerald-50">
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Product Name Title</th>
                                        <td className="p-3 font-bold text-slate-800">{productDetail.product_title}</td>
                                    </tr>
                                    <tr className="border-b border-emerald-50">
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Main Category</th>
                                        <td className="p-3 text-slate-600">{productDetail.category?.category_title || productDetail.category?.name || 'N/A'}</td>
                                    </tr>
                                    <tr className="border-b border-emerald-50">
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Brand Identity</th>
                                        <td className="p-3 text-slate-600">{productDetail.brand?.brand_title || 'N/A'}</td>
                                    </tr>
                                    <tr className="border-b border-emerald-50">
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Manufacturer / Maker</th>
                                        <td className="p-3 text-slate-600">{productDetail.maker?.maker_title || 'N/A'}</td>
                                    </tr>
                                    <tr className="border-b border-emerald-50">
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Dimension / Size</th>
                                        <td className="p-3 text-slate-600">{productDetail.size?.size_title || 'N/A'}</td>
                                    </tr>
                                    <tr className="border-b border-emerald-50">
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Unit Configuration</th>
                                        <td className="p-3 text-slate-600">{productDetail.unit?.unit_title || 'N/A'}</td>
                                    </tr>
                                    <tr className="border-b border-emerald-50">
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Unit Price</th>
                                        <td className="p-3 font-bold text-emerald-600">${Number(productDetail.product_price).toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-b border-emerald-50">
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Current Stock Level</th>
                                        <td className="p-3 text-slate-600">{productDetail.product_stock} items remaining</td>
                                    </tr>
                                    <tr className="border-b border-emerald-50">
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Inventory Status</th>
                                        <td className="p-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${Number(productDetail.product_status) === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                {Number(productDetail.product_status) === 1 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-emerald-50">
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">System Time Registered</th>
                                        <td className="p-3 text-slate-500">{moment(productDetail.created_at).format("DD/MM/YYYY HH:mm:ss")}</td>
                                    </tr>
                                    <tr>
                                        <th className="p-3 bg-emerald-50/30 font-semibold text-slate-700">Detailed Description</th>
                                        <td className="p-3 text-slate-600" style={{ whiteSpace: 'pre-line' }}>
                                            {productDetail.product_description || <span className="text-slate-400 italic">No extra description logs provided.</span>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Close</SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}
