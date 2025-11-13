document.addEventListener('DOMContentLoaded', () => {
    // --- Translation Logic ---
    let translations = {};

    // This function now ONLY fetches and stores the translation data.
    async function loadTranslations(lang) {
        const currentPath = window.location.pathname;
        // [MODIFIED] Added new app paths to the check
        const isNested = currentPath.startsWith('/spent-today') || 
                         currentPath.startsWith('/privacy') || 
                         currentPath.startsWith('/inventory') || 
                         currentPath.startsWith('/camerapouch');
        const basePath = isNested ? '../' : '';

        try {
            const response = await fetch(`${basePath}lang/${lang}.json`);
            if (!response.ok) {
                console.error(`Could not load translation file: ${lang}.json`);
                if (lang !== 'en') await loadTranslations('en');
                return;
            }
            translations = await response.json(); // Store translations globally
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    // This function applies the currently stored translations to the DOM.
    function updateAllText() {
        document.querySelectorAll('[data-i18n-key]').forEach(element => {
            const key = element.getAttribute('data-i18n-key');
            if (translations[key]) {
                element.innerHTML = translations[key];
            }
        });
    }


    // --- Component Loading & Initialization ---
    const loadComponents = async () => {
        // Step 1: Determine the initial language and load the translation data first.
        const savedLang = localStorage.getItem('userLanguage');
        const browserLang = navigator.language.split('-')[0];
        const supportedLangs = ['en', 'ja', 'zh', 'fr', 'th'];
        const browserLangCode = navigator.language;
        let initialLang = 'en';
        if (savedLang) {
            initialLang = savedLang;
        } else if (browserLangCode === 'zh-CN') {
            initialLang = 'zh-CN';
        } else if (browserLangCode === 'zh-TW' || browserLang === 'zh') {
            initialLang = 'zh-TW';
        } else if (browserLang === 'fr') {
            initialLang = 'fr-CA';
        } else if (supportedLangs.includes(browserLang)) {
            initialLang = browserLang;
        }
        await loadTranslations(initialLang);

        // Step 2: Fetch and inject the HTML components.
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');
        const currentPath = window.location.pathname;
        // [MODIFIED] Added new app paths to the check
        const isNested = currentPath.startsWith('/spent-today') || 
                         currentPath.startsWith('/privacy') || 
                         currentPath.startsWith('/inventory') || 
                         currentPath.startsWith('/camerapouch');
        const basePath = isNested ? '../shared/' : 'shared/';
        
        try {
            // Use Promise.all to fetch components concurrently
            const [headerRes, footerRes] = await Promise.all([
                fetch(`${basePath}header.html`),
                fetch(`${basePath}footer.html`)
            ]);

            if (headerPlaceholder && headerRes.ok) {
                headerPlaceholder.innerHTML = await headerRes.text();
            }
            if (footerPlaceholder && footerRes.ok) {
                footerPlaceholder.innerHTML = await footerRes.text();
            }

            // [THE FIX] Defer the final setup until the browser has processed the injected HTML.
            // A timeout of 0ms waits for the current execution to finish, ensuring the DOM is ready.
            setTimeout(() => {
                // Step 3: Initialize component interactivity (menus, dropdowns, etc.).
                initializeHeader();
                
                // Step 4: Now that the DOM is complete, apply the translations.
                updateAllText();
            }, 0);

        } catch (error) {
            console.error('Error loading components:', error);
        }
    };

    const initializeHeader = () => {
        const hamburger = document.getElementById('hamburger');
        const menuOverlay = document.getElementById('menu-overlay');
        const closeMenuButton = document.getElementById('close-menu');
        
        // Menu toggle
        const toggleMenu = () => {
            if (hamburger && menuOverlay) {
                hamburger.classList.toggle('active');
                menuOverlay.classList.toggle('active');
                document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : '';
            }
        };

        if (hamburger && menuOverlay && closeMenuButton) {
            hamburger.addEventListener('click', toggleMenu);
            closeMenuButton.addEventListener('click', toggleMenu);
            menuOverlay.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (menuOverlay.classList.contains('active')) {
                        toggleMenu();
                    }
                });
            });
        }

        // Language selector
        const langSelector = document.querySelector('.lang-selector');
        const langButton = document.getElementById('lang-button');
        const langDropdown = document.getElementById('lang-dropdown');

        if (langButton && langDropdown && langSelector) {
            langButton.addEventListener('click', (e) => {
                e.stopPropagation();
                langSelector.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (langSelector.classList.contains('active') && !langSelector.contains(e.target)) {
                    langSelector.classList.remove('active');
                }
            });

            const langOptions = langDropdown.querySelectorAll('.lang-option');
            const eventType = ('ontouchend' in document.documentElement) ? 'touchend' : 'click';

            langOptions.forEach(option => {
                // This event handler is now async to handle the await call.
                option.addEventListener(eventType, async (e) => {
                    e.preventDefault();
                    const selectedLang = option.getAttribute('data-lang');
                    
                    // First, await the new translation data.
                    await loadTranslations(selectedLang);
                    // THEN, update the text on the entire page.
                    updateAllText();
                    
                    localStorage.setItem('userLanguage', selectedLang);
                    langSelector.classList.remove('active');
                });
            });
        }
    };

    // Start the process
    loadComponents();
});