import axios from "axios";
import * as cheerio from "cheerio";
import { getProtected } from "./lib";

export interface EpisodeData {
  title: string;
  url: string;
  video: Video;
  type: EpisodeType;
}

export enum EpisodeType {
  M3U8 = "M3U8",
  MP4 = "MP4",
}

export class Episode {
  title: string;
  url: string;

  constructor(title: string, url: string) {
    this.title = title;
    this.url = url;
  }

  async get(): Promise<EpisodeData> {
    const res = await axios.get(this.url);
    const $ = cheerio.load(res.data);
    const frameUrl = $(".switcher > option").attr("value");
    const frameRes = await getProtected(frameUrl);
    const frame = cheerio.load(frameRes.data);
    const videoUrl = frame("video > source").attr("src");
    const subtitleUrl = "https://kfani.me" + frame("video > track").attr("src");
    const type =
      frame("video > source").attr("type") === "video/mp4"
        ? EpisodeType.MP4
        : EpisodeType.M3U8;
    const video = new Video(type, videoUrl, subtitleUrl);

    return { title: this.title, url: this.url, video, type };
  }
}

export class Video {
  type: EpisodeType;
  videoUrl: string;
  subtitleUrl: string;

  constructor(type: EpisodeType, videoUrl: string, subtitleUrl: string) {
    this.type = type;
    this.videoUrl = videoUrl;
    this.subtitleUrl = subtitleUrl;
  }
}

export async function getSubtitle(subtitleUrl: string) {
  const res = await getProtected(subtitleUrl);
  return res.data;
}

export async function getM3U8(m3u8Url: string) {
  const res = await getProtected(m3u8Url);
  return res.data;
}