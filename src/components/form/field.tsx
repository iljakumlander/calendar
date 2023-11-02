import React from 'react';
import { Input } from '../interfaces';
import { ColorPicker } from './eyedropper';

export default function Field ({
    type,
    name,
    value,
    label,
    checked,
    required,
    autofocus,
    options,
    onChange,
    ...props
}: Input): JSX.Element {
    switch (type) {
        case 'eyedropper':
            return (
                <ColorPicker onChange={onChange} />
            );
        case 'colorselect':
            return (
                <div className="bar">
                    <select
                        name={name}
                        value={value}
                        onChange={onChange}
                        required={required}
                        data-autofocus={autofocus}
                        {...props}
                    >
                        {options && options.map((option, index) => (
                            <option key={index} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <input
                        type="color"
                        name={name}
                        value={value}
                        onChange={onChange}
                        required={required}
                        data-autofocus={autofocus}
                        {...props}
                    />
                </div>
            );
        case 'select':
            return (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    data-autofocus={autofocus}
                    {...props}
                >
                    {options && options.map((option, index) => (
                        <option key={index} value={option.value}>{option.label}</option>
                    ))}
                </select>
            );

        case 'textarea':
            return (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    data-autofocus={autofocus}
                    {...props}
                />
            );

        case 'checkbox':
        case 'radio':
            return (
                <>
                    <input
                        type={type}
                        name={name}
                        checked={checked}
                        onChange={onChange}
                        required={required}
                        data-autofocus={autofocus}
                        {...props}
                    />
                    {label && <label htmlFor={name}>{label}</label>}
                </>
            );
        
        case 'text':
        default:
            return (
                <input
                    type={type || 'text'}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    data-autofocus={autofocus}
                    {...props}
                />
            );             
    }
}
