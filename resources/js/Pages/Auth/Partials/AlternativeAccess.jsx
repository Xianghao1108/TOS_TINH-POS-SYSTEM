// resources/js/Pages/Auth/Partials/AlternativeAccess.jsx

export default function AlternativeAccess() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <button
                type="button"
                className="flex items-center justify-center gap-2.5 py-3 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-green-700 hover:border-green-200 transition-all duration-200"
                onClick={() => alert("Staff ID login feature coming soon!")}
            >
                <i className="fas fa-id-badge text-gray-400"></i>
                <span>Staff ID</span>
            </button>

            <button
                type="button"
                className="flex items-center justify-center gap-2.5 py-3 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-green-700 hover:border-green-200 transition-all duration-200"
                onClick={() => alert("Biometric authentication feature coming soon!")}
            >
                <i className="fas fa-fingerprint text-gray-400"></i>
                <span>Biometric</span>
            </button>
        </div>
    );
}
