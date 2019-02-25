function MyPromise(executor) {
    this.status = 'pending'
    this.value = undefined
    this.reason = undefined
    this.onResolvedCbs = []
    this.onRejectedCbs = []

    const resolve = (value) => {
        if (this.status === 'pending') {
            this.status = 'resolved'
            this.value = value
            this.onResolvedCbs.forEach(fn => fn())
        }
    }

    const reject = (reason) => {
        if (this.status === 'pending') {
            this.status = 'rejected'
            this.reason = reason
            this.onRejectedCbs.forEach(fn => fn())
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
            setTimeout(() => {
                try {
                    let x = onFullfilled(this.value)
                    resolve(x)
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
                    resolve(x)
                } catch (e) {
                    reject(e)
                }
            })
        })
    }

    if (this.status === 'pending') {
        promise2 = new MyPromise((resolve, reject) => {
            this.onResolvedCbs.push(() => {
                setTimeout(() => {
                    try {
                        let x = onFullfilled(this.value)
                        resolve(x)
                    } catch (e) {
                        reject(e)
                    }
                })
            })

            this.onRejectedCbs.push(() => {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason)
                        resolve(x)
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        })
    }
    return promise2
}