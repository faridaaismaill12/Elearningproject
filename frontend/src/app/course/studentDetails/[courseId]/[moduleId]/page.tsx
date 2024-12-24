  "use client";

  import React, { useEffect, useState } from "react";
  import { useParams, useRouter } from "next/navigation";
  import { FiDownload } from "react-icons/fi";
  import Cookies from "js-cookie";

  const ModuleDetailsPage = () => {
    const { courseId, moduleId } = useParams();
    const router = useRouter();
    const [moduleDetails, setModuleDetails] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]); // To store quizzes
    const [files, setFiles] = useState<string[]>([]); // Store file paths
    const [videos, setVideos] = useState<string[]>([]); // Store video paths
    const [notes, setNotes] = useState<any[]>([]); // Store notes for the module
    const [newNoteContent, setNewNoteContent] = useState<string>("");
    const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Retrieve token from localStorage
    useEffect(() => {
      const token = Cookies.get("authToken");
      if (token) {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(decodedToken.id);
        setToken(token);
      } else {
        console.error("No token found in localStorage. Redirecting to login...");
        router.push("/login");
      }
    }, []);

    // Fetch module details, lessons, files, videos, and notes
    useEffect(() => {
      const fetchModuleDetails = async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
          // Fetch module details
          const moduleResponse = await fetch(
            `http://localhost:4000/courses/${courseId}/modules/${moduleId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!moduleResponse.ok) {
            throw new Error(
              `Failed to fetch module details: ${moduleResponse.statusText}`
            );
          }

          const moduleData = await moduleResponse.json();
          setModuleDetails(moduleData);
          setFiles(moduleData.files || []); // Files in the module
          setVideos(moduleData.videos || []); // Videos in the module

          // Fetch lessons for the module
          const lessonsResponse = await fetch(
            `http://localhost:4000/courses/${courseId}/modules/${moduleId}/lessons`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!lessonsResponse.ok) {
            throw new Error(
              `Failed to fetch lessons: ${lessonsResponse.statusText}`
            );
          }

          const lessonsData = await lessonsResponse.json();
          setLessons(lessonsData);

          // Fetch quizzes
          const quizzesResponse = await fetch(
            `http://localhost:4000/student/quizzes/all/${moduleId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(quizzesResponse);
          
          if (quizzesResponse.statusText === "Not Found") {
            console.warn("No quizzes found for this module.");
            setQuizzes([]);
          } else if (!quizzesResponse.ok) {
            throw new Error(`Failed to fetch quizzes: ${quizzesResponse.statusText}`);
          } else {
            const quizzesData = await quizzesResponse.json();
            setQuizzes(quizzesData);
          }
          

          // Fetch notes for the module
          const notesResponse = await fetch(
            `http://localhost:4000/notes/modules/${currentUserId}/${moduleId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log(notesResponse);
          if (!notesResponse.ok) {
            throw new Error(`Failed to fetch notes: ${notesResponse.statusText}`);
          }

          const notesData = await notesResponse.json();
          setNotes(notesData);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      if (courseId && moduleId) {
        fetchModuleDetails();
      } else {
        setError("Course ID or Module ID is missing.");
      }
    }, [courseId, moduleId, token]);

    // Add a new note for the module
    const handleAddNote = async () => {
      if (!token || !newNoteContent.trim() || !currentUserId) {
        console.error("Missing required fields for creating a note.");
        return;
      }

      try {
        const newNote = {
          content: newNoteContent.trim(),
          module: moduleId,
          course: courseId,
          lesson: null,
          creator: currentUserId,
        };

        const response = await fetch("http://localhost:4000/notes/createNote", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newNote),
        });

        if (!response.ok) {
          throw new Error(`Failed to create note: ${response.statusText}`);
        }

        const createdNote = await response.json();
        setNotes((prevNotes) => [...prevNotes, createdNote]);
        setNewNoteContent("");
        setIsAddingNote(false);
      } catch (err: any) {
        console.error("Error creating note:", err.message);
        setError("Failed to create note.");
      }
    };

    const handleLessonClick = (lessonId: string) => {
      router.push(`/course/studentDetails/${courseId}/${moduleId}/${lessonId}`);
    };

    const handleStartQuiz = async (quizId: string) => {
      if (!token) return;

      try {
        const response = await fetch(
          `http://localhost:4000/student/quizzes/start/${quizId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to start quiz: ${response.statusText}`);
        }

        alert("Quiz started successfully!");
        router.push(`/student/quizzes/${quizId}`);
      } catch (err: any) {
        alert(`Error starting quiz: ${err.message}`);
      }
    };

    const handleDownloadFiles = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          `http://localhost:4000/courses/${courseId}/modules/${moduleId}/files`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to download files: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `module_${moduleId}_files.zip`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (loading) return <div className="text-center text-gray-500">Loading module details...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Module Details</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <p className="text-lg font-semibold mb-2">
            <strong>Title:</strong> {moduleDetails?.title || "N/A"}
          </p>
          <p className="text-lg">
            <strong>Content:</strong> {moduleDetails?.content || "N/A"}
          </p>
        </div>

        <button
          onClick={handleDownloadFiles}
          className="flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
        >
          <FiDownload /> Download Files
        </button>

        <h2 className="text-2xl font-bold mt-8 mb-4">Lessons</h2>
        {lessons.length > 0 ? (
          <ul className="space-y-4">
            {lessons.map((lesson) => (
              <li
                key={lesson._id}
                className="text-blue-500 underline cursor-pointer hover:text-blue-700"
                onClick={() => handleLessonClick(lesson._id)}
              >
                {lesson.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No lessons available for this module.</p>
        )}

        <h2 className="text-2xl font-bold mt-8 mb-4">Notes</h2>
        {notes.length > 0 ? (
          <ul className="space-y-4">
            {notes.map((note) => (
              <li
                key={note._id}
                className="text-blue-500 underline cursor-pointer hover:text-blue-700"
                onClick={() => router.push(`/student/notes/${note._id}`)}
              >
                {note.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No notes available for this module.</p>
        )}

        {isAddingNote ? (
          <div className="mt-4">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write your note here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handleAddNote}
                className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 focus:outline-none"
              >
                Save Note
              </button>
              <button
                onClick={() => setIsAddingNote(false)}
                className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingNote(true)}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
          >
            + Add Note
          </button>
        )}

        <h2 className="text-2xl font-bold mt-8 mb-4">Quizzes</h2>
        {quizzes.length > 0 ? (
          <ul className="space-y-4">
            {quizzes.map((quiz) => (
              <li key={quiz._id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-lg font-semibold">
                  <strong>Name:</strong> {quiz.name}
                </p>
                <p>
                  <strong>Number of Questions:</strong> {quiz.numberOfQuestions}
                </p>
                <p>
                  <strong>Type:</strong> {quiz.quizType}
                </p>
                <p>
                  <strong>Duration:</strong> {quiz.duration} minutes
                </p>
                <button
                  onClick={() => handleStartQuiz(quiz._id)}
                  className="mt-2 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 focus:outline-none"
                >
                  Start Quiz
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No quizzes available for this module.</p>
        )}

        <h2 className="text-2xl font-bold mt-8 mb-4">Videos</h2>
        {videos.length > 0 ? (
          videos.map((videoUrl, index) => (
            <div key={index} className="mb-4">
              <video
                controls
                className="w-full max-h-96 border border-gray-300 rounded-lg shadow-md"
              >
                <source src={`http://localhost:4000/uploads/${videoUrl}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No videos available for this module.</p>
        )}
      </div>
    );
  };

  export default ModuleDetailsPage;
