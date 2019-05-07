var a = function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve('a')
    }, 1000)
  })
}

var b = function (data) {
  return new Promise(function (resolve, reject) {
    resolve(data + 'b')
  })
}

var c = function (data) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(data + 'c')
    }, 500)
  })
}

//way 1
// console.time()
// a().then(function(data) {
// 	return b(data)
// }).then(function(data) {
// 	return c(data)
// }).then(function(data) {
// 	console.log(data)
// })
// console.timeEnd()


//way 2
// function queue(arr) {
// 	let sequence = Promise.resolve()
// 	arr.forEach(item => {
// 		sequence = sequence.then(item)
// 	})
// 	return sequence
// }

// queue([a, b, c]).then(data => {
// 	console.log(data)
// })

async function queue2(arr) {
	let res
	for (let promise of arr) {
		res = await promise(res)
	}
	return res
}

queue2([a, b, c]).then(data => {
	console.log(data)
})