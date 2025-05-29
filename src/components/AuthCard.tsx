import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, title }) => (
  <div className="w-full max-w-md mx-auto mt-8 bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
    <img src="/ft-logo.svg" alt="Freelance Tracker Logo" className="w-16 h-16 mb-4" />
    <h2 className="text-2xl font-bold text-primary mb-6">{title}</h2>
    {children}
  </div>
);

export default AuthCard;
