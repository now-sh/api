// Simple main JavaScript - matches original functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Backend API loaded successfully');
    
    // Simple analytics tracking
    if (typeof gtag !== 'undefined') {
        // Track API endpoint clicks
        document.querySelectorAll('.btn[href*="/api/"]').forEach(btn => {
            btn.addEventListener('click', () => {
                gtag('event', 'click', {
                    event_category: 'API Endpoint',
                    event_label: btn.href
                });
            });
        });
        
        // Track outbound links
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            link.addEventListener('click', () => {
                gtag('event', 'click', {
                    event_category: 'Outbound Link', 
                    event_label: link.href
                });
            });
        });
    }
    
    // Handle image loading errors
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            console.error('Failed to load image:', this.src);
            this.style.display = 'none';
        });
    });
});