import React from 'react';

const Footer = () => {
  return (
    <div className="bg-blue-400 text-white py-6 mt-auto">
      <div className="container mx-auto text-center">
        <p>Contact At:</p>
        <div>
          <a href="mailto:contact@buildersacademy.ai" className="text-blue-600 visited:text-purple-600" target="_blank" rel="noopener noreferrer">
            Gmail Id
          </a>
        </div>
        <div>
          <a href="https://www.linkedin.com/company/buildersacademy/" className="text-blue-600 visited:text-purple-600" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
        <div>
          <a href="https://www.facebook.com/profile.php?id=61557169582718" className="text-blue-600 visited:text-purple-600" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </div>
        <div>
          <p>Location: Builders Academy, Fulbari, Pokhara, Nepal</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
