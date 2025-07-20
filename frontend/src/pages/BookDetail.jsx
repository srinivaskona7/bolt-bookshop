import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  Star, 
  User,
  Calendar,
  DollarSign,
  Package,
  Edit,
  Trash2,
  MessageSquare,
  Send
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/books/${id}`);
      setBook(response.data.book);
    } catch (error) {
      console.error('Error fetching book:', error);
      toast.error('Failed to load book details');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await axios.delete(`/api/books/${id}`);
      toast.success('Book deleted successfully');
      navigate('/books');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setReviewLoading(true);
    try {
      const response = await axios.post(`/api/books/${id}/reviews`, reviewData);
      setBook(response.data.book);
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      toast.success('Review added successfully');
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error(error.response?.data?.message || 'Failed to add review');
    } finally {
      setReviewLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => onRatingChange(i) : undefined}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!interactive}
        >
          <Star
            className={`h-5 w-5 ${
              i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        </button>
      );
    }
    return stars;
  };

  const canEditOrDelete = book && (
    book.addedBy._id === user?.id || user?.role === 'admin'
  );

  const hasUserReviewed = book?.reviews?.some(
    review => review.user._id === user?.id
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading book details..." />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Book not found</h3>
          <Link
            to="/books"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/books')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Books
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover and Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="aspect-w-3 aspect-h-4 mb-6">
                {book.coverImage ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${book.coverImage}`}
                    alt={book.title}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-80 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-20 w-20 text-primary-600" />
                  </div>
                )}
              </div>

              {/* Price and Stock */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-green-600">
                    {formatPrice(book.price)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    book.stock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {book.rating > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {renderStars(book.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {book.rating.toFixed(1)} ({book.reviews?.length || 0} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {canEditOrDelete && (
                <div className="space-y-3">
                  <Link
                    to={`/books/${book._id}/edit`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Book
                  </Link>
                  <button
                    onClick={handleDeleteBook}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Book
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  by {book.author}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
                    {book.category}
                  </span>
                  {book.isbn && (
                    <span>ISBN: {book.isbn}</span>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Added {formatDate(book.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    by {book.addedBy.username}
                  </div>
                </div>
              </div>

              {book.description && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Reviews ({book.reviews?.length || 0})
                </h2>
                {!hasUserReviewed && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Write Review
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {renderStars(reviewData.rating, true, (rating) => 
                        setReviewData(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Review
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      value={reviewData.comment}
                      onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Write your review..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {reviewLoading ? (
                        <LoadingSpinner size="small" text="" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Review
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              {book.reviews && book.reviews.length > 0 ? (
                <div className="space-y-4">
                  {book.reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.user.username}
                            </p>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 ml-11">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-500">Be the first to review this book!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;