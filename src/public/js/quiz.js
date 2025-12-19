// ===== PRODUCT QUIZ LOGIC =====

let currentQuestionNumber = 1;
const totalQuestionsCount = 6;
let quizAnswers = {};

// Product database con recomendaciones basadas en respuestas
const productDatabase = {
    energia: {
        name: "Vita Xtra T",
        description: "Mezcla energizante natural con guaraná, maca y vitaminas del complejo B",
        benefits: ["Aumenta energía", "Mejora concentración", "Sin cafeína artificial"],
        image: "https://fuxion.com/upload/images/products/2019/02/08/da558985659363f2.jpg"
    },
    peso: {
        name: "Nocarb-T",
        description: "Fórmula para ayudar a regular la asimilación de carbohidratos y apoyar un manejo más consciente del peso sin métodos extremos.",
        benefits: ["Control de apetito", "Metabolismo activo", "100% natural"],
        image: "https://fuxion.com/upload/images/products/2022/02/07/85f4050b6e6b467b.png"
    },
    inmunidad: {
        name: "Vera+",
        description: "Mezcla de extractos naturales y beta-glucanos que ayuda a reforzar defensas y mantener el cuerpo protegido desde dentro.",
        benefits: ["Fortalece defensas", "Antioxidante", "Recuperación rápida"],
        image: "https://fuxion.com/upload/images/products/2019/02/01/dd0438128944db51.jpg"
    },
    digestion: {
        name: "FuXion Prunex1",
        description: "Té herbal con fibras naturales que favorece un tránsito intestinal saludable de manera suave y constante.",
        benefits: ["Mejora digestión", "Flora intestinal", "Reduce inflamación"],
        image: "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/productDetails/PE/PE_149138_EXT_21072025_220955_MAIN.jpg"
    },
    bienestar: {
        name: "FuXion Flora Liv",
        description: "Fórmula a base de granadilla y prebióticos que protege la microbiota intestinal, promoviendo equilibrio digestivo.",
        benefits: ["Nutrición completa", "Vitalidad diaria", "Balance perfecto"],
        image: "https://fuxion.com/upload/images/products/2025/09/15/a858f212e3d2208c.jpg"
    },
    deportivo: {
        name: "FuXion BioPro+ Sport",
        description: "Batido proteico orientado al desempeño físico y la recuperación muscular, ideal para quienes entrenan con frecuencia.",
        benefits: ["Rendimiento deportivo", "Recuperación muscular", "Resistencia"],
        image: "https://fuxion.com/upload/images/products/2018/10/01/08d3a6e875fd50ef.jpg"
    },
    detox: {
        name: "FuXion Liquid Fiber",
        description: "Bebida prebiótica con fibras solubles que apoya la flora intestinal y ayuda a mantener digestión y regularidad.",
        benefits: ["Desintoxicación", "Alcaliniza el cuerpo", "Energía natural"],
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmbPi1e-D0PAAUzZ2ENdXzXpQlVAdRn8rL0g&s"
    },
    mental: {
        name: "FuXion Thero T3",
        description: "Bebida termogénica pensada para activar el metabolismo y aportar un extra de energía cuando el día exige más de lo habitual.",
        benefits: ["Claridad mental", "Memoria mejorada", "Reduce estrés"],
        image: "https://fuxion.com/upload/images/products/2021/05/12/d51464723d1431cc.jpg"
    }
};

function startQuiz() {
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizQuestions').style.display = 'block';
    document.getElementById('quizProgress').style.display = 'block';
    
    // Reset quiz state
    currentQuestionNumber = 1;
    quizAnswers = {};
    
    // Show first question
    showQuestion(1);
    updateProgress();
}

