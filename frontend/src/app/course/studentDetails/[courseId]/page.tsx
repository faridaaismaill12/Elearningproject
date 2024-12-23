"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const CourseDetailsPage = () => {
  const { courseId } = useParams(); // Capture dynamic route param
  const router = useRouter();
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjMxYzQ5OGU1ZDZlZDA0OGI4YmEwZiIsImVtYWlsIjoiY2xhcmFAZ21haWwuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MzQ3OTA3NDAsImV4cCI6MTczNDg3NzE0MH0.MmxxWMIbbjlUBJfmvwMrUky3I7nj5NWLfyh0-Sw3DLE";

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const courseResponse = await fetch(`http://localhost:4000/courses/${courseId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!courseResponse.ok) {
          throw new Error(`Failed to fetch course details: ${courseResponse.statusText}`);
        }

        const courseData = await courseResponse.json();
        setCourseDetails(courseData);

        const modulesResponse = await fetch(`http://localhost:4000/courses/${courseId}/modules`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!modulesResponse.ok) {
          throw new Error(`Failed to fetch modules: ${modulesResponse.statusText}`);
        }

        const modulesData = await modulesResponse.json();
        setModules(modulesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    } else {
      setError("Course ID is missing.");
    }
  }, [courseId]);

  const handleModuleClick = (moduleId: string) => {
    console.log(`Navigating to moduleId: ${moduleId}`); // Debugging
    router.push(`/course/studentDetails/${courseId}/${moduleId}`);
  };

  if (loading) return <div>Loading course details...</div>;

  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Course Details</h1>
      <p>
        <strong>Title:</strong> {courseDetails?.title || "N/A"}
      </p>
      <p>
        <strong>Description:</strong> {courseDetails?.description || "N/A"}
      </p>

      <h2>Modules</h2>
      {modules.length > 0 ? (
        <ul>
          {modules.map((module) => (
            <li
              key={module._id}
              style={{
                cursor: "pointer",
                color: "#007bff",
                textDecoration: "underline",
                marginBottom: "0.5rem",
              }}
              onClick={() => handleModuleClick(module._id)}
            >
              {module.title}
            </li>
          ))}
        </ul>
      ) : (
        <p>No modules available for this course.</p>
      )}
    </div>
  );
};

export default CourseDetailsPage;
