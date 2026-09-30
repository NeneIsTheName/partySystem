<template>
<section class="drinks">
	<div class="drinks__search">
		<input @input="searchBar = $event.target.value" type="text" placeholder="Zoek Drankje" class="drinks__input">
	</div>
    <div class="drinks__scroll">
        <div class="drinks__row" v-for="drink in filteredDrinks" :key="drink.id">
			<div class="drinks__name">
				<p v-if="!productionMode">{{ drink.name }}</p>
				<span v-else contenteditable="true" @blur="updateDrinkName(drink, $event.target.textContent)" class="drinks__changeName">{{ drink.name }}</span>
				<font-awesome-icon v-if="productionMode" icon="pen-to-square" class="drinks__edit" />
				<font-awesome-icon @click="deleteDrink(drink.id)" v-if="productionMode" icon="trash" class="drinks__trash" />
			</div>
            <div class="drinks__count">
				<button class="drinks__button" @click="updateDrinkSold(drink, -1)">-</button>
                <p>{{ drink.sold }}</p>
                <button class="drinks__button"  @click="updateDrinkSold(drink, 1)">+</button>
            </div>
        </div>
		<div v-if="productionMode" class="drinks__add">
			<input @input="addDrinkBar = $event.target.value" type="text" placeholder="Naam Drankje" class="drinks__input">
			<button @click="addDrink" class="drinks__button">Toevoegen</button>
		</div>
		<button v-if="searchBar == ''" @click="productionMode = (productionMode) ? false : true" class="drinks__button">Production Mode (NIET OP KLIKKEN)</button>
    </div>
</section>
</template>

<script>
import { useSQLite } from '@/composables/useSQLite';

const db = useSQLite();

export default {
  	data() {
		return {
			searchBar: "",
			addDrinkBar: "",
			productionMode: false,
			db,
			drinks: db.drinks,
		}
	},
	async mounted() {
		await this.db.selectDrinks();
		console.log(db.drinks)
	},
	computed: {
		filteredDrinks(){
			return this.drinks.filter(
				drink => drink?.name?.toLowerCase().includes(this.searchBar.toLowerCase())
			)
		}
	},
	methods: {
		async addDrink() {
			if (!this.addDrinkBar.trim()) return
			await this.db.insertDrink(this.addDrinkBar.trim())
			this.addDrinkBar = ""
		},
		async updateDrinkName(drink, newName) {
			if (newName === drink.name) return;
			await this.db.updateDrinkName(drink.id, newName);
		},
		async updateDrinkSold(drink, delta) {
			if (delta < 0 && drink.sold <= 0) return;
			await this.db.updateDrinkSold(drink.id, delta);
		},
		async deleteDrink(id){
			await this.db.deleteDrink(id)
		}
	}
}
</script>