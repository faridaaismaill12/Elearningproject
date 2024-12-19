"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function ViewUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = Cookies.get("authToken");

      if (!token) {
        setError("You must log in first.");
        setTimeout(() => {
          router.push("/users/login");
        }, 3000);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5010/users/get-all-users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data);
      } catch (err) {
        setError("You do not have permission to view this page or an error occurred.");
      }
    };

    fetchUsers();
  }, [router]);

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setConfirmDelete(true);
  };

  const handleDeleteUser = async () => {
    const token = Cookies.get("authToken");

    if (!token || !userToDelete) {
      setError("You must be logged in to delete a user.");
      return;
    }

    try {
      await axios.delete("http://localhost:5010/users/delete-user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          userId: userToDelete, // Send userId in the request body
        },
      });
      setUsers(users.filter((user) => user._id !== userToDelete));
      setConfirmDelete(false);
      setUserToDelete(null);
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setUserToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <h2 className="text-2xl font-semibold mb-4">All Users</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Birthday</th>
                <th className="px-4 py-2 text-left">Student Level</th>
                <th className="px-4 py-2 text-left">Enrolled Courses</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((user) => user._id) // Filter out users with no _id or invalid data
                .map((user: any) => (
                  <tr key={user._id}>
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.role}</td>
                    <td className="px-4 py-2">{user.birthday}</td>
                    <td className="px-4 py-2">{user.studentLevel}</td>
                    <td className="px-4 py-2">{user.enrolledCourses}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDeleteClick(user._id)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold">Are you sure you want to delete this user?</h3>
              <div className="flex justify-between mt-4">
                <button
                  onClick={handleDeleteUser}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}