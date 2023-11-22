<script lang="ts">
  import { page } from "$app/stores";
  import "iconify-icon";
</script>

<ul class="menu bg-base-200 rounded-box w-56 pb-3 h-fit flex-shrink-0">
  <li><a href="/admin" class={$page?.route?.id === "/admin" ? "active" : ""}>Overview</a></li>
  <div class="divider my-2">Scrapers</div>
  {#each $page.data.services.scrapers as scraper}
    <li>
      <a
        href={"/admin/scraper/" + scraper.name}
        class={$page?.params?.scraperId === scraper.name ? "active" : ""}>
        {#if scraper.running === false}
            <iconify-icon icon="ic:round-pause" class="text-accent" />
        {/if}
        {scraper.name}
      </a>
    </li>
  {/each}
  <div class="divider my-2">Influx Clients</div>
  to be developed
</ul>
