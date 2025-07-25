import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Intelligent Assistant</h3>
            <p className="text-gray-300 mb-4">
              AI-powered administrative assistant designed specifically for Australian trade businesses.
              Streamline your operations with intelligent email management, scheduling, and business automation.
            </p>
            <p className="text-sm text-gray-400">
              Made for Australian tradies, by people who understand your business.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/chat" className="text-gray-300 hover:text-white transition-colors">
                  Chat
                </a>
              </li>
              <li>
                <a href="/integrations" className="text-gray-300 hover:text-white transition-colors">
                  Integrations
                </a>
              </li>
              <li>
                <a href="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help & Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-md font-semibold mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@intelligent-assistant.com" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  support@intelligent-assistant.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            © {currentYear} Intelligent Assistant. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>🇦🇺 Proudly Australian</span>
            <span>•</span>
            <span>Built for Trade Businesses</span>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Privacy Policy"
            >
              🔒 Secure
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Australian Compliance"
            >
              📋 Compliant
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;