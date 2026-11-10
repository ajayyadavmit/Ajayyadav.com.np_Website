
/* =========================================
   MEDIUM AND YOUTUBE AUTOMATIC FEEDS
   ========================================= */

(() => {
  "use strict";

  const CONFIG = {
    mediumFeed:
      "https://medium.com/feed/@ajayyadav.mit",

    // Replace this with your actual YouTube Channel ID
    youtubeFeed:
      "https://www.youtube.com/feeds/videos.xml?channel_id=UCMrQQHEJe9BBmCwq29rcLVg",

    mediumCount: 4,
    youtubeCount: 5
  };

  const CORS_PROXY = "https://proxy.cors.dev/";

  // -----------------------------------------
  // FETCH AND PARSE RSS / ATOM FEEDS
  // -----------------------------------------

  async function fetchFeed(feedUrl) {
    const response = await fetch(CORS_PROXY + feedUrl, {
      credentials: "omit"
    });

    if (!response.ok) {
      const reason = response.headers.get("X-Cors-Error");
      throw new Error(reason || `Feed request failed: ${response.status}`);
    }

    const xml = new DOMParser().parseFromString(
      await response.text(),
      "application/xml"
    );

    if (xml.querySelector("parsererror")) {
      throw new Error("Invalid RSS or Atom feed.");
    }

    return xml;
  }

  // Read direct child text by XML local name
  function childText(element, name) {
    const child = Array.from(element.children).find(
      item => item.localName === name
    );

    return child?.textContent.trim() || "";
  }

  // Read a matching element anywhere inside an entry
  function descendantText(element, name) {
    const child = Array.from(
      element.getElementsByTagName("*")
    ).find(item => item.localName === name);

    return child?.textContent.trim() || "";
  }

  // Get article or video URL
  function getEntryLink(entry) {
    const links = Array.from(entry.getElementsByTagName("link"));

    const alternate = links.find(
      link => link.getAttribute("rel") === "alternate"
    );

    const selected = alternate || links[0];

    return (
      selected?.getAttribute("href") ||
      selected?.textContent.trim() ||
      ""
    );
  }

  // Extract plain text from HTML safely
  function plainText(html) {
    const parsed = new DOMParser().parseFromString(
      html || "",
      "text/html"
    );

    return parsed.body.textContent.replace(/\s+/g, " ").trim();
  }

  // Extract the first available article image
  function getArticleImage(html) {
    const parsed = new DOMParser().parseFromString(
      html || "",
      "text/html"
    );

    const image = parsed.querySelector("img[src]");
    const imageUrl = image?.getAttribute("src") || "";

    return /^https:\/\//i.test(imageUrl) ? imageUrl : "";
  }

  // Format publication date
  function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  // -----------------------------------------
  // CREATE FEED ELEMENTS
  // -----------------------------------------

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text) element.textContent = text;

    return element;
  }

  function createSafeLink(url, title) {
    try {
      const parsedUrl = new URL(url);

      if (!["https:", "http:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid link");
      }

      const link = createElement("a", "feed-entry-title", title);
      link.href = parsedUrl.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      return link;
    } catch {
      return createElement("span", "feed-entry-title", title);
    }
  }

  function createThumbnail(url, alt) {
    if (!url) return null;

    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.protocol !== "https:") return null;

      const image = document.createElement("img");
      image.src = parsedUrl.href;
      image.alt = alt;
      image.loading = "lazy";
      image.className = "feed-entry-image";

      return image;
    } catch {
      return null;
    }
  }

  function createFeedEntry(item, type) {
    const article = createElement("article", "feed-entry");

    const image = createThumbnail(item.image, item.title);

    if (image) {
      article.appendChild(image);
    }

    const content = createElement("div", "feed-entry-content");

    const title = createSafeLink(item.link, item.title);
    content.appendChild(title);

    if (item.date) {
      const date = createElement(
        "time",
        "feed-entry-date",
        formatDate(item.date)
      );

      const parsedDate = new Date(item.date);

      if (!Number.isNaN(parsedDate.getTime())) {
        date.dateTime = parsedDate.toISOString();
      }

      content.appendChild(date);
    }

    if (type === "medium" && item.summary) {
      const summary = createElement(
        "p",
        "feed-entry-summary",
        item.summary.length > 135
          ? item.summary.slice(0, 132) + "..."
          : item.summary
      );

      content.appendChild(summary);
    }

    article.appendChild(content);

    return article;
  }

  // -----------------------------------------
  // LOAD MEDIUM ARTICLES
  // -----------------------------------------

  async function loadMedium() {
    const container = document.getElementById("medium-feed");

    if (!container) return;

    try {
      const xml = await fetchFeed(CONFIG.mediumFeed);
      const entries = Array.from(xml.querySelectorAll("item"));

      const articles = entries.slice(0, CONFIG.mediumCount).map(item => {
        const html =
          childText(item, "encoded") ||
          childText(item, "description");

        const title = childText(item, "title");

        return {
          title,
          link: childText(item, "link"),
          date: childText(item, "pubDate"),
          summary: plainText(html),
          image: getArticleImage(html)
        };
      }).filter(item => item.title && item.link);

      container.replaceChildren();

      if (!articles.length) {
        container.appendChild(
          createElement("p", "feed-message", "No articles found.")
        );
        return;
      }

      articles.forEach(article => {
        container.appendChild(
          createFeedEntry(article, "medium")
        );
      });

    } catch (error) {
      console.error("Medium feed error:", error);

      container.replaceChildren(
        createElement(
          "p",
          "feed-message",
          "Articles could not be loaded. Please visit Medium."
        )
      );
    }
  }

  // -----------------------------------------
  // LOAD YOUTUBE VIDEOS from RSS 
  // -----------------------------------------

