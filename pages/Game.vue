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
    import ThreeMixin from '$lib/game/mixins/three-mixin';
    export default {
        mixins: [ThreeMixin],     
        mounted() {
            const {renderer, canvas} = this;
            
            const options = require(`$lib/game/bowling/config/options.json`);
            this.game = new BowlingGame({
                renderer,
                canvas,
                gui: this.$refs.gui,
                options
            });
            this.game.load();
            //console.log('game mount');
        },
        beforeDestroy() {
            this.game.destroy();
        }
    }
</script>
<style>nav {position: fixed}</style>
