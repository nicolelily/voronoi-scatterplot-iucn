<script lang="ts">
    let {
        value = $bindable(),
        values,
        label,
        name,
    }: {
        value: string;
        values: string[];
        label: string;
        name?: string;
    } = $props();
</script>

<div style="display: flex; align-items: center; gap: 20px;">
    <p style="margin: 0;">{label}</p>
    {#each values as val, i}
        <label for={`${name}-${i}`} style="transform: translateY(2px);">
            <input
                type="radio"
                {name}
                id={`${name}-${i}`}
                value={val}
                bind:group={value}
            />
            {val}</label
        >
    {/each}
</div>
