import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Effective Date: {new Date().getFullYear()}</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                By accessing and using the Intelligent Assistant service ("Service"), you accept and agree 
                to be bound by the terms and provision of this agreement.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Intelligent Assistant is an AI-powered administrative assistant designed specifically 
                for Australian trade businesses, providing:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email analysis and management</li>
                <li>Automated morning briefs and notifications</li>
                <li>Document processing and organization</li>
                <li>Integration with business tools and services</li>
                <li>AI-powered task automation</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Account and Registration</h2>
            <div className="text-gray-700 space-y-4">
              <p>To use our Service, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be at least 18 years old or have legal capacity to enter contracts</li>
                <li>Operate a legitimate business in Australia</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Email Access and Permissions</h2>
            <div className="text-gray-700 space-y-4">
              <p>By granting access to your email account, you understand and agree that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We will only access emails for the purposes described in our Privacy Policy</li>
                <li>You can revoke email access at any time through your account settings</li>
                <li>We do not store your email credentials; we use secure OAuth tokens</li>
                <li>Email processing is performed to provide intelligent business assistance</li>
                <li>You are responsible for ensuring you have authority to grant such access</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
            <div className="text-gray-700 space-y-4">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Send spam, malicious content, or engage in fraudulent activities</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the Service or our servers</li>
                <li>Use the Service for any commercial purpose other than your legitimate business operations</li>
                <li>Share your account access with unauthorized individuals</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. AI-Generated Content</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Our Service uses artificial intelligence to analyze and generate content. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI-generated responses are suggestions and should be reviewed before use</li>
                <li>You are responsible for the accuracy and appropriateness of any content you send</li>
                <li>We do not guarantee the accuracy or completeness of AI-generated content</li>
                <li>AI analysis may not always correctly interpret context or nuance</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                While we strive to provide continuous service, we do not guarantee that the Service will be:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Available at all times without interruption</li>
                <li>Free from errors or technical issues</li>
                <li>Compatible with all devices or software configurations</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue the Service with reasonable notice.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data and Privacy</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed 
                by our Privacy Policy, which forms part of these Terms of Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                The Service and its original content, features, and functionality are owned by us and are 
                protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You retain ownership of your business data and content, but grant us necessary rights 
                to provide the Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                To the maximum extent permitted by Australian law, we shall not be liable for any 
                indirect, incidental, or consequential damages arising from your use of the Service.
              </p>
              <p className="bg-amber-50 p-4 rounded-lg">
                <strong>Important:</strong> This does not exclude or limit liability that cannot be 
                excluded under Australian Consumer Law.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Either party may terminate this agreement at any time. Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your access to the Service will be immediately suspended</li>
                <li>We will delete your data in accordance with our Privacy Policy</li>
                <li>All rights and licenses granted to you will terminate</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Australian Consumer Law</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                If you are a consumer under the Australian Consumer Law, you have guaranteed rights 
                which cannot be excluded, restricted, or modified by this agreement.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                These Terms shall be interpreted and governed by the laws of Australia. Any disputes 
                shall be resolved in the appropriate Australian courts.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <div className="text-gray-700">
              <p>
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> legal@intelligent-assistant.com</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
            <div className="text-gray-700">
              <p>
                We reserve the right to update these Terms of Service at any time. We will notify you 
                of any material changes by posting the new terms on our website and updating the effective date.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;