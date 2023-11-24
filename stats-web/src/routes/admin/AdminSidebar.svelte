<script lang="ts">
  import { page } from "$app/stores";
  import type { Writable } from "svelte/store";
  import "iconify-icon";

  export let services: { [key: string]: Service };
</script>

<ul class="menu bg-base-200 rounded-box w-56 pb-3 h-fit flex-shrink-0">
  <li><a href="/admin" class={$page?.route?.id === "/admin" ? "active" : ""}>Overview</a></li>
  <div class="divider my-2">Scrapers</div>
  {#each Object.entries(services).filter((s) => s[1].type === "scraper") as [id, scraper]}
    <li>
      <a
        href={"/admin/scraper/" + scraper.id}
        class={$page?.params?.scraperId === scraper.id ? "active" : ""}>
        {#if scraper.running === false}
          <iconify-icon icon="ic:round-pause" class="text-accent w-3" />
        {/if}
        {scraper.id}
      </a>
    </li>
  {/each}
  <div class="divider my-2">Influx Clients</div>
  <li>
    <p>
      <iconify-icon icon="ic:round-construction" class="w-3" />
      to be continued
    </p>
  </li>
</ul>
