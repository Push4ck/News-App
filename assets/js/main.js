class NewsApp {
  constructor() {
    // API key and initial state
    this.API_KEY = "45f2d15614cd4a399dc9cdd4c3a684a9";
    this.currentPage = 1;
    this.currentCategory = null;
    this.currentKeyword = null;
    this.isLoading = false;
    this.moreNewsAvailable = true;
    this.newsContainer = document.getElementById("newsContainer");
    this.searchInput = document.getElementById("searchKeyword");
    this.categorySelect = document.getElementById("category");
    this.fetchCategoryButton = document.getElementById("fetchCategory");
    this.loadMoreButton = document.getElementById("loadMore");

    // Debouncing search input and throttling scroll event
    this.debouncedSearch = this.debounce(this.handleSearch.bind(this), 500);
    this.throttledScroll = this.throttle(this.handleScroll.bind(this), 500);

    // Initialize event listeners
    this.init();
  }

  // Initialization method
  init() {
    window.addEventListener("scroll", this.throttledScroll);
    this.searchInput.addEventListener("input", this.debouncedSearch);
    this.fetchCategoryButton.addEventListener(
      "click",
      this.handleFetchCategory.bind(this)
    );
    this.loadMoreButton.addEventListener(
      "click",
      this.handleLoadMore.bind(this)
    );
  }

  // Debounce function to delay search input handling
  debounce(func, timeout) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  // Throttle function to limit scroll event handling frequency
  throttle(func, delay) {
    let inThrottle = false;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), delay);
      }
    };
  }

  // Scroll event handler to fetch more news when scrolling to the bottom
  handleScroll() {
    if (!this.moreNewsAvailable || this.isLoading) return;
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 10
    ) {
      this.fetchNews(this.currentKeyword ? true : false);
    }
  }

  // Search input event handler to handle keyword search
  handleSearch() {
    this.currentPage = 1;
    this.currentCategory = null;
    this.currentKeyword = this.searchInput.value;
    this.moreNewsAvailable = true;
    this.fetchNews(true);
  }

  // Fetch category button click handler to fetch news by category
  handleFetchCategory() {
    this.currentPage = 1;
    this.currentKeyword = null;
    this.moreNewsAvailable = true;
    this.currentCategory = this.categorySelect.value;
    this.fetchNews(false);
  }

  // Load more button click handler to fetch more news
  handleLoadMore() {
    this.fetchNews(this.currentKeyword ? true : false);
  }

  // Fetch news from the API
  fetchNews(isSearching) {
    if (this.isLoading || !this.moreNewsAvailable) return;

    this.isLoading = true;
    let url;
    if (isSearching) {
      // Construct URL for keyword search
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        this.currentKeyword
      )}&apiKey=${this.API_KEY}&page=${this.currentPage}`;
    } else {
      // Construct URL for category fetch
      const category = this.currentCategory || this.categorySelect.value;
      url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${this.API_KEY}&page=${this.currentPage}`;
    }

    // Fetch news data from the API
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Handle fetched news articles
        if (this.currentPage === 1) {
          this.newsContainer.innerHTML = "";
        }

        const articlesWithImage = data.articles.filter(
          (article) => article.urlToImage
        );

        if (articlesWithImage.length === 0) {
          this.moreNewsAvailable = false;
          this.displayNoMoreNews();
          return;
        }

        this.lastArticleCount = articlesWithImage.length;

        const fragment = document.createDocumentFragment();
        articlesWithImage.forEach((article) => {
          const newsItem = document.createElement("div");
          newsItem.classList.add("newsItem");
          newsItem.innerHTML = `
            <div class="newsImage">
                <img src="${article.urlToImage}" alt="${article.title}">
            </div>
            <div class="newsContent">
                <div class="info">
                    <h5>${article.source.name}</h5>
                    <span>|</span>
                    <time datetime="${article.publishedAt}">${new Date(
            article.publishedAt
          ).toDateString()}</time>
                </div>
                <h2>${article.title}</h2>
                <p>${article.description}</p>
                <a href="${article.url}" target="_blank">Read More</a>
            </div>`;
          fragment.appendChild(newsItem);
        });

        this.newsContainer.appendChild(fragment);

        this.currentPage++;
        this.isLoading = false;
      })
      .catch((error) => {
        // Handle fetch errors
        console.log("There was an error fetching the news:", error.message);
        this.isLoading = false;
      });
  }

  // Display message when no more news is available
  displayNoMoreNews() {
    const noMoreNews = document.createElement("p");
    noMoreNews.textContent = "No more news to load.";
    this.newsContainer.appendChild(noMoreNews);
  }
}

// Initialize the NewsApp instance
const newsApp = new NewsApp();
