import React from "react";
import "./Banner.css";

const Banner = () => {
  return (
    <div className="banner-container">
      {/* Video Background */}
      <video autoPlay muted loop className="video-background">
        <source src="/23354-334950206_small.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient Overlay and Content */}
      <div className="gradient-overlay">
        <div className="content">
          <h1>Welcome to BananaBread Academy</h1>
          <p>
            Discover a world of knowledge with our expertly crafted courses.
            Learn at your own pace, from anywhere, and achieve your goals with
            ease.
          </p>
          <button className="banner-btn">Explore Courses</button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
