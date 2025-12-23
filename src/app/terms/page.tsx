import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <Link href="/" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">← Back to Home</Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: December 23, 2025</p>
          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2>1. Agreement</h2>
              <p>By using VolunTy, you agree to these Terms of Service. If you do not agree, please do not use the application.</p>
            </section>
            <section>
              <h2>2. Use of Service</h2>
              <p>You may use the service to manage volunteer events and shifts. You are responsible for content you submit and compliance with applicable laws.</p>
            </section>
            <section>
              <h2>3. Accounts</h2>
              <p>Authentication is provided via Facebook Login. You are responsible for maintaining the security of your account.</p>
            </section>
            <section>
              <h2>4. Data</h2>
              <p>We process your data as described in our <Link href="/privacy">Privacy Policy</Link>. You may request deletion at <Link href="/data-deletion">Data Deletion</Link>.</p>
            </section>
            <section>
              <h2>5. Termination</h2>
              <p>We may suspend or terminate access for violations of these terms or misuse of the service.</p>
            </section>
            <section>
              <h2>6. Disclaimer</h2>
              <p>The service is provided "as is" without warranties. We are not liable for any damages arising from use of the service.</p>
            </section>
            <section>
              <h2>7. Contact</h2>
              <p>Questions about these terms: legal@volunty.app</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
