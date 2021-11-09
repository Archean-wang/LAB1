// 函数柯里化
const curry = function(fun:Function) {
    let len = fun.length;
    return function $curry(...args: any[]) {
        if(args.length < len)
            return $curry.bind(null, ...args);
        return fun.call(null, ...args);
    }
}

// 函数组合
const compose = function(...fns:Function[]) {
    return function(...args:any[]) {
        fns.reduce((rest, fn) => [fn(...rest)], args)[0];
    }
}

type func = (x:number)=>number;

const sum = (x:number, y:number):number => x + y;
// const mul = (x:number, y:number):number => x * y;
// const div = (x:number, y:number):number => x / y;

// 类似pythton里的range
const range = function(start:number, end:number=undefined, step:number=1) {
    let nums:number[] = [];
    if(end === undefined)
        [start, end] = [0,start];
    for(let i=start; i<end; i+=step) {
        nums.push(i);
    }
    return nums;
}


const getStep = (start:number, val:number, n:number) => start+(n+0.5)*val;

// 消除误差
const getA = (pre:number, pos:number, n:number) => (pos*(2**n)-pre) / (2**n-1);

// 消除误差所需参数n
const getN = (a:number, b:number, c:number) => Math.log((a - c) / (b - c) /2);


// 生成消除误差的新序列
const elimError = function*(gen:Generator) {
    let pre = gen.next().value;
    let mid = gen.next().value;
    let pos = gen.next().value;
    while(true) {
        yield getA(pre, pos, getN(pre, mid, pos));
        [pre, mid, pos] = [mid, pos, gen.next().value];
    }
}


// 获取下个序列值，利用已经计算过的值避免重复计算
const getNextTm = (fn:func, pre:number, n:number, a:number, h:number) =>
                            range(n)
                            .map(i => fn(getStep(a, h, i)) * h / 2)
                            .reduce(sum, pre/2);

// 获取近似序列
const getSeq = function*(fn:func, a:number, b:number) {
    let h = b - a;
    let n = 1;
    let res = (fn(a) + fn(b)) * h / 2;
    while(true) {
        yield res;
        res = getNextTm(fn, res, n, a, h);
        h /= 2;
        n *= 2;
    }
}

// 精度控制
const eps = ( within:number, iter:Iterator<number>) => {
    let pre = iter.next().value;
    let cur = iter.next().value;
    while(Math.abs(pre - cur) > within) {
        console.log(cur); // 显示序列
        [cur, pre] = [pre, iter.next().value]; 
    }
    return cur;
}

// 精度柯里化
const epsn = curry(eps)(1e-6);


// 积分函数
const intergrator = compose(getSeq, elimError, elimError, elimError, epsn, console.log);

// 计算积分
function main() {
    intergrator((x:number) => Math.sin(x), 0, Math.PI/4);
}

main();