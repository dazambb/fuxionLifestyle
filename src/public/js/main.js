// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }
});

// Product Filter
function filterProducts(category) {
    const products = document.querySelectorAll('.product-item');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter products
    products.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = 'block';
            product.classList.add('fade-in');
        } else {
            product.style.display = 'none';
        }
    });
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact Form Handler - Removed (now handled inline in contacto.ejs)

// Distributor Form Handler
const distributorForm = document.getElementById('distributorForm');
if (distributorForm) {
    distributorForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Enviando...';
        submitBtn.disabled = true;
        
        const formData = {
            name: this.querySelector('#name').value,
            email: this.querySelector('#email').value,
            phone: this.querySelector('#phone').value,
            city: this.querySelector('#city').value,
            message: this.querySelector('#message').value
        };
        
        try {
            const response = await fetch('/api/distributor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                showAlert('¡Solicitud enviada con éxito! Te contactaremos pronto para más información.', 'success');
                this.reset();
            } else {
                showAlert('Hubo un error al enviar la solicitud. Por favor, intenta nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Hubo un error al enviar la solicitud. Por favor, intenta nuevamente.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Alert Helper
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Product Buy Button Handler
function buyProduct(productName, productUrl) {
    // Aquí irá tu código de distribuidor de FuXion
    const distributorCode = 'TU_CODIGO_DISTRIBUIDOR'; // Reemplazar con tu código real
    const fuxionUrl = productUrl || `https://www.fuxion.com?distributor=${distributorCode}`;
    window.open(fuxionUrl, '_blank');
}

// Initialize Swiper for testimonials
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Swiper !== 'undefined' && document.querySelector('.testimonial-swiper')) {
        new Swiper('.testimonial-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                }
            }
        });
    }
});

// Counter Animation
function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
}

// Observe counters
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(counter => {
    counterObserver.observe(counter);
});

// ===== PRODUCTS PAGE FUNCTIONS =====

// Product Search with Results Count
function searchProducts() {
    const searchInput = document.getElementById('productSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const products = document.querySelectorAll('.product-item');
    const resultsCount = document.getElementById('resultsCount');
    const noResultsMessage = document.getElementById('noResultsMessage');
    let visibleCount = 0;
    
    products.forEach(product => {
        const title = product.querySelector('.product-title')?.textContent.toLowerCase() || '';
        const description = product.querySelector('.product-desc')?.textContent.toLowerCase() || '';
        const category = product.getAttribute('data-category')?.toLowerCase() || '';
        
        if (searchTerm === '' || title.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)) {
            product.style.display = 'block';
            product.classList.add('fade-in');
            visibleCount++;
        } else {
            product.style.display = 'none';
        }
    });
    
    // Update results count
    if (resultsCount) {
        if (searchTerm === '') {
            resultsCount.textContent = '';
        } else {
            resultsCount.textContent = `${visibleCount} producto${visibleCount !== 1 ? 's' : ''} encontrado${visibleCount !== 1 ? 's' : ''}`;
        }
    }
    
    // Show/hide no results message
    if (noResultsMessage) {
        if (visibleCount === 0 && searchTerm !== '') {
            noResultsMessage.classList.remove('d-none');
        } else {
            noResultsMessage.classList.add('d-none');
        }
    }
    
    updateFilterCounts();
}

// Clear Search
function clearSearch() {
    const searchInput = document.getElementById('productSearch');
    const resultsCount = document.getElementById('resultsCount');
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (resultsCount) {
        resultsCount.textContent = '';
    }
    
    if (noResultsMessage) {
        noResultsMessage.classList.add('d-none');
    }
    
    // Reset filter to 'all'
    filterProducts('all');
}

// Filter Products with Active State
function filterProducts(category) {
    const products = document.querySelectorAll('.product-item');
    const buttons = document.querySelectorAll('.filter-btn-v2');
    const noResultsMessage = document.getElementById('noResultsMessage');
    let visibleCount = 0;
    
    // Update active button
    buttons.forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Filter products
    products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        
        if (category === 'all' || productCategory === category) {
            product.style.display = 'block';
            product.classList.add('fade-in');
            visibleCount++;
        } else {
            product.style.display = 'none';
        }
    });
    
    // Show/hide no results message
    if (noResultsMessage) {
        if (visibleCount === 0) {
            noResultsMessage.classList.remove('d-none');
        } else {
            noResultsMessage.classList.add('d-none');
        }
    }
    
    updateFilterCounts();
}

// Update Filter Counts
function updateFilterCounts() {
    const categories = ['all', 'energia', 'defensas', 'peso', 'digestion', 'deportes', 'belleza'];
    
    categories.forEach(category => {
        const countElement = document.getElementById(`count-${category}`);
        if (!countElement) return;
        
        let count;
        if (category === 'all') {
            count = document.querySelectorAll('.product-item').length;
        } else {
            count = document.querySelectorAll(`.product-item[data-category="${category}"]`).length;
        }
        
        countElement.textContent = count;
    });
}

