window.addEventListener("load", init);

let jokes;
let nextBtn;
let jokeCountEl;
let jokeEl;
let refreshLifeEl;

function init () {

	getJokes();

	nextBtn = document.querySelector(".next")
	nextBtn.addEventListener("click", onNextBtnClick)

	jokeCountEl = document.querySelector("#joke-count")
	jokeEl = document.querySelector("#joke")

	refreshLifeEl = document.querySelector("#refreshLife")
	refreshLifeEl.addEventListener("click", refreshLife)

}

function onNextBtnClick () {

	if (jokes.length > 0) {
		console.log("Next joke...")

		jokeEl.innerHTML = jokes[0].joke
		jokes.shift()

		jokeCountEl.innerHTML = 10 - jokes.length
	} else {

		getJokes()
	}


}

function getJokes() {

	 fetch('https://v2.jokeapi.dev/joke/Any?type=single&amount=10')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			// handle the JSON data

			jokes = data.jokes

			jokeEl.innerHTML = jokes[0].joke
			jokes.shift()

			jokeCountEl.innerHTML = 10 - jokes.length

		})
		.catch(error => {
			console.error('There was a problem with the fetch operation:', error);
		});
}

function refreshLife () {
	let lifeEls = document.querySelectorAll(".icofont-heart")
	for (let el of lifeEls) {
		el.classList.add('active')
	}
}