// async function loadYouTube() {
//   const container = document.getElementById("youtube-feed");

//   if (!container) return;

//   const feedUrl =
//     "https://www.youtube.com/feeds/videos.xml?channel_id=UCMrQQHEJe9BBmCwq29rcLVg";

//   const proxyUrl = "https://proxy.cors.dev/" + feedUrl;

//   try {
//     const response = await fetch(proxyUrl);

//     if (!response.ok) {
//       throw new Error(`Feed request failed: ${response.status}`);
//     }

//     const xmlText = await response.text();

//     const parser = new DOMParser();
//     const xml = parser.parseFromString(xmlText, "application/xml");

//     if (xml.querySelector("parsererror")) {
//       throw new Error("The YouTube feed could not be parsed as XML.");
//     }

//     // Read Atom entries, including namespaced YouTube elements.
//     const entries = Array.from(
//       xml.getElementsByTagNameNS("*", "entry")
//     );

//     console.log("YouTube entries found:", entries.length);

//     const getText = (element, tag) => {
//       return element
//         .getElementsByTagNameNS("*", tag)[0]
//         ?.textContent.trim() || "";
//     };

//     const videos = entries.slice(0, CONFIG.youtubeCount).map(entry => {
//       const videoId = getText(entry, "videoId");
//       const title = getText(entry, "title");
//       const date = getText(entry, "published");

//       const linkElement = Array.from(
//         entry.getElementsByTagNameNS("*", "link")
//       ).find(link => link.getAttribute("rel") === "alternate");

//       const link = linkElement?.getAttribute("href") ||
//         `https://www.youtube.com/watch?v=${videoId}`;

//       return {
//         title,
//         date,
//         link,
//         image: videoId
//           ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
//           : ""
//       };
//     }).filter(video => video.title && video.link);

//     console.log("YouTube videos:", videos);

//     container.replaceChildren();

//     if (videos.length === 0) {
//       container.textContent = "No YouTube videos were found.";
//       return;
//     }

//     videos.forEach(video => {
//       container.appendChild(createFeedEntry(video, "youtube"));
//     });

//   } catch (error) {
//     console.error("YouTube feed error:", error);

//     container.textContent =
//       "YouTube videos could not be loaded. Please visit the YouTube channel.";

//   }
// }




// -----------------------------------------
// LOAD YOUTUBE VIDEOS FROM LOCAL JSON
// -----------------------------------------

async function loadYouTube() {

  const container = document.getElementById("youtube-feed");

  if (!container) return;

  try {

    console.log("Loading YouTube videos from local JSON...");

    // Avoid using an outdated browser-cached JSON file
    const response = await fetch(
      `youtube-videos.json?v=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`JSON request failed: HTTP ${response.status}`);
    }

    const data = await response.json();

    const videos = (data.videos || [])
      .slice(0, CONFIG.youtubeCount || 13)
      .map(video => ({
        title: video.title,
        date: video.published,
        link: video.link,
        image: video.thumbnail
      }));

    console.log("YouTube videos loaded:", videos.length);
    console.log("Feed last updated:", data.updatedAt);

    container.replaceChildren();

    if (!videos.length) {
      container.textContent = "No YouTube videos are currently available.";
      return;
    }

    videos.forEach(video => {
      container.appendChild(
        createFeedEntry(video, "youtube")
      );
    });

  } catch (error) {

    console.error("YouTube JSON feed error:", error);

    container.textContent =
      "Recent videos are temporarily unavailable. Please visit my YouTube channel.";

  }
}





  // -----------------------------------------
  // INITIALISE BOTH FEEDS
  // -----------------------------------------

  function initialiseFeeds() {
    loadMedium();
    loadYouTube();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseFeeds);
  } else {
    initialiseFeeds();
  }

})();
