<script lang="ts">
  import { signOut } from "@auth/sveltekit/client";
</script>

<div class="m-4">
  <div class="flex flex-row w-full justify-start items-baseline gap-2">
    <a class="btn btn-primary" href="/admin">vorfahrt admin</a>
    <a class="btn btn-secondary" href="/">Back to Public Page</a>
    <a class="btn btn-outline" href="/admin/vehicles">Vehicles</a>
    <div class="flex-grow" />
    <div class="btn btn-outline" on:click={() => signOut({ callbackUrl: "/" })}>Sign Out</div>
    <div class="btn btn-error">Kill Server</div>
  </div>
</div>