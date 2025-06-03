document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables ---
    let allArticles = []; // Array to store all loaded articles

    // --- Get References to HTML Elements (DOM Manipulations) ---
    const articlesContainer = document.getElementById('articles-container');
    const mostPopularArticleContainer = document.getElementById('most-popular-article-container');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sortDropdownItems = document.querySelectorAll('.dropdown-item');
    const searchInput = document.getElementById('search-input');

    // --- References for Modal Window Elements ---
    // Создаем экземпляр модального окна Bootstrap
    const articleModal = new bootstrap.Modal(document.getElementById('articleModal'));
    const modalTitle = document.getElementById('articleModalLabel');
    const modalCategoryDate = document.getElementById('modal-category-date');
    const modalContent = document.getElementById('modal-content');
    const modalViews = document.getElementById('modal-views');
    const modalWordCount = document.getElementById('modal-word-count');

    // --- Theme Initialization on Page Load ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        if (savedTheme === 'dark-mode') {
            document.querySelector('#theme-toggle .light-text').classList.add('d-none');
            document.querySelector('#theme-toggle .dark-text').classList.remove('d-none');
        } else {
            document.querySelector('#theme-toggle .light-text').classList.remove('d-none');
            document.querySelector('#theme-toggle .dark-text').classList.add('d-none');
        }
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light-mode');
        document.querySelector('#theme-toggle .light-text').classList.remove('d-none');
        document.querySelector('#theme-toggle .dark-text').classList.add('d-none');
    }

    // --- Functions ---

    // 1. Load article data from JSON file
    async function loadArticles() {
        try {
            const response = await fetch('news.json');
            // Assuming news.json is an array of objects directly (as you confirmed last time)
            allArticles = await response.json(); 
            
            displayArticles(allArticles);
            updateMostPopularArticle(allArticles);
        } catch (error) {
            console.error('Error loading news:', error);
            articlesContainer.innerHTML = '<p class="text-danger">Failed to load news. Please try again later.</p>';
        }
    }

    // 2. Display articles dynamically
    function displayArticles(articlesToDisplay) {
        articlesContainer.innerHTML = ''; // Clear container

        if (articlesToDisplay.length === 0) {
            articlesContainer.innerHTML = '<p class="col-12 text-center text-muted">No articles found matching your search.</p>';
            return;
        }

        articlesToDisplay.forEach(article => {
            const readingTime = Math.ceil(article.wordCount / 200);

            const articleCard = document.createElement('div');
            articleCard.className = 'col-md-6 mb-4';

            // IMPORTANT: Corrected the template literal syntax and attributes for the "Read More" button
            articleCard.innerHTML = `
                <div class="card h-100 article-item" data-id="${article.id}">
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${article.category} - ${article.date}</h6>
                        <p class="card-text">${article.content.substring(0, 100)}...</p>
                        <p class="card-text small text-muted">
                            Views: <span class="article-views">${article.views}</span> | Reading time: ${readingTime} min
                        </p>
                        <button type="button" class="btn btn-primary btn-sm mt-2" 
                                data-bs-toggle="modal" data-bs-target="#articleModal" data-article-id="${article.id}">
                            Read More
                        </button>
                    </div>
                </div>
            `;
            articlesContainer.appendChild(articleCard);

            // Add click listener to the entire card (excluding the button click that opens modal)
            // This is primarily for incrementing views when clicking anywhere else on the card
            const currentArticleCard = articleCard.querySelector('.article-item');
            currentArticleCard.addEventListener('click', (event) => {
                // Check if the click originated from the "Read More" button itself
                // If so, let Bootstrap handle the modal, and don't increment views here
                if (event.target.tagName === 'BUTTON' && event.target.hasAttribute('data-bs-toggle')) {
                    return; // Do nothing if the button was clicked
                }

                // If not the button, increment views
                const clickedArticle = allArticles.find(a => a.id === article.id);
                if (clickedArticle) {
                    clickedArticle.views++;
                    currentArticleCard.querySelector('.article-views').textContent = clickedArticle.views;
                    updateMostPopularArticle(allArticles);
                }
            });
        });
    }

    // 3. Update the "Most Popular Article" section
    function updateMostPopularArticle(articlesArray) {
        if (articlesArray.length === 0) {
            mostPopularArticleContainer.innerHTML = '<p class="text-muted">No articles to display.</p>';
            return;
        }

        const mostPopular = articlesArray.reduce((prev, current) =>
            (prev.views > current.views) ? prev : current
        );

        if (mostPopular) {
            mostPopularArticleContainer.innerHTML = `
                <h6>${mostPopular.title}</h6>
                <p class="small text-muted">${mostPopular.category} - ${mostPopular.date}</p>
                <p>${mostPopular.content.substring(0, 120)}...</p>
                <p class="small text-muted">Views: ${mostPopular.views}</p>
            `;
        }
    }

    // 4. Sort Articles
    function sortArticles(sortBy) {
        const articlesToSort = [...allArticles];

        if (sortBy === 'date') {
            articlesToSort.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortBy === 'views') {
            articlesToSort.sort((a, b) => b.views - a.views);
        }
        displayArticles(articlesToSort);
    }

    // 5. Filter Articles (Search functionality)
    function filterArticles() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filtered = [];

        if (searchTerm === '') {
            filtered = allArticles;
        } else {
            filtered = allArticles.filter(article =>
                article.title.toLowerCase().includes(searchTerm) ||
                article.content.toLowerCase().includes(searchTerm)
            );
        }
        displayArticles(filtered);
    }

    // --- Event Listeners ---

    // Event Listener for Theme Toggle Button
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (isDarkMode) {
            localStorage.setItem('theme', 'dark-mode');
            document.querySelector('#theme-toggle .light-text').classList.add('d-none');
            document.querySelector('#theme-toggle .dark-text').classList.remove('d-none');
        } else {
            localStorage.setItem('theme', 'light-mode');
            document.querySelector('#theme-toggle .light-text').classList.remove('d-none');
            document.querySelector('#theme-toggle .dark-text').classList.add('d-none');
        }
    });

    // Event Listeners for Sorting Dropdown items
    sortDropdownItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const sortBy = event.target.dataset.sort;
            sortArticles(sortBy);
        });
    });

    // Event Listener for Search Input
    searchInput.addEventListener('input', filterArticles);

    // --- NEW: Event Listener for when the modal is about to be shown ---
    // This allows us to fill the modal with the correct article data
    document.getElementById('articleModal').addEventListener('show.bs.modal', (event) => {
        // Button that triggered the modal
        const button = event.relatedTarget; 
        // Extract info from data-article-id attributes
        const articleId = parseInt(button.dataset.articleId); 
        
        // Find the article in our allArticles array
        const article = allArticles.find(a => a.id === articleId);

        if (article) {
            // Fill the modal with the article's data
            modalTitle.textContent = article.title;
            modalCategoryDate.textContent = `${article.category} - ${article.date}`;
            modalContent.textContent = article.content; // Display full content here
            modalViews.textContent = article.views;
            modalWordCount.textContent = article.wordCount;
        }
    });

    // --- Initial Load ---
    loadArticles(); // Call loadArticles when the page first loads to populate the dashboard
});