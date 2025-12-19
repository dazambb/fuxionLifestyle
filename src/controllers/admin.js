const connection = require("../db/connection");
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// ============ AUTENTICACIÓN ============

// Mostrar página de login
const showLogin = (req, res) => {
    res.render('admin/login', {
        title: 'Admin Login - FuXion',
        layout: 'admin/layout-auth',
        error: null
    });
};

// Procesar login
const processLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const query = 'SELECT * FROM admin_users WHERE username = ? LIMIT 1';
        connection.query(query, [username], async (error, results) => {
            if (error) {
                return res.render('admin/login', {
                    title: 'Admin Login - FuXion',
                    layout: 'admin/layout-auth',
                    error: 'Error en el servidor'
                });
            }
            
            if (results.length === 0) {
                return res.render('admin/login', {
                    title: 'Admin Login - FuXion',
                    layout: 'admin/layout-auth',
                    error: 'Usuario o contraseña incorrectos'
                });
            }
            
            const user = results[0];
            
            // Verificar contraseña
            const validPassword = await bcrypt.compare(password, user.password);
            
            if (!validPassword) {
                return res.render('admin/login', {
                    title: 'Admin Login - FuXion',
                    layout: 'admin/layout-auth',
                    error: 'Usuario o contraseña incorrectos'
                });
            }
            
            // Generar token
            const token = generateToken(user);
            
            // Guardar token en cookie
            res.cookie('admin_token', token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
            });
            
            // Guardar mensaje de bienvenida en sesión
            res.cookie('welcome_message', 'true', {
                maxAge: 5000 // 5 segundos
            });
            
            res.redirect('/admin/dashboard');
        });
    } catch (error) {
        console.error(error);
        res.render('admin/login', {
            title: 'Admin Login - FuXion',
            layout: 'admin/layout-auth',
            error: 'Error en el servidor'
        });
    }
};

// Logout
const logout = (req, res) => {
    res.clearCookie('admin_token');
    res.redirect('/admin/login');
};

// ============ DASHBOARD ============

const dashboard = (req, res) => {
    // Obtener estadísticas principales
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM products WHERE active = 1) as products_count,
            (SELECT COUNT(*) FROM blog_posts WHERE published = 1) as posts_count,
            (SELECT COUNT(*) FROM contacts WHERE read_status = 0) as unread_contacts,
            (SELECT COUNT(*) FROM distributor_requests WHERE status = 'pending') as pending_distributors,
            (SELECT COUNT(*) FROM newsletter_subscribers WHERE active = 1) as subscribers_count,
            (SELECT COUNT(*) FROM customers) as customers_count,
            (SELECT COUNT(*) FROM customer_purchases WHERE MONTH(purchase_date) = MONTH(CURRENT_DATE()) AND YEAR(purchase_date) = YEAR(CURRENT_DATE())) as purchases_count
    `;
    
    // Obtener clientes recientes con última compra
    const customersQuery = `
        SELECT 
            c.*,
            MAX(cp.purchase_date) as last_purchase_date,
            COUNT(cp.id) as total_purchases,
            DATEDIFF(CURRENT_DATE(), MAX(cp.purchase_date)) as days_since_purchase
        FROM customers c
        LEFT JOIN customer_purchases cp ON c.id = cp.customer_id
        GROUP BY c.id
        ORDER BY last_purchase_date DESC
        LIMIT 5
    `;
    
    // Obtener objetivos semanales
    const goalsQuery = `
        SELECT * FROM weekly_goals 
        WHERE week_start <= CURRENT_DATE() AND week_end >= CURRENT_DATE()
        ORDER BY created_at DESC
        LIMIT 1
    `;
    
    connection.query(statsQuery, (error, stats) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al obtener estadísticas');
        }
        
        connection.query(customersQuery, (error2, customers) => {
            if (error2) {
                console.error(error2);
            }
            
            connection.query(goalsQuery, (error3, goals) => {
                if (error3) {
                    console.error(error3);
                }
                
                const weeklyGoals = goals && goals[0] ? goals[0] : {
                    blog_posts_completed: 0,
                    customer_calls_completed: 0,
                    social_posts_completed: 0,
                    products_added_completed: 0
                };
                
                res.render('admin/dashboard', {
                    title: 'Panel de Control - FuXion Lifestyle',
                    layout: 'admin/layout',
                    stats: {
                        ...stats[0],
                        weekly_blog_posts: weeklyGoals.blog_posts_completed,
                        weekly_calls: weeklyGoals.customer_calls_completed,
                        weekly_social: weeklyGoals.social_posts_completed,
                        weekly_followups: weeklyGoals.products_added_completed,
                        purchases_growth: 15 // Puedes calcular esto comparando con el mes anterior
                    },
                    recentCustomers: customers || [],
                    user: req.user
                });
            });
        });
    });
};

const listProducts = (req, res) => {
    const query = 'SELECT * FROM products ORDER BY display_order ASC, created_at DESC';
    
    connection.query(query, (error, products) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al obtener productos');
        }
        
        res.render('admin/products/list', {
            title: 'Productos - Admin FuXion',
            layout: 'admin/layout',
            products: products,
            user: req.user
        });
    });
};

const newProductForm = (req, res) => {
    res.render('admin/products/form', {
        title: 'Nuevo Producto - Admin FuXion',
        layout: 'admin/layout',
        product: null,
        user: req.user
    });
};

const createProduct = (req, res) => {
    const { name, slug, category, description, benefits, ingredients, image_url, fuxion_url, featured, active, display_order } = req.body;
    
    const query = `
        INSERT INTO products (name, slug, category, description, benefits, ingredients, image_url, fuxion_url, featured, active, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        name,
        slug || name.toLowerCase().replace(/\s+/g, '-'),
        category,
        description,
        benefits,
        ingredients,
        image_url,
        fuxion_url,
        featured === 'on' ? 1 : 0,
        active === 'on' ? 1 : 0,
        display_order || 0
    ];
    
    connection.query(query, values, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al crear producto');
        }
        
        res.redirect('/admin/products?success=created');
    });
};

