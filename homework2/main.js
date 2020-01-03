//First task
const {fromEvent} = rxjs;
const {map, debounceTime} = rxjs.operators;

const inputFirst = document.querySelectorAll('input');
const keyupFirst = fromEvent(inputFirst, 'keyup');
let object = {text1: '', text2: '', text3: ''};

keyupFirst.pipe(
    map((event) => event.currentTarget),
).subscribe(element => {
    let paragraph = document.querySelector(`[data-input=${element.id}]`);
    paragraph.innerText = element.value;
    object[element.id] = element.value;
});

//Second task
let input = document.getElementById('text');
let ul = document.getElementById('todos');
let save = document.getElementById('save');
let remove = document.getElementById('remove');
let select = document.getElementById('select');
let unSelect = document.getElementById('unselect');
let amountSelected = document.getElementById('amount');

function listFilter() {
    let list = document.querySelectorAll('#todos li');
    let regex = new RegExp(input.value, 'gi');

    list.forEach((element) => {
        let text = element.querySelector('span').innerText.toLowerCase();

        text.match(regex) ? element.classList.remove('hiden') : element.classList.add('hiden');
    });
}

function displayAllItems() {
    let list = document.querySelectorAll('#todos li');
    list.forEach((element) => {
        element.classList.remove('hiden');
    });
}

function createTodo() {
    let li = document.createElement('li');
    let label = document.createElement('label');
    let checkbox = document.createElement('input');
    let span = document.createElement('span');

    checkbox.type = 'checkbox';
    label.classList.add('todo-text');
    span.innerText = input.value;
    label.prepend(checkbox);
    label.append(span);
    li.append(label);
    ul.append(li);
    displayAllItems();
    input.value = '';
}

function getCheckedCheckboxes() {
    return document.querySelectorAll('input[type=checkbox]:checked');
}

function changeColor(mode) {
    let checked = getCheckedCheckboxes();

    checked.forEach((element) => {
        if (mode === 'select') {
            element.parentElement.classList.add('green');
            element.checked = false;
        } else {
            element.parentElement.classList.remove('green');
            element.checked = false;
        }
    });
}

fromEvent(input, 'keyup').subscribe((event) => {
    if (event.keyCode === 13 && input.value !== '') {
        createTodo();
    }
});

fromEvent(input, 'keyup').pipe(
    debounceTime(1000),
).subscribe((event) => {
    if (event.keyCode !== 13) {
        listFilter();
    }
});

fromEvent(save, 'click').subscribe(() => {
    if (input.value !== '') {
        createTodo();
    }
});

fromEvent(remove, 'click').subscribe(() => {
    let checked = getCheckedCheckboxes();

    checked.forEach((element) => element.parentElement.parentElement.remove());
});

fromEvent(select, 'click').subscribe(() => {
    changeColor('select');
});

fromEvent(unSelect, 'click').subscribe(() => {
    changeColor('unSelect');
});

fromEvent(amountSelected, 'click').subscribe(() => {
    let checked = getCheckedCheckboxes();

    alert(checked.length);
    checked.forEach((element) => element.checked = false);
});
