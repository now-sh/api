document.addEventListener('DOMContentLoaded', function() {
    const closingsList = document.getElementById('closingsList');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const weatherAlert = document.getElementById('weatherAlert');
    const lastUpdated = document.getElementById('lastUpdated');
    
    let allClosings = [];
    let currentFilter = 'all';
    
    // Load closings on page load
    loadClosings();
    
    // Update every minute
    setInterval(loadClosings, 60000);
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        filterAndDisplayClosings(e.target.value.toLowerCase(), currentFilter);
    });
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            filterAndDisplayClosings(searchInput.value.toLowerCase(), currentFilter);
        });
    });
    
    
    async function loadClosings() {
        try {
            const response = await fetch('/api/v1/world/closings');
            
            if (response.ok) {
                const data = await response.json();
                
                // Handle the regions structure
                if (data.regions) {
                    allClosings = [];
                    // Extract closings from all regions
                    Object.values(data.regions).forEach(region => {
                        if (region.closings && Array.isArray(region.closings)) {
                            region.closings.forEach(closing => {
                                // Add region info to each closing
                                allClosings.push({
                                    ...closing,
                                    region: region.region || 'Unknown'
                                });
                            });
                        }
                    });
                } else if (data.closings && Array.isArray(data.closings)) {
                    allClosings = data.closings;
                } else if (Array.isArray(data)) {
                    allClosings = data;
                } else {
                    // No data available
                    allClosings = [];
                }
                
                // Update last updated time
                lastUpdated.textContent = data.timestamp ? 
                    new Date(data.timestamp).toLocaleTimeString() : 
                    new Date().toLocaleTimeString();
                
                // Show weather alert if there are closings
                if (data.hasClosings && data.totalClosings > 0) {
                    showWeatherAlert(`${data.totalClosings} closings reported across all regions`);
                }
                
                // Display closings
                filterAndDisplayClosings(searchInput.value.toLowerCase(), currentFilter);
            } else {
                // No data available on error
                allClosings = [];
                filterAndDisplayClosings('', currentFilter);
                console.error('Failed to load closings');
            }
        } catch (error) {
            console.error('Error loading closings:', error);
            allClosings = [];
            filterAndDisplayClosings('', currentFilter);
        }
    }
    
    function filterAndDisplayClosings(searchTerm, filterType) {
        let filtered = allClosings;
        
        // Apply status filter
        if (filterType !== 'all') {
            filtered = filtered.filter(closing => {
                const status = (closing.status || '').toLowerCase();
                return status === filterType || 
                       (filterType === 'early' && status.includes('early')) ||
                       (filterType === 'delayed' && status.includes('delay'));
            });
        }
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(closing => {
                const org = (closing.organization || closing.name || '').toLowerCase();
                const reason = (closing.reason || '').toLowerCase();
                return org.includes(searchTerm) || reason.includes(searchTerm);
            });
        }
        
        displayClosings(filtered);
    }
    
    function displayClosings(closings) {
        if (!closings || closings.length === 0) {
            closingsList.innerHTML = '<div class="empty-state">No closings or delays reported</div>';
            return;
        }
        
        const html = closings.map(closing => {
            const status = (closing.status || 'closed').toLowerCase();
            const statusClass = status.includes('delay') ? 'delayed' : 
                               status.includes('early') ? 'early' : 'closed';
            const statusText = status.charAt(0).toUpperCase() + status.slice(1);
            
            return `
                <div class="closing-item status-${statusClass}">
                    <div class="closing-header">
                        <div class="closing-name">${closing.organization || closing.name || 'Unknown'}</div>
                        <div class="closing-status status-badge-${statusClass}">${statusText}</div>
                    </div>
                    <div class="closing-details">
                        ${closing.region ? 
                            `<span class="closing-region" style="color: var(--purple);">${closing.region.toUpperCase()}</span>` : ''
                        }
                        ${closing.delay_time || closing.time ? 
                            `<span class="closing-time">${closing.delay_time || closing.time}</span>` : ''
                        }
                        ${closing.reason ? 
                            `<div class="closing-reason">${closing.reason}</div>` : ''
                        }
                    </div>
                </div>
            `;
        }).join('');
        
        closingsList.innerHTML = html;
    }
    
    function showWeatherAlert(alert) {
        const alertContent = weatherAlert.querySelector('.alert-content');
        alertContent.textContent = alert;
        weatherAlert.style.display = 'block';
    }
    
    
});