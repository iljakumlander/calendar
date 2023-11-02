import React from 'react';
import colors from '../../../../colors.json';

export const Eyedropper = () => {
  return (
    <div>
      <h1>Eyedropper</h1>
    </div>
  );
};

const numberOfColors = Object.keys(colors).length;

const gridSize = (numberOfColors <= 10) ? "-large" : "-small";

export const ColorBox = ({ color, name, onChange } : { color: string, name: string, onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void }): JSX.Element => (
    <label className={`box ${gridSize}`}  style={{ backgroundColor: color }} htmlFor={name}>
        <input 
            type="radio" 
            id={name} 
            name="color" 
            value={color}
            className="-hidden"
            onChange={onChange}
        />
        <span className="-hidden">{name}</span>
    </label>
);


export const ColorPicker = ({
    onChange,
}: {
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element => (
    <div className="eyedropper">
        {Object.entries(colors).map(([name, color]) => (
            <ColorBox key={name} color={color} name={name} onChange={onChange} />
        ))}
    </div>
);
