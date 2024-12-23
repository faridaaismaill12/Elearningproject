import React from 'react';
import Banner from './banner/Banner';
import Banner2 from './banneroption2/page';
import About from './about/About';
import Courses from './courses/CoursesDisplay';
// import Sidebar from '../_components/sidebar/Sidebar';
import Slider from './slider/Slider';

const HomePage = () => {
  return (
    <div>
      {/* Sidebar Component */}
      {/* <Sidebar /> */}

      {/* Option 2 Banner */}
      <Banner2 />

      {/* Main Banner */}
      <Banner />

      {/* Slider Section */}
      <Slider />

      {/* About Section */}
      <About />

      {/* Courses Display */}
      <Courses />
    </div>
  );
};

export default HomePage;
