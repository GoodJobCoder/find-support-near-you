import { useState, useEffect } from 'react';

export interface Review {
  id: string;
  resourceId: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

const REVIEWS_KEY = 'cancer-support-reviews';

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(REVIEWS_KEY);
    if (stored) {
      try {
        setReviews(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    }
  }, []);

  const addReview = (review: Omit<Review, 'id' | 'date' | 'helpful'>) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      helpful: 0
    };
    const updated = [...reviews, newReview];
    setReviews(updated);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  };

  const markHelpful = (reviewId: string) => {
    const updated = reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    );
    setReviews(updated);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  };

  const getResourceReviews = (resourceId: string) => {
    return reviews.filter(review => review.resourceId === resourceId);
  };

  const getAverageRating = (resourceId: string) => {
    const resourceReviews = getResourceReviews(resourceId);
    if (resourceReviews.length === 0) return 0;
    
    const sum = resourceReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / resourceReviews.length;
  };

  return {
    reviews,
    addReview,
    markHelpful,
    getResourceReviews,
    getAverageRating
  };
}