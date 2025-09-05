document.addEventListener('DOMContentLoaded', function() {
    const domainsList = document.getElementById('domainsList');
    const domainSearch = document.getElementById('domainSearch');
    let allDomains = [];
    
    // Auto-load domains on page load
    loadAllDomains();
    
    // Handle domain search
    if (domainSearch) {
        domainSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allDomains.filter(domain => 
                domain.toLowerCase().includes(searchTerm)
            );
            displayDomains(filtered);
        });
    }
    
    // Make loadAllDomains globally accessible
    window.loadAllDomains = async function() {
        try {
            const response = await fetch('/api/v1/me/info/domains');
            
            if (response.ok) {
                const data = await response.json();
                
                // The API returns { domains: [...], subDomains: [...] }
                if (data.domains && Array.isArray(data.domains)) {
                    allDomains = [...data.domains];
                    if (data.subDomains && Array.isArray(data.subDomains)) {
                        // Filter out empty strings from subdomains
                        const validSubDomains = data.subDomains.filter(domain => domain && domain.trim() !== '');
                        allDomains.push(...validSubDomains);
                    }
                    displayDomains(allDomains);
                    // Hide loading status
                    const loadingEl = document.getElementById('loadingStatus');
                    if (loadingEl) loadingEl.style.display = 'none';
                } else {
                    domainsList.innerHTML = '<div class="error-message">Unexpected data format from API</div>';
                    document.getElementById('loadingStatus').style.display = 'none';
                }
            } else {
                domainsList.innerHTML = '<div class="error-message">Failed to load domains</div>';
                document.getElementById('loadingStatus').style.display = 'none';
            }
        } catch (error) {
            domainsList.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
            document.getElementById('loadingStatus').style.display = 'none';
        }
    }
    
    // Display domains as a grid
    function displayDomains(domains) {
        // Update domain count
        const countEl = document.getElementById('domainCount');
        if (countEl) {
            countEl.textContent = `${domains.length} domains`;
        }
        
        if (!domains || domains.length === 0) {
            domainsList.innerHTML = '<div class="empty-state">No domains available</div>';
            return;
        }
        
        const html = domains.map(domain => {
            // Check if it's a subdomain based on having more than one dot
            const parts = domain.split('.');
            const isSubdomain = parts.length > 2;
            const type = isSubdomain ? 'Subdomain' : 'Domain';
            
            return `
                <div class="domain-item" data-domain="${domain}">
                    <div class="domain-name">${domain}</div>
                    <div class="domain-status status-taken">${type}</div>
                    <div class="domain-details">
                        Click to copy
                    </div>
                </div>
            `;
        }).join('');
        
        domainsList.innerHTML = html;
        
        // Add click handlers
        document.querySelectorAll('.domain-item').forEach(item => {
            item.addEventListener('click', function() {
                const domain = this.getAttribute('data-domain');
                // Copy domain to clipboard
                navigator.clipboard.writeText(domain).then(() => {
                    // Visual feedback
                    const originalBorder = this.style.borderColor;
                    this.style.borderColor = 'var(--green)';
                    
                    // Show copied message
                    const statusEl = this.querySelector('.domain-status');
                    const originalText = statusEl.textContent;
                    statusEl.textContent = 'Copied!';
                    statusEl.classList.add('status-available');
                    
                    setTimeout(() => {
                        this.style.borderColor = originalBorder;
                        statusEl.textContent = originalText;
                        statusEl.classList.remove('status-available');
                    }, 2000);
                });
            });
        });
    }
    
    // Display TLD categories (if API returns categorized data)
    function displayTLDCategories(categories) {
        const allDomains = [];
        
        // Flatten all categories into a single array
        Object.values(categories).forEach(tldList => {
            if (Array.isArray(tldList)) {
                allDomains.push(...tldList);
            }
        });
        
        if (allDomains.length > 0) {
            displayDomains(allDomains);
        } else {
            // Display as JSON if we can't parse it
            domainsList.innerHTML = `
                <div class="result-output">
                    <pre>${JSON.stringify(categories, null, 2)}</pre>
                </div>
            `;
        }
    }
});