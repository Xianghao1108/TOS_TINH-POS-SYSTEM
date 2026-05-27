// resources/js/Components/UI/FormSeparator.jsx

export default function FormSeparator({ text }) {
    return (
        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-400 font-bold tracking-wider">
                    {text}
                </span>
            </div>
        </div>
    );
}
