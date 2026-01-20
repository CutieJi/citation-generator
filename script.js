document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const styleButtons = document.querySelectorAll('.style-btn');
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const citationOutput = document.getElementById('citation-output');
    
    // Current state
    let currentStyle = 'apa';
    let currentTab = 'book';
    
    // Initialize the app
    init();
    
    function init() {
        // Set up event listeners
        setupEventListeners();
        
        // Check for preferred theme
        const preferredTheme = localStorage.getItem('theme') || 'light';
        setTheme(preferredTheme);
    }
    
    function setupEventListeners() {
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);
        
        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });
        
        // Style selection
        styleButtons.forEach(btn => {
            btn.addEventListener('click', () => selectStyle(btn.dataset.style));
        });
        
        // Form actions
        generateBtn.addEventListener('click', generateCitation);
        clearBtn.addEventListener('click', clearForm);
        copyBtn.addEventListener('click', copyCitation);
    }
    
    // Theme functions
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update theme toggle icon
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Tab functions
    function switchTab(tabId) {
        // Update active tab
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        
        // Show corresponding content
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });
        
        currentTab = tabId;
    }
    
    // Style functions
    function selectStyle(style) {
        styleButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === style);
        });
        
        currentStyle = style;
        
        // If there's already a citation, regenerate it with new style
        if (citationOutput.textContent !== 'Fill out the form and click "Generate Citation" to see your formatted citation here.') {
            generateCitation();
        }
    }
    
    // Citation generation
    function generateCitation() {
        let citation = '';
        
        switch(currentTab) {
            case 'book':
                citation = generateBookCitation();
                break;
            case 'website':
                citation = generateWebsiteCitation();
                break;
        }
        
        if (citation) {
            citationOutput.innerHTML = `<strong>${currentStyle.toUpperCase()} Citation:</strong><br>${citation}`;
        }
    }
    
    function generateBookCitation() {
        const author = document.getElementById('author').value.trim();
        const title = document.getElementById('title').value.trim();
        const publisher = document.getElementById('publisher').value.trim();
        const year = document.getElementById('year').value.trim();
        
        // Basic validation
        if (!author || !title || !publisher || !year) {
            alert('Please fill in all required fields (Author, Title, Publisher, Year)');
            return '';
        }
        
        // Process authors
        const authors = processAuthors(author);
        
        switch(currentStyle) {
            case 'apa':
                return `${authors} (${year}). <i>${title}</i>. ${publisher}.`;
            case 'mla':
                return `${authors}. <i>${title}</i>, ${publisher}, ${year}.`;
            case 'chicago':
                return `${authors}. ${year}. <i>${title}</i>. ${publisher}.`;
            default:
                return '';
        }
    }
    
    function generateWebsiteCitation() {
        const author = document.getElementById('web-author').value.trim();
        const title = document.getElementById('web-title').value.trim();
        const siteName = document.getElementById('site-name').value.trim();
        const url = document.getElementById('url').value.trim();
        const accessDate = document.getElementById('access-date').value;
        
        if (!title || !siteName || !url || !accessDate) {
            alert('Please fill in all required fields (Title, Website Name, URL, Access Date)');
            return '';
        }
        
        // Format date
        const formattedAccessDate = formatDate(accessDate, currentStyle);
        
        // Process authors if available
        const authors = author ? processAuthors(author) + '.' : '';
        
        switch(currentStyle) {
            case 'apa':
                return `${authors} (n.d.). ${title}. <i>${siteName}</i>. Retrieved ${formattedAccessDate}, from ${url}`;
            case 'mla':
                return `${authors} "${title}." <i>${siteName}</i>, n.d., ${url}. Accessed ${formattedAccessDate}.`;
            case 'chicago':
                return `${authors} "${title}." ${siteName}. ${url} (accessed ${formattedAccessDate}).`;
            default:
                return '';
        }
    }
    
    // Helper functions
    function processAuthors(authorStr) {
        const authors = authorStr.split(',').map(a => a.trim());
        
        if (authors.length === 0) return '';
        if (authors.length === 1) return authors[0];
        
        switch(currentStyle) {
            case 'apa':
                if (authors.length <= 20) {
                    return authors.slice(0, -1).join(', ') + ' & ' + authors.slice(-1);
                } else {
                    return authors[0] + ' et al.';
                }
            case 'mla':
                if (authors.length <= 2) {
                    return authors.join(' and ');
                } else {
                    return authors[0] + ' et al.';
                }
            case 'chicago':
                if (authors.length <= 10) {
                    return authors.slice(0, -1).join(', ') + ', and ' + authors.slice(-1);
                } else {
                    return authors[0] + ' et al.';
                }
            default:
                return authors.join(', ');
        }
    }
    
    function formatDate(dateStr, style) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        switch(style) {
            case 'apa':
                return `${monthToString(month)} ${day}, ${year}`;
            case 'mla':
                return `${day} ${monthToString(month, true)} ${year}`;
            case 'chicago':
                return `${monthToString(month)} ${day}, ${year}`;
            default:
                return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
    }
    
    function monthToString(month, short = false) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const shortMonths = [
            'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June',
            'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'
        ];
        
        return short ? shortMonths[month - 1] : months[month - 1];
    }
    
    // Form functions
    function clearForm() {
        const activeForm = document.querySelector(`#${currentTab}-tab form`);
        if (activeForm) {
            activeForm.reset();
        }
        citationOutput.textContent = 'Fill out the form and click "Generate Citation" to see your formatted citation here.';
    }
    
    function copyCitation() {
        if (!citationOutput.textContent.includes('formatted citation here')) {
            navigator.clipboard.writeText(citationOutput.textContent)
                .then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy citation: ', err);
                });
        }
    }
});