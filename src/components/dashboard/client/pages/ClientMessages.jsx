import React from 'react';
import Messages from '../../pages/Messages';

const ClientMessages = () => {
  // We reuse the exact same real-time Messages component from the main dashboard
  // because it is already built to dynamically handle both client and freelancer sides
  return <Messages />;
};

export default ClientMessages;
