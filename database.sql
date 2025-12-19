-- Base de datos para FuXion Lifestyle

-- Tabla de usuarios administradores
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    benefits TEXT,
    ingredients TEXT,
    image_url VARCHAR(255),
    fuxion_url VARCHAR(255),
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (featured),
    INDEX idx_active (active)
);

-- Tabla de posts del blog
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    image_url VARCHAR(255),
    author VARCHAR(100) DEFAULT 'FuXion Team',
    featured BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    INDEX idx_published (published),
    INDEX idx_featured (featured),
    INDEX idx_slug (slug)
);

-- Tabla de contactos
CREATE TABLE IF NOT EXISTS contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    message TEXT,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_read (read_status)
);

-- Tabla de solicitudes de distribuidores
CREATE TABLE IF NOT EXISTS distributor_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

-- Tabla de suscriptores al newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active (active)
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Tabla de ventas/compras de clientes
CREATE TABLE IF NOT EXISTS customer_purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INT DEFAULT 1,
    amount DECIMAL(10, 2),
    purchase_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer (customer_id),
    INDEX idx_date (purchase_date)
);

-- Tabla de objetivos semanales
CREATE TABLE IF NOT EXISTS weekly_goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    blog_posts_goal INT DEFAULT 3,
    blog_posts_completed INT DEFAULT 0,
    customer_calls_goal INT DEFAULT 3,
    customer_calls_completed INT DEFAULT 0,
    social_posts_goal INT DEFAULT 5,
    social_posts_completed INT DEFAULT 0,
    products_added_goal INT DEFAULT 2,
    products_added_completed INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_week (week_start)
);

-- Tabla de seguimiento de actividades diarias
CREATE TABLE IF NOT EXISTS daily_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT TRUE,
    activity_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (activity_date),
    INDEX idx_type (activity_type)
);

-- Insertar usuario administrador por defecto
-- Usuario: admin, Password: admin123 (cambiar después del primer login)
INSERT INTO admin_users (username, email, password, full_name) 
VALUES ('admin', 'admin@fuxionlifestyle.com', '$2b$10$cS/V3wpNTWkDiVzQ9og79O3lG3nsUIXqAR5NFU.DV.vDDdXn/euJO', 'Administrador')
ON DUPLICATE KEY UPDATE username = username;

-- Insertar productos de ejemplo
INSERT INTO products (name, slug, category, description, benefits, image_url, featured, display_order) VALUES
('Hydro Fusion', 'hydro-fusion', 'nutricion', 'Hidratación avanzada con electrolitos y antioxidantes naturales.', 'Hidratación óptima, recuperación muscular, antioxidantes naturales', 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400', TRUE, 1),
('OmegaFX', 'omegafx', 'defensas', 'Omega 3, 6 y 9 para la salud cardiovascular y cerebral.', 'Salud cardiovascular, función cerebral, antiinflamatorio natural', 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400', TRUE, 2),
('Vitalezza', 'vitalezza', 'energia', 'Energía natural y duradera sin efectos secundarios.', 'Energía sostenida, sin nerviosismo, mejora el rendimiento', 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400', TRUE, 3),
('ImmunoFX', 'immunofx', 'defensas', 'Fortalece tu sistema inmunológico con ingredientes naturales poderosos.', 'Fortalece defensas, previene enfermedades, antioxidantes', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', FALSE, 4),
('ThermoGEN', 'thermogen', 'peso', 'Acelera tu metabolismo de forma natural y saludable.', 'Acelera metabolismo, quema grasa, control de apetito', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', FALSE, 5),
('Protein Plus', 'protein-plus', 'nutricion', 'Proteína vegetal de alta calidad para tu desarrollo muscular.', 'Desarrollo muscular, proteína completa, vegano', 'https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=400', FALSE, 6),
('Beautify', 'beautify', 'belleza', 'Colágeno y antioxidantes para una piel radiante y juvenil.', 'Piel radiante, anti-edad, colágeno natural', 'https://images.unsplash.com/photo-1556228841-a6b87f6c7e4c?w=400', FALSE, 7),
('Focus MAX', 'focus-max', 'energia', 'Mejora tu concentración y claridad mental de forma natural.', 'Mejor concentración, claridad mental, memoria mejorada', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', FALSE, 8),
('SlimFX', 'slimfx', 'peso', 'Control de peso efectivo y saludable con ingredientes naturales.', 'Control de peso saludable, reduce ansiedad, desintoxicante', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', FALSE, 9)
ON DUPLICATE KEY UPDATE name = name;

-- Insertar posts de blog de ejemplo
INSERT INTO blog_posts (title, slug, excerpt, content, image_url, published, featured) VALUES
('10 Alimentos que Aumentan tu Energía', '10-alimentos-energia', 'Descubre qué alimentos naturales pueden darte energía duradera durante todo el día.', '<p>La energía que necesitas para afrontar tu día no solo viene del café...</p>', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800', TRUE, TRUE),
('Beneficios de la Hidratación Adecuada', 'beneficios-hidratacion', 'La importancia de mantenerte hidratado y cómo los electrolitos mejoran tu salud.', '<p>El agua es esencial para todas las funciones corporales...</p>', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', TRUE, FALSE),
('Cómo Fortalecer tu Sistema Inmune', 'fortalecer-sistema-inmune', 'Consejos prácticos y productos naturales para mejorar tus defensas.', '<p>Un sistema inmunológico fuerte es tu mejor protección...</p>', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', TRUE, FALSE)
ON DUPLICATE KEY UPDATE title = title;
