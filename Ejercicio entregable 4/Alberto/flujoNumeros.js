class FlujoNumeros {
    constructor() {
        this.numeros = [6, 1, 4, 3, 10, 9, 8];
    }

    siguienteNumero(f) {
        setTimeout(() => {
            let result = this.numeros.shift();
            f(result);
        }, 100);
    }
}

/**
 * Imprime la suma de los dos primeros números del flujo pasado como parámetro.
 */
function sumaDosLog(flujo) {
    flujo.siguienteNumero(num => flujo.siguienteNumero(num2 => console.log(num + num2)));
}

/**
 * Llama a la función f con la suma de los dos primeros números del flujo pasado como parámetro.
 */
function sumaDos(flujo, f) {
    flujo.siguienteNumero(num => flujo.siguienteNumero(num2 => f(num + num2)));
}

/**
 * Llama a la función f con la suma de todos los números del flujo pasado como parámetro
 */
function sumaTodo(flujo, f) {
    sumar(flujo, f, 0);
}

function sumar(flujo, f, suma) {
    flujo.siguienteNumero(num => {
        if (num === undefined) {
            f(suma);
        } else {
            suma = suma + num;
            sumar(flujo, f, suma);
        }
    })
}



/* NO MODIFICAR A PARTIR DE AQUÍ */

module.exports = {
    FlujoNumeros: FlujoNumeros,
    sumaDosLog: sumaDosLog,
    sumaDos: sumaDos,
    sumaTodo: sumaTodo
}