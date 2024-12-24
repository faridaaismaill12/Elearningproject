"use client";
import React, { useState, ChangeEvent } from "react";
import "./Navbar.css";
import { IoSearch } from "react-icons/io5";
import Link from "next/link";


const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // Simulated auth state (replace this with your actual auth logic)
  const isLoggedIn = true; // Change to `true` to test logged-in state
  const authUser = "x";
  const profileImage = "cats";

  const handleSearch = async (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.trim();
    setSearchQuery(query);

    if (query === "") {
      setSearchResults([]);
      return;
    }

    try {
      // Replace this placeholder with actual search logic
      const results = ["Result 1", "Result 2", "Result 3"];
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
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
                  <img
                    src={"/avatar-placeholder.png"}
                    alt="Profile"
                  />
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <a href="/profile">My Profile</a>
                    <a href="/updates">Updates</a>
                    <a href="/settings">Settings</a>
                    <a href="/logout">Logout</a>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
                <li className="nav-item">
      <Link className="nav-link" href="/routes/course">
        Courses
      </Link>
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