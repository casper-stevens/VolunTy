import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
          >
            ← Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Last updated: December 23, 2025
          </p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                1. Introduction
              </h2>
              <p className="text-slate-600">
                VolunTy ("we", "our", or "us") is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use, and
                safeguard your information when you use our volunteer scheduling
                application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                2. Information We Collect
              </h2>
              <p className="text-slate-600 mb-2">
                When you sign in with Facebook, we collect:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
                <li>Your public profile information (name, profile picture)</li>
                <li>Your Facebook user ID</li>
                <li>
                  Any additional information you explicitly grant us permission
                  to access
                </li>
              </ul>
              <p className="text-slate-600 mt-3">
                We also collect information about your volunteer activities and
                shifts within our application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                3. How We Use Your Information
              </h2>
              <p className="text-slate-600 mb-2">We use your information to:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
                <li>Authenticate and identify you in our system</li>
                <li>Manage your volunteer shifts and schedule</li>
                <li>Provide you with volunteer opportunities</li>
                <li>Improve our services and user experience</li>
                <li>
                  Communicate with you about your volunteer activities
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                4. Data Sharing
              </h2>
              <p className="text-slate-600">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
                <li>
                  Service providers who assist us in operating our application
                  (e.g., Supabase for authentication and database services)
                </li>
                <li>
                  Organizations where you volunteer, but only information
                  necessary for coordinating your volunteer activities
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                5. Data Security
              </h2>
              <p className="text-slate-600">
                We implement appropriate security measures to protect your
                personal information. However, no method of transmission over
                the Internet is 100% secure, and we cannot guarantee absolute
                security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                6. Your Rights
              </h2>
              <p className="text-slate-600 mb-2">You have the right to:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent for data processing</li>
                <li>Export your data</li>
              </ul>
              <p className="text-slate-600 mt-3">
                To exercise these rights, please visit our{" "}
                <Link
                  href="/data-deletion"
                  className="text-blue-600 hover:underline"
                >
                  Data Deletion
                </Link>{" "}
                page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                7. Data Retention
              </h2>
              <p className="text-slate-600">
                We retain your personal information only for as long as
                necessary to provide our services and fulfill the purposes
                outlined in this policy. When you delete your account, we will
                delete or anonymize your personal information within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                8. Third-Party Services
              </h2>
              <p className="text-slate-600">
                Our application uses Facebook Login for authentication. Your use
                of Facebook Login is governed by Facebook's Privacy Policy. We
                do not control and are not responsible for Facebook's privacy
                practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                9. Children's Privacy
              </h2>
              <p className="text-slate-600">
                Our services are not directed to children under 13. We do not
                knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                10. Changes to This Policy
              </h2>
              <p className="text-slate-600">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                11. Contact Us
              </h2>
              <p className="text-slate-600">
                If you have any questions about this Privacy Policy, please
                contact us at: privacy@volunty.app
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
