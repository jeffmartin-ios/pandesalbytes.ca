document.addEventListener('DOMContentLoaded', () => {
    // Function to load HTML components and then initialize scripts
    const loadComponents = async () => {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        // FIXED: Robustly determine the relative path to the 'shared' directory.
        const currentPath = window.location.pathname;

        // Determine if the current page is not at the root level.
        const isNested = currentPath.includes('/', 1) || (currentPath.endsWith('/') && currentPath.length > 1);

        // If the page is nested, we need to go up one directory (../). Otherwise, it's local (shared/).
        const basePath = isNested ? '../shared/' : 'shared/';
        
        try {
            // Fetch and inject header
            const headerResponse = await fetch(`${basePath}header.html`);
            if (headerResponse.ok) {
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
        
        // This function runs only if on the home page (index.html)
        if (heroSection && heroPlaceholder && navBar) {
            
            let heroHeight = heroSection.offsetHeight;

            // Recalculate on resize
            window.addEventListener('resize', () => {
                 heroHeight = heroSection.offsetHeight;
            });
            
            // Reverted Scroll Handler Logic
            window.addEventListener('scroll', () => {
                const isScrolledPastHeaderHeight = window.scrollY > navBar.offsetHeight;

                if (isScrolledPastHeaderHeight) {
                    header.classList.add('scrolled');
                    heroPlaceholder.style.height = `${navBar.offsetHeight}px`; // Set placeholder height
                } else {
                    header.classList.remove('scrolled');
                    heroPlaceholder.style.height = '0px'; // Reset placeholder
                }
            });
            
            // Run on load to set initial state if page is already scrolled
            const isScrolledPastHeaderHeight = window.scrollY > navBar.offsetHeight;
            if (isScrolledPastHeaderHeight) {
                 header.classList.add('scrolled');
                 heroPlaceholder.style.height = `${navBar.offsetHeight}px`;
            }
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
