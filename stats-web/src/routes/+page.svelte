<script lang="ts">
  import { goto } from "$app/navigation";
  import { signIn } from "@auth/sveltekit/client";

  export let data;

  function gotoAdmin() {
    if (data?.session?.user) {
      goto("/admin");
    } else {
      signIn("auth0", { callbackUrl: "/admin" });
    }
  }

  async function postsache() {
    const res = await fetch("https://koenidv.eu.auth0.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        audience: "https://api.admin.vorfahrt.dev",
      }),
    });
    console.log(await res.json());
  }
</script>

<div class="flex flex-col w-full items-center">
  <div class="flex flex-col max-w-md w-full gap-4 mt-12">
    <div>
      <h1 class="text-2xl font-bold">vorfahrt</h1>
      <p>shared mobility insights</p>
    </div>

    <button class="btn btn-primary w-full" on:click={gotoAdmin}>Admin Panel</button>
    <button class="btn btn-primary w-full" on:click={postsache}>Dings</button>
  </div>
</div>
