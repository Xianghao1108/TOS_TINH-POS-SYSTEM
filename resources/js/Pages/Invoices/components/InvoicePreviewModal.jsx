import React, { useState, useEffect } from 'react';

/**
 * InvoicePreviewModal Component
 * Renders a Bootstrap-styled invoice preview inside a modal.
 * Fetches the invoice details dynamically via AJAX/Fetch API and provides
 * action buttons to download a generated PDF or print only the invoice contents.
 */
export function InvoicePreviewModal({ isOpen, onClose, invoiceId }) {
    // Component State Management
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [settings, setSettings] = useState(null);

    // Fetch details whenever the modal is opened with a valid invoice ID
    useEffect(() => {
        if (isOpen && invoiceId) {
            loadInvoiceDetails(invoiceId);
        } else {
            // Clean up state on close
            setInvoiceData(null);
            setSettings(null);
            setError(null);
        }
    }, [isOpen, invoiceId]);

    // AJAX request to fetch details from Laravel backend endpoint
    const loadInvoiceDetails = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/invoices/${id}/details`);
            if (!response.ok) {
                throw new Error('Could not retrieve invoice details.');
            }
            const data = await response.json();
            setInvoiceData(data.invoice);
            setSettings(data.settings);
        } catch (err) {
            setError(err.message || 'Failed to fetch invoice details.');
        } finally {
            setLoading(false);
        }
    };

    // Do not render anything if the modal is hidden
    if (!isOpen) return null;

    // Helper: Formats currency values
    const money = (value) => `$${Number(value || 0).toFixed(2)}`;
    
    // Helper: Formats invoice number sequence (e.g. #INV-00001)
    const invoiceNo = (id) => `#INV-${String(id).padStart(5, '0')}`;
    
    // Helper: Formats datestamps
    const formatDate = (value) => {
        if (!value) return 'N/A';
        return new Date(value).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Calculations & Data Consolidation
    let subtotal = 0;
    let discount = 0;
    let consolidatedItems = [];

    if (invoiceData && invoiceData.orders) {
        const itemsList = [];
        invoiceData.orders.forEach(order => {
            subtotal += Number(order.subtotal || 0);
            discount += Number(order.discount || 0);
            if (order.items) {
                order.items.forEach(item => {
                    itemsList.push({
                        product_title: item.product_title,
                        product_code: item.product_code,
                        quantity: Number(item.quantity || 0),
                        product_price: Number(item.product_price || 0),
                        subtotal: Number(item.quantity || 0) * Number(item.product_price || 0)
                    });
                });
            }
        });

        // Group items by code/title to consolidate duplicate entries cleanly
        const grouped = {};
        itemsList.forEach(item => {
            const key = item.product_code || item.product_title;
            if (!grouped[key]) {
                grouped[key] = { ...item };
            } else {
                grouped[key].quantity += item.quantity;
                grouped[key].subtotal += item.subtotal;
            }
        });
        consolidatedItems = Object.values(grouped);
    }

    const grandTotal = Number(invoiceData?.total || 0);
    const taxRate = Number(settings?.tax_rate || 0);
    const taxAmount = taxRate > 0 ? grandTotal * (taxRate / (100 + taxRate)) : 0;

    // Direct download trigger (sends user to the laravel-dompdf stream endpoint)
    const handleDownload = () => {
        if (invoiceId) {
            window.location.href = `/invoices/${invoiceId}/pdf`;
        }
    };

    // Helper: Format raw payment method string to elegant readable label
    const paymentLabel = (method) => {
        const clean = (method || '').toString().trim().toLowerCase();
        switch (clean) {
            case 'cash': return 'Cash';
            case 'qr': return 'QR';
            case 'khqr': return 'KHQR';
            case 'aba_qr':
            case 'aba': return 'ABA QR';
            case 'card': return 'Card';
            default:
                if (!method) return 'Unknown';
                return method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
    };

    return (
        <div 
            id="invoicePreviewModalRoot"
            className="modal show d-block" 
            tabIndex="-1" 
            role="dialog"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1050 }}
        >
            {/* Inline CSS styling block containing print-specific overrides */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    /* Hide everything outside of the modal parent wrapper */
                    body > *:not(#invoicePreviewModalRoot) {
                        display: none !important;
                    }
                    
                    /* Flatten layout constraints of the modal container */
                    #invoicePreviewModalRoot {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        background: transparent !important;
                        backdrop-filter: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                    }
                    
                    /* Expand dialog container to utilize full page width */
                    #invoicePreviewModalRoot .modal-dialog {
                        max-width: 100% !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    /* Strip modal borders, outlines, and box-shadows */
                    #invoicePreviewModalRoot .modal-content {
                        border: none !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        background: transparent !important;
                    }
                    
                    /* Hide modal header controls and modal action footer entirely during printing */
                    #invoicePreviewModalRoot .modal-header,
                    #invoicePreviewModalRoot .modal-footer {
                        display: none !important;
                    }
                    
                    /* Remove height limits and scrolling to print all items fully */
                    #invoicePreviewModalRoot .modal-body {
                        max-height: none !important;
                        overflow: visible !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    
                    /* Force browser to print active background colors/fills */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            ` }} />

            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    
                    {/* Modal Header */}
                    <div className="modal-header border-bottom bg-light px-4 py-3 d-flex justify-content-between align-items-center">
                        <h5 className="modal-title font-weight-bold text-dark d-flex align-items-center gap-2">
                            <i className="fas fa-file-invoice text-emerald-600"></i>
                            Invoice Preview
                        </h5>
                        <button 
                            type="button" 
                            className="close border-0 bg-transparent text-secondary p-1" 
                            onClick={onClose}
                            aria-label="Close"
                            style={{ fontSize: '24px', cursor: 'pointer', outline: 'none' }}
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        {/* Loading State Spinner */}
                        {loading && (
                            <div className="d-flex flex-column align-items-center justify-content-center py-5">
                                <div className="spinner-border text-success mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="sr-only">Loading...</span>
                                </div>
                                <span className="text-secondary font-weight-bold">Fetching invoice details...</span>
                            </div>
                        )}

                        {/* Error Handling Alert Box */}
                        {error && (
                            <div className="alert alert-danger border-0 rounded-lg p-4 d-flex align-items-center gap-3" role="alert">
                                <i className="fas fa-exclamation-circle text-danger" style={{ fontSize: '24px' }}></i>
                                <div>
                                    <h6 className="alert-heading font-weight-bold mb-1">Error Loading Invoice</h6>
                                    <p className="mb-0 text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Invoice Content Sheet */}
                        {!loading && !error && invoiceData && (
                            <div className="invoice-container text-left">
                                
                                {/* Store Header and Title */}
                                <div className="row mb-4">
                                    <div className="col-sm-6 d-flex flex-column">
                                        <div className="mb-2">
                                            <img src="/images/TOS TINH NOBG.png" alt={settings?.store_name || "Store Logo"} style={{ maxHeight: '50px', maxWidth: '180px', objectFit: 'contain' }} />
                                        </div>
                                        <span className="text-sm font-weight-bold text-dark">{settings?.store_name || "Tos Tinh Mart"}</span>
                                        <span className="text-xs text-muted mt-1">{settings?.store_address || "Phnom Penh, Cambodia"}</span>
                                        <span className="text-xs text-muted">Phone: {settings?.store_phone || "+855 12 345 678"}</span>
                                    </div>
                                    <div className="col-sm-6 text-sm-right mt-3 mt-sm-0 d-flex flex-column align-items-sm-end">
                                        <span className="badge badge-pill badge-success mb-2 px-3 py-1 font-weight-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Invoice Desk</span>
                                        <h3 className="font-weight-black text-dark mb-1">INVOICE</h3>
                                        <span className="font-weight-bold text-emerald-600 monospace" style={{ fontSize: '16px' }}>{invoiceNo(invoiceData.id)}</span>
                                    </div>
                                </div>

                                <hr className="my-4 border-light" />

                                {/* Billing & Customer info grid */}
                                <div className="row mb-4">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <div className="bg-light rounded p-3 h-100 border">
                                            <div className="text-uppercase text-muted font-weight-bold mb-2" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Billing Details</div>
                                            
                                            <div className="d-flex justify-content-between mb-1 text-sm">
                                                <span className="text-muted">Date & Time:</span>
                                                <span className="font-weight-bold text-dark">{formatDate(invoiceData.created_at)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-1 text-sm">
                                                <span className="text-muted">Payment Method:</span>
                                                <span className="font-weight-bold text-dark">{paymentLabel(invoiceData.payment_method)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-1 text-sm">
                                                <span className="text-muted">Payment Status:</span>
                                                <span>
                                                    {invoiceData.status === 1 ? (
                                                        <span className="badge badge-success px-2 py-0.5 font-weight-bold text-uppercase" style={{ fontSize: '9px' }}>Paid</span>
                                                    ) : (
                                                        <span className="badge badge-warning px-2 py-0.5 font-weight-bold text-uppercase" style={{ fontSize: '9px' }}>Unpaid</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between text-sm">
                                                <span className="text-muted">Cashier:</span>
                                                <span className="font-weight-bold text-dark">{invoiceData.staff?.name || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="bg-light rounded p-3 h-100 border">
                                            <div className="text-uppercase text-muted font-weight-bold mb-2" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Customer Details</div>
                                            
                                            <div className="d-flex justify-content-between mb-1 text-sm">
                                                <span className="text-muted">Name:</span>
                                                <span className="font-weight-bold text-dark">{invoiceData.customer?.name || 'Walk-in Customer'}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-1 text-sm">
                                                <span className="text-muted">Phone:</span>
                                                <span className="font-weight-bold text-dark">{invoiceData.customer?.phone || 'N/A'}</span>
                                            </div>
                                            {invoiceData.customer?.email && (
                                                <div className="d-flex justify-content-between text-sm">
                                                    <span className="text-muted">Email:</span>
                                                    <span className="font-weight-bold text-dark">{invoiceData.customer.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="table-responsive rounded border mb-4">
                                    <table className="table table-hover mb-0 text-sm">
                                        <thead className="thead-light">
                                            <tr>
                                                <th style={{ width: '8%' }} className="text-center">#</th>
                                                <th>Product Name</th>
                                                <th style={{ width: '12%' }} className="text-center">Qty</th>
                                                <th style={{ width: '20%' }} className="text-right">Unit Price</th>
                                                <th style={{ width: '22%' }} className="text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consolidatedItems.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="text-center text-muted">{idx + 1}</td>
                                                    <td>
                                                        <div className="font-weight-bold text-dark">{item.product_title}</div>
                                                        {item.product_code && <div className="text-muted monospace" style={{ fontSize: '10px' }}>Barcode: {item.product_code}</div>}
                                                    </td>
                                                    <td className="text-center font-weight-bold">{item.quantity}</td>
                                                    <td className="text-right">{money(item.product_price)}</td>
                                                    <td className="text-right font-weight-bold text-dark">{money(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary calculation breakdown columns */}
                                <div className="row justify-content-end font-weight-bold">
                                    <div className="col-md-5 col-sm-7">
                                        <div className="d-flex justify-content-between mb-2 text-sm">
                                            <span className="text-muted">Subtotal:</span>
                                            <span className="font-weight-bold text-dark">{money(subtotal)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="d-flex justify-content-between mb-2 text-sm">
                                                <span className="text-emerald-600 font-weight-bold">Discount:</span>
                                                <span className="text-emerald-600 font-weight-bold">-{money(discount)}</span>
                                            </div>
                                        )}
                                        {taxRate > 0 && (
                                            <div className="d-flex justify-content-between mb-2 text-sm">
                                                <span className="text-muted">VAT / Tax ({taxRate.toFixed(2)}%):</span>
                                                <span className="font-weight-bold text-dark">{money(taxAmount)}</span>
                                            </div>
                                        )}
                                        <hr className="my-2 border-light" />
                                        <div className="d-flex justify-content-between align-items-center pt-1">
                                            <span className="font-weight-bold text-dark" style={{ fontSize: '15px' }}>Grand Total:</span>
                                            <span className="font-weight-black text-emerald-700" style={{ fontSize: '18px' }}>{money(grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* Modal Footer Controls */}
                    <div className="modal-footer border-top bg-light px-4 py-3 d-flex justify-content-end gap-2">
                        {/* Print Invoice Button - Triggers window.print() and matches print overrides */}
                        <button 
                            type="button" 
                            className="btn btn-primary d-flex align-items-center gap-1.5 px-3 py-2 text-sm border-0" 
                            style={{ backgroundColor: 'var(--slate-800)', borderRadius: '8px', cursor: 'pointer' }}
                            onClick={() => window.print()}
                            disabled={loading || error || !invoiceData}
                        >
                            <i className="fas fa-print"></i> Print Invoice
                        </button>

                        {/* Download PDF Button */}
                        <button 
                            type="button" 
                            className="btn btn-success d-flex align-items-center gap-1.5 px-3 py-2 text-sm border-0" 
                            style={{ borderRadius: '8px', cursor: 'pointer' }}
                            onClick={handleDownload}
                            disabled={loading || error || !invoiceData}
                        >
                            <i className="fas fa-file-pdf"></i> Download PDF
                        </button>

                        {/* Close Modal Button */}
                        <button 
                            type="button" 
                            className="btn btn-secondary px-3 py-2 text-sm border border-slate-300" 
                            style={{ borderRadius: '8px', cursor: 'pointer' }}
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
