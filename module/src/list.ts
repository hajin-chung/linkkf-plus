import axios from "axios";
import * as cheerio from "cheerio";
import { Anime } from "./anime";

export class AnimeList {
  baseUrl: string;
  params: string;
  title: string;
  page: number;

  constructor(baseUrl: string, params: string, title: string, page = 1) {
    this.baseUrl = baseUrl;
    this.params = params;
    this.title = title;
    this.page = page;
  }

  url() {
    return `${this.baseUrl}page/${this.page}/?${this.params}`;
  }

  async get() {
    const res = await axios.get(this.url());
    const $ = cheerio.load(res.data);
    const animeList = new Array<Anime>();
    $(".item").each(function () {
      animeList.push(
        new Anime(
          $(this).find("span > strong").text().trim(),
          $(this).find("article > a").attr("href")
        )
      );
    });

    return animeList;
  }

  async next() {
    this.page++;
    return await this.get()
  }
}
