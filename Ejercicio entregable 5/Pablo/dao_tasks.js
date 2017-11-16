"use strict";


/**
 * Proporciona operaciones para la gestión de tareas
 * en la base de datos.
 */
class DAOTasks {
    /**
     * Inicializa el DAO de tareas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }


    /**
     * Devuelve todas las tareas de un determinado usuario.
     * 
     * Este método devolverá (de manera asíncrona) un array
     * con las tareas de dicho usuario. Cada tarea debe tener cuatro
     * atributos: id, text, done y tags. El primero es numérico, el segundo
     * una cadena, el tercero un booleano, y el cuarto un array de cadenas.
     * 
     * La función callback ha de tener dos parámetros: un objeto
     * de tipo Error (si se produce, o null en caso contrario), y
     * la lista de tareas (o undefined, en caso de error).
     * 
     * @param {string} email Identificador del usuario.
     * @param {function} callback Función callback.
     */
    getAllTasks(email, callback) {

        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err);
                return;
            }
            connection.query("select id, text, done, tag from user join task on email=user left join tag on id=taskId where email = ? order by id asc",
                            [email], 
                            (err, result) =>{
                                connection.release();
                                if(err){
                                    callback(err);
                                    return;
                                }
                                let tasks = [], id, text, done, tags = [], differentTask;
                                result.forEach(element => {
                                    if(element.id !== id){
                                        if(differentTask){
                                            tasks.push({ id: id, text: text, done: done, tags: tags});
                                        }
                                        id = element.id;
                                        text = element.text;
                                        done = element.done;
                                        differentTask = true;
                                    }
                                    if(element.tag !== null){
                                        tags.push(element.tag);
                                    }
                                });
                                if (result.length > 0){
                                    tasks.push({ id: element.id, text: element.text, done: element.done, tags: element.tags});
                                }
                                callback(null, tasks);
                                
            })
        })

    }

    /**
     * Inserta una tarea asociada a un usuario.
     * 
     * Se supone que la tarea a insertar es un objeto con, al menos,
     * dos atributos: text y tags. El primero de ellos es un string con
     * el texto de la tarea, y el segundo de ellos es un array de cadenas.
     * 
     * Tras la inserción se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la inserción, o null en caso contrario.
     * 
     * @param {string} email Identificador del usuario
     * @param {object} task Tarea a insertar
     * @param {function} callback Función callback que será llamada tras la inserción
     */
    insertTask(email, task, callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err);
                return;
            }
            //esto va a hacer que si es undefined se inserte false, preguntar si esta bien, sino lo del if else
            //igual puedo hasta pasarle a las ? el valor undefined, el if else ese...

            let done = task.done ? 1 : 0;
            connection.query("insert into task (user, text, done) values(?, ?, ?)",
                    [email, task.text, done],
                    (err, result) => {
                        if(err){
                            //preguntar si hay que meter un release para q si hay error se haga el release
                            connection.release();
                            callback(err);
                            return;
                        }
                        while(task.tags.length > 0){
                            let tag = task.tags.shift();
                            connection.query("insert into tag values(?, ?)",[result.id, tag],
                                (err, result) => {
                                    if(err){
                                        connection.release();
                                        callback(err);
                                        return;
                                    }
                            })
                        }
                        connection.release();
                    });
        })        
    }

    /**
     * Marca la tarea indicada como realizada, estableciendo
     * la columna 'done' a 'true'.
     * 
     * Tras la actualización se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     * 
     * @param {object} idTask Identificador de la tarea a modificar
     * @param {function} callback Función callback que será llamada tras la actualización
     */
    markTaskDone(idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "UPDATE task SET done = 1 WHERE id = ?",
                [idTask],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }

    /**
     * Elimina todas las tareas asociadas a un usuario dado que tengan
     * el valor 'true' en la columna 'done'.
     * 
     * Tras el borrado se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     * 
     * @param {string} email Identificador del usuario
     * @param {function} callback Función llamada tras el borrado
     */
    deleteCompleted(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "DELETE FROM task WHERE user = ? AND done = 1",
                [email],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }
}

module.exports = {
    DAOTasks: DAOTasks
}