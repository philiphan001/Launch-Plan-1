import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || ""
  );
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleLogout() {
    setError("");

    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError("Failed to log out: " + err.message);
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      setMessage("");

      await updateUserProfile(currentUser, { displayName });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {message && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      <div className="mb-6">
        <p className="text-gray-600">Email: {currentUser?.email}</p>
      </div>

      <form onSubmit={handleUpdateProfile}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="displayName"
          >
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            Update Profile
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </form>
    </div>
  );
}
