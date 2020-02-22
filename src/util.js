export function throttle(fn, threshold, scope) {
    let prev = Date.now();
    return function () {
        let context = scope || this, args = arguments;
        let now = Date.now();
        if (now - prev > threshold) {
            prev = now;
            fn.apply(context, args);
        }
    }
}

export function clearEventBubble (e) {
    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true;

    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;
  }