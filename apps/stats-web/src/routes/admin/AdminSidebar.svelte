<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import "iconify-icon";

  export let services: { [key: string]: Service };

  let licensePlateValue = /.*\/vehicle\/([^\/]*)/.exec($page?.route?.id || "")?.[1] ?? "";
  function onLicensePlateInput(event: KeyboardEvent) {
    if (event.key === "Enter") {
      goto("/admin/vehicle/" + licensePlateValue);
    }
  }
</script>

<ul class="menu bg-base-200 rounded-box w-56 pb-3 h-fit flex-shrink-0">
  <li><a href="/admin" class={$page?.route?.id === "/admin" ? "active" : ""}>Overview</a></li>
  <li>
    <input
      type="text"
      placeholder="Find Vehicle"
      class="input input-bordered input-md w-full max-w-xs mt-2 mb-1"
      bind:value={licensePlateValue}
      on:keydown={onLicensePlateInput} />
  </li>
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
