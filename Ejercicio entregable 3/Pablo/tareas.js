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
  tasks = tasks.filter(task => task.done !== true);
  return tasks.map(task => task.text);
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
  return tasks.filter(task => task.tags.some(tag => tags.indexOf(tag) !== -1));
}

/**
 * Devuelve el número de tareas finalizadas
 */
function countDone(tasks) {
  return tasks.filter(task => task.done === true).reduce((num, inicio) => num + 1, 0);
}

/**
 * Construye una tarea a partir de un texto con tags de la forma "@tag"
 */
function createTask(text) {
  let regexSplitNameAndTags = /([a-zA-Z0-9" "]*)(@.*)?/;
  let nombre = regexSplitNameAndTags.exec(text)[1].trim();
  let etiquetasRestantes = regexSplitNameAndTags.exec(text)[2];

  let regexSplitTags = /(@)([a-zA-Z0-9" "]*)(.*)/
  let etiquetasCollection = [];
  let i = 0;
  while(etiquetasRestantes !== "" && etiquetasRestantes !== null && etiquetasRestantes !== undefined){
    etiquetasCollection[i] = regexSplitTags.exec(etiquetasRestantes)[2].trim();
    etiquetasRestantes = regexSplitTags.exec(etiquetasRestantes)[3].trim();
    i++;
  }

  let task = {};
  task.text = nombre;
  task.tags = etiquetasCollection;
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