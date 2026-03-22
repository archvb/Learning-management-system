import Link from "next/link";
import { Subject } from "@/lib/types";

interface SubjectCardProps {
  subject: Subject;
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <Link
      href={`/subjects/${subject.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#12121a] transition-all duration-200 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10"
    >
      {/* Thumbnail / Placeholder */}
      <div className="relative aspect-video w-full bg-[#1a1a27] overflow-hidden">
        {subject.thumbnail_url ? (
          <img
            src={subject.thumbnail_url}
            alt={subject.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl text-indigo-500/40">◈</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
          {subject.title}
        </h2>
        {subject.description && (
          <p className="text-sm text-slate-400 line-clamp-2">
            {subject.description}
          </p>
        )}
      </div>
    </Link>
  );
}
