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

console.log(getToDoTasks(listaTareas));
console.log(findByTag(listaTareas, "personal"));

/**
 * Devuelve las tareas de la lista de entrada que no hayan sido finalizadas.
 */
function getToDoTasks(tasks) {
    let toDo = tasks.filter(n => !n.done);
    return toDo.map(n => n.text);
}

/**
 * Devuelve las tareas que contengan el tag especificado
 */
function findByTag(tasks, tag) {
    return tasks.filter(n => n.tags.indexOf(tag) != -1);
}

/**
 * Devuelve las tareas que contengan alguno de los tags especificados
 */
function findByTags(tasks, tags) {
  /* Implementar */
}

/**
 * Devuelve el número de tareas finalizadas
 */
function countDone(tasks) {
  /* Implementar */
}

/**
 * Construye una tarea a partir de un texto con tags de la forma "@tag"
 */
function createTask(text) {
  /* Implementar */
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