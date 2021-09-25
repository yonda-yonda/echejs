export function intersect<T>(a: T[], b: T[]): boolean {
    return a.length + b.length > new Set([...a, ...b]).size
}

export function line(length: number): number[][] {
    const ret: number[][] = [];
    if (length > 0) ret.push([1]);
    for (let i = 1; i < length - 1; i++) 
        ret.push([i - 1, i + 1]);
    if (length >= 2) ret.push([length - 2]);
    
    return ret;
}

export function grid(row: number, col: number, square?: boolean): number[][] {
    const ret: number[][] = [];
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            const neighbor: number[] = [];
            if (i > 0) {
                if (square && j > 0)
                    neighbor.push(col * (i - 1) + j - 1);
                neighbor.push(col * (i - 1) + j);
                if (square && j < col - 1)
                    neighbor.push(col * (i - 1) + j + 1);
            }

            if (j > 0) neighbor.push(col * i + j - 1);
            if (j < col - 1) neighbor.push(col * i + j + 1);

            if (i < row - 1) {
                if (square && j > 0)
                    neighbor.push(col * (i + 1) + j - 1);
                neighbor.push(col * (i + 1) + j);
                if (square && j < col - 1)
                    neighbor.push(col * (i + 1) + j + 1);

            }
    
            ret.push(neighbor);
        }
    }
    
    return ret;
}