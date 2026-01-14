// Simple router and markdown renderer

const app = {
    contentEl: document.getElementById('content'),

    init() {
        // Configure marked for safety
        marked.setOptions({
            breaks: true,
            gfm: true
        });

        // Handle route changes
        window.addEventListener('hashchange', () => this.route());

        // Initial route
        this.route();
    },

    async route() {
        const hash = window.location.hash || '#/';
        const path = hash.slice(2); // Remove '#/'

        if (path === '' || path === '/') {
            this.renderHome();
        } else if (path === 'about') {
            await this.renderPage('about');
        } else if (path.startsWith('post/')) {
            const slug = path.slice(5);
            await this.renderPost(slug);
        } else {
            this.render404();
        }
    },

    renderHome() {
        const postsHtml = CONFIG.posts.map(post => `
            <li class="post-item">
                <a href="#/post/${post.slug}">
                    <h2>${post.title}</h2>
                    <p class="post-meta">${this.formatDate(post.date)}</p>
                    ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ''}
                </a>
            </li>
        `).join('');

        this.contentEl.innerHTML = `
            <h1>Latest Posts</h1>
            <ul class="post-list">
                ${postsHtml}
            </ul>
        `;
    },

    async renderPost(slug) {
        const post = CONFIG.posts.find(p => p.slug === slug);

        if (!post) {
            this.render404();
            return;
        }

        this.contentEl.innerHTML = '<div class="loading">Loading...</div>';

        try {
            const response = await fetch(`posts/${slug}.md`);
            if (!response.ok) throw new Error('Post not found');

            const markdown = await response.text();
            const html = marked.parse(markdown);

            this.contentEl.innerHTML = `
                <article>
                    <a href="#/" class="back-link">← Back to posts</a>
                    <h1>${post.title}</h1>
                    <p class="post-meta">${this.formatDate(post.date)}</p>
                    <div class="markdown-content">
                        ${html}
                    </div>
                </article>
            `;
        } catch (error) {
            this.contentEl.innerHTML = `
                <div class="error">
                    <h2>Error loading post</h2>
                    <p>Could not load the post. Make sure the file exists at posts/${slug}.md</p>
                    <a href="#/" class="back-link">← Back to posts</a>
                </div>
            `;
        }
    },

    async renderPage(pageName) {
        this.contentEl.innerHTML = '<div class="loading">Loading...</div>';

        try {
            const response = await fetch(`posts/${pageName}.md`);
            if (!response.ok) throw new Error('Page not found');

            const markdown = await response.text();
            const html = marked.parse(markdown);

            this.contentEl.innerHTML = `
                <article>
                    <div class="markdown-content">
                        ${html}
                    </div>
                </article>
            `;
        } catch (error) {
            this.render404();
        }
    },

    render404() {
        this.contentEl.innerHTML = `
            <div class="error">
                <h2>Page not found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <a href="#/" class="back-link">← Back to home</a>
            </div>
        `;
    },

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// Start the app
app.init();
