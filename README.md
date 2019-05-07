# MyPromise
### why promise
- [whypromise](./src/whypromise.js)
- [whypromiseAdvance](./src/whypromiseAdvance.js)
- [whypromiseAdvanceSequence](./src/whypromiseAdvanceSequence.js)

### [how to use](./src/how2use.js)
1. Promise is a constructor，insstanse has then mehtod
2. while new Promise, pass an executor, it is involed immediatety
3. executor receives two params(resolve / reject), they are functions

### [version 1](./src/mypromise_1.js)

### [version 2](./src/mypromise_2.js)
1. new Promise后的实例具有状态， 默认状态是等待，当执行器调用`resolve`后， 实例状态为成功状态， 当执行器调用`reject`后，实例状态为失败状态
2. promise翻译过来是承诺的意思，实例的状态一经改变，不能再次修改，不能成功再变失败，或者反过来也不行
3. 每一个promise实例都有方法`then`，then中有两个参数 ，我习惯把第一个参数叫做then的成功回调，把第二个参数叫做then的失败回调，这两个参数也都是函数，当执行器调用resolve后，then中第一个参数函数会执行。当执行器调用reject后，then中第二个参数函数会执行

- add state
- resolv and reject change status
- then invoke cb according to status
- ensure that state only can be changed once

### [version 3](./src/mypromise_3.js)
1. resolve或reject方法传的值，传递给then的函数

### [version 4](./src/mypromise_4.js)
1. sync invoke
2. multi-invoke then, not chain invoke
3. add try-catch for executor

> 1 对于异步情况，当代码执行到了p.then()的时候，执行器方法中的resolve('data1')被>setTimeout放到了异步任务队列中
>
> 2 换句话说，也就是，此时实例p的状态还是默认状态，没有改变，那么我们此时并不知道要去> 执行then的成功回调还失败回调
>
> 3 在不知道哪个回调会被执行的情况下，就需要先把这两个回调函数保存起来，等到时机成熟，确定调用哪个函数的时候，再拿出来调用
>
> 4 其实就是发布订阅的一个变种，我们在执行一次p.then(),就会then中的参数，也就是把成功> 回调和失败回调都保存起来（订阅），执行器执行了resolve方法或者reject方法时，我们去> 执行刚保存起来的函数（发布）

### **chain invoke**
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
// 7 可能既调resolve又调reject，得忽略后一个
// 8 光then，里面啥也不传(值穿透)
    // new Promise(resolve=>resolve(8))
    // .then(1)
    // .then(Promise.resolve(2))
    // .then(value => {
    //     console.log(value)  // 8
    // })

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

    ```javascript
    const promise = new Promise((resolve, reject) => {
        resolve('success1');
        reject('error');
        resolve('success2');
    });
    
    promise.then((res) => {
        console.log('then:', res);
    }).catch((err) => {
        console.log('catch:', err);
    })
    ```

4. 值穿透，传给then或者catch的参数为非函数时，会发生穿透

5. 无法取消，Promise一旦运行，无法取消

6. 如果不设置回调函数，Promise内部抛出的错误，不会反应到外部

7. 处于pending时，无法感知promise的状态（刚刚开始还是即将完成）

##### then方法中的两个参数，也就是那所谓的成功回调和失败回调，他们的返回值如何处理？
以成功回调函数（then中的第一个参数）为例，这个函数返回普通值，也就是常量或者对象，这个值会传递到下一个then中，作为成功的结果。 如果这个函数返回的不是普通值，那么有两种情况
​    - 非普通值---promise：会根据返回的promise成功还是失败，决定调用下一个then的第一个参数还是第二个参数
​    - 非普通值---如报错异常：会跑到下一个then中的失败参数中，也就是then中的第二个参数

[version 5](./src/mypromise_5.js)

1. simple chian-invoke implement (has bug)
2. change setTimeout to right place

### [implement then version](./src/mypromise_6.js)  (use promises-aplus-tests to test)
- add resolvePromise() to resovle below issues


