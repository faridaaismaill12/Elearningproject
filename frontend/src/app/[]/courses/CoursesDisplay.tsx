import React from 'react';
import './CoursesDisplay.css';
import Image from 'next/image';

// Sample course data
const courseData = [
  {
    id: 1,
    title: 'React for Beginners',
    image: '/photo1.jfif', // Replace with your image path
    description: 'Learn the basics of React.'
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    image: '/photo2.jpg', // Replace with your image path
    description: 'Master JavaScript for modern web development.'
  },
  {
    id: 3,
    title: 'Cryptography',
    image: '/security.jpeg', // Replace with your image path
    description: 'Master Cryptography for modern web development.'
  },
  {
    id: 4,
    title: 'Cryptography',
    image: '/security.jpeg', // Replace with your image path
    description: 'Master Cryptography for modern web development.'
  },
  {
    id: 5,
    title: 'Cryptography',
    image: '/security.jpeg', // Replace with your image path
    description: 'Master Cryptography for modern web development.'
  },
  {
    id: 6,
    title: 'Cryptography',
    image: '/security.jpeg', // Replace with your image path
    description: 'Master Cryptography for modern web development.'
  },
  // Add more courses as needed
];

const CoursesDisplay = () => {
  return (
    <div className='courses_container'>
      <div className="course">
        <h1 className='title'>Popular Courses</h1>
        <div className='courses_grid'>
          {courseData.map((course) => {
            return (
              <div key={course.id} className="course_item">
                <div className="image-container">
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={300}
                    height={200}
                    className="course_image"
                  />
                  <div className='caption'>
                    <p>{course.description}</p>
                  </div>
                </div>
                <div className='buttons'>
                  <button className="button">View Course</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoursesDisplay;
