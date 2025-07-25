import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Effective Date: {new Date().getFullYear()}</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, business information</li>
                <li><strong>Communication Data:</strong> Email content and metadata (with your consent)</li>
                <li><strong>Usage Information:</strong> How you interact with our service</li>
                <li><strong>Device Information:</strong> Browser type, IP address, device identifiers</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <div className="text-gray-700 space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and analyze your emails to provide intelligent assistance</li>
                <li>Send you notifications and updates about your business</li>
                <li>Provide customer support and respond to your requests</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Email Data Processing</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                <strong>With your explicit consent,</strong> we access and process your Gmail data to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Analyze email content for urgency and priority classification</li>
                <li>Generate morning briefs and summaries</li>
                <li>Provide intelligent responses and suggestions</li>
                <li>Extract business-relevant information (quotes, appointments, etc.)</li>
              </ul>
              <p className="bg-blue-50 p-4 rounded-lg">
                <strong>Important:</strong> We only access emails when you explicitly grant permission. 
                You can revoke this access at any time through your account settings.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption in transit and at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication requirements</li>
                <li>Compliance with industry security standards</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
            <div className="text-gray-700 space-y-4">
              <p>Our service integrates with third-party platforms:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Services:</strong> Gmail API, Google Authentication</li>
                <li><strong>Firebase:</strong> Authentication and push notifications</li>
                <li><strong>OpenAI:</strong> AI processing (data is not stored by OpenAI)</li>
              </ul>
              <p>
                Each integration requires your explicit consent and follows the respective service's privacy policies.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <div className="text-gray-700 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access, update, or delete your personal information</li>
                <li>Revoke consent for email access at any time</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of non-essential communications</li>
                <li>Request information about how your data is processed</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Australian Privacy Act Compliance</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                As an Australian business, we comply with the Privacy Act 1988 and the Australian Privacy Principles (APPs). 
                This includes ensuring your personal information is handled in accordance with Australian privacy law.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <div className="text-gray-700">
              <p>
                If you have questions about this Privacy Policy or how we handle your information, 
                please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> privacy@intelligent-assistant.com</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <div className="text-gray-700">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new policy on our website and updating the effective date.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;