1. 前一次then返回一个普通值，字符串数组对象这些东西，只需传给下一个then
2. 前一次then返回的是一个Promise，是正常的操作，也是Promise提供的语法糖，我们要想办法判断到底返回的是啥
3. 前一次then返回的是一个Promise，其中有异步操作，也是理所当然的，那我们就要等待他的状态改变，再进行下面的处理
4. 前一次then返回的是自己本身这个Promise
5. 前一次then返回的是一个别人自己随便写的Promise，这个Promise可能是个有then的普通对象，比如{then:'哈哈哈'}，也有可能在then里故意抛错
6. 调resolve的时候再传一个Promise下去，我们还得处理这个Promise
7. 可能既调resolve又调reject，得忽略后一个
8. 光then，里面啥也不传(值穿透)

### [implement all/race/catch/resolve/reject](./src/mypromise_7.js)

### [class version](./src/mypromise_8.js)

### 状态追随
```javascript
//当处于状态跟随时，即使promiseB立即被resolved了，但是因为他追随了promiseA/的状态，而A的状态则是pending，所以才说处于resolved的promiseB的状态是pending
const promiseA = new Promise((resolve) => {
  setTimeout(() => {
​    resolve('ccc')
  }, 3000)
})
const promiseB = new Promise(resolve => {
  resolve(promiseA)
})
promiseB.then((arg) => {
  console.log(arg) // print 'ccc' after 3000ms
})
```

### Promise Questions

1. 红灯三秒亮一次，绿灯一秒亮一次，黄灯2秒亮一次，意思就是3秒，执行一次 red 函数，2秒执行一次 green 函数，1秒执行一次 yellow 函数，不断交替重复亮灯，意思就是按照这个顺序一直执行这3个函数，这步可以就利用递归来实现。

    ```javascript
    function red() {
        console.log('red');
    }
    function green() {
        console.log('green');
    }
    function yellow() {
        console.log('yellow');
    }
    
    var light = function (timmer, cb) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                cb();
                resolve();
            }, timmer);
        });
    };
    
    var step = function () {
        Promise.resolve().then(function () {
            return light(3000, red);
        }).then(function () {
            return light(2000, green);
        }).then(function () {
            return light(1000, yellow);
        }).then(function () {
            step();
        });
    }
    
    step();
    ```

2. 实现mergePromise函数，把传进去的数组按顺序先后执行，并且把返回的数据先后放到数组data中

    ```javascript
    const timeout = ms => new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
    
    const ajax1 = () => timeout(2000).then(() => {
        console.log('1');
        return 1;
    });
    
    const ajax2 = () => timeout(1000).then(() => {
        console.log('2');
        return 2;
    });
    
    const ajax3 = () => timeout(2000).then(() => {
        console.log('3');
        return 3;
    });
    
    // 保存数组中的函数执行后的结果
    var data = [];
    var sequence = Promise.resolve();
    
    const mergePromise = ajaxArray => {
        ajaxArray.forEach(function (item) {
            // 第一次的then方法用来执行数组中的每个函数
            // 第二次的then方法接受数组中的函数执行后返回的结果，并把结果添加到data中，然后把data返回
            // 这里对sequence的重新赋值，其实是相当于延长了Promise链
            sequence = sequence.then(item).then(function (res) {
                data.push(res);
                return data;
            });
    
        })
        //遍历结束后，返回一个 Promise，也就是 sequence， 他的 [[PromiseValue]] 值就是 data，
        //而data（保存数组中的函数执行后的结果）也会作为参数，传入下次调用的then方法中
        return sequence;
    };
    
    mergePromise([ajax1, ajax2, ajax3]).then(data => {
        console.log('done');
        console.log(data);
    });
    
    // 要求分别输出
    // 1
    // 2
    // 3
    // done
    // [1, 2, 3]
    ```

3. 输出什么

    ```javascript
    const first = () => (new Promise((resolve, reject) => {
        console.log(3);
        let p = new Promise((resolve, reject) => {
            console.log(7);
            setTimeout(() => {
                console.log(5);
                resolve(6);
            }, 0)
            resolve(1);
        });
        resolve(2);
        p.then((arg) => {
            console.log(arg);
        });
    
    }));
    
    first().then((arg) => {
        console.log(arg);
    });
    console.log(4);
    ```

