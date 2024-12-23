import React from "react";
import "./Banner.css";
import Image from "next/image";
const Banner = () => {
  return (
    <div className="banner_container">
      <div className="left-side">
        <Image
          src="/undraw_learning_sketching_nd4f.svg"
          alt="Learning Sketching"
          width={300}
          height={300}
          className="banner-svg"
        />
      </div>
      <div className="right-side">
        <h1>Welcome to BananaBread Academy</h1>
        <p>
          Discover a world of knowledge with our expertly crafted courses. Learn
          at your own pace, from anywhere, and achieve your goals with ease.
        </p>
        <button className="banner-btn">Explore Courses</button>
      </div>
    </div>
  );
};

export default Banner;


