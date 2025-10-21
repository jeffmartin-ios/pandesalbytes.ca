document.addEventListener('DOMContentLoaded', () => {
    // --- Translation Logic ---
    let translations = {};

    async function loadTranslations(lang) {
        // Determine the correct path to the lang folder
        const currentPath = window.location.pathname;
        // [FIX] Use startsWith for a more robust check that handles URLs with or without trailing slashes.
        const isNested = currentPath.startsWith('/spent-today') || currentPath.startsWith('/privacy');
        const basePath = isNested ? '../' : '';

        try {
            const response = await fetch(`${basePath}lang/${lang}.json`);
            if (!response.ok) {
                console.error(`Could not load translation file: ${lang}.json`);
                // Fallback to English if the chosen language file fails
                if (lang !== 'en') await loadTranslations('en');
                return;
            }
            translations = await response.json();
            updateAllText();
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

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
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        const currentPath = window.location.pathname;
        // [FIX] Use startsWith for a more robust check.
        const isNested = currentPath.startsWith('/spent-today') || currentPath.startsWith('/privacy');
        const basePath = isNested ? '../shared/' : 'shared/';
        
        try {
            // Fetch and inject header
            if (headerPlaceholder) {
                const headerResponse = await fetch(`${basePath}header.html`);
                if (headerResponse.ok) {
                    headerPlaceholder.innerHTML = await headerResponse.text();
                }
            }
            // Fetch and inject footer
            if (footerPlaceholder) {
                const footerResponse = await fetch(`${basePath}footer.html`);
                 if (footerResponse.ok) {
                    footerPlaceholder.innerHTML = await footerResponse.text();
                }
            }

            // After components are loaded, initialize interactivity and apply initial translation
            initializeHeader();
            
            // Detect user's language preference
            const savedLang = localStorage.getItem('userLanguage');
            const browserLang = navigator.language.split('-')[0]; // e.g., "en-US" -> "en"
            
            // List of supported languages
            const supportedLangs = ['en', 'ja', 'zh', 'fr', 'th'];
            const browserLangCode = navigator.language; // e.g., "zh-CN", "zh-TW"
            
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
            
            // [FIX] Use 'touchend' for mobile and 'click' for desktop to prevent issues.
            const eventType = ('ontouchend' in document.documentElement) ? 'touchend' : 'click';

            langOptions.forEach(option => {
                option.addEventListener(eventType, (e) => {
                    e.preventDefault();
                    const selectedLang = option.getAttribute('data-lang');
                    
                    loadTranslations(selectedLang);
                    localStorage.setItem('userLanguage', selectedLang);
                    
                    langSelector.classList.remove('active');
                });
            });
        }
    };

    // Start the process
    loadComponents();
});

