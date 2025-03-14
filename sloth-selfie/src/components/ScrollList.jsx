import React from 'react';
import CardActivity from './CardActivity';

const ScrollList = ({ CardList, smallView }) => {

    return (
        <>
            {CardList.length > 0 && (
                <div className='d-flex flex-column w-100 h-50 overflow-auto'>
                    {CardList.map((card, index) => (
                        <div key={index} className='d-flex flex-column w-100 p-3'>
                            <CardActivity Activity={card} smallView={smallView} />
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}

export default ScrollList;