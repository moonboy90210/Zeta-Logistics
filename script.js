
'use strict';

// ==================== CONFIGURATION ====================
const CONFIG = {
  navbar: {
    scrollThreshold: 70,
    hideOffset: -100
  },
  carousel: {
    scrollStep: 380,
    autoScrollInterval: 4000,
    smoothScrollBehavior: 'smooth'
  },
  animation: {
    intersectionThreshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  },
  contact: {
    successMessage: 'Thank you! Your message has been sent successfully.',
    errorMessage: 'Oops! Something went wrong. Please try again.',
    processingMessage: 'Sending your message...'
  }
};

// ==================== UTILITY FUNCTIONS ====================
const Utils = {
  /**
   * Debounce function to limit rate of function execution
   */
  debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function to ensure function runs at most once per interval
   */
  throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Smooth scroll to element
   */
  smoothScrollTo(element) {
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
};

// ==================== NAVBAR CONTROLLER ====================
class NavbarController {
  constructor() {
    this.navbar = document.querySelector('nav');
    this.navbarElement = document.querySelector('.navbar');
    this.lastScrollTop = 0;
    this.isScrolling = false;
    
    if (this.navbar && this.navbarElement) {
      this.init();
    }
  }

  init() {
    // Use throttled scroll handler for better performance
    window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 100));
    
    // Close mobile menu when clicking nav links
    this.setupMobileMenuClose();
  }

  handleScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Handle navbar hide/show
    this.toggleNavbarVisibility(currentScroll);
    
    // Handle navbar background change
    this.toggleNavbarBackground(currentScroll);
    
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }

  toggleNavbarVisibility(currentScroll) {
    if (currentScroll > this.lastScrollTop && currentScroll > 200) {
      // Scrolling down & past threshold
      this.navbar.style.top = CONFIG.navbar.hideOffset + 'px';
    } else {
      // Scrolling up
      this.navbar.style.top = '0';
    }
  }

  toggleNavbarBackground(currentScroll) {
    if (currentScroll > CONFIG.navbar.scrollThreshold) {
      this.navbarElement.classList.add('scrolled');
    } else {
      this.navbarElement.classList.remove('scrolled');
    }
  }

  setupMobileMenuClose() {
    const navLinks = document.querySelectorAll('.nav-link');
    const offcanvas = document.getElementById('offcanvasNavbar');
    
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (offcanvas && window.innerWidth < 992) {
          const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        }
      });
    });
  }
}

// ==================== SCROLL ANIMATION CONTROLLER ====================
class ScrollAnimationController {
  constructor() {
    this.sections = document.querySelectorAll('.section');
    
    if (this.sections.length > 0) {
      this.init();
    }
  }