// Sort Products
function sortProducts() {
    const sortSelect = document.getElementById('sortProducts');
    if (!sortSelect) return;
    
    const sortValue = sortSelect.value;
    const productsGrid = document.getElementById('productsGrid');
    const products = Array.from(document.querySelectorAll('.product-item'));
    
    if (sortValue === 'default') return;
    
    products.sort((a, b) => {
        const nameA = a.querySelector('.product-title').textContent.toLowerCase();
        const nameB = b.querySelector('.product-title').textContent.toLowerCase();
        
        switch(sortValue) {
            case 'name-asc':
                return nameA.localeCompare(nameB);
            case 'name-desc':
                return nameB.localeCompare(nameA);
            case 'newest':
                return 0; // Keep original order
            default:
                return 0;
        }
    });
    
    // Re-append sorted products
    products.forEach(product => {
        productsGrid.appendChild(product);
    });
}

// Set View (Grid/List)
function setView(viewType) {
    const productsGrid = document.getElementById('productsGrid');
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');
    
    if (!productsGrid) return;
    
    if (viewType === 'grid') {
        productsGrid.classList.remove('list-view');
        gridViewBtn?.classList.add('active');
        listViewBtn?.classList.remove('active');
    } else if (viewType === 'list') {
        productsGrid.classList.add('list-view');
        listViewBtn?.classList.add('active');
        gridViewBtn?.classList.remove('active');
    }
}

// Quick View Modal
let currentProductName = '';

function quickView(name, description, imageUrl) {
    currentProductName = name;
    
    document.getElementById('quickViewName').textContent = name;
    document.getElementById('quickViewDescription').textContent = description;
    document.getElementById('quickViewImage').src = imageUrl;
    document.getElementById('quickViewImage').alt = name;
    
    const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
    modal.show();
}

function buyProductFromModal() {
    if (currentProductName) {
        buyProduct(currentProductName);
    }
    // Close modal
    const modalElement = document.getElementById('quickViewModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    }
}

function contactWhatsApp() {
    const message = currentProductName 
        ? `Hola, necesito más información sobre ${currentProductName}` 
        : 'Hola, necesito más información sobre los productos FuXion';
    
    window.open(`https://wa.me/593993161517?text=${encodeURIComponent(message)}`, '_blank');
}

// Toggle Description
function toggleDescription(button) {
    const wrapper = button.closest('.product-description-wrapper');
    const description = wrapper.querySelector('.product-desc');
    
    if (description.classList.contains('collapsed')) {
        description.classList.remove('collapsed');
        description.classList.add('expanded');
        button.innerHTML = '<i class="fas fa-chevron-up"></i> Ver menos';
        button.classList.add('active');
    } else {
        description.classList.remove('expanded');
        description.classList.add('collapsed');
        button.innerHTML = '<i class="fas fa-chevron-down"></i> Ver más';
        button.classList.remove('active');
    }
}

// Contact About Product
function contactAboutProduct(productName) {
    const message = `Hola, necesito más información sobre ${productName}`;
    window.open(`https://wa.me/593993161517?text=${encodeURIComponent(message)}`, '_blank');
}

// Initialize Products Page
document.addEventListener('DOMContentLoaded', function() {
    // Update filter counts on page load
    if (document.getElementById('productsGrid')) {
        updateFilterCounts();
    }
});

// Newsletter Subscription
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span>';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            if (response.ok) {
                showAlert('¡Suscripción exitosa! Recibirás nuestras novedades.', 'success');
                this.reset();
            } else {
                showAlert('Error al suscribirse. Por favor, intenta nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error al suscribirse. Por favor, intenta nuevamente.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Mobile Menu Close on Link Click
document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', function() {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
            navbarToggler.click();
        }
    });
});

// ===== INCOME CALCULATOR =====
const salesRange = document.getElementById('salesRange');
const teamRange = document.getElementById('teamRange');
const commissionRange = document.getElementById('commissionRange');

if (salesRange && teamRange && commissionRange) {
    const salesValue = document.getElementById('salesValue');
    const teamValue = document.getElementById('teamValue');
    const commissionValue = document.getElementById('commissionValue');
    const monthlyIncome = document.getElementById('monthlyIncome');
    const yearlyIncome = document.getElementById('yearlyIncome');
    
    function calculateIncome() {
        const sales = parseInt(salesRange.value);
        const team = parseInt(teamRange.value);
        const commission = parseInt(commissionRange.value);
        
        // Cálculo: (ventas personales * comisión) + (equipo * ventas promedio por persona * comisión de red)
        const personalIncome = sales * commission;
        const teamIncome = team * 3 * (commission * 0.3); // 3 ventas promedio por persona, 30% de comisión
        const monthly = Math.round(personalIncome + teamIncome);
        const yearly = monthly * 12;
        
        // Actualizar valores en pantalla
        salesValue.textContent = sales;
        teamValue.textContent = team;
        commissionValue.textContent = '$' + commission;
        
        // Animar el cambio de números
        animateValue(monthlyIncome, parseInt(monthlyIncome.textContent.replace(/,/g, '') || 0), monthly, 500);
        animateValue(yearlyIncome, parseInt(yearlyIncome.textContent.replace(/,/g, '') || 0), yearly, 500);
    }
    
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current).toLocaleString();
        }, 16);
    }
    
    // Event listeners
    salesRange.addEventListener('input', calculateIncome);
    teamRange.addEventListener('input', calculateIncome);
    commissionRange.addEventListener('input', calculateIncome);
    
    // Inicializar valores
    calculateIncome();
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let current = 0;
        const increment = target / speed;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current);
                setTimeout(updateCounter, 1);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Iniciar animación de contadores cuando sean visibles
const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(statsSection);
}


