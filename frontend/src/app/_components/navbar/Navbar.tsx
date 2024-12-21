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
  const [authUser, setAuthUser] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

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
      const response = await axios.get("http://localhost:4000/users/view-profile", {
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
                <a className="nav-link" href="/Home">
                  Courses
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/courses">
                  Notes
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Home">
                  Chat
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Home">
                  Notifications
                </a>
              </li>
              <li className="nav-item dropdown-container">
                <div className="avatar" onClick={toggleDropdown}>
                  <img src={profileImage} alt="Profile" />
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <a href="/profile">My Profile</a>
                    <a href="/updates">Updates</a>
                    <a href="/settings">Settings</a>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </li>
              {/* Display user role */}
              <li className="nav-item">
                <span className="nav-link">Role: {userRole}</span>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <a className="nav-link" href="/courses">
                  Courses
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/report">
                  Teach on BananaBread
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/login">
                  Login
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/signup">
                  Signup
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
