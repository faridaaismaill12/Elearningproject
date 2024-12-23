"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CoursePage from "./coursePage"; // Instructor view
import StudentCoursePage from "./studentCoursePage"; // Student view
import AdminPage from "./AdminPage"; // Admin view

export default function Page() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching the user role from a token or API
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NGI1MzQ4N2I2YzhiOWRkMmFjOGM5MiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzQ5NzM0ODksImV4cCI6MTczNTA1OTg4OX0.teodZTB0khP02a9cUMbknBrt2Azn-zHNtjlnWW2JUuk"; // Replace with the actual token
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode the JWT
    const role = decodedToken.role; // Assume role is present in the token

    setUserRole(role);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while fetching the role
  }

  // Render the appropriate page based on the user role
  if (userRole === "instructor") {
    return <CoursePage />;
  } else if (userRole === "student") {
    return <StudentCoursePage />;
  } else if (userRole === "admin") {
    return <AdminPage />;
  } else {
    // Handle unknown roles
    return <div>Unauthorized: Unknown role</div>;
  }
}