// Mostrar formulario de edición
const editProductForm = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM products WHERE id = ?';
    
    connection.query(query, [id], (error, results) => {
        if (error || results.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        
        res.render('admin/products/form', {
            title: 'Editar Producto - Admin FuXion',
            layout: 'admin/layout',
            product: results[0],
            user: req.user
        });
    });
};

// Actualizar producto
const updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, slug, category, description, benefits, ingredients, image_url, fuxion_url, featured, active, display_order } = req.body;
    
    const query = `
        UPDATE products 
        SET name = ?, slug = ?, category = ?, description = ?, benefits = ?, ingredients = ?, 
            image_url = ?, fuxion_url = ?, featured = ?, active = ?, display_order = ?
        WHERE id = ?
    `;
    
    const values = [
        name,
        slug,
        category,
        description,
        benefits,
        ingredients,
        image_url,
        fuxion_url,
        featured === 'on' ? 1 : 0,
        active === 'on' ? 1 : 0,
        display_order || 0,
        id
    ];
    
    connection.query(query, values, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al actualizar producto');
        }
        
        res.redirect('/admin/products?success=updated');
    });
};

// Eliminar producto
const deleteProduct = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM products WHERE id = ?';
    
    connection.query(query, [id], (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false });
        }
        
        res.json({ success: true });
    });
};

// ============ BLOG ============

// Listar posts
const listPosts = (req, res) => {
    const query = 'SELECT * FROM blog_posts ORDER BY created_at DESC';
    
    connection.query(query, (error, posts) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al obtener posts');
        }
        
        res.render('admin/blog/list', {
            title: 'Blog - Admin FuXion',
            layout: 'admin/layout',
            posts: posts,
            user: req.user
        });
    });
};

// Mostrar formulario de nuevo post
const newPostForm = (req, res) => {
    res.render('admin/blog/form', {
        title: 'Nuevo Artículo - Admin FuXion',
        layout: 'admin/layout',
        post: null,
        user: req.user
    });
};

