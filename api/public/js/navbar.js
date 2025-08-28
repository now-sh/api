// Navbar JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    const dropdowns = document.querySelectorAll('.has-dropdown');
    
    // Toggle mobile menu
    if (navbarToggle) {
        navbarToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navbarMenu.classList.toggle('active');
        });
    }
    
    // Simple dropdown handler that actually works
    console.log('Setting up dropdowns. Found:', dropdowns.length, 'dropdowns');
    
    dropdowns.forEach((dropdown, index) => {
        const link = dropdown.querySelector('.navbar-link');
        console.log(`Dropdown ${index}:`, dropdown, 'Link:', link);
        
        if (link) {
            link.addEventListener('click', function(e) {
                console.log('Dropdown clicked!', this);
                e.preventDefault();
                e.stopPropagation();
                
                // Close all other dropdowns
                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove('active');
                    }
                });
                
                // Toggle this dropdown
                dropdown.classList.toggle('active');
                console.log('Dropdown now has active:', dropdown.classList.contains('active'));
            });
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar')) {
            navbarMenu?.classList.remove('active');
            if (navbarToggle) navbarToggle.setAttribute('aria-expanded', 'false');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
                const link = dropdown.querySelector('.navbar-link');
                if (link) link.setAttribute('aria-expanded', 'false');
            });
        }
    });
    
    // Handle window resize
    let resizeTimer;
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const currentWidth = window.innerWidth;
            // Only reload if crossing the mobile/desktop breakpoint
            if ((lastWidth <= 768 && currentWidth > 768) || 
                (lastWidth > 768 && currentWidth <= 768)) {
                location.reload();
            }
            lastWidth = currentWidth;
        }, 250);
    });
});