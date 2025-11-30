import React from 'react';
import { Link } from 'react-router-dom';
import { Tour } from './types';

interface TourCardProps {
  tour: Tour;
}

const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  return (
    <Link to={`/guide/${tour.guideId}`} className="tour-card">
      <img src={tour.publicData.images[0]} alt={tour.publicData.title} className="tour-image" />
      <h3>{tour.publicData.title}</h3>
      <p>{tour.publicData.summary}</p>
      <div className="tour-details">
        <span>{tour.durationHours} hours</span>
        <span>${tour.pricing.basePrice}</span>
      </div>
    </Link>
  );
};

export default TourCard;
