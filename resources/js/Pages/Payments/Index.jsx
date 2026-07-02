import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { usePaymentPOS } from './hooks/usePaymentPOS';
import { ProductCatalog } from './components/ProductCatalog';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { KhqrModal } from './components/KhqrModal';

export default function PaymentsIndex({ products = [], customers = [] }) {
    const {
        productSearch,
        setProductSearch,
        selectedCategory,
        setSelectedCategory,
        cart,
        setCart,
        discount,
        setDiscount,
        cashReceived,
        setCashReceived,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        paymentMethod,
        setPaymentMethod,
        transactionReference,
        setTransactionReference,
        checkoutCurrency,
        setCheckoutCurrency,
        
        khqrPaymentData,
        setKhqrPaymentData,
        khqrModalOpen,
        setKhqrModalOpen,
        khqrTimeLeft,
        khqrStatus,
        khqrMessage,
        khqrLoading,

        data,
        setData,
        processing,
        errors,

        subtotal,
        discountAmountVal,
        totalPaymentVal,
        changeDue,
        filteredProducts,

        addProductToCart,
        updateCartQuantity,
        removeCartItem,
        handleKHQRCheckout,
        handleConfirmPayment
    } = usePaymentPOS(products, customers);

    return (
        <AdminLayout hideHeader={true}>
            <Head title="Payments POS Terminal" />

            {/* Global Page Wrapper (mint-themed background) */}
            <div className="flex min-h-screen flex-col bg-[#F2F9F5] p-2 pt-2 font-sans lg:h-screen lg:min-h-0 lg:p-3 lg:pt-3">
                {/* Primary Split Pane Columns */}
                <div className="grid flex-1 grid-cols-1 gap-4 lg:min-h-0 lg:grid-cols-12 lg:items-stretch">

                    {/* Left Column: Product Catalog Workspace (7 Columns Width) */}
                    <ProductCatalog
                        productSearch={productSearch}
                        setProductSearch={setProductSearch}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        filteredProducts={filteredProducts}
                        cart={cart}
                        onAddToCart={addProductToCart}
                    />

                    {/* Right Column: Step 1 Active Cart Sidebar (5 Columns Width) */}
                    <CartSidebar
                        cart={cart}
                        setCart={setCart}
                        subtotal={subtotal}
                        checkoutCurrency={checkoutCurrency}
                        setCheckoutCurrency={setCheckoutCurrency}
                        onUpdateQuantity={updateCartQuantity}
                        onRemoveItem={removeCartItem}
                        onProceed={() => setIsPaymentModalOpen(true)}
                    />

                </div>
            </div>

            {/* STEP 2: The Modern Payment Modal Overlay */}
            {isPaymentModalOpen && (
                <CheckoutModal
                    cart={cart}
                    customers={customers}
                    discount={discount}
                    setDiscount={setDiscount}
                    cashReceived={cashReceived}
                    setCashReceived={setCashReceived}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    transactionReference={transactionReference}
                    setTransactionReference={setTransactionReference}
                    processing={processing}
                    khqrLoading={khqrLoading}
                    errors={errors}
                    data={data}
                    setData={setData}
                    subtotal={subtotal}
                    discountAmountVal={discountAmountVal}
                    totalPaymentVal={totalPaymentVal}
                    changeDue={changeDue}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={paymentMethod === 'qr' ? handleKHQRCheckout : handleConfirmPayment}
                />
            )}

            {/* STEP 3: KHQR Payment Modal Overlay */}
            {khqrModalOpen && khqrPaymentData && (
                <KhqrModal
                    khqrPaymentData={khqrPaymentData}
                    khqrStatus={khqrStatus}
                    khqrTimeLeft={khqrTimeLeft}
                    khqrMessage={khqrMessage}
                    onClose={() => {
                        setKhqrModalOpen(false);
                        setKhqrPaymentData(null);
                    }}
                    onDone={() => {
                        setCart([]);
                        setDiscount('');
                        setCashReceived('');
                        setProductSearch('');
                        setTransactionReference('');
                        setKhqrModalOpen(false);
                        setKhqrPaymentData(null);
                        window.location.reload();
                    }}
                />
            )}
        </AdminLayout>
    );
}
