// resources/js/Components/UI/IconInput.jsx

import InputError from '@/Components/InputError';

export default function IconInput({
    id,
    type = 'text',
    name,
    value,
    placeholder,
    onChange,
    required = false,
    className = '',
    icon,
    error,
    label,
    rightElement,
    ...props
}) {
    return (
        <div>
            {label && (
                <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative rounded-xl transition-all duration-200">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className={`fas ${icon} text-green-600`}></i>
                    </div>
                )}
                <input
                    {...props}
                    id={id}
                    type={type}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    className={`block w-full ${icon ? 'pl-11' : 'pl-4'} ${rightElement ? 'pr-11' : 'pr-4'} py-3 bg-[#f2f9f5] border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-green-600 transition-all duration-200 ${className}`}
                    required={required}
                    onChange={onChange}
                />
                {rightElement && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
}
