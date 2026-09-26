(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollOptions = { behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' };
    const menu = document.getElementById('cbp-spmenu');
    const menuButton = document.getElementById('showLeft');
    const overlay = document.querySelector('.md-overlay');
    let activeModal = null;
    let modalTrigger = null;
    let galleryIndex = 0;
    let gallerySlides = [];

    function scrollToTarget(target) {
        if (target) target.scrollIntoView(scrollOptions);
    }

    function setMenuOpen(open) {
        if (!menu || !menuButton) return;
        menu.classList.toggle('cbp-spmenu-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    }

    function setActiveNavigation(id) {
        document.querySelectorAll('#sections a, #sections_mobile a').forEach((link) => {
            const current = link.getAttribute('href') === `#${id}`;
            link.parentElement.classList.toggle('current', current);
            if (current) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }

    function initNavigation() {
        menuButton?.setAttribute('aria-expanded', 'false');
        menuButton?.setAttribute('aria-label', 'Mở menu');

        menuButton?.addEventListener('click', () => {
            setMenuOpen(!menu?.classList.contains('cbp-spmenu-open'));
        });

        document.querySelectorAll('#sections a, #sections_mobile a').forEach((link) => {
            link.addEventListener('click', (event) => {
                const target = document.querySelector(link.getAttribute('href'));
                if (!target) return;
                event.preventDefault();
                scrollToTarget(target);
                setMenuOpen(false);
            });
        });

        document.getElementById('btn-arrow')?.addEventListener('click', () => {
            scrollToTarget(document.getElementById('about'));
        });

        document.addEventListener('click', (event) => {
            if (menu?.classList.contains('cbp-spmenu-open') &&
                !menu.contains(event.target) && !menuButton?.contains(event.target)) {
                setMenuOpen(false);
            }
        });

        const sections = [...document.querySelectorAll('main section, body > section')]
            .filter((section) => section.id && section.id !== 'footer');
        if ('IntersectionObserver' in window) {
            const sectionObserver = new IntersectionObserver((entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
                if (visible) setActiveNavigation(visible.target.id);
            }, { threshold: [0.25, 0.5, 0.75] });
            sections.forEach((section) => sectionObserver.observe(section));
        }
    }

    function initHeroText() {
        const rotator = document.querySelector('.tlt');
        const phrases = [...(rotator?.querySelectorAll('.texts li') || [])]
            .map((item) => item.textContent.trim())
            .filter(Boolean);
        if (!rotator || phrases.length === 0) return;

        const output = document.createElement('span');
        output.className = 'hero-rotator';
        output.setAttribute('aria-live', 'polite');
        output.textContent = phrases[0];
        output.style.display = 'block';
        output.style.transition = reduceMotion ? 'none' : 'opacity 300ms ease, transform 300ms ease';
        rotator.prepend(output);
        if (reduceMotion || phrases.length < 2) return;

        let phraseIndex = 0;
        window.setInterval(() => {
            output.style.opacity = '0';
            output.style.transform = 'translateY(8px)';
            window.setTimeout(() => {
                phraseIndex = (phraseIndex + 1) % phrases.length;
                output.textContent = phrases[phraseIndex];
                output.style.transform = 'translateY(-8px)';
                requestAnimationFrame(() => {
                    output.style.opacity = '1';
                    output.style.transform = 'translateY(0)';
                });
            }, 320);
        }, 3200);
    }

    function initPortfolioReveal() {
        const grid = document.getElementById('grid');
        if (!grid) return;

        grid.classList.add('grid-enhanced');
        grid.style.removeProperty('height');
        grid.style.removeProperty('perspective-origin');
        const items = [...grid.querySelectorAll(':scope > li')];
        items.forEach((item) => {
            ['position', 'left', 'top', 'animation-duration'].forEach((property) => {
                item.style.removeProperty(property);
            });
            item.classList.remove('animate');
        });

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach((item) => item.classList.add('is-visible'));
            return;
        }

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        items.forEach((item) => revealObserver.observe(item));
    }

    function showGallerySlide(index) {
        if (gallerySlides.length === 0) return;
        galleryIndex = (index + gallerySlides.length) % gallerySlides.length;
        gallerySlides.forEach((slide, slideIndex) => {
            slide.style.display = slideIndex === galleryIndex ? 'block' : 'none';
            slide.setAttribute('aria-hidden', String(slideIndex !== galleryIndex));
        });
    }

    function openModal(modal, trigger) {
        if (!modal) return;
        closeModal();
        activeModal = modal;
        modalTrigger = trigger;
        modal.classList.add('md-show');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        document.body.classList.add('modal-open');

        if (modal.id === 'work3') {
            const slideTrack = modal.querySelector('.slides');
            if (slideTrack) {
                slideTrack.style.removeProperty('width');
                slideTrack.style.removeProperty('transform');
                slideTrack.style.removeProperty('transition-duration');
            }
            modal.querySelectorAll('.slides > li.clone').forEach((slide) => {
                slide.style.display = 'none';
            });
            gallerySlides = [...modal.querySelectorAll('.slides > li:not(.clone)')];
            gallerySlides.forEach((slide) => {
                slide.style.removeProperty('width');
                slide.style.removeProperty('float');
            });
            showGallerySlide(0);
        }
        modal.querySelector('.md-close')?.focus();
    }

    function closeModal() {
        if (!activeModal) return;
        const closingModal = activeModal;
        closingModal.classList.remove('md-show');
        closingModal.removeAttribute('aria-modal');
        document.body.classList.remove('modal-open');
        closingModal.querySelectorAll('iframe').forEach((frame) => {
            const source = frame.getAttribute('src');
            frame.setAttribute('src', 'about:blank');
            window.setTimeout(() => frame.setAttribute('src', source), 350);
        });
        activeModal = null;
        gallerySlides = [];
        modalTrigger?.focus();
        modalTrigger = null;
    }

    function initModals() {
        document.querySelectorAll('.md-close[onclick]').forEach((button) => {
            button.removeAttribute('onclick');
        });

        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-modal]');
            if (trigger) {
                event.preventDefault();
                openModal(document.getElementById(trigger.dataset.modal), trigger);
                return;
            }
            if (event.target.closest('.md-close')) {
                closeModal();
                return;
            }
            if (event.target === overlay) closeModal();

            const direction = event.target.closest('#work3 .flex-direction-nav a');
            if (direction && activeModal?.id === 'work3') {
                event.preventDefault();
                showGallerySlide(galleryIndex + (direction.classList.contains('next') ? 1 : -1));
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeModal();
                setMenuOpen(false);
            }
        });
    }

    function init() {
        initNavigation();
        initHeroText();
        initPortfolioReveal();
        initModals();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
