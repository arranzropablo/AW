/**
 * ============================
 * Ejercicio entregable 3.
 * Funciones de orden superior.
 * ============================
 * 
 * Puedes ejecutar los tests ejecutando `mocha` desde el directorio en el que se encuentra
 * el fichero `tareas.js`.
 */
"use strict";

let listaTareas = [
    { text: "Preparar práctica PDAP", tags: ["pdap", "practica"] },
    { text: "Mirar fechas congreso", done: true, tags: [] },
    { text: "Ir al supermercado", tags: ["personal"] },
    { text: "Mudanza", done: false, tags: ["personal"] },
];

/**
 * Devuelve las tareas de la lista de entrada que no hayan sido finalizadas.
 */
function getToDoTasks(tasks) {
    let toDo = tasks.filter(task => !task.done);
    return toDo.map(task => task.text);
}

/**
 * Devuelve las tareas que contengan el tag especificado
 */
function findByTag(tasks, tag) {
    return tasks.filter(task => task.tags.indexOf(tag) !== -1);
}

/**
 * Devuelve las tareas que contengan alguno de los tags especificados
 */
function findByTags(tasks, tags) {
    return tasks.filter(task => task.tags.some(x => tags.indexOf(x) !== -1));
}

/**
 * Devuelve el número de tareas finalizadas
 */
function countDone(tasks) {
    return tasks.reduce((acum, n) => { if (n.done) { acum++; } return acum }, 0);
}

/**
 * Construye una tarea a partir de un texto con tags de la forma "@tag"
 */
function createTask(text) {
    let exp = /@[a-z]+/ig;

    let tags = text.match(exp);

    let task = { text: "", tags: [] };

    task.text = text.replace(exp, "").trim();
    if (tags !== null) {
        tags.forEach(tag => task.tags.push(tag.replace("@", "")));
    }
    return task;
}


/*
  NO MODIFICAR A PARTIR DE AQUI
  Es necesario para la ejecución de tests
*/
module.exports = {
    getToDoTasks: getToDoTasks,
    findByTag: findByTag,
    findByTags: findByTags,
    countDone: countDone,
    createTask: createTask
}