import os
import argparse
from lib import vtt_to_srt, safe_file_name
from downloader import M3u8Downloader
import cloudscraper
from bs4 import BeautifulSoup

scraper = cloudscraper.create_scraper()
isForce = False

def getProtected(url: str):
  return scraper.get(url, headers={"referer": "https://mobikf.ncctvgroup.com/"})

def downloadm3u8(src: str, o:str):
  print("[-] downloading m3u8 to " + o)
  if os.path.exists(o) and not isForce:
    print("[-] pass (file exists)")
    return
  M3u8Downloader(src, o).start()

def downloadmp4(src: str, o: str):
  print("[-] downloading mp4 to " + o)
  if os.path.exists(o) and not isForce:
    print("[-] pass (file exists)")
    return
  r = getProtected(src)
  with open(o, "wb") as f:
    f.write(r.content)

def downloadTrack(src: str, o: str):
  print("[-] downloading track to " + o)
  if os.path.exists(o) and not isForce:
    print("[-] pass (file exists)")
    return
  r = getProtected(src)
  with open(o, "wb") as f:
    f.write(bytes(vtt_to_srt(r.text), encoding="utf-8"))

def download(url: str, outdir="./"):
  res = getProtected(url)
  soup = BeautifulSoup(res.text, 'html.parser')

  frame = soup.select_one(".myWrapper > iframe")
  epList = soup.select("ul > a")

  if frame != None:
    title = soup.select_one("title").text.strip();
    frameSrcs = map(lambda x: x['value'], soup.select(".switcher > option"))
    for frameSrc in frameSrcs:
      try:
        frameRes = getProtected(frameSrc)
        frameSoup = BeautifulSoup(frameRes.text, 'html.parser')
        src = frameSoup.select_one("video > source")['src']
        trackSrc = "https://kfani.me" + frameSoup.select_one("video > track")['src']
        mimetype = frameSoup.select_one("video > source")['type']
        ext = "ts"
        if mimetype == "video/mp4":
          ext = "mp4" 
        
        videoPath = os.path.join(outdir, f"{title}.mp4")
        trackPath = os.path.join(outdir, f"{title}.srt")

        downloadTrack(trackSrc, trackPath)
        if ext == "ts":
          downloadm3u8(src, videoPath)
        elif ext == "mp4":
          downloadmp4(src, videoPath)
      except:
        print(f"Error on {frameSrc}")
      
  elif len(epList) != 0:
    title = soup.select_one("title").text.strip()
    safe_title = safe_file_name(title) + "/"
    dir_path = os.path.join(outdir, safe_title)
    if not os.path.exists(dir_path):
      os.makedirs(dir_path)

    epList.reverse()
    for ep in epList:
      url = ep["href"]
      name = ep.text
      print(f"[-] downloading {name}")
      download(url, dir_path)

def search(query: str):
  global isForce
  url = "https://linkkf.app/?s=" + query
  res = getProtected(url)
  soup = BeautifulSoup(res.text, 'html.parser')

  items = soup.select(".item")
  print("--- 검색 결과 ---")
  for item in items:
    title = item.select_one("span > strong").text.strip()
    url = item.select_one("a")['href']
    print(f"{url}: {title}")

def main():
  parser = argparse.ArgumentParser(description="search, download anime from linkkf.app")
  parser.add_argument('--search', type=str)
  parser.add_argument('--url', type=str)
  parser.add_argument('--dest', type=str, default="./")
  parser.add_argument('--force', action=argparse.BooleanOptionalAction)

  args = parser.parse_args()
  if args.url:
    download(args.url, args.dest)
  elif args.search:
    search(args.search)

if __name__ == "__main__":
  main()
