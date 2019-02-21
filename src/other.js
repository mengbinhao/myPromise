function Promise(cb) {
    const that = this
    that.value = undefined // Promise的值
    that.status = 'pending' // Promise的状态
    that.resolveArray = [] // resolve函数集合
    that.rejectArray = [] // reject函数集合

    function resolve(value) {
        if (value instanceof Promise) {
            return value.then(resolve, reject)
        }
        setTimeout(function () {
            if (that.status === 'pending') { // 处于pending状态 循环调用
                that.value = value
                that.status = 'resolve'
                for (let i = 0; i < that.resolveArray.length; i++) {
                    that.resolveArray[i](value)
                }
            }
        })
    }

    function reject(reason) {
        if (reason instanceof Promise) {
            return reason.then(resolve, reject)
        }
        setTimeout(function () {
            if (that.status === 'pending') { // 处于pending状态 循环调用
                that.value = reason
                that.status = 'reject'
                for (let i = 0; i < that.rejectArray.length; i++) {
                    that.rejectArray[i](reason)
                }
            }
        })
    }

    try {
        cb(resolve, reject)
    } catch (e) {
        reject(e)
    }
}
Promise.prototype.then = function (onResolve, onReject) {
    var that = this
    var promise2 // 返回的Promise

    onResolve = typeof onResolve === 'function' ? onResolve : function (v) {
        return v
    } //如果不是函数 则处理穿透值
    onReject = typeof onReject === 'function' ? onReject : function (v) {
        return v
    } //如果不是函数 则处理穿透值

    if (that.status === 'resolve') {
        return promise2 = new Promise(function (resolve, reject) {
            setTimeout(function () {
                try {
                    const x = onResolve(that.value)
                    if (x instanceof Promise) { // 如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise2的结果
                        x.then(resolve, reject)
                    } else {
                        resolve(x)
                    }
                } catch (e) {
                    reject(e)
                }
            })
        })
    }

    if (that.status === 'reject') {
        return promise2 = new Promise(function (resolve, reject) {
            setTimeout(function () {
                try {
                    const x = onResolve(that.value)
                    if (x instanceof Promise) { // 如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise2的结果
                        x.then(resolve, reject)
                    } else {
                        reject(x)
                    }
                } catch (e) {
                    reject(e)
                }
            })
        })
    }

    if (that.status === 'pending') {
        return promise2 = new Promise(function (resolve, reject) {
            that.resolveArray.push(function (value) {
                try {
                    var x = onResolve(value)
                    if (x instanceof Promise) {
                        x.then(resolve, reject)
                    }
                } catch (e) {
                    reject(e)
                }
            })
            that.rejectArray.push(function (reason) {
                try {
                    var x = onReject(reason)
                    if (x instanceof Promise) {
                        x.then(resolve, reject)
                    }
                } catch (e) {
                    reject(e)
                }
            })
        })
    }
}
Promise.prototype.catch = function (onReject) {
    return this.then(null, onReject)
}