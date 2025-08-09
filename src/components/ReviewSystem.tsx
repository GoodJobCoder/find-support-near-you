import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReviews, Review } from '@/hooks/useReviews';
import { useLanguage } from '@/context/LanguageContext';

interface ReviewSystemProps {
  resourceId: string;
  resourceName: string;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({ resourceId, resourceName }) => {
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const { getResourceReviews, getAverageRating, addReview, markHelpful } = useReviews();
  const { t } = useLanguage();

  const reviews = getResourceReviews(resourceId);
  const averageRating = getAverageRating(resourceId);

  const handleSubmitReview = () => {
    if (rating === 0) return;
    
    addReview({
      resourceId,
      rating,
      comment: comment.trim()
    });
    
    setRating(0);
    setComment('');
    setShowAddReview(false);
  };

  const StarRating = ({ value, onRate, onHover, readonly = false }: {
    value: number;
    onRate?: (rating: number) => void;
    onHover?: (rating: number) => void;
    readonly?: boolean;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
          }`}
          onClick={() => !readonly && onRate?.(star)}
          onMouseEnter={() => !readonly && onHover?.(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
          <StarRating value={Math.round(averageRating)} readonly />
          <div className="text-sm text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? t('review') : t('reviews')}
          </div>
        </div>
        <div className="flex-1">
          <Button
            onClick={() => setShowAddReview(!showAddReview)}
            variant="outline"
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {t('addReview')}
          </Button>
        </div>
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('writeReview')} {resourceName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('rating')}</label>
              <StarRating
                value={hoveredStar || rating}
                onRate={setRating}
                onHover={setHoveredStar}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('comment')} ({t('optional')})</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('shareExperience')}
                className="min-h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} disabled={rating === 0}>
                {t('submitReview')}
              </Button>
              <Button variant="outline" onClick={() => setShowAddReview(false)}>
                {t('cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t('noReviews')}</p>
          </div>
        ) : (
          reviews
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} readonly />
                      <Badge variant="secondary">
                        {new Date(review.date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm mb-3 leading-relaxed">{review.comment}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpful(review.id)}
                      className="text-xs"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {t('helpful')} ({review.helpful})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;