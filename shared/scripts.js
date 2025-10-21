document.addEventListener('DOMContentLoaded', () => {
    // --- TRANSLATION LOGIC ---
    let currentTranslations = {};

    // Function to fetch and apply translations
    const loadTranslations = async (lang) => {
        try {
            // Determine path to lang folder based on page depth
            const isNested = window.location.pathname.includes('/', 1);
            const basePath = isNested ? '../' : './';
            
            const response = await fetch(`${basePath}lang/${lang}.json`);
            if (!response.ok) {
                console.error(`Could not load translation file: ${lang}.json`);
                // Fallback to English if the selected language file fails
                if (lang !== 'en') await loadTranslations('en');
                return;
            }
            currentTranslations = await response.json();
            
            // Set page language and direction
            document.documentElement.lang = lang;

            // Apply translations to all elements with data-i18n-key
            document.querySelectorAll('[data-i18n-key]').forEach(element => {
                const key = element.getAttribute('data-i18n-key');
                if (currentTranslations[key]) {
                    element.innerHTML = currentTranslations[key];
                }
            });

        } catch (error) {
            console.error('Error loading translations:', error);
        }
    };

    // Function to initialize language settings
    const initializeLanguage = () => {
        const savedLang = localStorage.getItem('userLanguage');
        const browserLang = navigator.language; // Full code e.g., 'en-US', 'ja', 'zh-CN'

        let langToLoad = 'en'; // Default
        if (savedLang) {
            langToLoad = savedLang;
        } else if (browserLang.startsWith('fr')) {
            langToLoad = 'fr-CA';
        } else if (browserLang.startsWith('th')) {
            langToLoad = 'th';
        } else if (browserLang.startsWith('ja')) {
            langToLoad = 'ja';
        } else if (browserLang === 'zh-CN' || browserLang === 'zh-SG') {
            langToLoad = 'zh-CN';
        } else if (browserLang.startsWith('zh')) { // Catches zh-TW, zh-HK, etc.
            langToLoad = 'zh-TW';
        }
        
        loadTranslations(langToLoad);
    };


    // Function to load HTML components
    const loadComponents = async () => {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        const isNested = window.location.pathname.includes('/', 1);
        const basePath = isNested ? '../shared/' : 'shared/';
        
        try {
            if (headerPlaceholder) {
                const headerResponse = await fetch(`${basePath}header.html`);
                if (headerResponse.ok) headerPlaceholder.innerHTML = await headerResponse.text();
            }

            if (footerPlaceholder) {
                const footerResponse = await fetch(`${basePath}footer.html`);
                if (footerResponse.ok) footerPlaceholder.innerHTML = await footerResponse.text();
            }

            // After components are loaded, initialize interactive elements and language
            setTimeout(() => {
                initializeHeader();
                initializeLanguage();
            }, 10);

        } catch (error) {
            console.error('Error loading components:', error);
        }
    };

    // Function to set up header interactivity
    const initializeHeader = () => {
        const hamburger = document.getElementById('hamburger');
        const menuOverlay = document.getElementById('menu-overlay');
        const closeMenuButton = document.getElementById('close-menu');
        
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
                    if (menuOverlay.classList.contains('active')) toggleMenu();
                });
            });
        }

        // Language selector logic
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

            langDropdown.querySelectorAll('.lang-option').forEach(option => {
                option.addEventListener('click', (e) => {
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

