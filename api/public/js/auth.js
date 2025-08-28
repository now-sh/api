document.addEventListener('DOMContentLoaded', function() {
    // Handle form toggle links
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-toggle-form]')) {
            e.preventDefault();
            const formType = e.target.getAttribute('data-toggle-form');
            toggleForms(e, formType);
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
            
            const formData = new FormData(e.target);
            const data = {
                username: formData.get('username'),
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
                    showMessage(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                showMessage(`Error: ${error.message}`, 'error');
            }
        });
    }
    
    // Handle register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            try {
                const response = await fetch('/api/v1/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('Registration successful! Please login.', 'success');
                    toggleForms(null, 'login');
                } else {
                    showMessage(`Error: ${result.message}`, 'error');
                }
            } catch (error) {
                showMessage(`Error: ${error.message}`, 'error');
            }
        });
    }
    
    // Check for existing token on page load
    checkAuthState();
});

function toggleForms(event, formType) {
    if (event) event.preventDefault();
    
    const loginForm = document.getElementById('loginFormContainer');
    const registerForm = document.getElementById('registerFormContainer');
    
    if (formType === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else if (formType === 'register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('authToken');
    showUnauthenticatedState();
    showMessage('Logged out successfully!', 'success');
}

function copyToken() {
    const tokenElement = document.getElementById('userToken');
    if (tokenElement) {
        const token = tokenElement.textContent;
        navigator.clipboard.writeText(token).then(() => {
            showMessage('Token copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy token:', err);
            showMessage('Failed to copy token', 'error');
        });
    }
}

function checkAuthState() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verify token with server
        fetch('/api/v1/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                showAuthenticatedState(token, data.user);
            } else {
                localStorage.removeItem('authToken');
                showUnauthenticatedState();
            }
        })
        .catch(() => {
            localStorage.removeItem('authToken');
            showUnauthenticatedState();
        });
    } else {
        showUnauthenticatedState();
    }
}

function showAuthenticatedState(token, user) {
    document.getElementById('authForms').style.display = 'none';
    document.getElementById('authSuccess').style.display = 'block';
    
    document.getElementById('userToken').textContent = token;
    if (user && user.username) {
        document.getElementById('userName').textContent = user.username;
    }
}

function showUnauthenticatedState() {
    document.getElementById('authForms').style.display = 'block';
    document.getElementById('authSuccess').style.display = 'none';
}

function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message message-${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}