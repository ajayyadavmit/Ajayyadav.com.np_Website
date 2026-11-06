# Ajay Yadav website template

A clean, responsive white-background portfolio site with shared header/footer files, reusable CSS, and a small JavaScript file. It is designed for GitHub Pages or another static web host.

## 1. Preview locally

Because the header and footer are loaded with JavaScript `fetch()`, do not open `index.html` directly using a `file://` URL. Run a local web server from this folder instead. If Python is installed:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

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

## Important notes

- This package is a starter template, not a verified copy of every paragraph from your existing website. Transfer any original content you want to preserve into the corresponding pages before replacing the live site.
- The experience page uses concise draft summaries. Verify dates and wording against your CV and supporting records.
- The social links are generic placeholders. Replace them with your actual profile URLs.
- A working contact form requires a real Google Forms embed URL.
