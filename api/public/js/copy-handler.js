// Global copy functionality for all forms
document.addEventListener('DOMContentLoaded', function() {
    // Handle copy buttons using event delegation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn')) {
            const formId = e.target.getAttribute('data-form-id');
            if (formId) {
                copyFormResult(formId);
            }
        }
    });
    
    function copyFormResult(formId) {
        const resultDiv = document.getElementById(formId + '-result');
        const resultOutput = resultDiv.querySelector('.result-output');
        const copyBtn = resultDiv.querySelector('.copy-btn');
        
        if (resultOutput && copyBtn) {
            const text = resultOutput.textContent;
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy Result';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy Result';
                    }, 2000);
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                }
                document.body.removeChild(textArea);
            });
        }
    }
});