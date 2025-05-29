import React from 'react';

interface SessionTimeoutModalProps {
  open: boolean;
  onLogin: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({ open, onLogin }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-red-600">Session Timed Out</h2>
        <p className="mb-6 text-center text-gray-700">
          Your session has expired. Please log in again to continue.
        </p>
        <button
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
          onClick={onLogin}
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
