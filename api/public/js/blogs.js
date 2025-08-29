document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('blogForm');
    const sourceSelect = document.getElementById('source');
    const customRepoDiv = document.getElementById('customRepo');
    const resultDiv = document.getElementById('blogForm-result');
    const blogPostsDiv = document.getElementById('blogPosts');
    
    // Show/hide custom repo fields
    sourceSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customRepoDiv.style.display = 'block';
        } else {
            customRepoDiv.style.display = 'none';
        }
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const source = sourceSelect.value;
        let endpoint;
        
        if (source === 'jason') {
            endpoint = '/api/v1/blogs/jason';
        } else {
            const user = document.getElementById('user').value;
            const repo = document.getElementById('repo').value;
            
            if (!user || !repo) {
                alert('Please enter both GitHub username and repository name');
                return;
            }
            
            endpoint = `/api/v1/blogs/${user}/${repo}`;
        }
        
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (response.ok && data.posts && Array.isArray(data.posts)) {
                displayBlogPosts(data);
                resultDiv.style.display = 'block';
            } else if (data.error) {
                blogPostsDiv.innerHTML = `<div class="alert alert-danger">Error: ${data.error}${data.hint ? '<br>' + data.hint : ''}</div>`;
                resultDiv.style.display = 'block';
            } else {
                blogPostsDiv.innerHTML = '<div class="alert alert-danger">Error loading blog posts</div>';
                resultDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            blogPostsDiv.innerHTML = '<div class="alert alert-danger">Failed to load blog posts</div>';
            resultDiv.style.display = 'block';
        }
    });
    
    async function displayBlogPosts(data) {
        const posts = data.posts;
        
        if (!posts || posts.length === 0) {
            blogPostsDiv.innerHTML = '<div class="alert alert-info">No blog posts found</div>';
            return;
        }
        
        // Add repository info
        blogPostsDiv.innerHTML = `
            <div class="alert alert-success">
                Repository: <strong>${data.repository}</strong><br>
                Total posts: <strong>${data.total_posts}</strong>
            </div>
        `;
        
        // Display posts (already sorted by date from API)
        posts.slice(0, 20).forEach((post) => {
            const postDiv = document.createElement('div');
            postDiv.className = 'blog-post';
            
            if (post.error) {
                postDiv.innerHTML = `
                    <h5>${escapeHtml(post.filename)}</h5>
                    <div class="content text-danger">${escapeHtml(post.error)}</div>
                `;
            } else {
                const date = post.date ? new Date(post.date).toLocaleDateString() : '';
                const tags = post.tags ? `<span class="tags">Tags: ${escapeHtml(post.tags)}</span>` : '';
                const categories = post.categories ? `<span class="categories">Categories: ${escapeHtml(post.categories)}</span>` : '';
                
                postDiv.innerHTML = `
                    <h5>${escapeHtml(post.title)}</h5>
                    <div class="meta">
                        ${date ? `<span class="date">${date}</span>` : ''}
                        ${post.author ? `<span class="author">by ${escapeHtml(post.author)}</span>` : ''}
                        ${categories}
                        ${tags}
                        <a href="${post.html_url}" target="_blank">View on GitHub</a>
                    </div>
                    <div class="content">${escapeHtml(post.excerpt)}</div>
                    <details>
                        <summary>Read more...</summary>
                        <div class="full-content">${escapeHtml(post.content)}</div>
                    </details>
                `;
            }
            
            blogPostsDiv.appendChild(postDiv);
        });
        
        if (posts.length > 20) {
            blogPostsDiv.innerHTML += `<div class="alert alert-info mt-3">Showing first 20 of ${posts.length} posts</div>`;
        }
    }
    
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Load Jason's blog by default
    form.dispatchEvent(new Event('submit'));
});