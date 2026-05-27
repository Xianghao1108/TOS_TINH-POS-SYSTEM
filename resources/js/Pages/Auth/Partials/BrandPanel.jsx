// resources/js/Pages/Auth/Partials/BrandPanel.jsx

export default function BrandPanel() {
    return (
        <div className="hidden lg:flex flex-col justify-between bg-[#166534] p-12 text-white relative overflow-hidden">
            {/* Visual embellishments for a premium first impression */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.35),transparent_60%)] pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-700/40 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Header Group */}
            <div className="relative z-10 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                    <img src="/images/TOS TINH NOBG.png" alt="Tos Tinh Mart Logo" className="h-8 w-8 object-contain" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Tos Tinh Mart</h1>
                    <span className="text-xs font-semibold tracking-wider text-green-200 uppercase block -mt-1">POS System</span>
                </div>
            </div>

            {/* Mid Section Description & Visual Asset */}
            <div className="relative z-10 my-auto flex flex-col items-center">
                <div className="max-w-md text-center lg:text-left mb-10">
                    <h2 className="text-3xl font-bold leading-tight mb-4 text-green-50">Retail Management System</h2>
                    <p className="text-green-100/80 text-base leading-relaxed">
                        Manage sales, inventory, and operations efficiently with our next-generation retail management platform designed for speed and clarity.
                    </p>
                </div>
                
                {/* Immersive Asset (POS Terminal mockup) */}
                <div className="relative group">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-green-400 to-green-600 opacity-25 blur transition duration-1000 group-hover:opacity-40"></div>
                    <img
                        src="/images/pos_terminal.png"
                        alt="POS Terminal"
                        className="relative rounded-2xl shadow-2xl w-full max-w-sm border border-white/10 transition-transform duration-500 hover:scale-105"
                    />
                </div>
            </div>

            {/* Bottom stats/footer of visual panel */}
            <div className="relative z-10 text-xs text-green-200/50 flex justify-between items-center border-t border-white/10 pt-4">
                <span>Speed · Reliability · Efficiency</span>
                <span>Build v2.4.0</span>
            </div>
        </div>
    );
}
