function f1_singleEmptyDeclaration() {
    var x;
}
function f2_multipleEmptyDeclarations() {
    var a, b;
}
function f3_singleInitLiteralDeclaration() {
    var c = 1;
}
function f4_singleInitCallDeclaration() {
    var d = other(1);
}
function f5_callNoArgs() {
    other();
}
function f6_callLiteralArgs() {
    other(123);
}
function f7_callCallArgs() {
    other(stuff());
}
function f8_callCallCallCallArgs() {
    aaa()[bbb()](ccc(), ddd(1, eee(1).fff()));
}

/*
function all(first, second) {
    var sum = initialize(first, second);
    var other = 111, yetAnother = 222;
    var obj = callOther(second, other);
    obj.memberCall(other, sum, first);
    for (var i = 0; i < myArray.length; i++) {
        sum = sum + myArray[i];
        yetAnother *= first;
    }
    if (sum > 10) {
        other = yetAnother + 123;
        sum = doStuff(other);
    }
    switch (sum) {
        case 1:
            sideEffect(sum, second);
            break;
        case 50:
            sum += other;
            break;
        case 100:
            return -1;
    }
    return sum;
}*/