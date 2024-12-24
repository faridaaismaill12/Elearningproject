'use client'
import React, { useState, useEffect, ChangeEvent } from "react";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import "./Navbar.css";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<string>("Guest");
  const [profileImage, setProfileImage] = useState<string>("/avatar-placeholder.png");
  const [userRole, setUserRole] = useState<string>("User");

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile();
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("http://localhost:6165/users/view-profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      const { role, profileImage } = response.data; 
      setAuthUser(response.data.username || "Guest");
      setProfileImage(profileImage || "/avatar-placeholder.png");
      setUserRole(role || "User");
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleSearch = async (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.trim();
    setSearchQuery(query);

    if (query === "") {
      setSearchResults([]);
      return;
    }

    try {
      const results = ["Result 1", "Result 2", "Result 3"];
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setAuthUser("Guest");
    setProfileImage("/avatar-placeholder.png");
    setUserRole("User");
  };

  return (
    <header>
      <div className="logo">
        <h1 className="logo-name">BananaBread</h1>
      </div>
      <div className="search">
        <IoSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <nav className="ms-auto">
        <ul className="navbar-nav d-flex flex-row">
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <a className="nav-link" href="/Home">Courses</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/courses">Notes</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Home">Chat</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Home">Notifications</a>
              </li>

              {/* Role-based navigation items */}
              {userRole === "student" && (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/student/dashboard">Student Dashboard</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/student/courses">My Courses</a>
                  </li>
                </>
              )}

              {userRole === "instructor" && (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/instructor/dashboard">Instructor Dashboard</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/instructor/manage-courses">Manage Courses</a>
                  </li>
                </>
              )}

              {userRole === "admin" && (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/admin/dashboard">Admin Dashboard</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/admin/users">Manage Users</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/admin/courses">Manage Courses</a>
                  </li>
                </>
              )}

              {/* Dropdown with profile settings */}
              <li className={`nav-item dropdown-container ${dropdownOpen ? 'active' : ''}`}>
                <div className="avatar" onClick={toggleDropdown}>
                  <img src={profileImage} alt="Profile" />
                </div>
                <div className="dropdown-menu">
                  <a href="/profile">My Profile</a>
                  <a href="/updates">Updates</a>
                  <a href="/settings">Settings</a>
                  <button  onClick={handleLogout}>Logout</button>
                </div>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <a className="nav-link" href="/courses">Courses</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/report">Teach on BananaBread</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/login">Login</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/signup">Signup</a>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
