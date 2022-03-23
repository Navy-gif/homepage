import React from "react";
import '../css/Structures.css';

const DropdownItem = ({ onUpdate, id, item: {name, value}}) => {
    
    return (
        <div className='dropdown-item'>
            <label htmlFor={id}>{name}</label>
            <input
                id={id}
                type='checkbox'
                defaultChecked={value}
                name={name}
                onChange={onUpdate}
            />
        </div>
    );

};

const Dropdown = ({items, name, onUpdate}) => {

    return (
        <div className='dropdown'>
            {name}
            <div className='dropdown-list'>
                {items.map(item => {
                    const id = `${name}:${item.name}`;
                    return <DropdownItem onUpdate={onUpdate} key={id} id={id} item={item} />;
                })}
            </div>
        </div>
    );

};

export default Dropdown;