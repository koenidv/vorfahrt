<script lang="ts">
  import { trpc } from "$lib/trpc.js";
  import { writable } from "svelte/store";

  export let data;
  let service = writable<Service | undefined>(undefined);
  let subscribed: any;

  $: subscribe(data.serviceId);

  function subscribe(serviceId: string) {
    if (subscribed) subscribed.unsubscribe();
    subscribed = trpc.services.details.subscribe(serviceId, {
      onData(update) {
        service.set(update);
      },
      onError(error) {
        console.log(error);
      },
    });
  }

  function cycleTimeReadable(cycleMs: number | undefined) {
    if (!cycleMs) {
      return "N/A";
    } else if (cycleMs <= 1000) {
      return `${+(1 / (cycleMs / 1000)).toFixed(2)}/s`;
    } else if (cycleMs <= 60000) {
      return `${+(1 / (cycleMs / (1000 * 60))).toFixed(2)}/min`;
    } else if (cycleMs <= 3600000) {
      return `${+(1 / (cycleMs / (1000 * 60 * 60))).toFixed(2)}/hr`;
    } else {
      return `${+(1 / (cycleMs / (1000 * 60 * 60 * 24))).toFixed(2)}/day`;
    }
  }
</script>

{#if $service !== undefined}
  <div class="flex flex-col gap-8 px-4 py-2">
    <div class="flex flex-row gap-8 items-center">

      <div class="flex flex-col gap-0">
        <h1 class="font-title text-3xl font-bold tracking-wide">{$service.id}</h1>
        <p class="font-mono">
          cycles: {cycleTimeReadable($service.cycleMs)}
          {#if $service.running === false}(Paused){/if}
        </p>
      </div>

      <div class="w-[1px] h-8 bg-neutral" />

      <div class="flex flex-row gap-4 items-baseline">
        {#if $service.running === false}
          <button
            class="btn btn-primary"
            on:click={() => {
              if ($service) trpc.services.start.mutate($service.id);
            }}>Start Scraper</button>
        {:else}
          <button
            class="btn btn-error"
            on:click={() => {
              if ($service) trpc.services.stop.mutate($service.id);
            }}>Stop Scraper</button>
        {/if}
        <button
          class="btn {$service.running ? 'btn-neutral' : 'btn-outline'}"
          on:click={() => {
            if ($service) true; // todo: open modal to adjust speed
          }}>Adjust Speed</button>
      </div>
    </div>
    <div class="w-full max-w-4xl h-96 skeleton rounded-box"></div>
  </div>
{/if}
