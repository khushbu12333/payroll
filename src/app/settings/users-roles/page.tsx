"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from './styles.module.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  googleProfilePic?: string;
}

interface InviteUserForm {
  name: string;
  email: string;
  role: string;
}

export default function UsersRoles() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Users" | "Roles">("Users");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteUserForm>({
    name: "",
    email: "",
    role: ""
  });
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Khushboo Rajpal",
      email: "rajpalkhushbu4@gmail.com",
      role: "Admin",
      status: "ACTIVE",
      googleProfilePic: undefined // Will be populated from Google OAuth
    }
  ]);
  // Add state for exit animation
  const [isClosing, setIsClosing] = useState(false);

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your invite logic here
    const newUser: User = {
      id: users.length + 1,
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      status: "ACTIVE"
    };
    setUsers([...users, newUser]);
    setShowInviteModal(false);
    setInviteForm({ name: "", email: "", role: "" });
  };

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        };
      }
      return user;
    }));
  };

  // Add close handler
  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowInviteModal(false);
      setIsClosing(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-black">Users & Roles</h1>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors duration-200"
        >
          Invite User
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("Users")}
            className={`pb-4 px-2 text-sm font-medium ${
              activeTab === "Users"
                ? "text-green-500 border-b-2 border-green-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("Roles")}
            className={`pb-4 px-2 text-sm font-medium ${
              activeTab === "Roles"
                ? "text-green-500 border-b-2 border-green-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Roles
          </button>
        </div>
      </div>

      {/* Users Table */}
      {activeTab === "Users" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-medium text-black">USER DETAILS</th>
                <th className="text-left py-4 px-4 font-medium text-black">ROLE</th>
                <th className="text-left py-4 px-4 font-medium text-black">STATUS</th>
                <th className="text-left py-4 px-4 font-medium text-black"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                        {user.googleProfilePic ? (
                          <img 
                            src={user.googleProfilePic} 
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-black">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-black">{user.role}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        user.status === "ACTIVE" ? "bg-green-600" : "bg-gray-600"
                      }`}></span>
                      {user.status}
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Roles Tab Content */}
      {activeTab === "Roles" && (
        <div className="text-gray-500">
          Roles configuration will be implemented here
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div 
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${styles.modalOverlay} ${isClosing ? styles.modalOverlayExit : ''}`}
        >
          <div 
            className={`bg-white rounded-lg p-6 w-[500px] ${styles.modalContent} ${isClosing ? styles.modalContentExit : ''}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-black">Invite User</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Role<span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Invite
                </button>
              </div>
              <p className="text-xs text-red-500 mt-2">* indicates mandatory fields</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}