'use client';
import React, { useState } from "react";

export default function GroupModal({ onClose, onCreate, user }) {
  const [groupName, setGroupName] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupUsers, setGroupUsers] = useState([]);
  const [groupResults, setGroupResults] = useState([]);

  const handleGroupUserSearch = async () => {
    if (!groupSearch.trim()) return;
    try {
      const res = await fetch(`http://localhost:5000/api/user/searchUser?search=${groupSearch}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const data = await res.json();
      setGroupResults(data);
    } catch (err) {
      console.error("Group search error", err);
    }
  };

  const createGroupChat = async () => {
    if (!groupName || groupUsers.length < 2) {
      alert("Group name and at least 2 users required");
      return;
    }
    const adminId=user._id
    const usersList = [user._id, ...groupUsers.map((u) => u._id)];
    try {
      const res = await fetch("http://localhost:5000/api/chat/createGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          groupName: groupName,
          users: usersList,
          isGroupChat: true,
          groupAdmin: adminId,
        }),
      });
      const groupChat = await res.json();
      onCreate(groupChat);
      onClose(); // Close modal
    } catch (err) {
      console.error("Group creation error", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[500px] relative">
        <button
          className="absolute top-2 right-3 text-red-500 text-xl"
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-lg font-bold mb-4">Create New Group</h2>

        <input
          type="text"
          placeholder="Group Name"
          className="w-full border p-2 mb-3"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div className="flex mb-3">
          <input
            type="text"
            placeholder="Search users..."
            className="flex-1 border p-2"
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
          />
          <button
            onClick={handleGroupUserSearch}
            className="bg-blue-400 text-white px-3 ml-2"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {groupResults.map((u) => (
            <div
              key={u._id}
              className="bg-gray-200 px-3 py-1 rounded cursor-pointer"
              onClick={() => {
                if (!groupUsers.find((gu) => gu._id === u._id)) {
                  setGroupUsers((prev) => [...prev, u]);
                }
              }}
            >
              {u.name}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {groupUsers.map((u) => (
            <div key={u._id} className="bg-green-200 px-3 py-1 rounded">
              {u.name}
              <span
                className="ml-2 text-red-500 cursor-pointer"
                onClick={() =>
                  setGroupUsers((prev) => prev.filter((p) => p._id !== u._id))
                }
              >
                ×
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={createGroupChat}
          className="w-full bg-orange-400 text-white py-2 rounded"
        >
          Create Group
        </button>
      </div>
    </div>
  );
}
