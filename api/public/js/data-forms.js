// Generic data form handler for data pages
document.addEventListener('DOMContentLoaded', function() {
    // Handle COVID data form
    const covidForm = document.getElementById('covidForm');
    if (covidForm) {
        covidForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const resultDiv = document.getElementById('covidForm-result');
            const resultOutput = resultDiv.querySelector('.result-output');
            
            try {
                const response = await fetch('/api/v1/global');
                const data = await response.json();
                
                if (response.ok) {
                    resultOutput.textContent = JSON.stringify(data, null, 2);
                    resultDiv.style.display = 'block';
                } else {
                    resultOutput.textContent = `Error: ${data.message || 'Failed to fetch data'}`;
                    resultDiv.style.display = 'block';
                }
            } catch (error) {
                resultOutput.textContent = `Error: ${error.message}`;
                resultDiv.style.display = 'block';
            }
        });
    }
    
    // Handle Anime quotes form
    const animeForm = document.getElementById('animeForm');
    if (animeForm) {
        animeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const resultDiv = document.getElementById('animeForm-result');
            const resultOutput = resultDiv.querySelector('.result-output');
            
            try {
                const response = await fetch('/api/v1/anime/quote');
                const data = await response.json();
                
                if (response.ok) {
                    // Format anime quote nicely
                    const formatted = `"${data.quote}"\n\n— ${data.character}\n   from ${data.anime}`;
                    resultOutput.textContent = formatted;
                    resultDiv.style.display = 'block';
                } else {
                    resultOutput.textContent = `Error: ${data.message || 'Failed to fetch quote'}`;
                    resultDiv.style.display = 'block';
                }
            } catch (error) {
                resultOutput.textContent = `Error: ${error.message}`;
                resultDiv.style.display = 'block';
            }
        });
    }
    
    // Handle Reddit form
    const redditForm = document.getElementById('redditForm');
    if (redditForm) {
        redditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const username = formData.get('username');
            const resultDiv = document.getElementById('redditForm-result');
            const resultOutput = resultDiv.querySelector('.result-output');
            
            if (!username) {
                resultOutput.textContent = 'Please enter a username';
                resultDiv.style.display = 'block';
                return;
            }
            
            try {
                const endpoint = username === 'casjay' ? '/api/v1/reddit/jason' : `/api/v1/reddit/u/${username}`;
                const response = await fetch(endpoint);
                const data = await response.json();
                
                if (response.ok) {
                    // Format Reddit data nicely
                    if (data.reddit && data.reddit.length > 0) {
                        const posts = data.reddit.map(post => ({
                            title: post.data.title,
                            subreddit: post.data.subreddit,
                            score: post.data.score,
                            created: new Date(post.data.created_utc * 1000).toLocaleDateString()
                        }));
                        const summary = `Total posts: ${data.totalPosts || data.reddit.length}\n\n`;
                        resultOutput.textContent = summary + JSON.stringify(posts, null, 2);
                    } else if (data.data && data.data.children && data.data.children.length > 0) {
                        // Fallback for old format
                        const posts = data.data.children.map(post => ({
                            title: post.data.title,
                            subreddit: post.data.subreddit,
                            score: post.data.score,
                            created: new Date(post.data.created_utc * 1000).toLocaleDateString()
                        }));
                        resultOutput.textContent = JSON.stringify(posts, null, 2);
                    } else {
                        resultOutput.textContent = 'No posts found for this user';
                    }
                    resultDiv.style.display = 'block';
                } else {
                    resultOutput.textContent = `Error: ${data.message || 'Failed to fetch data'}`;
                    resultDiv.style.display = 'block';
                }
            } catch (error) {
                resultOutput.textContent = `Error: ${error.message}`;
                resultDiv.style.display = 'block';
            }
        });
    }
    
    // Handle Domains form
    const domainsForm = document.getElementById('domainsForm');
    if (domainsForm) {
        domainsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const tld = formData.get('tld');
            const resultDiv = document.getElementById('domainsForm-result');
            const resultOutput = resultDiv.querySelector('.result-output');
            
            try {
                const endpoint = tld === 'all' ? '/api/v1/domains' : `/api/v1/domains/${tld}`;
                const response = await fetch(endpoint);
                const data = await response.json();
                
                if (response.ok) {
                    resultOutput.textContent = JSON.stringify(data, null, 2);
                    resultDiv.style.display = 'block';
                } else {
                    resultOutput.textContent = `Error: ${data.message || 'Failed to fetch data'}`;
                    resultDiv.style.display = 'block';
                }
            } catch (error) {
                resultOutput.textContent = `Error: ${error.message}`;
                resultDiv.style.display = 'block';
            }
        });
    }
    
    // Handle Closings form
    const closingsForm = document.getElementById('closingsForm');
    if (closingsForm) {
        closingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const resultDiv = document.getElementById('closingsForm-result');
            const resultOutput = resultDiv.querySelector('.result-output');
            
            try {
                const response = await fetch('/api/v1/closings');
                const data = await response.json();
                
                if (response.ok) {
                    // Format closings data nicely
                    const formatted = data.map(closing => 
                        `${closing.name}: ${closing.status || 'Status unknown'}`
                    ).join('\n');
                    resultOutput.textContent = formatted || JSON.stringify(data, null, 2);
                    resultDiv.style.display = 'block';
                } else {
                    resultOutput.textContent = `Error: ${data.message || 'Failed to fetch data'}`;
                    resultDiv.style.display = 'block';
                }
            } catch (error) {
                resultOutput.textContent = `Error: ${error.message}`;
                resultDiv.style.display = 'block';
            }
        });
    }
    
    // Handle GitHub data form
    const gitForm = document.getElementById('gitForm');
    if (gitForm) {
        gitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const username = formData.get('username');
            const dataType = formData.get('dataType');
            const resultDiv = document.getElementById('gitForm-result');
            const resultOutput = resultDiv.querySelector('.result-output');
            
            if (!username) {
                alert('Please enter a username');
                return;
            }
            
            try {
                let endpoint;
                if (dataType === 'repos') {
                    endpoint = `/api/v1/git/repos/${username}`;
                } else if (dataType === 'orgs') {
                    endpoint = `/api/v1/git/orgs/${username}`;
                } else {
                    endpoint = `/api/v1/git/user/${username}`;
                }
                
                const response = await fetch(endpoint);
                const data = await response.json();
                
                if (response.ok) {
                    // Check if response has repos or orgs with total count
                    if (data.repos && data.totalRepos !== undefined) {
                        const summary = `Total repositories: ${data.totalRepos}\n\n`;
                        resultOutput.textContent = summary + JSON.stringify(data.repos, null, 2);
                    } else if (data.orgs && data.totalOrgs !== undefined) {
                        const summary = `Total organizations: ${data.totalOrgs}\n\n`;
                        resultOutput.textContent = summary + JSON.stringify(data.orgs, null, 2);
                    } else {
                        resultOutput.textContent = JSON.stringify(data, null, 2);
                    }
                    resultDiv.style.display = 'block';
                    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    resultOutput.textContent = `Error: ${data.message || 'Failed to fetch data'}`;
                    resultDiv.style.display = 'block';
                }
            } catch (error) {
                resultOutput.textContent = `Error: ${error.message}`;
                resultDiv.style.display = 'block';
            }
        });
    }
    
    // Handle Timezones display
    const timezonesList = document.getElementById('timezonesList');
    if (timezonesList) {
        updateTimezones();
        // Update every second
        setInterval(updateTimezones, 1000);
    }
});

// Function to update timezone displays
function updateTimezones() {
    const timezonesList = document.getElementById('timezonesList');
    if (!timezonesList) return;
    
    const timezones = [
        { name: 'New York', zone: 'America/New_York' },
        { name: 'Los Angeles', zone: 'America/Los_Angeles' },
        { name: 'Chicago', zone: 'America/Chicago' },
        { name: 'London', zone: 'Europe/London' },
        { name: 'Paris', zone: 'Europe/Paris' },
        { name: 'Tokyo', zone: 'Asia/Tokyo' },
        { name: 'Sydney', zone: 'Australia/Sydney' },
        { name: 'Dubai', zone: 'Asia/Dubai' }
    ];
    
    const html = timezones.map(tz => {
        const time = new Date().toLocaleString('en-US', {
            timeZone: tz.zone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="timezone-item">
                <div class="timezone-name">${tz.name}</div>
                <div class="timezone-time">${time}</div>
            </div>
        `;
    }).join('');
    
    timezonesList.innerHTML = html;
}