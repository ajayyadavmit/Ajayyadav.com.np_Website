
import json
import time
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime, timezone

# -----------------------------------------
# CONFIGURATION
# -----------------------------------------

CHANNEL_ID = "UCMrQQHEJe9BBmCwq29rcLVg"

MAX_VIDEOS = 13

FEED_URL = (
    "https://www.youtube.com/feeds/videos.xml"
    f"?channel_id={CHANNEL_ID}"
)

OUTPUT_FILE = Path("youtube-videos.json")

# -----------------------------------------
# FETCH YOUTUBE FEED
# -----------------------------------------

def fetch_feed():

    request = urllib.request.Request(
        FEED_URL,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; AjayWebsiteFeed/1.0)"
        }
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def extract_videos(xml_data):

    root = ET.fromstring(xml_data)

    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
        "media": "http://search.yahoo.com/mrss/"
    }

    videos = []

    for entry in root.findall("atom:entry", ns):

        video_id = entry.findtext("yt:videoId", default="", namespaces=ns)
        title = entry.findtext("atom:title", default="", namespaces=ns)
        published = entry.findtext("atom:published", default="", namespaces=ns)

        if not video_id or not title:
            continue

        link = f"https://www.youtube.com/watch?v={video_id}"

        thumbnail = (
            f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        )

        videos.append({
            "id": video_id,
            "title": title,
            "published": published,
            "link": link,
            "thumbnail": thumbnail
        })

        if len(videos) >= MAX_VIDEOS:
            break

    return videos


# -----------------------------------------
# SAVE JSON
# -----------------------------------------

def save_json(videos):

    data = {
        "channelId": CHANNEL_ID,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "count": len(videos),
        "videos": videos
    }

    temporary_file = OUTPUT_FILE.with_suffix(".tmp")

    temporary_file.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    temporary_file.replace(OUTPUT_FILE)

    print(f"Successfully saved {len(videos)} YouTube videos.")


# -----------------------------------------
# MAIN
# -----------------------------------------

def main():

    for attempt in range(1, 4):

        try:

            print(f"Fetching YouTube feed. Attempt {attempt}/3")

            xml_data = fetch_feed()
            videos = extract_videos(xml_data)

            if not videos:
                raise ValueError("No valid videos found in YouTube feed.")

            save_json(videos)
            return

        except Exception as error:

            print(f"Attempt {attempt} failed: {error}")

            if attempt < 3:
                time.sleep(attempt * 10)

    # Do not overwrite the last successful JSON file.
    raise RuntimeError(
        "YouTube feed could not be updated after 3 attempts."
    )


if __name__ == "__main__":
    main()
