function MyPromise(executor) {
    this.status = 'pending'
    this.value = undefined
    this.reason = undefined
    this.onResolvedCbs = []
    this.onRejectedCbs = []

    let resolve = (value) => {
        if (this.status === 'pending') {
            this.value = value
            this.status = 'resolved'
            this.onResolvedCb.forEach(fn => fn())
        }
    }

    let reject = (reason) => {
        if (this.status === 'pending') {
            this.reason = reason
            this.status = 'rejected'
            this.onRejectedCb.forEach(fn => fn())
        }
    }

    try {
        executor(resolve, reject)
    } catch (e) {
        reject(e)
    }
}

MyPromise.prototype.then = function (onFullfilled, onRejected) {
    //handle value penetration
    onFullfilled = typeof onFullfilled === 'function' ? onFullfilled : (value) => value
    onRejected = typeof onRejected === 'function' ? onRejected : (reason) => reason

    var promise2

    if (this.status === 'resolved') {
        promise2 = new MyPromise((resolve, reject) => {
            try {
                let x = onFullfilled(this.value)
                resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
                reject(e)
            }
        })
    }

    if (this.status === 'rejected') {
        promise2 = new MyPromise((resolve, reject) => {
            try {
                let x = onRejected(this.reason)
                resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
                reject(e)
            }
        })
    }

    if (this.status === 'pending') {
        promise2 = new MyPromise((resolve, reject) => {
            this.onResolvedCbs.push(() => {
                try {
                    let x = onFullfilled(this.value)
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            })
        })

        this.onRejectedCbs.push(() => {
            try {
                let x = onRejected(this.value)
                resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
                reject(e)
            }
        })
    }

    return promise2
}

function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject(new TypeError('circular reference'))
    }
    let called
    if (x && (typeof x === 'object') || typeof x === 'function') {
        try {
            let then = x.then
            if (typeof then === 'function') {
                then.call(x, function (y) {
                    if (called) return
                    called = true
                    //recursion
                    //y is previous promise's return
                    resolvePromise(promise2, y, resolve, reject)
                }, function (err) {
                    if (called) return
                    called = true
                    reject(err)
                })
            } else {
                reject(err)
            }
        } catch (e) {
            if (called) return
            called = true
            reject(err)
        }
    } else {
        resolve(x)
    }
}

module.export = MyPromise