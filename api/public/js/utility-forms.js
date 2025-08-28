// Generic utility form handler for all utility pages
document.addEventListener('DOMContentLoaded', function() {
    // Find all forms that match common utility patterns
    const utilityForms = [
        'hashForm', 'uuidForm', 'jwtForm', 'qrForm', 'colorForm', 
        'loremForm', 'passwdForm', 'commitForm', 'domainsForm', 
        'timezonesForm', 'closingsForm', 'notesForm', 'authForm',
        'urlForm'
    ];
    
    utilityForms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const resultDiv = document.getElementById(formId + '-result');
                const resultOutput = resultDiv ? resultDiv.querySelector('.result-output') : null;
                
                if (!resultDiv || !resultOutput) {
                    console.error('Result div or output not found for', formId);
                    return;
                }
                
                // Convert form data to object
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                
                // Handle special cases for different form types
                let endpoint, requestOptions;
                
                if (formId === 'hashForm') {
                    const hashType = data.type || 'sha256';
                    if (hashType === 'all') {
                        // For 'all' type, call multiple endpoints and combine results
                        await handleAllHashTypes(data.text, resultOutput, resultDiv);
                        return;
                    } else {
                        endpoint = `/api/v1/hash/${hashType}?json=true`;
                        requestOptions = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: `text=${encodeURIComponent(data.text)}`
                        };
                    }
                } else if (formId === 'base64Form') {
                    // Base64 is handled by its own script
                    return;
                } else {
                    endpoint = getEndpointForForm(formId);
                    if (!endpoint) return;
                    
                    requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&')
                    };
                }
                
                try {
                    const response = await fetch(endpoint, requestOptions);
                    
                    if (response.ok) {
                        // Check if this is a JSON endpoint
                        if (endpoint.includes('?json=true') || formId === 'hashForm') {
                            const jsonResult = await response.json();
                            if (jsonResult.success && jsonResult.data) {
                                if (formId === 'hashForm') {
                                    resultOutput.textContent = `${jsonResult.data.algorithm.toUpperCase()}: ${jsonResult.data.hash}`;
                                } else {
                                    resultOutput.textContent = JSON.stringify(jsonResult.data, null, 2);
                                }
                            } else {
                                resultOutput.textContent = JSON.stringify(jsonResult, null, 2);
                            }
                        } else {
                            const result = await response.text();
                            resultOutput.textContent = result;
                        }
                        resultDiv.style.display = 'block';
                        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    } else {
                        const errorText = await response.text();
                        resultOutput.textContent = `Error: ${errorText}`;
                        resultDiv.style.display = 'block';
                    }
                } catch (error) {
                    resultOutput.textContent = `Error: ${error.message}`;
                    resultDiv.style.display = 'block';
                }
            });
        }
    });
    
    async function handleAllHashTypes(text, resultOutput, resultDiv) {
        const hashTypes = ['md5', 'sha1', 'sha256', 'sha512'];
        const results = [];
        
        for (const hashType of hashTypes) {
            try {
                const response = await fetch(`/api/v1/hash/${hashType}?json=true`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `text=${encodeURIComponent(text)}`
                });
                
                if (response.ok) {
                    const jsonResult = await response.json();
                    if (jsonResult.success && jsonResult.data) {
                        results.push(`${jsonResult.data.algorithm.toUpperCase()}: ${jsonResult.data.hash}`);
                    } else {
                        results.push(`${hashType.toUpperCase()}: Error in response format`);
                    }
                } else {
                    results.push(`${hashType.toUpperCase()}: Error generating hash`);
                }
            } catch (error) {
                results.push(`${hashType.toUpperCase()}: ${error.message}`);
            }
        }
        
        resultOutput.textContent = results.join('\n');
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    function getEndpointForForm(formId) {
        const endpoints = {
            'hashForm': '/api/v1/hash',
            'uuidForm': '/api/v1/uuid',
            'jwtForm': '/api/v1/jwt',
            'qrForm': '/api/v1/qr',
            'colorForm': '/api/v1/color',
            'loremForm': '/api/v1/lorem',
            'passwdForm': '/api/v1/passwd',
            'commitForm': '/api/v1/commit',
            'domainsForm': '/api/v1/domains',
            'timezonesForm': '/api/v1/timezones',
            'closingsForm': '/api/v1/closings',
            'notesForm': '/api/v1/notes',
            'authForm': '/api/v1/auth',
            'urlForm': '/api/v1/url'
        };
        
        return endpoints[formId];
    }
});