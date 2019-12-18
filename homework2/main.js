//First task
const {fromEvent} = rxjs;
const {map, debounceTime} = rxjs.operators;

const inputFirst = document.querySelectorAll('input');
const keyupFirst = fromEvent(inputFirst, 'keyup');
let object = {text1: '', text2: '', text3: ''};

keyupFirst.pipe(
    map((event) => event.currentTarget),
).subscribe(element => {
    let p = document.querySelector('[data-input=' + element.id + ']');
    p.innerText = element.value;
    object[element.id] = element.value;
    console.log(object);
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
    let note = input.value;
    let regex = new RegExp(note, 'gi');

    list.forEach(function (element) {
        let text = element.querySelector('span').innerText.toLowerCase();

        if (text.match(regex)) {
            element.classList.remove('hiden');
        } else {
            element.classList.add('hiden');
        }
    });
}

function displayAllItems() {
    let list = document.querySelectorAll('#todos li');
    list.forEach(function (element) {
        element.classList.remove('hiden');
    });
}

function createTodo() {
    let li = document.createElement('li');
    let label = document.createElement('label');
    let checkbox = document.createElement('input');
    let span = document.createElement('span');
    let newNote = input.value;

    checkbox.type = 'checkbox';
    label.classList.add('todo-text');
    span.innerText = newNote;
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

    checked.forEach(function (element) {
        element.parentElement.parentElement.remove();
    });
});

fromEvent(select, 'click').subscribe(() => {
    let checked = getCheckedCheckboxes();

    checked.forEach(function (element) {
        element.parentElement.style.color = '#159966';
        element.checked = false;
    });
});

fromEvent(unSelect, 'click').subscribe(() => {
    let checked = getCheckedCheckboxes();

    checked.forEach(function (element) {
        element.parentElement.style.color = '#000';
        element.checked = false;
    });
});

fromEvent(amountSelected, 'click').subscribe(() => {
    let checked = getCheckedCheckboxes();

    alert(checked.length);
    checked.forEach(function (element) {
        element.checked = false;
    });
});
