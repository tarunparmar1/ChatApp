import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#12141C] text-white px-4">

      <h1 className="text-8xl font-bold text-blue-600">
        404
      </h1>

      <h2 className="text-2xl font-semibold mt-4">
        Page Not Found
      </h2>

      <p className="text-gray-400 mt-2 text-center">
        Sorry, the page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="mt-6 px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
      >
        Go Back
      </Link>

    </div>
  );
}

export default NotFound;