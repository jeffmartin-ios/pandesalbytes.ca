document.addEventListener('DOMContentLoaded', () => {
    // Function to load HTML components and then initialize scripts
    const loadComponents = async () => {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        // FIXED: Robustly determine the relative path to the 'shared' directory.
        const currentPath = window.location.pathname;

        // Determine if the current page is not at the root level.
        // - currentPath.includes('/', 1) checks for paths like /about/index.html
        // - (currentPath.endsWith('/') && currentPath.length > 1) checks for paths like /about/
        const isNested = currentPath.includes('/', 1) || (currentPath.endsWith('/') && currentPath.length > 1);

        // If the page is nested, we need to go up one directory (../). Otherwise, it's local (shared/).
        const basePath = isNested ? '../shared/' : 'shared/';
        
        // This is safe to run even if the placeholders are null, but we check before injecting.

        try {
            // Fetch and inject header
            const headerResponse = await fetch(`${basePath}header.html`);
            if (headerResponse.ok) {
                // Ensure the placeholder exists before trying to inject HTML
                if (headerPlaceholder) {
                    headerPlaceholder.innerHTML = await headerResponse.text();
                }
            } else {
                console.error(`Failed to load header from ${basePath}header.html`);
            }

            // Fetch and inject footer
            if (footerPlaceholder) {
                const footerResponse = await fetch(`${basePath}footer.html`);
                 if (footerResponse.ok) {
                    footerPlaceholder.innerHTML = await footerResponse.text();
                } else {
                    console.error(`Failed to load footer from ${basePath}footer.html`);
                }
            }

            // After components are loaded, initialize the interactive elements
            // We must wait a moment to ensure the dynamically loaded DOM elements are available
            setTimeout(initializeHeader, 10); 

        } catch (error) {
            console.error('Error loading components:', error);
        }
    };

    // Function to set up header interactivity (scroll and menu)
    const initializeHeader = () => {
        const header = document.querySelector('.header');
        const heroSection = document.querySelector('#hero-section');
        const heroPlaceholder = document.querySelector('#hero-placeholder');
        
        // Dynamic elements loaded via fetch
        const navBar = document.getElementById('nav-bar');
        const hamburger = document.getElementById('hamburger');
        const menuOverlay = document.getElementById('menu-overlay');
        const closeMenuButton = document.getElementById('close-menu');

        // New elements for title collapsing
        const collapsibleTitle = document.getElementById('collapsible-title');
        const navLogo = document.getElementById('nav-logo');
        
        // This function runs only if on the home page (index.html)
        if (heroSection && heroPlaceholder && collapsibleTitle && navBar && navLogo) {
            
            // 1. Setup initial values (done in next tick to ensure layout is ready)
            const setupCollapsibleTitle = () => {
                const navLogoRect = navLogo.getBoundingClientRect();
                const titleRect = collapsibleTitle.getBoundingClientRect();
                const heroHeight = heroSection.offsetHeight;
                
                // Calculate the final scale factor (from 60px hero title size to 20px nav logo title size)
                // Sizes are based on CSS defined in styles.css (hero-title is 3.75rem/60px, nav-logo-text is 20px)
                const targetScale = 20 / 60; // 0.3333

                // Calculate the translation required to move the center of the big title 
                // to the center of the small title's final position.
                // We use titleRect.x and titleRect.y for the starting point (relative to viewport)
                const startX = titleRect.left + (titleRect.width / 2);
                const startY = titleRect.top + (titleRect.height / 2);
                
                // Target position (center of where the PB logo icon is, since that's what navLogo aligns to)
                // We compensate for the fact that the title scales down to navLogo's size.
                const targetX = navLogoRect.left + (navLogoRect.width / 2);
                const targetY = navLogoRect.top + (navLogoRect.height / 2);
                
                const translateX = targetX - startX;
                const translateY = targetY - startY;

                // How much distance we need to scroll to complete the animation (arbitrary value)
                const scrollThreshold = heroHeight * 0.5; // Complete animation halfway down the hero section

                return { translateX, translateY, targetScale, scrollThreshold, heroHeight };
            };

            let metrics = setupCollapsibleTitle();

            // Recalculate on resize
            window.addEventListener('resize', () => {
                 metrics = setupCollapsibleTitle();
                 // Re-apply scroll listener logic just in case the scroll position is already active
                 handleScroll(window.scrollY);
            });
            
            // 2. Scroll Handler Logic
            const handleScroll = (scrollY) => {
                const { translateX, translateY, targetScale, scrollThreshold, heroHeight } = metrics;

                // Calculate progress (clamped between 0 and 1)
                let progress = Math.min(1, scrollY / scrollThreshold);

                // Title Transition (Scale and Move)
                const scale = 1 - (progress * (1 - targetScale));
                const currentTranslateX = progress * translateX;
                const currentTranslateY = progress * translateY;
                
                collapsibleTitle.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${scale})`;
                collapsibleTitle.style.opacity = 1 - (progress * 0.2); // Slight fade on the big title

                // Header appearance transition
                const isScrolledPastHero = scrollY > navBar.offsetHeight;

                if (isScrolledPastHero) {
                    header.classList.add('scrolled');
                    heroPlaceholder.style.height = `${navBar.offsetHeight}px`; // Set placeholder height
                } else {
                    header.classList.remove('scrolled');
                    heroPlaceholder.style.height = '0px'; // Reset placeholder
                }
            };
            
            window.addEventListener('scroll', () => {
                handleScroll(window.scrollY);
            });
            
            // Run on load to set initial state if page is already scrolled
            handleScroll(window.scrollY); 
        }
        
        // Menu toggle functionality (remains unchanged)
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
            // Also close menu if a link inside is clicked
            menuOverlay.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    // Only toggle if the menu is actually active
                    if (menuOverlay.classList.contains('active')) {
                        toggleMenu();
                    }
                });
            });
        }
    };

    // Start the process
    loadComponents();
});
