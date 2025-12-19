const connection = require("../db/connection");

const index = async (req, res) => {
  try {
    // Obtener productos destacados
    const productsQuery = 'SELECT * FROM products WHERE active = 1 AND featured = 1 ORDER BY display_order ASC LIMIT 3';
    
    connection.query(productsQuery, (error, products) => {
      if (error) {
        console.error(error);
        products = [];
      }
      
      // Obtener posts destacados del blog
      const postsQuery = 'SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3';
      
      connection.query(postsQuery, (err, posts) => {
        if (err) {
          console.error(err);
          posts = [];
        }
        
        res.render("index", {
          title: "FuXion Lifestyle - Distribuidor Oficial",
          featuredProducts: products,
          recentPosts: posts
        });
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
};

const productos = async (req, res) => {
  try {
    // Obtener productos de la base de datos
    const query = 'SELECT * FROM products WHERE active = 1 ORDER BY display_order ASC, created_at DESC';
    connection.query(query, (error, products) => {
      if (error) {
        console.error(error);
        // Si hay error, renderizar sin productos
        return res.render("productos", {
          title: "Productos - FuXion Lifestyle",
          products: []
        });
      }
      
      res.render("productos", {
        title: "Productos - FuXion Lifestyle",
        products: products
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
};

const blog = async (req, res) => {
  try {
    // Obtener posts publicados de la base de datos
    const query = 'SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC';
    connection.query(query, (error, posts) => {
      if (error) {
        console.error(error);
        // Si hay error, renderizar sin posts
        return res.render("blog", {
          title: "Blog - FuXion Lifestyle",
          posts: []
        });
      }
      
      res.render("blog", {
        title: "Blog - FuXion Lifestyle",
        posts: posts
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
};

const blogDetail = async (req, res) => {
  try {
    const blogId = req.params.id;
    
    // Obtener el post de la base de datos
    const query = 'SELECT * FROM blog_posts WHERE id = ? AND published = 1';
    connection.query(query, [blogId], (error, results) => {
      if (error || results.length === 0) {
        console.error(error);
        return res.status(404).send('Artículo no encontrado');
      }
      
      const post = results[0];
      
      // Incrementar contador de vistas
      connection.query('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [blogId]);
      
      // Obtener posts relacionados
      const relatedQuery = 'SELECT * FROM blog_posts WHERE published = 1 AND id != ? ORDER BY created_at DESC LIMIT 3';
      connection.query(relatedQuery, [blogId], (err, relatedPosts) => {
        res.render("blog-detail", {
          title: post.title + " - FuXion Lifestyle",
          post: post,
          relatedPosts: relatedPosts || []
        });
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
};

const distribuidor = async (req, res) => {
  try {
    res.render("distribuidor", {
      title: "Ser Distribuidor - FuXion Lifestyle"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
};

const contacto = async (req, res) => {
  try {
    res.render("contacto", {
      title: "Contacto - FuXion Lifestyle"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
};

// API Endpoints
const apiContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Validación
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }
    
    // Guardar en base de datos
    const query = 'INSERT INTO contacts (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, NOW())';
    connection.query(query, [name, email, phone, message], (error, result) => {
      if (error) {
        console.error('Error al guardar contacto:', error);
        return res.status(500).json({
          success: false,
          error: 'Error al guardar el mensaje'
        });
      }
      
      console.log('Contacto guardado:', { name, email, phone });
      
      res.status(200).json({
        success: true,
        message: 'Mensaje recibido correctamente'
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud',
    });
  }
};

const apiDistributor = async (req, res) => {
  try {
    const { name, email, phone, city, message } = req.body;
    
    // Aquí puedes agregar lógica para guardar en base de datos
    console.log('Solicitud de distribuidor recibida:', { name, email, phone, city, message });
    
    res.status(200).json({
      success: true,
      message: 'Solicitud recibida correctamente'
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud',
    });
  }
};

const apiNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validación
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email es requerido'
      });
    }
    
    // Verificar si el email ya está suscrito
    const checkQuery = 'SELECT * FROM newsletter_subscribers WHERE email = ?';
    connection.query(checkQuery, [email], (checkError, existing) => {
      if (checkError) {
        console.error('Error al verificar email:', checkError);
        return res.status(500).json({
          success: false,
          error: 'Error al procesar la suscripción'
        });
      }
      
      if (existing.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'Este email ya está suscrito'
        });
      }
      
      // Guardar en base de datos
      const query = 'INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, NOW())';
      connection.query(query, [email], (error, result) => {
        if (error) {
          console.error('Error al guardar suscripción:', error);
          return res.status(500).json({
            success: false,
            error: 'Error al procesar la suscripción'
          });
        }
        
        console.log('Nueva suscripción:', { email });
        
        res.status(200).json({
          success: true,
          message: 'Suscripción exitosa'
        });
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud',
    });
  }
};

const apiSendQuizResults = async (req, res) => {
  try {
    const { email, name, products, answers } = req.body;
    
    // Validación básica
    if (!email || !products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'Email y productos son requeridos'
      });
    }
    
    // Intentar enviar email
    const emailConfig = require('../config/email');
    const result = await emailConfig.sendQuizResults(email, name, products);
    
    if (result.success) {
      // Enviar notificación al admin (opcional)
      emailConfig.sendQuizNotificationToAdmin({ email, name, answers }, products);
      
      res.status(200).json({
        success: true,
        message: '¡Email enviado exitosamente! Revisa tu bandeja de entrada.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error al enviar el email. Por favor, intenta nuevamente.'
      });
    }
  } catch (error) {
    console.log('Error en apiSendQuizResults:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud de envío de email',
    });
  }
};

const quiz = async (req, res) => {
  try {
    res.render("quiz-productos", {
      title: "Quiz de Productos - FuXion Lifestyle",
      description: "Descubre qué productos FuXion son perfectos para ti con nuestro quiz personalizado"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
};

module.exports = {
  index: index,
  productos: productos,
  blog: blog,
  blogDetail: blogDetail,
  distribuidor: distribuidor,
  contacto: contacto,
  quiz: quiz,
  apiContact: apiContact,
  apiDistributor: apiDistributor,
  apiNewsletter: apiNewsletter,
  apiSendQuizResults: apiSendQuizResults,
};
