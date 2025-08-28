// Global copy functionality for all frontend pages
document.addEventListener('DOMContentLoaded', function() {
    // Handle copy buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn')) {
            const formId = e.target.dataset.formId;
            const resultOutput = document.querySelector(`#${formId}-result .result-output`);
            
            if (resultOutput && resultOutput.textContent) {
                navigator.clipboard.writeText(resultOutput.textContent).then(() => {
                    const originalText = e.target.textContent;
                    e.target.textContent = 'Copied!';
                    e.target.style.backgroundColor = 'var(--green)';
                    
                    setTimeout(() => {
                        e.target.textContent = originalText;
                        e.target.style.backgroundColor = '';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    alert('Failed to copy to clipboard');
                });
            }
        }
    });
    
    // Handle any other copy elements
    document.addEventListener('click', function(e) {
        if (e.target.hasAttribute('onclick') && e.target.getAttribute('onclick').includes('copyToClipboard')) {
            e.preventDefault();
            const selector = e.target.getAttribute('onclick').match(/copyToClipboard\(['"](.+?)['"]\)/);
            if (selector && selector[1]) {
                const element = document.querySelector(selector[1]);
                if (element) {
                    navigator.clipboard.writeText(element.textContent).then(() => {
                        const originalText = e.target.textContent;
                        e.target.textContent = 'Copied!';
                        setTimeout(() => {
                            e.target.textContent = originalText;
                        }, 2000);
                    });
                }
            }
        }
    });
});

// Global copy function for backward compatibility
function copyToClipboard(selector) {
    const element = document.querySelector(selector);
    if (element) {
        navigator.clipboard.writeText(element.textContent);
    }
}