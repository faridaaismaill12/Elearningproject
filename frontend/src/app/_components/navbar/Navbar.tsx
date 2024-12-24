'use client'
import React, { useState, useEffect, ChangeEvent } from "react";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import "./Navbar.css";
import Cookies from "js-cookie";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");  // For the search input value
  const [searchResults, setSearchResults] = useState<any[]>([]);  // For storing search results
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);  // For controlling dropdown visibility
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);  // To track if the user is logged in
  const [authUser, setAuthUser] = useState<string>("Guest");  // For tracking authenticated user's name
  const [profileImage, setProfileImage] = useState<string>("/avatar-placeholder.png");  // Placeholder for user profile image
  const [userRole, setUserRole] = useState<string>("User");  // To track the user's role (student, instructor, admin)
  const [showViewEnrolled, setShowViewEnrolled] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Fetch user profile when the component mounts and the user is logged in
  useEffect(() => {
    const token = Cookies.get("authToken");

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

  // Handle search input changes and filter results accordingly
  const handleSearch = async (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.trim().toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setSearchResults([]);  // Clear search results when query is empty
      return;
    }

    try {
      // Assuming 'courses' is an available list, filter them based on the search query
      const filteredResults = ["Result 1", "Result 2", "Result 3"];  // Replace with actual data
      setSearchResults(filteredResults);  // Set the filtered search results
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // Toggle the dropdown for user profile options
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle user logout
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
          onChange={handleSearch}  // Handle search changes
        />
      </div>

      <nav className="ms-auto">
        <ul className="navbar-nav d-flex flex-row">
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <a className="nav-link" href="/courses">Courses</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Notes">Notes</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/communication/chats/my-chats">Chat</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/communication/notifications">Notifications</a>
              </li>

              {/* Role-based navigation items */}
              {userRole === "student" && (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/student/dashboard">Student Dashboard</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/course">My Courses</a>
                  </li>
                </>
              )}

              {userRole === "instructor" && (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/instructor/dashboard">Instructor Dashboard</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/course">Manage Courses</a>
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
                  <button onClick={handleLogout}>Logout</button>
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