function showQuestion(questionNum) {
    // Hide all questions
    const allQuestions = document.querySelectorAll('.question-card');
    allQuestions.forEach(q => {
        q.style.display = 'none';
        // Reset selections
        q.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    });
    
    // Show current question with animation
    const currentQuestion = document.querySelector(`[data-question="${questionNum}"]`);
    if (currentQuestion) {
        setTimeout(() => {
            currentQuestion.style.display = 'block';
            currentQuestion.classList.add('fade-in-up');
        }, 100);
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    if (questionNum === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-block';
    }
    
    currentQuestionNumber = questionNum;
    updateProgress();
}

function selectOption(button, questionNum, value) {
    // Remove previous selection
    const questionCard = button.closest('.question-card');
    questionCard.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selection to clicked button
    button.classList.add('selected');
    
    // Store answer
    quizAnswers[`q${questionNum}`] = value;
    
    // Move to next question after short delay
    setTimeout(() => {
        if (questionNum < totalQuestionsCount) {
            showQuestion(questionNum + 1);
        } else {
            // Quiz completed, show results
            showResults();
        }
    }, 500);
}

function previousQuestion() {
    if (currentQuestionNumber > 1) {
        showQuestion(currentQuestionNumber - 1);
    }
}

function updateProgress() {
    const percent = Math.round((currentQuestionNumber / totalQuestionsCount) * 100);
    document.getElementById('currentQuestion').textContent = currentQuestionNumber;
    document.getElementById('totalQuestions').textContent = totalQuestionsCount;
    document.getElementById('progressPercent').textContent = percent;
    document.getElementById('progressBar').style.width = percent + '%';
}

function showResults() {
    console.log('Mostrando resultados...');
    console.log('Respuestas del quiz:', quizAnswers);
    
    // Hide questions
    document.getElementById('quizQuestions').style.display = 'none';
    document.getElementById('quizProgress').style.display = 'none';
    
    // Show results
    const resultsSection = document.getElementById('quizResults');
    if (!resultsSection) {
        console.error('Elemento quizResults no encontrado');
        return;
    }
    
    resultsSection.style.display = 'block';
    
    // Calculate recommended products
    const recommendedProducts = getRecommendedProducts();
    console.log('Productos recomendados:', recommendedProducts);
    
    // Display products
    displayRecommendedProducts(recommendedProducts);
    
    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function getRecommendedProducts() {
    const products = [];
    
    // Logic to recommend products based on answers
    const objetivo = quizAnswers.q1;
    const actividad = quizAnswers.q2;
    const horario = quizAnswers.q3;
    const edad = quizAnswers.q5;
    const mejora = quizAnswers.q6;
    
    // Primary recommendation based on main goal
    if (objetivo) {
        products.push(productDatabase[objetivo]);
    }
    
    // Secondary recommendations based on activity level
    if (actividad === 'intenso' || actividad === 'moderado') {
        if (!products.find(p => p.name === productDatabase.deportivo.name)) {
            products.push(productDatabase.deportivo);
        }
    }
    
    // Recommendation based on daily improvement goal
    if (mejora === 'concentracion') {
        if (!products.find(p => p.name === productDatabase.mental.name)) {
            products.push(productDatabase.mental);
        }
    } else if (mejora === 'estres') {
        if (!products.find(p => p.name === productDatabase.bienestar.name)) {
            products.push(productDatabase.bienestar);
        }
    }
    
    // Always recommend detox as complementary
    if (products.length < 3 && !products.find(p => p.name === productDatabase.detox.name)) {
        products.push(productDatabase.detox);
    }
    
    // Limit to top 3 products
    return products.slice(0, 3);
}

function displayRecommendedProducts(products) {
    const container = document.getElementById('recommendedProducts');
    
    if (!container) {
        console.error('Container recommendedProducts no encontrado');
        return;
    }
    
    container.innerHTML = '';
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No se encontraron productos recomendados.</p></div>';
        return;
    }
    
    products.forEach((product, index) => {
        if (!product) return;
        
        const productCard = `
            <div class="col-md-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="card h-100 border-0 shadow-sm product-recommendation">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <div class="badge bg-primary mb-2">Recomendado para ti</div>
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted">${product.description}</p>
                        <ul class="list-unstyled">
                            ${product.benefits.map(benefit => `
                                <li class="mb-1">
                                    <i class="fas fa-check text-success"></i> ${benefit}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="card-footer bg-transparent border-0">
                        <a href="/productos" class="btn btn-outline-primary w-100">
                            <i class="fas fa-shopping-cart"></i> Ver Producto
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });
    
    // Re-initialize AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
    
    console.log(`Se mostraron ${products.length} productos recomendados`);
}

function restartQuiz() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizStart').style.display = 'block';
    quizAnswers = {};
    currentQuestionNumber = 1;
}

function shareResults() {
    const text = '¡Acabo de descubrir mis productos FuXion ideales! Haz el quiz tú también:';
    const url = window.location.href;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Quiz de Productos FuXion',
            text: text,
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: Copy to clipboard
        const fullText = `${text} ${url}`;
        navigator.clipboard.writeText(fullText).then(() => {
            alert('¡Link copiado al portapapeles! Compártelo con tus amigos.');
        }).catch(err => {
            console.error('Error copying to clipboard:', err);
        });
    }
}

// Email results form handler
document.addEventListener('DOMContentLoaded', function() {
    const resultsEmailForm = document.getElementById('resultsEmailForm');
    if (resultsEmailForm) {
        resultsEmailForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resultEmail').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';
            submitBtn.disabled = true;
            
            try {
                // Obtener los productos recomendados actuales
                const recommendedProducts = getRecommendedProducts();
                
                // Enviar al servidor
                const response = await fetch('/api/quiz/send-results', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        name: '', // Puedes pedirlo en el formulario si quieres
                        products: recommendedProducts,
                        answers: quizAnswers
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Success
                    showNotification('✅ ¡Resultados enviados a tu email! Revisa tu bandeja de entrada.', 'success');
                    this.reset();
                } else {
                    showNotification('❌ ' + (data.error || 'Hubo un error al enviar. Por favor, intenta nuevamente.'), 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('❌ Hubo un error al enviar. Por favor, intenta nuevamente.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

// Función para mostrar notificaciones
function showNotification(message, type) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}