import React from 'react'
import Banner from './banner/Banner'
import About from './about/About'
import Courses from './courses/CoursesDisplay'
import Sidebar from '../_components/sidebar/Sidebar'
const HomePage = () => {
  return (
    
    <div>
      <Sidebar/>
      <Banner/>
      <About/>
      <Courses/>
    </div>
  )
}

export default HomePage