// Crear post
const createPost = (req, res) => {
    const { title, slug, excerpt, content, image_url, author, featured, published } = req.body;
    
    const query = `
        INSERT INTO blog_posts (title, slug, excerpt, content, image_url, author, featured, published, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        title,
        slug || title.toLowerCase().replace(/\s+/g, '-'),
        excerpt,
        content,
        image_url,
        author || 'FuXion Team',
        featured === 'on' ? 1 : 0,
        published === 'on' ? 1 : 0,
        published === 'on' ? new Date() : null
    ];
    
    connection.query(query, values, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al crear post');
        }
        
        res.redirect('/admin/blog?success=created');
    });
};

// Mostrar formulario de edición de post
const editPostForm = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM blog_posts WHERE id = ?';
    
    connection.query(query, [id], (error, results) => {
        if (error || results.length === 0) {
            return res.status(404).send('Post no encontrado');
        }
        
        res.render('admin/blog/form', {
            title: 'Editar Artículo - Admin FuXion',
            layout: 'admin/layout',
            post: results[0],
            user: req.user
        });
    });
};

// Actualizar post
const updatePost = (req, res) => {
    const { id } = req.params;
    const { title, slug, excerpt, content, image_url, author, featured, published } = req.body;
    
    // Obtener estado anterior
    connection.query('SELECT published FROM blog_posts WHERE id = ?', [id], (err, results) => {
        const wasPublished = results[0].published;
        const isPublished = published === 'on' ? 1 : 0;
        
        const query = `
            UPDATE blog_posts 
            SET title = ?, slug = ?, excerpt = ?, content = ?, image_url = ?, author = ?, 
                featured = ?, published = ?, published_at = ?
            WHERE id = ?
        `;
        
        const values = [
            title,
            slug,
            excerpt,
            content,
            image_url,
            author,
            featured === 'on' ? 1 : 0,
            isPublished,
            (!wasPublished && isPublished) ? new Date() : results[0].published_at,
            id
        ];
        
        connection.query(query, values, (error) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error al actualizar post');
            }
            
            res.redirect('/admin/blog?success=updated');
        });
    });
};

// Eliminar post
const deletePost = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM blog_posts WHERE id = ?';
    
    connection.query(query, [id], (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false });
        }
        
        res.json({ success: true });
    });
};

// ============ CLIENTES ============

const listCustomers = (req, res) => {
    const query = `
        SELECT 
            c.*,
            MAX(cp.purchase_date) as last_purchase_date,
            COUNT(cp.id) as total_purchases,
            DATEDIFF(CURRENT_DATE(), MAX(cp.purchase_date)) as days_since_purchase
        FROM customers c
        LEFT JOIN customer_purchases cp ON c.id = cp.customer_id
        GROUP BY c.id
        ORDER BY last_purchase_date DESC
    `;
    
    connection.query(query, (error, customers) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al obtener clientes');
        }
        
        res.render('admin/customers/list', {
            title: 'Clientes - Admin FuXion',
            layout: 'admin/layout',
            customers: customers,
            user: req.user
        });
    });
};

const newCustomerForm = (req, res) => {
    res.render('admin/customers/form', {
        title: 'Nuevo Cliente - Admin FuXion',
        layout: 'admin/layout',
        customer: null,
        user: req.user
    });
};

const createCustomer = (req, res) => {
    const { name, email, phone, address, city, notes } = req.body;
    
    const query = 'INSERT INTO customers (name, email, phone, address, city, notes) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [name, email, phone, address, city, notes];
    
    connection.query(query, values, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al crear cliente');
        }
        
        res.redirect('/admin/customers');
    });
};

const editCustomerForm = (req, res) => {
    const { id } = req.params;
    
    const customerQuery = 'SELECT * FROM customers WHERE id = ?';
    const purchasesQuery = 'SELECT * FROM customer_purchases WHERE customer_id = ? ORDER BY purchase_date DESC';
    
    connection.query(customerQuery, [id], (error, customer) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al obtener cliente');
        }
        
        if (customer.length === 0) {
            return res.status(404).send('Cliente no encontrado');
        }
        
        connection.query(purchasesQuery, [id], (error2, purchases) => {
            res.render('admin/customers/form', {
                title: 'Editar Cliente - Admin FuXion',
                layout: 'admin/layout',
                customer: customer[0],
                purchases: purchases || [],
                user: req.user
            });
        });
    });
};

const updateCustomer = (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, city, notes } = req.body;
    
    const query = 'UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, city = ?, notes = ? WHERE id = ?';
    const values = [name, email, phone, address, city, notes, id];
    
    connection.query(query, values, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al actualizar cliente');
        }
        
        res.redirect('/admin/customers');
    });
};

const deleteCustomer = (req, res) => {
    const { id } = req.params;
    
    connection.query('DELETE FROM customers WHERE id = ?', [id], (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false });
        }
        
        res.json({ success: true });
    });
};

const addPurchase = (req, res) => {
    const { customer_id, product_name, quantity, amount, purchase_date, notes } = req.body;
    
    const query = 'INSERT INTO customer_purchases (customer_id, product_name, quantity, amount, purchase_date, notes) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [customer_id, product_name, quantity || 1, amount, purchase_date, notes];
    
    connection.query(query, values, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false });
        }
        
        res.json({ success: true });
    });
};

// ============ OBJETIVOS SEMANALES ============

const incrementGoal = (req, res) => {
    const { type } = req.params;
    
    // Obtener o crear objetivo de la semana actual
    const getGoalQuery = `
        SELECT * FROM weekly_goals 
        WHERE week_start <= CURRENT_DATE() AND week_end >= CURRENT_DATE()
        LIMIT 1
    `;
    
    connection.query(getGoalQuery, (error, goals) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false });
        }
        
        if (goals.length === 0) {
            // Crear nuevo objetivo semanal
            const createQuery = `
                INSERT INTO weekly_goals (week_start, week_end) 
                VALUES (DATE_SUB(CURRENT_DATE(), INTERVAL WEEKDAY(CURRENT_DATE()) DAY), 
                        DATE_ADD(DATE_SUB(CURRENT_DATE(), INTERVAL WEEKDAY(CURRENT_DATE()) DAY), INTERVAL 6 DAY))
            `;
            
            connection.query(createQuery, (error2) => {
                if (error2) {
                    console.error(error2);
                    return res.status(500).json({ success: false });
                }
                
                incrementGoalValue(type, res);
            });
        } else {
            incrementGoalValue(type, res);
        }
    });
};

function incrementGoalValue(type, res) {
    const fieldMap = {
        'blog_posts': 'blog_posts_completed',
        'customer_calls': 'customer_calls_completed',
        'social_posts': 'social_posts_completed',
        'followups': 'products_added_completed'
    };
    
    const field = fieldMap[type];
    if (!field) {
        return res.status(400).json({ success: false });
    }
    
    const updateQuery = `
        UPDATE weekly_goals 
        SET ${field} = ${field} + 1
        WHERE week_start <= CURRENT_DATE() AND week_end >= CURRENT_DATE()
    `;
    
    connection.query(updateQuery, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false });
        }
        
        res.json({ success: true });
    });
}

const resetWeeklyGoals = (req, res) => {
    const query = `
        UPDATE weekly_goals 
        SET blog_posts_completed = 0, 
            customer_calls_completed = 0, 
            social_posts_completed = 0, 
            products_added_completed = 0
        WHERE week_start <= CURRENT_DATE() AND week_end >= CURRENT_DATE()
    `;
    
    connection.query(query, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false });
        }
        
        res.json({ success: true });
    });
};

module.exports = {
    // Auth
    showLogin,
    processLogin,
    logout,
    // Dashboard
    dashboard,
    // Products
    listProducts,
    newProductForm,
    createProduct,
    editProductForm,
    updateProduct,
    deleteProduct,
    // Blog
    listPosts,
    newPostForm,
    createPost,
    editPostForm,
    updatePost,
    deletePost,
    // Customers
    listCustomers,
    newCustomerForm,
    createCustomer,
    editCustomerForm,
    updateCustomer,
    deleteCustomer,
    addPurchase,
    // Goals
    incrementGoal,
    resetWeeklyGoals
};
