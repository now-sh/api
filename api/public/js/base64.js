document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('base64Form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const text = formData.get('text');
            const action = formData.get('action');
            const resultDiv = document.getElementById('base64Form-result');
            const resultOutput = resultDiv.querySelector('.result-output');
            
            try {
                const response = await fetch(`/api/v1/tools/base64/${action}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `text=${encodeURIComponent(text)}`
                });
                
                if (response.ok) {
                    const result = await response.text();
                    resultOutput.textContent = result;
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