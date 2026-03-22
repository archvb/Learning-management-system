"use client";

import { useEffect, useState } from "react";
import { apiGetSubjects } from "@/lib/api";
import { Subject } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import SubjectCard from "@/components/SubjectCard";
import Spinner from "@/components/Spinner";
import Alert from "@/components/Alert";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await apiGetSubjects();
        setSubjects(data.subjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 px-4 py-10 max-w-screen-xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Courses</h1>
            <p className="mt-1 text-slate-400">
              Browse all available courses and start learning
            </p>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {!loading && !error && subjects.length === 0 && (
            <p className="text-center text-slate-400 py-20">
              No courses available yet.
            </p>
          )}

          {!loading && !error && subjects.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
