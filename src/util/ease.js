
export const easeOutCubic = (pos) => {
    return (Math.pow((pos-1), 3) +1);
}