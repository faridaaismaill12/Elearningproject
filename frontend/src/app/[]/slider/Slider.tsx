import React, { useState } from 'react';
import './Slider.css'; // Add CSS styles for the slider.

interface SliderItem {
  image: string;
  title: string;
  description: string;
}

const slides: SliderItem[] = [
  {
    image: 'https://via.placeholder.com/600x300/FF5733/fff?text=Slide+1',
    title: 'Course 1',
    description: 'This is the description of Course 1.'
  },
  {
    image: 'https://via.placeholder.com/600x300/33CFFF/fff?text=Slide+2',
    title: 'Course 2',
    description: 'This is the description of Course 2.'
  },
  {
    image: 'https://via.placeholder.com/600x300/33FF57/fff?text=Slide+3',
    title: 'Course 3',
    description: 'This is the description of Course 3.'
  }
];

const Slider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="slider-container">
      <div className="slider">
        <div className="slide">
          <img
            src={slides[currentIndex].image}
            alt={slides[currentIndex].title}
            className="slide-image"
          />
          <div className="slide-text">
            <h2>{slides[currentIndex].title}</h2>
            <p>{slides[currentIndex].description}</p>
          </div>
        </div>
      </div>
      
      <button className="prev" onClick={handlePrev}>
        &#10094;
      </button>
      <button className="next" onClick={handleNext}>
        &#10095;
      </button>
    </div>
  );
};

export default Slider;
