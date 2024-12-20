import React, {useEffect, useRef, useState} from 'react';

const MultiSelectDropdown = (props: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (option: any) => {
        setSelectedOptions((prevSelected: any) => {
            if (prevSelected.includes(option.id)) {
                return prevSelected.filter((id: any) => id !== option.id);
            } else {
                return [...prevSelected, option.id];
            }
        });
    };

    useEffect(() => {
        props.dataSelected(selectedOptions);
    }, [selectedOptions]);

    const isSelected = (optionId: any) => (selectedOptions as string[]).includes(optionId as string);

    // Close dropdown if click is outside
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                onClick={toggleDropdown}
                className="cursor-pointer border border-gray-300 rounded-md p-2 flex justify-between items-center"
            >
        <span>
          {selectedOptions.length === 0
              ? 'Selecione'
              : `${selectedOptions.length} ${selectedOptions.length === 1 ? 'selecionado' : 'selecionados'}`}
        </span>
                <svg
                    className={`w-5 h-5 transform transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute mt-2 w-full border border-gray-300 bg-white rounded-md shadow-lg z-30">
                    <ul className="max-h-60 overflow-y-auto">
                        {props.data.map((option: any, index: number) => (
                            <li
                                key={`${option.id}${index}`}
                                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(option)
                                }}
                            >
                                <input
                                    id={option.id}
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-indigo-600"
                                    checked={isSelected(option.id)}
                                    onChange={() => handleSelect(option)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <span className="ml-2 text-gray-700">{option.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
