import { AnimeList } from "./list";

async function test() {
  const animeList = new AnimeList(
    "https://mobikf.ncctvgroup.com/anime-list/",
    "",
    "신작",
    1
  );
  const list1 = await animeList.get();
  const list2 = await animeList.next();
  console.log(list1, list2);
  const anime = await list1[0].get();
  console.log(anime);
  const episode = await anime.episodes[0].get();
  console.log(episode);
}

async function main() {
  await test();
}

main().catch((err) => console.error(err));
