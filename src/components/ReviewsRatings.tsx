import { useState, useEffect } from 'react';
import { Star, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../hooks/useToast';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  timestamp: string;
  helpful: number;
  verified: boolean;
}

interface ReviewsRatingsProps {
  itemId: string;
  itemName: string;
}

export default function ReviewsRatings({ itemId, itemName }: ReviewsRatingsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Load reviews from localStorage (in real app, this would be API call)
  useEffect(() => {
    const storedReviews = localStorage.getItem(`reviews_${itemId}`);
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
  }, [itemId]);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      addToast({ type: 'error', message: 'Please write a comment' });
      return;
    }

    setIsSubmitting(true);

    const review: Review = {
      id: Date.now().toString(),
      userId: 'current-user', // In real app, get from auth
      userName: 'Anonymous User', // In real app, get from auth
      rating: newReview.rating,
      comment: newReview.comment,
      timestamp: new Date().toISOString(),
      helpful: 0,
      verified: true
    };

    const updatedReviews = [review, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${itemId}`, JSON.stringify(updatedReviews));

    setNewReview({ rating: 5, comment: '' });
    setShowReviewForm(false);
    setIsSubmitting(false);
    addToast({ type: 'success', message: 'Review submitted successfully!' });
  };

  const handleHelpfulVote = (reviewId: string, helpful: boolean) => {
    const updatedReviews = reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: helpful ? review.helpful + 1 : review.helpful - 1 }
        : review
    );
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${itemId}`, JSON.stringify(updatedReviews));
    addToast({ 
      type: 'info', 
      message: helpful ? 'Marked as helpful' : 'Feedback noted' 
    });
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
  }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} readonly />
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm w-3">{rating}</span>
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle size={16} />
          Write a Review
        </button>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Review {itemName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <StarRating
                  rating={newReview.rating}
                  onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comment
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience with this dish..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                {review.userName.charAt(0)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {review.userName}
                  </span>
                  {review.verified && (
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                      Verified
                    </span>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <StarRating rating={review.rating} readonly />
                
                <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                  {review.comment}
                </p>
                
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => handleHelpfulVote(review.id, true)}
                    className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <ThumbsUp size={14} />
                    Helpful ({review.helpful})
                  </button>
                  <button
                    onClick={() => handleHelpfulVote(review.id, false)}
                    className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <ThumbsDown size={14} />
                    Not helpful
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {reviews.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to review {itemName}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
