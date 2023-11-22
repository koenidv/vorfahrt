import type { LayoutLoad } from "./$types";

export const _test = "";

export const load: LayoutLoad = async (event) => {
  // fixme not reaching the admin api will result in 500
  // const scrapersRes = await fetch(PUBLIC_ADMIN_URL + "/scraper", {
  //   headers: {
  //     "Authorization": "Bearer " + session.accessToken
  //   }
  // })
  // todo trpc
  // const scrapers = await scrapersRes.json();
  
  const scrapers = [
    {name: "scraper-1"},
    {name: "scraper-2"},
    {name: "scraper-3"}
  ]

  return { scrapers };
};