# myPromise

### how to use
```javasctipt
const p = () => {
            return new Promise((resolve, reject) => {
                console.log('start promise')
                resolve('resolve')
            })
        }

p().then((value) => {
    console.log('sucess ' + value)
}, (reson) => {
    console.log('error ' + reson)
})
console.log('end')
```

1. Promise是构造函数，new出来的实例有then方法
2. new Promise时，传递一个参数，这个参数是函数，又被称为执行器函数(executor)， 并执行器会被立即调用，也就是上面结果中start最先输出的原因
3. executor是函数，它接受两个参数`resolve`和`reject`，同时这两个参数也是函数
4. new Promise后的实例具有状态， 默认状态是等待，当执行器调用`resolve`后， 实例状态为成功状态， 当执行器调用`reject`后，实例状态为失败状态
5. promise翻译过来是承诺的意思，实例的状态一经改变，不能再次修改，不能成功再变失败，或者反过来也不行
每一个promise实例都有方法`then`，then中有两个参数 ，我习惯把第一个参数叫做then的成功回调，把第二个参数叫做then的失败回调，这两个参数也都是函数，当执行器调用resolve后，then中第一个参数函数会执行。当执行器调用reject后，then中第二个参数函数会执行

### [version 1](./src/mypromise_1.js)

### [version 2](./src/mypromise_2.js)
1. add state
2. resolv and reject change status
3. then invoke cb according to status

### [version 3](./src/mypromise_3.js)
1. ensure that state only can be changed once
2. resolve或reject方法传的值，传递给then的函数

### [version 4](./src/mypromise_4.js)
1. sync invoke
2. multi invoke then, not chain invoke

> 1 对于异步情况，当代码执行到了p.then()的时候，执行器方法中的resolve('data1')被> > setTimeout放到了异步任务队列中
>
> 2 换句话说，也就是，此时实例p的状态还是默认状态，没有改变，那么我们此时并不知道要去> 执行then中的第一个参数（成功回调）还是第二个参数（失败回调）
>
> 3 在不知道哪个回调会被执行的情况下，就需要先把这两个回调函数保存起来，等到时机成熟，> 确定调用哪个函数的时候，再拿出来调用
>
> 4 其实就是发布订阅的一个变种，我们在执行一次p.then(),就会then中的参数，也就是把成功> 回调和失败回调都保存起来（订阅），执行器执行了resolve方法或者reject方法时，我们去> 执行刚保存起来的函数（发布）

### [version 5](./src/mypromise_5.js)
- **chain invoke**
#### 实际场景
第一次读取的是文件名字，拿到文件名字后，再去读这个名字文件的内容。很显然这是两次异步操作，并且第二次的异步操作依赖第一次的异步操作结果

```javascript
let fs = require('fs')

fs.readFile('./name.txt', 'utf8', function (err, data) {
  console.log(data)
  fs.readFile(data, 'utf8', function (err, data) {
    console.log(data)
  })
})
```

转成promise

```javascript
function readFile(url){
  return new Promise((resolve, reject)=>{
    fs.readFile(url, 'utf8', function (err, data) {
        if(err) reject(err)
        resolve(data)
      })
    })
}

readFile('./name.txt')
.then(
  (data) => {
    console.log(data)
    return readFile(data)
  },
  (err) => {console.log(err)}
)
.then(
  (data) => { console.log(data) },
  (err) => { console.log(err) }
)
```

#### promise套路
```javascript
let p1 = new Promise(function(resolve, reject){
  resolve()
})
let p2 = p1.then(function(data){ //这是p1的成功回调，此时p1是成功状态
    throw new Error('错误') // 如果这里抛出错误，p2应是失败状态
})
p2.then(function(){
},function(err){
    console.log(err)
})
//如果返回的是this，那么p2跟p1相同，固状态也相同，但上面说了，Promise的成功态和失败态不能相互转换，那就不会得到p1成功而p2失败的效果，而实际上是可能发生这种情况的
//所以Promise的then方法实现链式调用的原理是：返回一个新的Promise
```

```javascript
// 以下代码中第一次then的返回值就是源码内第一次调用onRjected的返回值，可以用一个x来接收
// 这个x需要兼容
// 1 前一次then返回一个普通值，字符串数组对象这些东西，只需传给下一个then
// 2 前一次then返回的是一个Promise，是正常的操作，也是Promise提供的语法糖，我们要想办法判断到底返回的是啥
// 3 前一次then返回的是一个Promise，其中有异步操作，也是理所当然的，那我们就要等待他的状态改变，再进行下面的处理
// 4 前一次then返回的是自己本身这个Promise
// 5 前一次then返回的是一个别人自己随便写的Promise，这个Promise可能是个有then的普通对象，比如{then:'哈哈哈'}，也有可能在then里故意抛错
// 6 调resolve的时候再传一个Promise下去，我们还得处理这个Promise
// 7 可能既调resolve又调reject，得忽略后一个。
// 8 光then，里面啥也不(值穿透)
    ```javascript
    new Promise(resolve=>resolve(8))
    .then()
    .then()
    .then(value => {
        console.log(value)  // 8
    })
    ```
// 。。。
let p = new Promise(function(resolve, reject){
  resolve(data)
})
p.then(function(data){
    return xxx // 这里返回一个值
}, function(){

}).then(function(data){
    console.log // 这里会接收到xxx
}, function(){

})
```

#### promise特点
1. 对象具有三个状态，分别是pending（进行中）、fulfilled（resolve）（已成功）、reject（已失败），并且对象的状态不受外界改变，只能从pending到fulfilled或者pending到reject
2. 一旦状态被改变，就不会再变，任何时候都能得到这个结果，与事件回调不同，事件回调在事件过去后无法再调用函数。
3. 一个promise一旦resolved，再次resolve/reject将失效。即只能resolved一次
4. 值穿透，传给then或者catch的参数为非函数时，会发生穿透
5. 无法取消，Promise一旦运行，无法取消
6. 如果不设置回调函数，Promise内部抛出的错误，不会反应到外部
7. 处于pending时，无法感知promise的状态（刚刚开始还是即将完成）


#### then方法中的两个参数，也就是那所谓的成功回调和失败回调，他们的返回值如何处理？
以成功回调函数（then中的第一个参数）为例，这个函数返回普通值，也就是常量或者对象，这个值会传递到下一个then中，作为成功的结果。 如果这个函数返回的不是普通值，那么有两种情况
    - 非普通值---promise：会根据返回的promise成功还是失败，决定调用下一个then的第一个参数还是第二个参数
    - 非普通值---如报错异常：会跑到下一个then中的失败参数中，也就是then中的第二个参数。


### 状态追随
```javascript
//当处于状态跟随时，即使promiseB立即被resolved了，但是因为他追随了promiseA的状态，而A的状态则是pending，所以才说处于resolved的promiseB的状态是pending
const promiseA = new Promise((resolve) => {
  setTimeout(() => {
    resolve('ccc')
  }, 3000)
})
const promiseB = new Promise(res => {
  res(promiseA)
})
promiseB.then((arg) => {
  console.log(arg) // print 'ccc' after 3000ms
})
```


https://segmentfault.com/a/1190000016848192
https://juejin.im/post/5ab20c58f265da23a228fe0f#heading-5
https://juejin.im/post/5aab286a6fb9a028d3752621