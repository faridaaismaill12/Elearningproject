"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardData {
  courseProgress: number;
  lessonsCompletedToday: number;
  averageScore: number;
  bestModule: string | null; // Replace with actual module type if available
  worstModule: string | null; // Replace with actual module type if available
}

const StudentDashboard = () => {
  const [courseId, setCourseId] = useState<string>(''); // Replace with actual courseId or dynamically fetch it
  const [userId, setUserId] = useState<string>(''); // Replace with actual userId or dynamically fetch it
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // Today's date
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          progressResponse,
          lessonsCompletedTodayResponse,
          averageScoreResponse,
          bestModuleResponse,
          worstModuleResponse,
        ] = await Promise.all([
          axios.get(`/dashboard/student/${courseId}/progress`, { params: { userId } }),
          axios.get(`/dashboard/student/completed/${date}`, { params: { userId } }),
          axios.get(`/dashboard/student/${courseId}/average-score`, { params: { userId } }),
          axios.get(`/dashboard/student/${courseId}/best-Module`, { params: { userId } }),
          axios.get(`/dashboard/student/${courseId}/worst-module`, { params: { userId } }),
        ]);

        setData({
          courseProgress: progressResponse.data,
          lessonsCompletedToday: lessonsCompletedTodayResponse.data,
          averageScore: averageScoreResponse.data,
          bestModule: bestModuleResponse.data?.title || null,
          worstModule: worstModuleResponse.data?.title || null,
        });
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, userId, date]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Student Dashboard</h1>

      {data && (
        <div className="dashboard-metrics">
          <div className="metric">
            <h2>Course Progress</h2>
            <p>{data.courseProgress.toFixed(2)}%</p>
          </div>

          <div className="metric">
            <h2>Lessons Completed Today</h2>
            <p>{data.lessonsCompletedToday}</p>
          </div>

          <div className="metric">
            <h2>Average Score in Course</h2>
            <p>{data.averageScore.toFixed(2)}</p>
          </div>

          <div className="metric">
            <h2>Best Module</h2>
            <p>{data.bestModule || 'N/A'}</p>
          </div>

          <div className="metric">
            <h2>Worst Module</h2>
            <p>{data.worstModule || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
