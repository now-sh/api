document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('urlForm');
    const recentUrlsDiv = document.getElementById('recentUrls');
    
    // Load recent URLs on page load
    loadRecentUrls();
    
    // Handle form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {
                url: formData.get('url'),
                customCode: formData.get('customCode'),
                expiresIn: formData.get('expiresIn')
            };
            
            // Remove empty fields
            Object.keys(data).forEach(key => {
                if (!data[key]) delete data[key];
            });
            
            try {
                const token = localStorage.getItem('authToken');
                const headers = {
                    'Content-Type': 'application/json'
                };
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                
                const response = await fetch('/api/v1/data/urls/shorten', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showSuccessMessage(result.data);
                    form.reset();
                    loadRecentUrls(); // Reload recent URLs
                } else {
                    showError(result.message || 'Failed to shorten URL');
                }
            } catch (error) {
                showError('Network error. Please try again.');
            }
        });
    }
    
    // Handle clicks on action buttons
    document.addEventListener('click', async (e) => {
        if (e.target.matches('[data-action="copy-url"]')) {
            copyToClipboard(e.target.dataset.url, e.target);
        } else if (e.target.matches('[data-action="show-qr"]')) {
            showQRCode(e.target.dataset.url);
        } else if (e.target.matches('.overlay')) {
            closeQRPopup();
        }
    });
    
    async function loadRecentUrls() {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            recentUrlsDiv.innerHTML = '<div class="empty-state">Sign in to see your recent URLs</div>';
            return;
        }
        
        try {
            const response = await fetch('/api/v1/data/urls/list', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.length > 0) {
                    displayRecentUrls(result.data);
                } else {
                    recentUrlsDiv.innerHTML = '<div class="empty-state">No URLs found. Create your first short URL above!</div>';
                }
            } else {
                recentUrlsDiv.innerHTML = '<div class="empty-state">Unable to load recent URLs</div>';
            }
        } catch (error) {
            recentUrlsDiv.innerHTML = '<div class="empty-state">Error loading recent URLs</div>';
        }
    }
    
    function displayRecentUrls(urls) {
        const html = urls.map(url => {
            const shortUrl = `${window.location.origin}/s/${url.shortCode}`;
            const createdDate = new Date(url.createdAt).toLocaleDateString();
            const expiresText = url.expiresAt ? 
                `Expires: ${new Date(url.expiresAt).toLocaleDateString()}` : 
                'Never expires';
            
            return `
                <div class="url-item">
                    <div class="url-content">
                        <div class="short-url">
                            <a href="${shortUrl}" target="_blank">${shortUrl}</a>
                        </div>
                        <div class="original-url">${url.originalUrl}</div>
                        <div class="url-stats">
                            <span>Clicks: ${url.clicks || 0}</span>
                            <span>Created: ${createdDate}</span>
                            <span>${expiresText}</span>
                        </div>
                    </div>
                    <div class="url-actions">
                        <button class="btn btn-sm btn-primary" data-action="copy-url" data-url="${shortUrl}">
                            Copy
                        </button>
                        <button class="btn btn-sm btn-secondary" data-action="show-qr" data-url="${shortUrl}">
                            QR Code
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        recentUrlsDiv.innerHTML = html;
    }
    
    function showSuccessMessage(data) {
        const shortUrl = `${window.location.origin}/s/${data.shortCode}`;
        
        // Remove any existing success message
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create success message
        const messageHtml = `
            <div class="success-message" style="display: block;">
                <h4>✓ URL Shortened Successfully!</h4>
                <p>Your short URL is ready to use:</p>
                <div class="short-link">
                    <input type="text" value="${shortUrl}" readonly id="shortUrlInput">
                    <button class="btn btn-sm btn-primary" onclick="copyShortUrl()">Copy</button>
                </div>
            </div>
        `;
        
        // Insert after the form card
        const formCard = form.closest('.card');
        formCard.insertAdjacentHTML('afterend', messageHtml);
        
        // Auto-select the URL
        const input = document.getElementById('shortUrlInput');
        input.select();
        
        // Scroll to success message
        document.querySelector('.success-message').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
    
    function showError(message) {
        // Remove any existing error message
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        const errorHtml = `
            <div class="error-message" style="display: block;">
                ${message}
            </div>
        `;
        
        const formCard = form.closest('.card');
        formCard.insertAdjacentHTML('afterend', errorHtml);
        
        setTimeout(() => {
            const errorDiv = document.querySelector('.error-message');
            if (errorDiv) errorDiv.remove();
        }, 5000);
    }
    
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('btn-success');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('btn-success');
            }, 2000);
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        });
    }
    
    function showQRCode(url) {
        // Generate QR code URL
        const qrUrl = `/api/v1/tools/qr/generate?text=${encodeURIComponent(url)}&size=250`;
        
        // Create popup
        const popupHtml = `
            <div class="overlay"></div>
            <div class="qr-popup">
                <h3>QR Code</h3>
                <img src="${qrUrl}" alt="QR Code">
                <p class="mt-3 text-secondary">Scan this code to visit the URL</p>
                <button class="btn btn-secondary mt-3" onclick="closeQRPopup()">Close</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHtml);
    }
    
    window.closeQRPopup = function() {
        const overlay = document.querySelector('.overlay');
        const popup = document.querySelector('.qr-popup');
        if (overlay) overlay.remove();
        if (popup) popup.remove();
    }
    
    window.copyShortUrl = function() {
        const input = document.getElementById('shortUrlInput');
        if (input) {
            copyToClipboard(input.value, event.target);
        }
    }
});

// Add styles for error message if not already present
if (!document.querySelector('style[data-url-styles]')) {
    const style = document.createElement('style');
    style.setAttribute('data-url-styles', 'true');
    style.textContent = `
        .error-message {
            background-color: rgba(255, 85, 85, 0.1);
            border: 1px solid var(--red);
            color: var(--red);
            padding: var(--space-3);
            border-radius: var(--radius-md);
            margin-top: var(--space-3);
        }
    `;
    document.head.appendChild(style);
}