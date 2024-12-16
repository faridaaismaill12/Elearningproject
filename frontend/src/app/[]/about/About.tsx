import React from 'react'
import './About.css'
import Image from "next/image";

const about = () => {
  return (
    <div className='about_container'>
        <div>
        <h1>Unlock Your Potential: Learn, Grow, and Succeed with Us!</h1>
        </div>
        <div>
            <p>Gain access to a vast library of videos across a variety of courses, Specializations, and Professional Certificates, all expertly designed and taught by instructors from top universities and leading companies. Whether you're looking to enhance your skills, advance your career, or explore new fields, our platform offers high-quality content to help you achieve your learning goals.</p>
        </div>
        <div>
        <Image
          src="/undraw_graduation_re_gthn.svg"
          alt="graduation"
          width={300}
          height={300}
          className="about-svg"
        />
        </div>
    </div>
  )
}

export default about
