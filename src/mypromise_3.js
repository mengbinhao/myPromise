function MyPromise(executor) {
    this.status = 'pending'
    this.value = undefined
    this.reason = undefined

    const resolve = (value) => {
        if (this.status === 'pending') {
            this.status = 'resolved'
            this.value = value
        }
    }

    const reject = (reason) => {
        if (this.status === 'pending') {
            this.status = 'rejected'
            this.reason = reason
        }
    }
    executor(resolve, reject)
}

MyPromise.prototype.then = function(onFullfilled, onRejected) {
    if (this.status === 'resolved') {
        onFullfilled(this.value)
    }

    if (this.status === 'rejected') {
        onRejected(this.reason)
    }
}