4. 有 8 个图片资源的 url，已经存储在数组 `urls` 中（即`urls = ['http://example.com/1.jpg', ...., 'http://example.com/8.jpg']）`，而且已经有一个函数 `function loadImg`，输入一个 url 链接，返回一个 Promise，该 Promise 在图片下载完成的时候 resolve，下载失败则 reject。
    但是我们要求，任意时刻，同时下载的链接数量不可以超过 3 个。
    请写一段代码实现这个需求，要求尽可能快速地将所有图片下载完成

    ```javascript
    var urls = ['https://www.kkkk1000.com/images/getImgData/getImgDatadata.jpg', 'https://www.kkkk1000.com/images/getImgData/gray.gif', 'https://www.kkkk1000.com/images/getImgData/Particle.gif', 'https://www.kkkk1000.com/images/getImgData/arithmetic.png', 'https://www.kkkk1000.com/images/getImgData/arithmetic2.gif', 'https://www.kkkk1000.com/images/getImgData/getImgDataError.jpg', 'https://www.kkkk1000.com/images/getImgData/arithmetic.gif', 'https://www.kkkk1000.com/images/wxQrCode2.png'];
    function loadImg(url) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = function () {
                console.log('一张图片加载完成');
                resolve();
            }
            img.onerror = reject
            img.src = url
        })
    };
    
    //题目的意思是需要我们这么做，先并发请求 3 张图片，当一张图片加载完成后，又会继续发起一张图片的请求，让并发数保持在 3 个，直到需要加载的图片都全部发起请求。
    //用 Promise 来实现就是，先并发请求3个图片资源，这样可以得到 3 个 Promise，组成一个数组，就叫promises 吧，然后不断的调用 Promise.race 来返回最快改变状态的 Promise，然后从数组（promises ）中删掉这个 Promise 对象，再加入一个新的 Promise，直到全部的 url 被取完，最后再使用 Promise.all 来处理一遍数组（promises ）中没有改变状态的 Promise
    var urls = ['https://www.kkkk1000.com/images/getImgData/getImgDatadata.jpg', 'https://www.kkkk1000.com/images/getImgData/gray.gif', 'https://www.kkkk1000.com/images/getImgData/Particle.gif', 'https://www.kkkk1000.com/images/getImgData/arithmetic.png', 'https://www.kkkk1000.com/images/getImgData/arithmetic2.gif', 'https://www.kkkk1000.com/images/getImgData/getImgDataError.jpg', 'https://www.kkkk1000.com/images/getImgData/arithmetic.gif', 'https://www.kkkk1000.com/images/wxQrCode2.png'];
    function loadImg(url) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = function () {
                console.log('一张图片加载完成');
                resolve();
            }
            img.onerror = reject
            img.src = url
        })
    };
    
    function limitLoad(urls, handler, limit) {
        // 对数组做一个拷贝
        const sequence = [].concat(urls)
        let promises = [];
    
        //并发请求到最大数
        promises = sequence.splice(0, limit).map((url, index) => {
            // 这里返回的index是任务在promises的脚标，用于在Promise.race之后找到完成的任务脚标
            return handler(url).then(() => {
                return index
            }); 
        });
    
        // 利用数组的reduce方法来以队列的形式执行
        return sequence.reduce((last, url, currentIndex) => {
            return last.then(() => {
                // 返回最快改变状态的Promise
                return Promise.race(promises)
            }).catch(err => {
                // 这里的catch不仅用来捕获前面then方法抛出的错误
                // 更重要的是防止中断整个链式调用
                console.error(err)
            }).then((res) => {
                // 用新的Promise替换掉最快改变状态的Promise
                promises[res] = handler(sequence[currentIndex]).then(() => { return res });
            })
        }, Promise.resolve().then(() => {
            return Promise.all(promises)
        })
    }
    limitLoad(urls, loadImg, 3)
    
    /*
    因为 limitLoad 函数也返回一个 Promise，所以当 所有图片加载完成后，可以继续链式调用
    
    limitLoad(urls, loadImg, 3).then(() => {
        console.log('所有图片加载完成');
    }).catch(err => {
        console.error(err);
    })
    */
    ```


