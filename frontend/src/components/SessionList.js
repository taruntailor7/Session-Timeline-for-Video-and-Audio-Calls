import React, { useState, useEffect } from "react";
import { fetchSessions } from "../services/api";
import { Link } from "react-router-dom";

const SessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 10; // Number of sessions per page

  const getSessions = async (page) => {
    setLoading(true);
    try {
      const data = await fetchSessions(page, PAGE_SIZE);
      setSessions(data.sessions || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSessions(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Sessions
        </h1>
      </header>

      {loading ? (
        <p className="text-center text-gray-500">Loading sessions...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Session ID</th>
                <th className="px-6 py-3 text-left">Meeting ID</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr
                  key={session._id}
                  className="hover:bg-gray-100 transition-all"
                >
                  <td className="px-6 py-4 text-gray-700">{session._id}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {session.meetingId}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/session/${session._id}`}
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
              }`}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
              }`}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionList;
