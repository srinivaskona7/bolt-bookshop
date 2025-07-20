import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  Plus, 
  TrendingUp,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, backendStatus } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    recentBooks: [],
    userBooks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch books
      const booksResponse = await axios.get('/api/books?limit=6');
      const books = booksResponse.data.books || [];
      
      // Fetch users count if admin
      let usersCount = 0;
      if (user?.role === 'admin') {
        try {
          const usersResponse = await axios.get('/api/users?limit=1');
          usersCount = usersResponse.data.total || 0;
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }

      // Count user's books
      const userBooks = books.filter(book => book.addedBy?._id === user?.id).length;

      setStats({
        totalBooks: booksResponse.data.total || 0,
        totalUsers: usersCount,
        recentBooks: books.slice(0, 3),
        userBooks
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.firstName || user?.username}! 👋
                </h1>
                <p className="text-primary-100 text-lg">
                  Ready to discover your next great read?
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        backendStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
                      }`}
                    />
                    <span>
                      Backend {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Last login: {user?.lastLogin ? formatDate(user.lastLogin) : 'First time'}</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <BookOpen className="h-24 w-24 text-primary-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBooks}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/books"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                View all books
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/users"
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                >
                  Manage users
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Books</p>
                <p className="text-3xl font-bold text-gray-900">{stats.userBooks}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/books/add"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
              >
                Add new book
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quick Action</p>
                <p className="text-lg font-semibold text-gray-900">Add Book</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/books/add"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Books */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Books</h2>
              <Link
                to="/books"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
              >
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {stats.recentBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.recentBooks.map((book) => (
                  <Link
                    key={book._id}
                    to={`/books/${book._id}`}
                    className="group block"
                  >
                    <div className="bg-gray-50 rounded-lg p-4 group-hover:bg-gray-100 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {book.coverImage ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${book.coverImage}`}
                              alt={book.title}
                              className="w-16 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-20 bg-primary-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-8 w-8 text-primary-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            by {book.author}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-sm font-medium text-green-600">
                              ${book.price}
                            </span>
                            {book.rating > 0 && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 ml-1">
                                  {book.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Added {formatDate(book.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No books yet</h3>
                <p className="text-gray-500 mb-4">Start building your library by adding your first book.</p>
                <Link
                  to="/books/add"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Book
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;