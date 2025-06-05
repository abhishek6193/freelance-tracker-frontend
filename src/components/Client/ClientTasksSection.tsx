import React from 'react';

interface ClientTasksSectionProps {
  clientId: string;
}

const ClientTasksSection: React.FC<ClientTasksSectionProps> = ({ clientId }) => {
  // Placeholder for loading and tasks list
  return (
    <div>
      <div className="animate-pulse h-6 w-32 bg-gray-200 rounded mb-4" />
      <div className="text-gray-500">Tasks for this client will appear here.</div>
      {/* TODO: Fetch and display tasks for clientId */}
    </div>
  );
};

export default ClientTasksSection;
