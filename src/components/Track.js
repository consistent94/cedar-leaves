import React from 'react';

import '../styles/Track.css'

function Track({ track }) {

    return (
        <div className="Track">
            <span class="track-title">{track.title}</span>

            <button className="play-button" >
                Play
            </button>
        </div>
        
    )
}

export default Track;