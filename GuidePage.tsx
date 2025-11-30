
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GuideProfile, Tour } from './types';
import { dataService } from './services/dataService';
import TourCard from './TourCard';

const GuidePage: React.FC = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const [guide, setGuide] = useState<GuideProfile | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuideData = async () => {
      if (!guideId) return;
      try {
        setLoading(true);
        const guideProfile = await dataService.getGuideProfile(guideId);
        const guideTours = await dataService.getGuideTours(guideId);
        setGuide(guideProfile || null);
        setTours(guideTours);
        setError(null);
      } catch (err) {
        setError('Failed to load guide information.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideData();
  }, [guideId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!guide) {
    return <div>Guide not found.</div>;
  }

  return (
    <div className="guide-page">
      <div className="guide-header">
        <img src={guide.avatarUrl} alt={guide.name} className="guide-avatar" />
        <h1>{guide.name}</h1>
        <p>{guide.bio}</p>
        <div className="guide-tags">
          {guide.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      <div className="guide-tours">
        <h2>Tours by {guide.name}</h2>
        <div className="tour-list">
          {tours.map(tour => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
