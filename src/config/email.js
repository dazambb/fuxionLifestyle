const nodemailer = require('nodemailer');

// Configuración del transportador de email
// IMPORTANTE: Configura estas variables de entorno en producción

const emailConfig = {
    // Opción 1: Gmail (más fácil para empezar)
    gmail: {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'dazambb@gmail.com',
            pass: process.env.EMAIL_PASSWORD || 'hvit rkop grop tlnm'
        }
    },
    
    // Opción 2: SMTP personalizado (hosting, cPanel, etc.)
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.tu-hosting.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: process.env.EMAIL_USER || 'contacto@fuxionlifestyle.com',
            pass: process.env.EMAIL_PASSWORD || 'tu-password'
        }
    },
    
    // Opción 3: SendGrid (profesional, gratuito hasta 100 emails/día)
    sendgrid: {
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY || 'tu-sendgrid-api-key'
        }
    }
};

// Selecciona la configuración a usar
const selectedConfig = process.env.EMAIL_PROVIDER || 'gmail';
const transporter = nodemailer.createTransport(
    selectedConfig === 'sendgrid' ? emailConfig.sendgrid :
    selectedConfig === 'smtp' ? emailConfig.smtp :
    emailConfig.gmail
);

// Verificar conexión (opcional, para debug)
transporter.verify(function(error, success) {
    if (error) {
        console.log('⚠️  Error en configuración de email:', error.message);
        console.log('ℹ️  Configura las variables de entorno EMAIL_USER y EMAIL_PASSWORD');
    } else {
        console.log('✅ Servidor de email listo para enviar mensajes');
    }
});

// Función para enviar resultados del quiz
async function sendQuizResults(recipientEmail, recipientName, products) {
    const productsHTML = products.map(product => `
        <div style="margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <img src="${product.image}" alt="${product.name}" 
                 style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="color: #4A7C59; margin-bottom: 10px;">${product.name}</h3>
            <p style="color: #666; margin-bottom: 15px;">${product.description}</p>
            <ul style="list-style: none; padding: 0;">
                ${product.benefits.map(benefit => `
                    <li style="margin-bottom: 8px; color: #333;">
                        ✅ ${benefit}
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('');

    const mailOptions = {
        from: `"FuXion Lifestyle" <${process.env.EMAIL_USER || 'contacto@fuxionlifestyle.com'}>`,
        to: recipientEmail,
        subject: '🎯 Tus Productos FuXion Recomendados',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #4A7C59 0%, #2C5530 100%); border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">¡Tus Resultados Están Listos!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Productos personalizados para ti</p>
    </div>
    
    <div style="padding: 30px; background: white;">
        <h2 style="color: #4A7C59;">Hola ${recipientName || 'Amigo/a'},</h2>
        
        <p>Gracias por completar nuestro quiz de productos. Basándonos en tus respuestas, estos son los productos FuXion que mejor se adaptan a tus necesidades:</p>
        
        ${productsHTML}
        
        <div style="margin-top: 40px; padding: 20px; background: #e8f5e9; border-left: 4px solid #4A7C59; border-radius: 5px;">
            <h3 style="color: #4A7C59; margin-top: 0;">¿Necesitas más información?</h3>
            <p style="margin-bottom: 15px;">Nuestros asesores están listos para ayudarte a elegir el producto perfecto y responder todas tus preguntas.</p>
            <a href="https://wa.me/593993161517?text=Hola,%20recibí%20mis%20resultados%20del%20quiz%20y%20me%20gustaría%20más%20información" 
               style="display: inline-block; padding: 12px 30px; background: #25D366; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                📱 Contactar por WhatsApp
            </a>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <a href="https://fuxionlifestyle.com/productos" 
               style="display: inline-block; padding: 15px 40px; background: #4A7C59; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                Ver Todos los Productos
            </a>
            <a href="https://fuxionlifestyle.com/quiz" 
               style="display: inline-block; padding: 15px 40px; background: white; color: #4A7C59; text-decoration: none; border-radius: 5px; font-weight: bold; border: 2px solid #4A7C59;">
                Hacer Quiz Nuevamente
            </a>
        </div>
    </div>
    
    <div style="padding: 20px; background: #f8f9fa; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>FuXion Lifestyle</strong> - Distribuidor Oficial<br>
            📞 +593 99 316 1517 | 📧 contacto@fuxionlifestyle.com<br>
            <a href="https://fuxionlifestyle.com" style="color: #4A7C59;">www.fuxionlifestyle.com</a>
        </p>
        <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
            Recibes este email porque completaste nuestro quiz de productos.<br>
            Si no solicitaste esta información, puedes ignorar este mensaje.
        </p>
    </div>
</body>
</html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        return { success: false, error: error.message };
    }
}

// Función para enviar notificación al admin cuando alguien completa el quiz
async function sendQuizNotificationToAdmin(userData, products) {
    const mailOptions = {
        from: `"FuXion Lifestyle" <${process.env.EMAIL_USER || 'contacto@fuxionlifestyle.com'}>`,
        to: process.env.ADMIN_EMAIL || 'contacto@fuxionlifestyle.com',
        subject: '🎯 Nuevo Quiz Completado',
        html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Nuevo Usuario Completó el Quiz</h2>
    
    <h3>Información del Usuario:</h3>
    <ul>
        <li><strong>Nombre:</strong> ${userData.name || 'No proporcionado'}</li>
        <li><strong>Email:</strong> ${userData.email}</li>
        <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</li>
    </ul>
    
    <h3>Productos Recomendados:</h3>
    <ul>
        ${products.map(p => `<li>${p.name}</li>`).join('')}
    </ul>
    
    <h3>Respuestas del Quiz:</h3>
    <pre>${JSON.stringify(userData.answers, null, 2)}</pre>
    
    <p><a href="https://wa.me/${userData.phone || '593993161517'}">Contactar por WhatsApp</a></p>
</body>
</html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Notificación enviada al admin');
    } catch (error) {
        console.error('❌ Error enviando notificación al admin:', error);
    }
}

module.exports = {
    transporter,
    sendQuizResults,
    sendQuizNotificationToAdmin
};
