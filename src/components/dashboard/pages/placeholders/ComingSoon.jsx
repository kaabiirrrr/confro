import { Construction } from 'lucide-react';

export default function ComingSoon({ title = 'Coming Soon' }) {
  return (
    <div className="min-w-[1000px] mx-auto flex flex-col items-center justify-center py-32 text-center">
      <Construction className="w-14 h-14 text-white/20 mb-4" />
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-white/40 text-sm">This page is under construction.</p>
    </div>
  );
}
