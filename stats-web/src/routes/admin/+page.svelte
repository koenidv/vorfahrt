<script lang="ts">
  import { signOut } from "@auth/sveltekit/client";

  export let data;
</script>

{#if data?.session?.user}
  This the glorious admin panel.
  <button class="btn" on:click={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
{:else}
  You are not logged in :(
{/if}
