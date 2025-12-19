const router = require('express').Router();
const admin = require('../../controllers/admin');
const { authMiddleware } = require('../../middleware/auth');

// Auth routes (sin middleware)
router.get('/login', admin.showLogin);
router.post('/login', admin.processLogin);
router.get('/logout', admin.logout);

// Dashboard (con middleware)
router.get('/dashboard', authMiddleware, admin.dashboard);
router.get('/', authMiddleware, (req, res) => res.redirect('/admin/dashboard'));

// Products routes
router.get('/products', authMiddleware, admin.listProducts);
router.get('/products/new', authMiddleware, admin.newProductForm);
router.post('/products/new', authMiddleware, admin.createProduct);
router.get('/products/edit/:id', authMiddleware, admin.editProductForm);
router.post('/products/edit/:id', authMiddleware, admin.updateProduct);
router.delete('/products/delete/:id', authMiddleware, admin.deleteProduct);

// Blog routes
router.get('/blog', authMiddleware, admin.listPosts);
router.get('/blog/new', authMiddleware, admin.newPostForm);
router.post('/blog/new', authMiddleware, admin.createPost);
router.get('/blog/edit/:id', authMiddleware, admin.editPostForm);
router.post('/blog/edit/:id', authMiddleware, admin.updatePost);
router.delete('/blog/delete/:id', authMiddleware, admin.deletePost);

// Customers routes
router.get('/customers', authMiddleware, admin.listCustomers);
router.get('/customers/new', authMiddleware, admin.newCustomerForm);
router.post('/customers/create', authMiddleware, admin.createCustomer);
router.get('/customers/:id/edit', authMiddleware, admin.editCustomerForm);
router.post('/customers/:id/update', authMiddleware, admin.updateCustomer);
router.post('/customers/:id/delete', authMiddleware, admin.deleteCustomer);
router.post('/customers/purchase/add', authMiddleware, admin.addPurchase);

// Goals API routes
router.post('/api/goals/increment/:type', authMiddleware, admin.incrementGoal);
router.post('/api/goals/reset', authMiddleware, admin.resetWeeklyGoals);

module.exports.router = router;
