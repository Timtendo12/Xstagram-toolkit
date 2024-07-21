<template>
  <div>
    <VitePwaManifest />
    <div v-if="hasAccess.isGranted">
      <slot />
    </div>
    <div v-else>
      <h1>Missing access permissions.</h1>
    </div>
  </div>
</template>

<script setup>
const client = useKindeClient();

const {data: hasAccess} = await useAsyncData(async () => {
  return (await client?.getPermission("access")) ?? {};
});

</script>