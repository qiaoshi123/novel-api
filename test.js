var a = ["类", "型", "：", "剧", "情", " ", "爱", "情", " ", "↵", "	", "	", "	", "	", "	", "	", "	", "	", "	", "↵", "↵", "	", "	", "	", "	", "	", "	", "	", "	", "	", "地", "区", "：", "大", "陆", " ", "↵", "	", "	", "	", "	", "	", "	", "	", "	", "	", "↵", "↵", "	", "	", "	", "	", "	", "	", "	", "	", "	", "年", "份", "：", "2", "0", "1", "9"];
console.log(a.reduce(function (prev, next, origin) {
    if(prev[prev.length-1] == " " && next == " "){
        return prev+","
    }
    return prev + next;
}, ""));



var arr = [1, 2, 3, 4];
var sum = arr.reduce(function(prev, cur, index, arr) {
    console.log(prev, cur, index);
    return prev + cur;
})
console.log(arr, sum);
