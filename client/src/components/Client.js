import React from 'react';
import Avatar from 'react-avatar';

//Creating the client with the username entered
const Client = ({ username }) => {
    return (
        <div className="client">
            <Avatar name={username} size={50} round="14px" />
            <span className="userName">{username}</span>
        </div>
    );
};

export default Client;
