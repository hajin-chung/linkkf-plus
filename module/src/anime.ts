import * as cheerio from "cheerio";
import { Episode } from "./episode";
import { getProtected } from "lib";

export interface AnimeData {
  isMovie: boolean;
  url: string;
  imgUrl: string;
  title: string;
  engTitle: string;
  id: number;
  info: object;
  episodes: Array<Episode>;
}

export class Anime {
  title: string;
  url: string;

  constructor(title: string, url: string) {
    this.title = title;
    this.url = url;
  }

  async get(): Promise<AnimeData> {
    const url = this.url;
    const res = await getProtected(url);
    const $ = cheerio.load(res.data);

    const isMovie = !!$(".myWrapper");
    const title = $("#body > div > div.hrecipe > article > center > strong")
      .text()
      .trim();
    const engTitle = $("#body > div > div.hrecipe > center").text().trim();
    const id = +$(`link[rel="canonical"]`).attr("href").split("/").at(-2);
    const imgUrl = $(
      "#body > div > div.hrecipe > div.infomation > center > img"
    ).attr("src");
    const episodes = new Array<Episode>();
    $(".ep").each(function () {
      episodes.push(
        new Episode($(this).text().trim(), $(this).attr("href").trim())
      );
    });

    return { isMovie, url, imgUrl, title, engTitle, id, info: {}, episodes };
  }
}

export interface Anime {
  isMovie: boolean;
  url: string;
  imgUrl: string;
  title: string;
  engTitle: string;
  id: number;
  info: object;
  episodes: Array<Episode>;
}