  init() {
    const observerOptions = {
      threshold: CONFIG.animation.intersectionThreshold,
      rootMargin: CONFIG.animation.rootMargin
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Optional: Stop observing after animation (performance boost)
          // this.observer.unobserve(entry.target);
        } else {
          // Remove class when scrolling out for re-animation effect
          entry.target.classList.remove('visible');
        }
      });
    }, observerOptions);

    this.sections.forEach(section => {
      this.observer.observe(section);
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// ==================== CAROUSEL/SLIDER CONTROLLER ====================
class IndustryCarouselController {
  constructor() {
    this.container = document.getElementById('scrollContainer');
    this.autoScrollInterval = null;
    this.userInteracted = false;
    this.isDown = false;
    this.startX = 0;
    this.scrollLeft = 0;
    
    if (this.container) {
      this.init();
    }
  }

  init() {
    this.cloneContent();
    this.setupAutoScroll();
    this.setupUserInteraction();
    this.setupTouchEvents();
    this.setupMouseDrag();
  }

  cloneContent() {
    const items = Array.from(this.container.children);
    // Clone items twice for seamless infinite scroll
    items.forEach(item => {
      const clone = item.cloneNode(true);
      this.container.appendChild(clone);
    });
  }

  setupAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      if (this.userInteracted) {
        this.stopAutoScroll();
        return; 
      }

      const maxScrollLeft = this.container.scrollWidth - this.container.clientWidth;
      
      if (this.container.scrollLeft >= maxScrollLeft - CONFIG.carousel.scrollStep) {
        // Reset to beginning for infinite loop
        this.container.scrollTo({ left: 0, behavior: CONFIG.carousel.smoothScrollBehavior });
      } else {
        this.container.scrollBy({ 
          left: CONFIG.carousel.scrollStep, 
          behavior: CONFIG.carousel.smoothScrollBehavior 
        });
      }
    }, CONFIG.carousel.autoScrollInterval);
  }

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  setupUserInteraction() {
    const stopScroll = () => {
      this.userInteracted = true;
      this.stopAutoScroll();
    };

    this.container.addEventListener('wheel', stopScroll, { passive: true });
    this.container.addEventListener('touchstart', stopScroll, { passive: true });
    this.container.addEventListener('mousedown', stopScroll);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        stopScroll();
      }
    });
  }

  setupTouchEvents() {
    this.container.addEventListener('touchstart', (e) => {
      this.isDown = true;
      this.startX = e.touches[0].pageX - this.container.offsetLeft;
      this.scrollLeft = this.container.scrollLeft;
    }, { passive: true });

    this.container.addEventListener('touchend', () => {
      this.isDown = false;
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (!this.isDown) return;
      const x = e.touches[0].pageX - this.container.offsetLeft;
      const walk = (x - this.startX) * 2.5; // Adjust scroll sensitivity
      this.container.scrollLeft = this.scrollLeft - walk;
    }, { passive: true });
  }

  setupMouseDrag() {
    this.container.addEventListener('mousedown', (e) => {
      this.isDown = true;
      this.container.style.cursor = 'grabbing';
      this.startX = e.pageX - this.container.offsetLeft;
      this.scrollLeft = this.container.scrollLeft;
    });

    this.container.addEventListener('mouseleave', () => {
      this.isDown = false;
      this.container.style.cursor = 'grab';
    });

    this.container.addEventListener('mouseup', () => {
      this.isDown = false;
      this.container.style.cursor = 'grab';
    });

    this.container.addEventListener('mousemove', (e) => {
      if (!this.isDown) return;
      e.preventDefault();
      const x = e.pageX - this.container.offsetLeft;
      const walk = (x - this.startX) * 2.5;
      this.container.scrollLeft = this.scrollLeft - walk;
    });
  }

  scrollBy(direction) {
    this.userInteracted = true;
    this.stopAutoScroll();
    
    const scrollAmount = direction === 'left' ? -CONFIG.carousel.scrollStep : CONFIG.carousel.scrollStep;
    this.container.scrollBy({ 
      left: scrollAmount, 
      behavior: CONFIG.carousel.smoothScrollBehavior 
    });
  }

  destroy() {
    this.stopAutoScroll();
  }
}

// ==================== CONTACT FORM HANDLER ====================
class ContactFormHandler {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.messageElement = document.getElementById('formMessage');
    
    if (this.form) {
      this.init();
    }
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Add real-time validation
    this.setupValidation();
  }

  setupValidation() {
    const inputs = this.form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          this.validateField(input);
        }
      });
    });
  }

  validateField(field) {
    const isValid = field.checkValidity();
    
    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
    }
    
    return isValid;
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    const inputs = this.form.querySelectorAll('input, textarea');
    let isFormValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });
    
    if (!isFormValid) {
      this.showMessage(CONFIG.contact.errorMessage, 'danger');
      return;
    }
    
    this.showMessage(CONFIG.contact.processingMessage, 'info');
    
    const formData = new FormData(this.form);
    
    try {
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        this.showMessage(CONFIG.contact.successMessage, 'success');
        this.form.reset();
        
        // Remove validation classes
        inputs.forEach(input => {
          input.classList.remove('is-valid', 'is-invalid');
        });
        
        // Optional: Track conversion
        this.trackConversion();
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showMessage(CONFIG.contact.errorMessage, 'danger');
    }
  }

  showMessage(message, type) {
    if (!this.messageElement) return;
    
    this.messageElement.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    
    // Auto-dismiss after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        this.messageElement.innerHTML = '';
      }, 5000);
    }
  }

  trackConversion() {
    // Add your analytics tracking here
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submission', {
        'event_category': 'Contact',
        'event_label': 'Contact Form'
      });
    }
  }
}

