var boilWater = function () {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve(`boilWater`)
		}, 5000)
	})
}

var washClass = function () {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve(`washClass`)
		}, 1000)
	})
}

var steepLeaf = function () {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve(`steepLeaf`)
		}, 2000)
	})
}

console.time(`AsyncPromise`)
Promise.all([boilWater(),washClass(),steepLeaf()]).then(function(data) {
	console.log(`Done`)
	console.log(data)
	console.timeEnd(`AsyncPromise`)
})