import React from "react";
import { Link } from "react-router-dom";

const AppComingSoon = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">

      <h1 className="text-[80px] font-bold text-gray-900 mb-6">
        404
      </h1>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Really sorry
      </h2>

      <p className="text-gray-600 mb-10 max-w-md">
        We are currently working on our mobile apps.
        Stay tuned — they will be available soon.
      </p>

      <Link
        to="/"
        className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-80 transition"
      >
        Back to Home
      </Link>

    </div>
  );
};

export default AppComingSoon;