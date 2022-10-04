<template>
    <div>
        <div ref="gui" class="hidden fixed -z-10 h-full bg-hero-texture bg-red-100 w-1/5">
            Stats
        </div>

        <canvas ref="canvas" class="bg-light flex fixed inset-0 -z-20 select-none"></canvas>
    </div>
</template>
<script>
    import BowlingGame from '../bowling-game';
    export default {
        mounted() {
            const {renderer} = this;
            const options = require(`$lib/game/bowling/config/options.json`);
            this.game = new BowlingGame({
                renderer,
                canvas: this.$refs.canvas,
                gui: this.$refs.gui,
                options
            });
            this.game.load();
        },
        beforeDestroy() {
            this.game.destroy();
        }
    }
</script>
<style>nav {position: fixed}</style>
