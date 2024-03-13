export const value = () => {
    return Math.random();
}

export const range = (min, max) => {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return value() * (max - min) + min;
};

export const rangeFloor = (min, max) => Math.floor(range(min, max));
export const pick = (array) => array.length ? array[rangeFloor(array.length)] : undefined;