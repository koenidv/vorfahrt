<script lang="ts">
  import { trpc } from "$lib/trpc.js";

  export let data;
</script>

{data?.name}
<button class="btn btn-primary" on:click={() => trpc.services.start.mutate(data.name)}
  >Start Scraper</button>
<button class="btn btn-error" on:click={() => trpc.services.stop.mutate(data.name)}
  >Stop Scraper</button>
