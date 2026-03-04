import React from 'react';

const DeletePopUpLayout = ({ children, handleDelete, handleClose }) => {

    return (
        <div className='fixed-top bg-dark bg-opacity-25 vh-100 vw-100 d-flex justify-content-center align-items-center' style={{ zIndex: 2000 }}>
            <div className='modal-dialog custom-modal position-absolute top-50 start-50 translate-middle bg-white'>
                <div className='modal-content border border-secondary p-3'>
                    <div className='modal-header'>
                        <h5 className='modal-title' style={{ color: '#244476' }}>
                            Deletion Warning
                        </h5>
                        <button type='button' className='close' onClick={() => handleClose()}>
                            <span>&times;</span>
                        </button>
                    </div>

                    <div className='modal-body col-12'>
                        <div className='border-top border-secondary d-flex flex-column w-100 pt-3'>
                            {children}
                        </div>
                    </div>
                    <div className='d-flex justify-content-center align-items-center py-3'>
                        <button type='button' className='btn btn-outline-light' style={{ backgroundColor: '#244476' }} onClick={() => handleClose()}>
                            Cancel
                        </button>
                        <button type='button' className='btn btn-outline-light' style={{ backgroundColor: '#244476' }} onClick={() => handleDelete()}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeletePopUpLayout;