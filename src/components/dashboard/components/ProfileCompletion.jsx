export default function ProfileCompletion() {

  return (
    <div className="bg-secondary border border-white/10 rounded-xl p-6">

      <h2 className="text-lg font-semibold mb-2">
        Complete your profile
      </h2>

      <p className="text-white/60 mb-4">
        Your profile is 75% complete. Finish it to start applying for jobs.
      </p>

      <div className="w-full bg-white/10 rounded-full h-2">

        <div className="bg-accent h-2 rounded-full w-[75%]"></div>

      </div>

    </div>
  );
}