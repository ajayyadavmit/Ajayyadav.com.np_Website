# Ajay Yadav website template

A clean, responsive white-background portfolio site with shared header/footer files, reusable CSS, and a small JavaScript file. It is designed for GitHub Pages or another static web host.

## 2. Personalise before publishing

1. Replace `assets/images/profile.jpg` with your real professional photograph. Keep the same filename or update its `src` in `index.html`.
2. Replace the other three JPG placeholder images with your own photographs or licensed images.
3. Update the LinkedIn, Medium, and YouTube URLs in `partials/header.html` and `partials/footer.html`.
4. In `contact.html`, replace `YOUR_EMAIL@example.com` with the email address you want to publish.
5. Replace `YOUR_GOOGLE_FORM_EMBED_URL` with your Google Forms embed URL. Ensure the form is set to accept responses from the people you want to contact.
6. Check all professional dates, role names, and descriptions in `experience.html` before publishing.
7. Add any other documents to `assets/documents/` and link to them from the relevant page.

## 3. Shared header and footer

Each HTML page contains these placeholders:

```html
<div id="site-header"></div>
...
<div id="site-footer"></div>
```

The script in `assets/js/main.js` loads `partials/header.html` and `partials/footer.html`. Edit those files once to update navigation or footer content across the site.

## 4. Add a new page

Copy an existing page, change its `<title>`, description, and `<main>` content, then add a link to it in `partials/header.html` and/or `partials/footer.html`. Keep asset paths relative, such as `assets/css/style.css`.

## 5. Publish on GitHub Pages

Upload the contents of this folder to your repository, keeping the folder structure intact. In GitHub, open **Settings → Pages** and select the correct branch and folder. Test the deployed website and every link after publishing.


# GitHUB ACTIONS >> WOrkflows 

GitHub repository should look like this:
Your website repository

 1. index.html >> about.html. >>> services.html. >> youtube-videos.json (Auto-generated)

 2. assets/.  >>. js/ >> content-feeds.js

3.a.  .github/. >> scripts/. >> fetch_youtube.py

3.b.  .github/.  >> workflows/  >>  update-youtube.yml

The generated JSON must be in the same website root as index.html. The Python script and workflow live in the .github folder.

# 5. Activate and test GitHub Actions
Follow these steps:
1. Push all three new/updated files to your GitHub repository.
2. Open your repository on GitHub.
3. Select the Actions tab.
4. Find Update YouTube Videos in the workflow list.
5. Open it and select Run workflow.
6. Wait for the workflow to finish successfully.
7. Return to the repository's main Code tab.
You should now see youtube-videos.json in the root directory. Open it and check that it contains your video titles, links and thumbnails.

# GitHub Actions turns your repository into a small automation server.
Your website can remain a static HTML, CSS and JavaScript site hosted by GitHub Pages, while GitHub Actions runs Python, Node.js, shell commands and other tasks separately.
1. Why is the folder named .github/workflows?
Yes, .github/workflows is GitHub's required directory convention for workflow files.
- .github/ is a special directory for GitHub-specific configuration and resources.
- workflows/ contains the automation definitions.
- Each workflow is normally a .yml or .yaml file.
- GitHub automatically detects these files and makes the workflows available under the repository's Actions tab.

Folder/file	>> Purpose
.github/workflows/. >>	    Tells GitHub when and how to run an automation
.github/scripts/	>>      Stores the Python or other scripts that the workflow executes
assets/	            >>      Stores files used by your website
youtube-videos.json	  >> Stores the generated data consumed by your website

The workflow YAML is the instruction manual. The Python file does the actual work.
## 2. How does GitHub Actions work internally?
Think of it as two separate environments:

A. Your website environment
GitHub Pages

Serves HTML, CSS, JavaScript, images and JSON to website visitors.

B. Your automation environment
GitHub Actions runner

A temporary virtual machine starts when a workflow is triggered.
1. Checks out your repository.
2. Sets up Python or another runtime.
3. Runs your script.
4. Creates or updates files, such as youtube-videos.json.
5. Can commit the updated file back to your repository.

Website receives the updated JSON

Visitors see the new video list when the page loads.

## 6. What triggers a GitHub Action?
A workflow can run in several ways:
Trigger	When it runs
schedule	At a specified time, such as every six hours
push	When you push changes to GitHub
pull_request	When someone creates or updates a pull request
workflow_dispatch	When you manually click Run workflow
release	When a new GitHub release is published
issues	When an issue is opened, edited or closed

You can combine multiple triggers in one workflow.

# 4. Common automation scenarios

## Use case	>> What the workflow does	>> Example
1. Automatic content updates	>> Fetches information and updates website data	>> Refresh YouTube videos every 6 hours
2. Website testing	>> Checks HTML, CSS and JavaScript for errors	>> Detect broken HTML before publishing
3. Automatic deployment	>> 	Deploy a website when you push to GitHub
4. Broken link checking	>> Scans pages for invalid links	>> Find broken links across your website
5. Image optimisation	>> Compresses images automatically	>> Reduce website loading time
6. Data processing   >> 	Runs Python scripts on datasets	>> Clean survey data and generate summary files
7. Report generation	>> Creates reports on a schedule  >>	Generate a monthly activity report
8. Document generation. >>	Creates PDFs or other documents
9. Security checking	>> Scans code and dependencies for vulnerabilities	
10. Scheduled backups	>> 	Back up website content or configuration
12. Notifications	>> Sends alerts when a workflow fails or a deployment completes

