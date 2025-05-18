import React from 'react';
import CardActivity from './CardActivity';
import CardTool from './CardTool';

const ScrollList = ({ CardList, smallView, activity }) => {

    return (
        <>
            {CardList.length > 0 && (
                <div className='d-flex flex-column mx-md-0 m-2 overflow-y-auto overflow-x-hidden bg-white border rounded w-100' style={{ maxHeight: '35vmin' }}>
                    {CardList.map((card, index) => (
                        <div key={index} className='d-flex flex-column w-100 p-md-3 p-2'>
                            {activity ? (
                                <CardActivity Activity={card} smallView={smallView} />
                            ) : (
                                <CardTool tool={card} smallView={smallView} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}

export default ScrollList;