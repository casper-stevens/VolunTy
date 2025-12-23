"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative isolate px-6 pt-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">VolunTy</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Organize events, manage shifts, and empower your community — a modern platform for volunteer coordination.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {!isLoading && (
              user ? (
                <Link href="/volunteer" className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">Go to Portal</Link>
              ) : (
                <Link href="/login" className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">Log In</Link>
              )
            )}
            <Link href="/volunteer" className="text-sm font-semibold leading-6 text-slate-900">Browse Opportunities</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Plan Events</h3>
            <p className="mt-2 text-sm text-slate-600">Create events with roles and sub-shifts. Track capacity and staffing at a glance.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Manage Shifts</h3>
            <p className="mt-2 text-sm text-slate-600">Volunteers sign up for roles; admins monitor and adjust assignments.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Coordinate Teams</h3>
            <p className="mt-2 text-sm text-slate-600">Streamline communication and keep everyone on schedule.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} VolunTy</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-slate-600 hover:text-slate-900">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-600 hover:text-slate-900">Terms of Service</Link>
            <Link href="/data-deletion" className="text-slate-600 hover:text-slate-900">Data Deletion</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
