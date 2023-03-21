import express from "express";
import carrosRouter from "./carrosRouter.js"
import axios from "axios";
import fs from 'fs/promises';

/* async function getDadosDoJson() {
    try {
      const response = await axios.get('https://raw.githubusercontent.com/matthlavacka/car-list/master/car-list.json');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados de carros:', error);
      return [];
    }
  } */


async function getDadosDoJson() {
    try {
        const fileContent = await fs.readFile('data.json', 'utf-8');
        const data = JSON.parse(fileContent);
        return data;
    } catch (error) {
        console.error('Erro ao ler o arquivo JSON local:', error);
        return null;
    }
}

async function listarMarcasComSeusModelos() {
    try {
        const data = await getDadosDoJson();

        let result = [];
        data.forEach(car => {
            car.models.forEach(model => {
                result.push({ brand: car.brand, model });
            });
        });

        return result;
    } catch (error) {
        console.error('Erro ao buscar dados de carros:', error);
        return [];
    }
}

async function contarModelosPorMarca() {
    const marcasComModelos = await listarMarcasComSeusModelos();
    const contagemModelos = {};

    marcasComModelos.forEach(item => {
        if (contagemModelos[item.brand]) {
            contagemModelos[item.brand]++;
        } else {
            contagemModelos[item.brand] = 1;
        }
    });

    return contagemModelos;
}


async function contarModelosPorMarcaPorOrdem(ordem = 'asc') {
    const marcasComModelos = await listarMarcasComSeusModelos();
    const modelosPorMarca = {};

    marcasComModelos.forEach(item => {
        if (modelosPorMarca[item.brand]) {
            modelosPorMarca[item.brand]++;
        } else {
            modelosPorMarca[item.brand] = 1;
        }
    });

    const contagemModelosArray = Object.entries(modelosPorMarca).map(([marca, quantidade]) => ({ marca, quantidade }));

    contagemModelosArray.sort((a, b) => {
        if (ordem === 'desc') {
            return b.quantidade - a.quantidade;
        } else {
            return a.quantidade - b.quantidade;
        }
    });

    return contagemModelosArray;
}


async function marcaComMaisModelos() {
    const modelosPorMarca = await contarModelosPorMarca();

    let maxModelos = 0;
    let marcas = [];

    for (const marca in modelosPorMarca) {
        if (modelosPorMarca[marca] > maxModelos) {
            maxModelos = modelosPorMarca[marca];
            marcas = [marca, maxModelos];
        } else if (modelosPorMarca[marca] === maxModelos) {
            marcas.push(marca, maxModelos);
        }
    }

    return marcas.length === 1 ? marcas[0] : marcas;
}

async function marcaComMenosModelos() {
    const modelosPorMarca = await contarModelosPorMarca('desc');

    let minModelos = Infinity;
    let marcas = [];

    for (const marca in modelosPorMarca) {
        if (modelosPorMarca[marca] < minModelos) {
            minModelos = modelosPorMarca[marca];
            marcas = [marca, minModelos];
        } else if (modelosPorMarca[marca] === minModelos) {
            marcas.push(marca, minModelos);
        }
    }

    return marcas.length === 1 ? marcas[0] : marcas;
}

async function marcasComMenosModelos(X) {
    const modelosPorMarcaAsc = await contarModelosPorMarcaPorOrdem('asc');
    const resultado = modelosPorMarcaAsc.slice(0, X).map(item => `${item.marca} - ${item.quantidade}`);
    return resultado;
}

async function marcasComMaisModelos(X) {
    const modelosPorMarcaAsc = await contarModelosPorMarcaPorOrdem('desc');
    const resultado = modelosPorMarcaAsc.slice(0, X).map(item => `${item.marca} - ${item.quantidade}`);
    return resultado;
}


const app = express();

app.use("/carros", carrosRouter);

app.get("/", (req, res) => {
    res.send("Hello World");

});

app.get('/marcas/listaModelos', async (req, res) => {
    const carData = await listarMarcasComSeusModelos();
    console.log(carData);
    res.send(carData);
});

app.get('/marcas/modelosPorMarca', async (req, res) => {
    const modelosPorMarca = await contarModelosPorMarcaPorOrdem('asc');
    console.log(modelosPorMarca);
    res.send(modelosPorMarca);
});

app.get('/marcas/maisModelos', async (req, res) => {
    const resultado = await marcaComMaisModelos();
    console.log(resultado);
    res.send(resultado);
});

app.get('/marcas/menosModelos', async (req, res) => {
    const resultado = await marcaComMenosModelos();
    console.log(resultado);
    res.send(resultado);
});

app.get('/marcas/listaMaisModelos/:X', async (req, res) => {
    const X = parseInt(req.params.X, 10);
    if (isNaN(X) || X <= 0) {
      res.status(400).send('O parâmetro X deve ser um número inteiro positivo.');
      return;
    }
    const resultado = await marcasComMaisModelos(X);
    res.json(resultado);
});  

app.get('/marcas/listaMenosModelos/:X', async (req, res) => {
    const X = parseInt(req.params.X, 10);
    if (isNaN(X) || X <= 0) {
      res.status(400).send('O parâmetro X deve ser um número inteiro positivo.');
      return;
    }
    const resultado = await marcasComMenosModelos(X);
    res.json(resultado);
}); 
 

app.listen(3000, () => {
    console.log("API Iniciada!");
});

