import express from "express"

const router = express.Router();

router.get("/", (req, res) =>{
    console.log("Carro no Get");
    res.send("Carro no Get");
});

router.get("/ligar", (req, res) =>{
    console.log("Carro Ligado");
    res.send("Carro Ligado");
});

export default router;