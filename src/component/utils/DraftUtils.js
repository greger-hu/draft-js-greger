const lockCall = (uuid, func, sync, args) => {
    // 使用乐观锁 处理并发问题 -- 没必要 -- js单线程的，所以只需要简单同步下就行了
    window.dLock = window.dLock || {};
    let rand = Math.random();
    while (true) {
        if (dLock[uuid] && dLcok[uuid] != rand) {
            continue;
        }
        dLock[uuid] = rand;
        func(...args);
        delete dLock[uuid];
        break;
    }
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
