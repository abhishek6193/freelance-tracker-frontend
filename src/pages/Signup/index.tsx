import React from 'react';
import SignupForm from '../../components/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-sky-50 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-start">
        <div className="mt-16 w-full flex justify-center">
          <SignupForm />
        </div>
      </main>
    </div>
  );
};

export default SignupPage;
