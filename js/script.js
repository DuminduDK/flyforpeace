document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('show');
            const icon = menuToggle.querySelector('i');
            if (navList.classList.contains('show')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark'); // FA6 Standard Cross
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            if(navList && menuToggle) {
                navList.classList.remove('show');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });
    } // End Nav Guard

    // 2. Header Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Scroll Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // Expose for dynamic content
    window.scrollObserver = observer;

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Note: Active Nav Link is now handled natively via HTML pages.

        // 6. Donation Form Logic
        const donationForm = document.getElementById('donation-form');
        if (donationForm) {
            const amountBtns = document.querySelectorAll('.amount-btn');
            const customAmountInput = document.querySelector('.custom-amount-input');
            const amountInput = document.getElementById('custom-amount');

            amountBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    amountBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    if (this.classList.contains('custom-amount-btn')) {
                        customAmountInput.classList.remove('hidden');
                        amountInput.focus();
                    } else {
                        customAmountInput.classList.add('hidden');
                    }
                });
            });
        }

    // 7. Contact Form Logic (Placeholder - Overridden directly in contact.html if Firebase present)
    const contactForm = document.getElementById('contact-form');
    if (contactForm && !contactForm.dataset.firebaseReady) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            setTimeout(() => {
                alert(`Thank you ${name}! This is a fallback test submission.`);
                contactForm.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1000);
        });
    }
});
