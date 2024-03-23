import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username, additionalData }) => {
    // Error handling for missing username
    if (!username) {
        return <div className="client">No username provided</div>;
    }

    return (
        <div className="client">
            {/* Avatar with custom size and roundness */}
            <Avatar name={username} size={50} round="14px" />

            {/* Username display */}
            <span className="userName">{username}</span>

            {/* Additional data rendering if provided */}
            {additionalData && (
                <div className="additionalData">
                    <h4>Additional Data</h4>
                    <p>{additionalData}</p>
                </div>
            )}
        </div>
    );
};

export default Client;
