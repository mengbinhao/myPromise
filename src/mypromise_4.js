function MyPromise(executor) {
    this.status = 'pending'
    this.value = undefined
    this.reason = undefined
    this.onResolvedCb = []
    this.onRejectedCb = []

    const resolve = (value) => {
        setTimeout(() => {
            if (this.status === 'pending') {
                this.value = value
                this.status = 'resolved'
                this.onResolvedCb.forEach(fn => fn())
            }
        })
    }

    const reject = (reason) => {
        setTimeout(() => {
            if (this.status === 'pending') {
                this.reason = reason
                this.status = 'rejected'
                this.onRejectedCb.forEach(fn => fn())
            }
        })
    }

    try {
        executor(resolve, reject)
    } catch (e) {
        reject(e)
    }
}

MyPromise.prototype.then = function(onFullfilled, onRejected) {
    if (this.status === 'pending') {
        this.onResolvedCb.push(() => {
            onFullfilled(this.value)
        })
        this.onRejectedCb.push(() => {
            onRejected(this.value)
        })
    }

    if (this.status === 'resolved') {
        onFullfilled(this.value)
    }

    if (this.status === 'rejected') {
        onRejected(this.reason)
    }
}

