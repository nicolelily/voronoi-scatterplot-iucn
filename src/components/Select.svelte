<script lang="ts">
    let {
        value = $bindable(),
        options,
        label,
        id,
    }: {
        value: string;
        options: string[];
        label: string;
        id?: string;
    } = $props();
</script>

<label for={id}>{label}</label>
<select {id} name={id} bind:value>
    {#each options as opt}
        <option value={opt}>{opt}</option>
    {/each}
</select>
