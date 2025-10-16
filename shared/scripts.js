document.addEventListener('DOMContentLoaded', () => {
    // Function to load HTML components and then initialize scripts
    const loadComponents = async () => {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        // Determine the correct base path for shared files
        const isRoot = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
        const basePath = isRoot ? '' : '../';

        try {
            // Fetch and inject header
            const headerResponse = await fetch(`${basePath}shared/header.html`);
            if (headerResponse.ok) {
                headerPlaceholder.innerHTML = await headerResponse.text();
            } else {
                console.error('Failed to load header');
            }

            // Fetch and inject footer
            if (footerPlaceholder) {
                const footerResponse = await fetch(`${basePath}shared/footer.html`);
                 if (footerResponse.ok) {
                    footerPlaceholder.innerHTML = await footerResponse.text();
                } else {
                    console.error('Failed to load footer');
                }
            }

            // After components are loaded, initialize the interactive elements
            initializeHeader();

        } catch (error) {
            console.error('Error loading components:', error);
        }
    };

    // Function to set up header interactivity (scroll and menu)
    const initializeHeader = () => {
        const header = document.querySelector('.header');
        const heroSection = document.querySelector('#hero-section');
        const heroPlaceholder = document.querySelector('#hero-placeholder');
        const navBar = document.getElementById('nav-bar');
        const navLogo = document.getElementById('nav-logo');
        const hamburger = document.getElementById('hamburger');
        const menuOverlay = document.getElementById('menu-overlay');
        const closeMenuButton = document.getElementById('close-menu');
        
        // This function can only run if the page has a hero section
        if (heroSection && heroPlaceholder) {
            let heroHeight = heroSection.offsetHeight;

            // Recalculate on resize
            window.addEventListener('resize', () => {
                 heroHeight = heroSection.offsetHeight;
            });
            
            window.addEventListener('scroll', () => {
                const isScrolledPastHero = window.scrollY > heroHeight - navBar.offsetHeight;

                if (isScrolledPastHero) {
                    header.classList.add('scrolled');
                    navLogo.classList.remove('opacity-0');
                    heroPlaceholder.style.height = `${navBar.offsetHeight}px`; // Set placeholder height
                } else {
                    header.classList.remove('scrolled');
                    navLogo.classList.add('opacity-0');
                    heroPlaceholder.style.height = '0px'; // Reset placeholder
                }
            });
        }
        
        // Menu toggle functionality
        const toggleMenu = () => {
            hamburger.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : '';
        };

        if (hamburger && menuOverlay && closeMenuButton) {
            hamburger.addEventListener('click', toggleMenu);
            closeMenuButton.addEventListener('click', toggleMenu);
            // Also close menu if a link inside is clicked
            menuOverlay.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', toggleMenu);
            });
        }
    };

    // Start the process
    loadComponents();
});