// ==================== NEWSLETTER HANDLER ====================
class NewsletterHandler {
  constructor() {
    this.form = document.querySelector('footer form');
    
    if (this.form) {
      this.init();
    }
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const emailInput = this.form.querySelector('#newSub');
    const submitButton = this.form.querySelector('button[type="submit"]');
    
    if (!emailInput.checkValidity()) {
      emailInput.classList.add('is-invalid');
      return;
    }
    
    emailInput.classList.remove('is-invalid');
    emailInput.classList.add('is-valid');
    
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Subscribing...';
    submitButton.disabled = true;
    
    const formData = new FormData(this.form);
    
    try {
      const response = await fetch(this.form.action || 'newsletter.php', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        submitButton.textContent = 'Subscribed!';
        emailInput.value = '';
        emailInput.classList.remove('is-valid');
        
        setTimeout(() => {
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;
        }, 3000);
        
        // Track newsletter signup
        if (typeof gtag !== 'undefined') {
          gtag('event', 'newsletter_signup', {
            'event_category': 'Newsletter',
            'event_label': 'Footer Subscription'
          });
        }
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      submitButton.textContent = 'Error - Try Again';
      
      setTimeout(() => {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }, 3000);
    }
  }
}

// ==================== SMOOTH SCROLL NAVIGATION ====================
class SmoothScrollNavigation {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        
        // Skip if it's just "#" or doesn't have a target
        if (href === '#' || href === '#!') return;
        
        const targetElement = document.querySelector(href);
        
        if (targetElement) {
          e.preventDefault();
          
          const navbarHeight = document.querySelector('nav')?.offsetHeight || 0;
          const targetPosition = targetElement.offsetTop - navbarHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update URL without jumping
          history.pushState(null, null, href);
        }
      });
    });
  }
}

// ==================== PERFORMANCE OPTIMIZATION ====================
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    // Lazy load images
    this.setupLazyLoading();
    
    // Preload critical resources
    this.preloadCriticalResources();
  }

  setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      return;
    }
    
    // Fallback for browsers that don't support native lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }

  preloadCriticalResources() {
    // Preload hero image
    const heroImage = new Image();
    heroImage.src = 'img/aerial-view-cargo-ship.jpg';
  }
}

// ==================== SCROLL BUTTON CONTROLS ====================
// Global functions for button controls (called from HTML)
window.scrollLeftBtn = function() {
  if (window.carouselController) {
    window.carouselController.scrollBy('left');
  }
};

window.scrollRightBtn = function() {
  if (window.carouselController) {
    window.carouselController.scrollBy('right');
  }
};

// ==================== INITIALIZATION ====================
class ZetaLogisticsApp {
  constructor() {
    this.controllers = [];
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeControllers());
    } else {
      this.initializeControllers();
    }
  }

  initializeControllers() {
    console.log('🚀 Initializing Zeta Logistics...');
    
    try {
      // Initialize all controllers
      this.controllers.push(new NavbarController());
      this.controllers.push(new ScrollAnimationController());
      window.carouselController = new IndustryCarouselController();
      this.controllers.push(window.carouselController);
      this.controllers.push(new ContactFormHandler());
      this.controllers.push(new NewsletterHandler());
      this.controllers.push(new SmoothScrollNavigation());
      this.controllers.push(new PerformanceOptimizer());
      
      console.log('✅ Zeta Logistics initialized successfully!');
      
      // Add back-to-top button
      this.addBackToTopButton();
      
    } catch (error) {
      console.error('❌ Error initializing Zeta Logistics:', error);
    }
  }

  addBackToTopButton() {
    // Create back to top button
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTop);
    
    // Show/hide button based on scroll
    window.addEventListener('scroll', Utils.throttle(() => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }, 100));
    
    // Scroll to top on click
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  destroy() {
    this.controllers.forEach(controller => {
      if (controller.destroy) {
        controller.destroy();
      }
    });
  }
}

// ==================== START APPLICATION ====================
const app = new ZetaLogisticsApp();
app.init();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ZetaLogisticsApp, Utils };
}