import React from 'react';

const DashboardGrid = ({ children }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {children}
    </div>
  );
};

export default DashboardGrid;
