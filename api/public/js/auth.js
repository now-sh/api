document.addEventListener('DOMContentLoaded', function() {
    // Handle form toggle links
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-toggle-form]')) {
            e.preventDefault();
            const formType = e.target.getAttribute('data-toggle-form');
            toggleForms(formType);
        }
        
        // Handle logout button
        if (e.target.matches('[data-action="logout"]')) {
            logout();
        }
        
        // Handle copy token button
        if (e.target.matches('[data-action="copy-token"]')) {
            copyToken();
        }
    });
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessages();
            
            const formData = new FormData(e.target);
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            try {
                const response = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('authToken', result.token);
                    showAuthenticatedState(result.token, result.user);
                    showMessage('Login successful!', 'success');
                } else {
                    showMessage(result.message || 'Login failed', 'error');
                }
            } catch (error) {
                showMessage('Network error. Please try again.', 'error');
            }
        });
    }
    
    // Handle register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessages();
            
            const formData = new FormData(e.target);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            try {
                const response = await fetch('/api/v1/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('authToken', result.token);
                    showAuthenticatedState(result.token, result.user);
                    showMessage('Registration successful!', 'success');
                } else {
                    showMessage(result.message || 'Registration failed', 'error');
                }
            } catch (error) {
                showMessage('Network error. Please try again.', 'error');
            }
        });
    }
    
    // Check for existing token on page load
    checkAuthState();
});

function toggleForms(formType) {
    const loginCard = document.getElementById('loginCard');
    const registerCard = document.getElementById('registerCard');
    
    if (formType === 'register') {
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    } else {
        loginCard.style.display = 'block';
        registerCard.style.display = 'none';
    }
    
    hideMessages();
}

function logout() {
    localStorage.removeItem('authToken');
    showUnauthenticatedState();
    showMessage('Logged out successfully!', 'success');
}

function copyToken() {
    const tokenElement = document.getElementById('tokenValue');
    if (tokenElement) {
        const token = tokenElement.value;
        navigator.clipboard.writeText(token).then(() => {
            const button = document.querySelector('[data-action="copy-token"]');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('btn-success');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('btn-success');
            }, 2000);
        }).catch(err => {
            // Fallback for older browsers
            tokenElement.select();
            document.execCommand('copy');
            showMessage('Token copied!', 'success');
        });
    }
}

async function checkAuthState() {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            // Get current user info
            const response = await fetch('/api/v1/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                showAuthenticatedState(token, result.user);
            } else {
                localStorage.removeItem('authToken');
                showUnauthenticatedState();
            }
        } catch (error) {
            localStorage.removeItem('authToken');
            showUnauthenticatedState();
        }
    } else {
        showUnauthenticatedState();
    }
}

function showAuthenticatedState(token, user) {
    // Hide login/register forms
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('registerCard').style.display = 'none';
    
    // Show profile card
    const profileCard = document.getElementById('profileCard');
    profileCard.style.display = 'block';
    
    // Update profile info
    document.getElementById('profileName').textContent = user.name || '-';
    document.getElementById('profileEmail').textContent = user.email || '-';
    document.getElementById('profileId').textContent = user._id || user.id || '-';
    
    // Show token card
    const tokenCard = document.getElementById('tokenCard');
    tokenCard.style.display = 'block';
    document.getElementById('tokenValue').value = token;
    
    // Decode and display token details
    try {
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        
        const detailsHtml = `
            <div class="detail-row">
                <span class="detail-label">User ID:</span>
                <span class="detail-value">${payload.userId || payload.id || '-'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${payload.email || '-'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Issued At:</span>
                <span class="detail-value">${payload.iat ? new Date(payload.iat * 1000).toLocaleString() : '-'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Expires:</span>
                <span class="detail-value">${payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Never'}</span>
            </div>
        `;
        
        document.getElementById('tokenDetails').innerHTML = detailsHtml;
    } catch (error) {
        document.getElementById('tokenDetails').innerHTML = '<p class="text-secondary">Unable to decode token details</p>';
    }
}

function showUnauthenticatedState() {
    // Show login form
    document.getElementById('loginCard').style.display = 'block';
    document.getElementById('registerCard').style.display = 'none';
    
    // Hide profile and token
    document.getElementById('profileCard').style.display = 'none';
    document.getElementById('tokenCard').style.display = 'none';
    
    // Clear form inputs
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

function showMessage(message, type = 'info') {
    // Remove any existing message
    hideMessages();
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    // Find the active card and insert message after the h2
    const activeCard = document.querySelector('.auth-card:not([style*="display: none"])');
    if (activeCard) {
        const h2 = activeCard.querySelector('h2');
        if (h2 && h2.nextSibling) {
            h2.parentNode.insertBefore(messageDiv, h2.nextSibling);
        } else {
            activeCard.prepend(messageDiv);
        }
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function hideMessages() {
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => msg.remove());
}