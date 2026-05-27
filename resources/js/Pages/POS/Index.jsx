import React from 'react';
import { Head } from '@inertiajs/react';
import POSInterface from '@/Components/POSInterface';
import AdminLayout from '@/Layouts/AdminLayout';

export default function POSIndex({ products }) {
    // We can decide to wrap this in AdminLayout or just display the POS fullscreen.
    // The instructions specified a 2/3 and 1/3 split interface, often POS systems
    // look better without the side menus, or with it. Let's use the AdminLayout 
    // but the POS Interface inside it. Wait, the layout might clash with h-screen.
    // Let's use it as a fullscreen app, but provide a back button to Dashboard, 
    // or just use AdminLayout if they want the sidebar. 
    // The user said: "when I click on the POS menu on the sidebar, it load to POS page"
    // so it should probably be inside the AdminLayout to keep the sidebar visible, 
    // OR we just use AdminLayout. Let's wrap it in AdminLayout.
    return (
        <AdminLayout>
            <Head title="Point of Sale" />
            
            {/* 
              POSInterface assumes h-screen, which might overflow if AdminLayout has its own headers/footers.
              We adjust the wrapper height to fit into AdminLayout's content area if necessary.
              Since POSInterface uses h-screen, we can override it by letting it take the full height
              of the container. We'll set the container to h-[calc(100vh-something)] if needed, 
              or just let it render. We'll add an inline style or wrapper class to make it fit nicely.
            */}
            <div className="h-[calc(100vh-2rem)] w-full -m-4 sm:-m-6 lg:-m-8">
                {/* Adjusting the POS component to take the full available space inside the layout */}
                <POSInterface products={products} />
            </div>
        </AdminLayout>
    );
}
