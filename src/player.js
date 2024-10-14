const { ipcRenderer } = require('electron');
const ContentManager = require('./content-manager');
const Database = require('./database');

class Player {
    constructor() {
        this.contentManager = new ContentManager();
        this.db = new Database();
        this.currentContent = null;
        this.nextContent = null;
        this.currentContainer = document.getElementById('current-content');
        this.nextContainer = document.getElementById('next-content');
        
        this.init();
    }

    async init() {
        await this.contentManager.fetchContent();
        this.playNextContent();
        this.startContentUpdateInterval();
    }

    async playNextContent() {
        this.currentContent = this.nextContent || await this.contentManager.getNextContent();
        this.nextContent = await this.contentManager.getNextContent();

        this.displayContent(this.currentContent, this.currentContainer);
        this.preloadContent(this.nextContent, this.nextContainer);

        setTimeout(() => this.transitionToNextContent(), this.currentContent.length);
    }

    displayContent(content, container) {
        container.innerHTML = '';
        if (content.type === 'image') {
            const img = document.createElement('img');
            img.src = content.url;
            img.style.objectFit = content.fill_screen ? 'fill' : 'contain';
            container.appendChild(img);
        } else if (content.type === 'video') {
            const video = document.createElement('video');
            video.src = content.url;
            video.autoplay = true;
            video.muted = true;
            video.style.objectFit = content.fill_screen ? 'fill' : 'contain';
            container.appendChild(video);
        }
    }

    preloadContent(content, container) {
        // Similar to displayContent, but for preloading
        // ...
    }

    transitionToNextContent() {
        // Swap current and next containers
        [this.currentContainer, this.nextContainer] = [this.nextContainer, this.currentContainer];
        this.playNextContent();
    }

    startContentUpdateInterval() {
        setInterval(async () => {
            const updated = await this.contentManager.fetchContent();
            if (updated) {
                // Content has changed, restart playback
                this.playNextContent();
            }
        }, 10000); // Check every 10 seconds
    }
}

const player = new Player();