import React from 'react';

const Footer = () => {
  return (
    <div className="w-full bg-gray-800 text-white py-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <p className="text-center md:text-left">Contact At:</p>
        <div className="flex flex-col items-center md:items-start space-y-2">
          <a
            href="mailto:contact@buildersacademy.ai"
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gmail Id
          </a>
          <a
            href="https://www.linkedin.com/company/buildersacademy/"
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
