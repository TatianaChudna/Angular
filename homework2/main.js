const { fromEvent } = rxjs;
const { map } = rxjs.operators;

const input = document.querySelectorAll('input');
const keyup = fromEvent(input, 'keyup');
let object = {text1: '', text2: '', text3: ''};

keyup.pipe(
    map((event) => event.currentTarget)
).subscribe(element => {
    let p = document.querySelector("[data-input="+ element.id +"]");
        p.innerText = element.value;
        object[element.id] = element.value;
        console.log(object);
});
