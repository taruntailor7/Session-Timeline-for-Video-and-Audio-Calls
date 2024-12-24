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
    <div className="p-6 bg-black min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white text-center">Sessions</h1>
      </header>

      {loading ? (
        <p className="text-center text-gray-500">Loading sessions...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-black rounded-lg shadow-md border border-gray-700">
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
                  className="hover:bg-gray-900 transition-all"
                >
                  <td className="px-6 py-4 text-gray-300">{session._id}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {session.meetingId}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/session/${session._id}`}
                      style={{
                        color: "#5568FE",
                        textDecoration: "underline",
                      }}
                      className="hover:text-[#5568FE]"
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
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-black border border-gray-700 rounded-md text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-700"
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
