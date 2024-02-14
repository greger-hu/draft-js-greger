
const EditorState = require('EditorState');

const getContentEditableContainer = require('getContentEditableContainer');
const getDraftEditorSelection = require('getDraftEditorSelection');

// 同步调用，防止editorState存在多个不同副本，导致数据丢失
const lockCall = (uuid, func, sync, args) => {
    // 使用乐观锁 处理并发问题 -- 没必要 -- js单线程的，所以只需要简单同步下就行了
    window.dLock = window.dLock || {};
    // let rand = Math.random();
    let deadCnt = window.lockDeadCnt || 1000;
    while (true) {
        if (deadCnt-- <= 0) {
            console.error(`可能存在死锁,${func.name}等待${dLock[uuid]?.name}`)
            break;
        }
        if (dLock[uuid] && dLock[uuid] != func) {
            continue;
        }
        dLock[uuid] = func;
        // console.log(func.name + '开始');
        func(...args);
        delete dLock[uuid];
        // console.log(func.name + '结束');
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

// 更新光标位置，更新editorState中的selectionState。
const updateSelection = (editor: DraftEditor) => {
    let editorState = editor._latestEditorState;
    const documentSelection = getDraftEditorSelection(
        editorState,
        getContentEditableContainer(editor),
    );
    const updatedSelectionState = documentSelection.selectionState;
    editorState = EditorState.forceSelection(
        editorState,
        updatedSelectionState,
    );
    editor.update(editorState);
}

module.exports = {
    lockCall,
    spinDo,
    updateSelection
}
