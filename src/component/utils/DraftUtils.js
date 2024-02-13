const lockCall = (uuid, func, sync) => {
    let done = false;
    spinDo(() => {
        window.dLock = window.dLock || {};
        if (dLock[uuid]) {
            throw new Error('');
        }
        dLock[uuid] = true;
        try {
            func();
        }
        finally {
            dLock = false;
            done = true;
        }
    });
    if (sync) {
        while (!done);
    }
    return 0;
}

const spinDo = (handler, interval, tryCnt) => {
    interval = interval || 100;
    tryCnt = tryCnt || 20;
    let cnt = 0;
    let error0;
    let timer = setInterval(() => {
        let error;
        try {
            handler();
            clearInterval(timer);
        }
        catch (e) {
            // ignore
            cnt++;
            error = e;
            error0 = error0 || e;
        }
        if (cnt == tryCnt) {
            clearInterval(timer);
            // 首次和最后一次报错比较关键
            console.error('spinDo fail...', error0, error);
        }
    }, interval)
}

module.exports = {
    lockCall,
    spinDo
}
