// Enhanced utility form handler for dynamic API interaction
document.addEventListener('DOMContentLoaded', function() {
    // Toast notification system
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Show loading state
    function showLoading(resultDiv) {
        const resultOutput = resultDiv.querySelector('.result-output');
        resultOutput.innerHTML = '<div class="loading">Processing...</div>';
        resultDiv.style.display = 'block';
    }

    // Show error
    function showError(resultDiv, message) {
        const resultOutput = resultDiv.querySelector('.result-output');
        resultOutput.innerHTML = `<div class="error">Error: ${message}</div>`;
        resultDiv.style.display = 'block';
    }

    // Show result
    function showResult(resultDiv, data, isText = false) {
        const resultOutput = resultDiv.querySelector('.result-output');
        
        if (isText) {
            resultOutput.textContent = data;
        } else {
            // Pretty print JSON
            resultOutput.textContent = JSON.stringify(data, null, 2);
        }
        
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Copy to clipboard
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            showToast('Failed to copy to clipboard', 'error');
        });
    }

    // Handle form submission
    async function handleFormSubmit(form, config) {
        const formData = new FormData(form);
        const resultDiv = document.getElementById(form.id + '-result');
        
        if (!resultDiv) {
            console.error('Result div not found for', form.id);
            return;
        }

        showLoading(resultDiv);

        try {
            // Build request based on form type
            const request = await buildRequest(form.id, formData, config);
            
            // Skip if form is handled elsewhere
            if (!request) return;
            
            const { url, options } = request;
            
            const response = await fetch(url, options);
            const contentType = response.headers.get('content-type');
            
            let result;
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                result = await response.text();
            }

            if (response.ok) {
                // Handle success based on response type
                if (typeof result === 'string') {
                    showResult(resultDiv, result, true);
                } else if (result.success && result.data) {
                    // Format based on form type
                    const formatted = formatResponse(form.id, result.data);
                    showResult(resultDiv, formatted, typeof formatted === 'string');
                } else {
                    showResult(resultDiv, result);
                }
            } else {
                const errorMsg = result.error || result.message || 'Request failed';
                showError(resultDiv, errorMsg);
            }
        } catch (error) {
            showError(resultDiv, error.message);
        }
    }

    // Build request based on form type
    async function buildRequest(formId, formData, config) {
        const data = Object.fromEntries(formData.entries());
        
        // Default to JSON POST
        let url = config.endpoint;
        let options = {
            method: config.method || 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        // Special handling for different form types
        switch (formId) {
            case 'hashForm': {
                const algorithm = data.algorithm || 'sha256';
                url = `/api/v1/tools/hash/${algorithm}`;
                delete data.algorithm;
                break;
            }

            case 'uuidForm': {
                const count = data.count || 1;
                url = `/api/v1/tools/uuid/generate/${count}`;
                options.method = 'GET';
                delete options.body;
                delete options.headers;
                break;
            }

            case 'loremForm': {
                const type = data.type || 'paragraphs';
                const lCount = data.count || 3;
                url = `/api/v1/tools/lorem/${type}/${lCount}`;
                options.method = 'GET';
                delete options.body;
                delete options.headers;
                break;
            }

            case 'passwdForm': {
                const length = data.length || 16;
                url = `/api/v1/tools/passwd/${length}`;
                options.method = 'GET';
                delete options.body;
                delete options.headers;
                break;
            }

            case 'commitForm':
                url = '/api/v1/tools/commit';
                options.method = 'GET';
                delete options.body;
                delete options.headers;
                break;

            case 'colorForm':
                if (data.action === 'palette') {
                    url = '/api/v1/tools/color/palette';
                } else {
                    url = '/api/v1/tools/color/convert';
                }
                break;

            case 'gitForm':
                // SKIP - handled inline in git.ejs
                return null;

            case 'redditForm':
                // SKIP - handled inline in reddit.ejs
                return null;

            case 'covidForm': {
                const country = data.country;
                url = country ? `/api/v1/world/covid/countries/${country}` : '/api/v1/world/covid';
                options.method = 'GET';
                delete options.body;
                delete options.headers;
                break;
            }

            case 'animeForm': {
                const quoteCount = data.count || 1;
                url = quoteCount > 1 ? `/api/v1/fun/anime/quotes/${quoteCount}` : '/api/v1/fun/anime/quote';
                options.method = 'GET';
                delete options.body;
                delete options.headers;
                break;
            }
        }

        return { url, options };
    }

    // Format response based on form type
    function formatResponse(formId, data) {
        switch (formId) {
            case 'hashForm':
                return `${data.algorithm.toUpperCase()}: ${data.hash}`;
                
            case 'uuidForm':
                if (Array.isArray(data)) {
                    return data.join('\n');
                }
                return data.uuid || data;

            case 'commitForm':
                return data.message || data;

            case 'animeForm':
                if (data.quote && data.character) {
                    return `"${data.quote}"\n\n— ${data.character}\n   from ${data.anime}`;
                }
                return data;

            case 'colorForm':
                if (data.palette) {
                    return data.palette.map(color => `${color.name}: ${color.hex}`).join('\n');
                }
                return data;

            default:
                return data;
        }
    }

    // Find all utility forms and attach handlers
    const forms = document.querySelectorAll('form[id$="Form"]');
    forms.forEach(form => {
        // Get endpoint from data attribute or derive from form
        const endpoint = form.dataset.endpoint || deriveEndpoint(form.id);
        const method = form.dataset.method || 'POST';
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleFormSubmit(form, { endpoint, method });
        });
    });

    // Derive endpoint from form ID
    function deriveEndpoint(formId) {
        const endpoints = {
            'base64Form': '/api/v1/tools/base64/encode',
            'hashForm': '/api/v1/tools/hash',
            'uuidForm': '/api/v1/tools/uuid/v4',
            'jwtForm': '/api/v1/tools/jwt/decode',
            'qrForm': '/api/v1/tools/qr/generate',
            'colorForm': '/api/v1/tools/color/convert',
            'loremForm': '/api/v1/tools/lorem',
            'passwdForm': '/api/v1/tools/passwd',
            'commitForm': '/api/v1/tools/commit',
            'domainsForm': '/api/v1/me/info/domains',
            'timezonesForm': '/api/v1/world/timezones',
            'closingsForm': '/api/v1/world/closings',
            'notesForm': '/api/v1/data/notes',
            'authForm': '/api/v1/auth',
            'urlForm': '/api/v1/data/urls',
            'gitForm': '/api/v1/social/github',
            'redditForm': '/api/v1/social/reddit',
            'covidForm': '/api/v1/world/covid',
            'animeForm': '/api/v1/fun/anime/quote'
        };
        
        return endpoints[formId] || '/api/v1/unknown';
    }

    // Copy button handlers
    document.addEventListener('click', (e) => {
        if (e.target.matches('.copy-btn')) {
            const formId = e.target.dataset.formId;
            const resultDiv = document.getElementById(formId + '-result');
            if (resultDiv) {
                const output = resultDiv.querySelector('.result-output');
                const text = output.textContent;
                copyToClipboard(text, e.target);
            }
        }
    });

    // Add CSS for toast animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});