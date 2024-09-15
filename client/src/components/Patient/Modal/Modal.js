// src/components/Modal.js
import React from 'react';
import './Modal.css';

function Modal ( { isOpen, onClose, message } )
{
        if ( !isOpen ) return null;

        return (
                <div className="modal-overlay">
                        <div className="modal-content">
                                <h3>{ message }</h3>
                                <button onClick={ onClose }>Close</button>
                        </div>
                </div>
        );
}

export default Modal;
