# Welcome to BananaBread Academy!

We designed an online learning platform simulaiton as part of our university course on software development.

## Description

We were tasked with developing an E-Learning Platform using NestJS, MongoDB, and Next.js. Our platform aims to deliver adaptive learning experiences, and provide
personalized insights into user performance. It caters to three user roles: students, instructors, and administrators; focusing on interactive learning and robust security.

## Key Features
### User Management
* We implemented role-based user authorization with access-based controls.
* Students and instructors can update their personal information, view enrolled courses, track their completed courses and delete or otherwise manage their accounts.

### Course Management
* Course Creation and Organization: Instructors can create course modules, upload multimedia resources (videos, PDFs), and organize content hierarchically.
* Version Control: Instructors can update course content while maintaining access to previous versions.
* Search Functionality: Whereby users can search for a certain course, instructors can search for a certain student, and students can search for a certain instructor.

### Interactive Modules
* Quizzes and Assessments: Adaptive quizzes dynamically adjust question difficulty based on user performance.
* Real-Time Feedback: Students can get instant feedback on quizzes, highlighting correct answers and areas for improvement.

### Security and Data Protection
* Secure Authentication: We used JSON Web Tokens (JWT) for secure login and session management. Moreover, passwords are stored with hashing and salting using bcrypt to ensure data integrity.
* Role-Based Access Control (RBAC): We implemented middleware in the backend to control access to APIs based on user roles (student, instructor, admin).
* Multifactor Authentication: We provided MFA that connects to authenticator apps on users mobile phones to add an additional layer of security. 

### Communication Features
* Real-Time Chat: We enabled Instructors to communicate with students for queries and discussions while students can also form study groups and chat with peers.
* Discussion Forums: We created spaces to allow for Forums for course-specific discussions moderated by instructors. Additional Features include: thread creation, replies, and search functionality.
* Notification System: Students and instructors receive notifications for new messages, replies, or announcements.
* Saved Conversations: Chat history and forum discussions are saved for future reference.

### Quick Notes
* Allow users to create and save quick notes for their courses or modules.
* We provided students with a personal space to jot down key points, reminders, or study tips as they navigate the course.

## Full Tech Stack:
* Backend: NestJS (Node.js, TypeScript).
* Frontend: Next.js, with Tailwind CSS for styling.
* Database: MongoDB for flexible and scalable storage.
* Security: Multi-Factor Authentication (MFA)

