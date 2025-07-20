const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Book = require('../models/Book');
const { auth, adminAuth } = require('../middleware/auth');
const winston = require('winston');

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/books');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for book covers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `book-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all books
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search = '', 
      category = '', 
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    const query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const books = await Book.find(query)
      .populate('addedBy', 'username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Book.countDocuments(query);
    const categories = await Book.distinct('category', { isActive: true });

    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      categories
    });
  } catch (error) {
    logger.error('Get books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('addedBy', 'username')
      .populate('reviews.user', 'username');

    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ book });
  } catch (error) {
    logger.error('Get book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new book
router.post('/', auth, upload.single('coverImage'), [
  body('title').notEmpty().trim().isLength({ max: 200 }),
  body('author').notEmpty().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('category').notEmpty().trim(),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, description, price, category, isbn, stock } = req.body;

    // Check if ISBN already exists
    if (isbn) {
      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        return res.status(400).json({ message: 'Book with this ISBN already exists' });
      }
    }

    const bookData = {
      title,
      author,
      description,
      price: parseFloat(price),
      category,
      isbn,
      stock: parseInt(stock) || 0,
      addedBy: req.user._id
    };

    if (req.file) {
      bookData.coverImage = `/uploads/books/${req.file.filename}`;
    }

    const book = new Book(bookData);
    await book.save();

    const populatedBook = await Book.findById(book._id).populate('addedBy', 'username');

    logger.info(`Book added: ${book.title} by ${req.user.username}`);
    res.status(201).json({
      message: 'Book added successfully',
      book: populatedBook
    });
  } catch (error) {
    logger.error('Add book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update book
router.put('/:id', auth, upload.single('coverImage'), [
  body('title').optional().trim().isLength({ max: 200 }),
  body('author').optional().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('price').optional().isNumeric().isFloat({ min: 0 }),
  body('category').optional().trim(),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user owns the book or is admin
    if (book.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    const updateData = {};
    const { title, author, description, price, category, isbn, stock } = req.body;

    if (title) updateData.title = title;
    if (author) updateData.author = author;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (isbn) updateData.isbn = isbn;
    if (stock !== undefined) updateData.stock = parseInt(stock);

    if (req.file) {
      // Delete old cover image
      if (book.coverImage) {
        const oldPath = path.join(__dirname, '../uploads/books', path.basename(book.coverImage));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.coverImage = `/uploads/books/${req.file.filename}`;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username');

    logger.info(`Book updated: ${updatedBook.title} by ${req.user.username}`);
    res.json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    logger.error('Update book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete book
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user owns the book or is admin
    if (book.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    // Soft delete
    await Book.findByIdAndUpdate(req.params.id, { isActive: false });

    logger.info(`Book deleted: ${book.title} by ${req.user.username}`);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    logger.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review
router.post('/:id/reviews', auth, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already reviewed this book
    const existingReview = book.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Add review
    book.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    // Update average rating
    const totalRating = book.reviews.reduce((sum, review) => sum + review.rating, 0);
    book.rating = totalRating / book.reviews.length;

    await book.save();

    const updatedBook = await Book.findById(book._id)
      .populate('addedBy', 'username')
      .populate('reviews.user', 'username');

    logger.info(`Review added for book: ${book.title} by ${req.user.username}`);
    res.json({
      message: 'Review added successfully',
      book: updatedBook
    });
  } catch (error) {
    logger.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;