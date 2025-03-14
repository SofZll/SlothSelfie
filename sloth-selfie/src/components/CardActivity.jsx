import React from "react";

const CardActivity = ({ Activity, smallView }) => {

    return (
        <div className='d-flex flex-column w-100 align-items-center'>
            <div className="row">
                <div className="col-6">
                    {Activity.title}
                </div>
                <div className="col-6">
                    {Activity.user}
                </div>
            </div>

            {!smallView && (
                <div className="row">
                    <div className="col-12">
                        {Activity.description}
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col-6">
                    <button type="button" class="btn active" data-bs-toggle="button" aria-pressed={Activity.completed}>
                        {Activity.completed ? "Completed" : "to Complete"}
                    </button>
                </div>
                {Activity.deadline && (
                    <div className="col-6">
                        {Activity.deadline}
                    </div>
                )}
            </div>
            
        </div>
    )
}

export default CardActivity;