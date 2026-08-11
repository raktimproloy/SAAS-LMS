import { BookLoader } from "@/components/ui/BookLoader";

export default function TestLoaderPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-12 text-center border border-slate-100 dark:border-slate-800">
        <h1 className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-100">Testing Loader</h1>
        
        {/* Loader Component */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 border border-slate-100 dark:border-slate-800/50">
          <BookLoader />
        </div>

        <p className="mt-8 text-sm text-foreground/90">
          This animation uses pure CSS transforms and Framer Motion to create a 3D book flipping effect.
        </p>
      </div>
    </div>
  );
}
