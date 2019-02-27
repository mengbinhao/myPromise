class MyPromise {
    constructor(executor) {
        this.status = 'pending'
        this.value = undefined
        this.reason = undefined
        this.onResolvedCallbacks = []
        this.onRejectedCallbacks = []

        const resolve = value => {
            if (this.status === 'pending') {
                this.status = 'resolved'
                this.value = value
                this.onResolvedCallbacks.forEach(fn => fn())
            }
        }

        const reject = (reason) => {
            if (this.status === 'pending') {
                this.status = 'rejected'
                this.reason = reason
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }

        try {
            executor(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }

    then(onFulfilled, onRejected) {

        function resolvePromise(promise2, x, resolve, reject) {
            if (promise2 === x) {
                return reject(new TypeError('circular reference'))
            }
            let called
            if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
                try {
                    let then = x.then
                    if (typeof then === 'function') {
                        then.call(x, (y) => {
                            if (called) return
                            called = true
                            //recursion
                            //y is the return of previous promise
                            resolvePromise(promise2, y, resolve, reject)
                        }, (err) => {
                            if (called) return
                            called = true
                            reject(err)
                        })
                    } else {
                        resolve(x)
                    }
                } catch (e) {
                    if (called) return
                    called = true
                    reject(e)
                }
            } else {
                //normal value
                resolve(x)
            }
        }

        //handle value penetration, just return the value
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : err => {
            throw err
        }

        let promise2
        if (this.status === 'resolved') {
            promise2 = new MyPromise((resolve, reject) => {
                setTimeout(() => {
                    //executor的try不能捕获到sync,所以这里加下try
                    try {
                        let x = onFulfilled(this.value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        }

        if (this.status === 'rejected') {
            promise2 = new MyPromise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        }

        if (this.status === 'pending') {
            promise2 = new MyPromise((resolve, reject) => {
                this.onResolvedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    })
                })

                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    })
                })
            })
        }
        return promise2
    }

    catch (callback) {
        return this.then(null, callback)
    }

    static all(promises) {
        return new MyPromise(function (resolve, reject) {
            let arr = []; //arr是最终返回值的结果
            let i = 0; // 表示成功了多少次
            function processData(index, y) {
                arr[index] = y
                if (++i === promises.length) {
                    resolve(arr)
                }
            }
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(function (y) {
                    processData(i, y)
                }, reject)
            }
        })
    }

    static race(promises) {
        return new MyPromise(function (resolve, reject) {
            for (var i = 0; i < promises.length; i++) {
                promises[i].then(resolve, reject)
            }
        })
    }

    static resolve(value) {
        return new MyPromise(function (resolve, reject) {
            resolve(value)
        })
    }

    static reject(reason) {
        return new MyPromise(function (resolve, reject) {
            reject(reason)
        })
    }
}

module.exports = MyPromise