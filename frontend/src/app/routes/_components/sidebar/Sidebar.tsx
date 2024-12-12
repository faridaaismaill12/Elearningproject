"use client"; // Add this at the top
import React, { useState } from "react";
import Link from "next/link";
import { MdHomeFilled, MdBookmark } from "react-icons/md";
import { IoNotifications, IoSettings } from "react-icons/io5";
import { FiMessageSquare } from "react-icons/fi";
import { CgDetailsMore } from "react-icons/cg";
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Track sidebar state

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar">
        <button className="sidebar-toggle-btn" onClick={handleSidebarToggle}>
          {isSidebarOpen ? "Close" : "Open"}
        </button>
        <ul className="sidebar-menu">
          <li className="menu-item">
            <Link href="/" className="menu-link">
              <MdHomeFilled className="menu-icon" />
              <span className="menu-text">Home</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link href="/notifications" className="menu-link">
              <IoNotifications className="menu-icon" />
              <span className="menu-text">Courses</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
