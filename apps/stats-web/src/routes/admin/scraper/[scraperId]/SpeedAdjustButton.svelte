<script lang="ts">
  import { trpc } from "$lib/trpc";
  import type { Writable } from "svelte/store";

  export let service: Writable<Service>;

  let speedValue = "";

  function handleSpeedAdjustment() {
    if (speedValue === "") return;
    trpc.services.speed.mutate({ id: $service.id, cyclesMinute: Number(speedValue) });
  }
</script>

<button
  class="btn {$service.running ? 'btn-neutral' : 'btn-outline'}"
  on:click={() => document.getElementById("speedAdjustModal").showModal()}>
  Adjust Speed
</button>

<dialog id="speedAdjustModal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Requests per minute for {$service.id}</h3>
    <input
      type="number"
      bind:value={speedValue}
      placeholder={(60 / ($service.cycleMs / 1000))?.toString() ?? "?"}
      class="input input-bordered w-full max-w-xs mt-4" />
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Cancel</button>
        <button class="btn btn-primary" on:click={handleSpeedAdjustment}>Save</button>
      </form>
    </div>
  </div>
</dialog>
