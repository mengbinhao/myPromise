const fs = require('fs')

//cb version
// fs.readFile('./name.txt', 'utf8', function (err, data) {
//     console.log(data)
//     fs.readFile(data, 'utf8', function (err, data) {
//         console.log(data)
//     })
// })


//package promise
const myReadFile = (file) => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf-8', function(err, data) {
            if(err) reject(err)
            resolve(data)
        })
    })
}

//test myReadFile
// myReadFile('./name.txt')
// .then((data) => {
//         console.log(data)
//         return myReadFile(data)
//     },
//     (err) => {console.log(err)}
// )
// .then(
//     (data) => {console.log(data)},
//     (err) => {console.log(err)}
// )

//test return other conditions
// myReadFile('./name.txt')
// .then(
//   (data) => {
//     console.log(data)
//     return {'a': 100} // 1 返回引用类型
//     // return 100 // 2 返回基本类型
//     // return undefined 3 返回undefined
//     // 4 不写return
//   },
//   (err) => {console.log(err)}
// )
// .then(
//   (data) => { console.log(data) },
//   (err) => { console.log(err) }
// )

//test return promise
// myReadFile('./name.txt')
// .then(
//   (data) => {
//     console.log(data)
//     return new Promise(function(resolve, reject){
//       setTimeout(function(){
//         resolve('ok')
//         //reject('error')
//       },1000)
//     })
//   },
//   (err) => {console.log(err)}
// )
// .then(
//   (data) => { console.log(data) },
//   (err) => { console.log(err) }
// )

//test return exception
myReadFile('./name.txt')
.then(
  (data) => {
    console.log(data)
    throw TypeError()
  },
  (err) => {console.log(err)}
)
.then(
  (data) => { console.log(data) },
  (err) => { console.log(err) }
)