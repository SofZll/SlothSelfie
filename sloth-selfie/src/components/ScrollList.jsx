import React from 'react';
import CardActivity from './CardActivity';

const ScrollList = ({ CardList, smallView }) => {

    return (
        <>
            {CardList.length > 0 && (
                <div className='d-flex flex-column mx-md-0 m-2 overflow-y-auto overflow-x-hidden bg-white border rounded w-100' style={{ maxHeight: '30vh' }}>
                    {CardList.map((card, index) => (
                        <div key={index} className='d-flex flex-column w-100 p-md-3 p-2'>
                            <CardActivity Activity={card} smallView={smallView} />
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}

export default ScrollList;