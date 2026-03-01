export function diffObject(oldObj = {}, newObj = {}) {
    const oldValue = {};
    const newValue = {};

    Object.keys(newObj).forEach((key) => {
        const oldVal = oldObj[key];
        const newVal = newObj[key];

        // bandingkan nilai (handle null & undefined)
        if (oldVal !== newVal) {
            oldValue[key] = oldVal ?? null;
            newValue[key] = newVal ?? null;
        }
    });

    return { oldValue, newValue };
}
