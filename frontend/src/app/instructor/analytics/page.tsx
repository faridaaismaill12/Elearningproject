import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardData {
  enrolledStudents: number;
  averageCompletions: number;
  averageCourseGrade: number;
  averageModuleGrade: number;
  averageRating: number;
}

const InstructorDashboard = () => {
  const [courseId, setCourseId] = useState<string>(''); // Replace with actual courseId or get it dynamically
  const [moduleId, setModuleId] = useState<string>(''); // Replace with actual moduleId or get it dynamically
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !moduleId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          enrolledStudentsResponse,
          averageCompletionsResponse,
          averageCourseGradeResponse,
          averageModuleGradeResponse,
          averageRatingResponse,
        ] = await Promise.all([
          axios.get(`/dashboard/instructor/${courseId}/enrolled-students`),
          axios.get(`/dashboard/instructor/average-completions/${courseId}`),
          axios.get(`/dashboard/instructor/${courseId}/average-grades`),
          axios.get(`/dashboard/instructor/${moduleId}/average-modules`),
          axios.get(`/dashboard/instructor/${courseId}/average-rating`),
        ]);

        setData({
          enrolledStudents: enrolledStudentsResponse.data,
          averageCompletions: averageCompletionsResponse.data.averageCompletions,
          averageCourseGrade: averageCourseGradeResponse.data,
          averageModuleGrade: averageModuleGradeResponse.data,
          averageRating: averageRatingResponse.data,
        });
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, moduleId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Instructor Dashboard</h1>

      {data && (
        <div className="dashboard-metrics">
          <div className="metric">
            <h2>Number of Enrolled Students</h2>
            <p>{data.enrolledStudents}</p>
          </div>

          <div className="metric">
            <h2>Average Lesson Completions per Day</h2>
            <p>{data.averageCompletions.toFixed(2)}</p>
          </div>

          <div className="metric">
            <h2>Average Quiz Grade (Course)</h2>
            <p>{data.averageCourseGrade.toFixed(2)}</p>
          </div>

          <div className="metric">
            <h2>Average Quiz Grade (Module)</h2>
            <p>{data.averageModuleGrade.toFixed(2)}</p>
          </div>

          <div className="metric">
            <h2>Average Course Rating</h2>
            <p>{data.averageRating.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
