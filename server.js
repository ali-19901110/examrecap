'use strict';

require('dotenv').config();

const PORT=process.env.PORT;

const express =require('express');
const pg      =require('pg')
const superagent =require('superagent')
const methodoverride=require('method-override');
const { search } = require('superagent');

const app=express();

app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));
app.use(methodoverride('_method'));
// app.use(express.urlencoded({extended:true}));


const client =new pg.Client(process.env.DATABASE_URL)
client.on('error',err=>console.log(err));

app.get('/',rendermainpage)
app.get('/digmons',renderalldigmons)
app.post('/digmons',insertDigmonsToDb)
app.get('/mydimons',rendermydigmons)
app.get('/details/:id',renderonedigmons)
app.put('/details/:id',editdimon)
app.delete('/details/:id',deletegimon)
app.post('/',searchbyname)

function rendermainpage(req,res){
    res.render('index',{flag:0});
}

function renderalldigmons(req,res){
    let url='https://digimon-api.vercel.app/api/digimon'

    superagent.get(url).then(dig=>{
        // console.log(dig.body);
        res.render('pages/digmons',{data:dig.body})
    })
}

function insertDigmonsToDb(req,res){
    
const name =req.body.name;
console.log(name);
const img =req.body.img;
const level =req.body.level;

const sql='INSERT INTO dimons (name,img,level) VALUES($1,$2,$3) RETURNING *'
let vlaues=[name,img,level];

client.query(sql,vlaues).then(result=>{
    console.log(result.rows);
    res.redirect('/');
})

}

function rendermydigmons(req,res){
    let sql ='select * from dimons'
    client.query(sql).then(data=>{
        res.render('mydimons',{mydi:data.rows})
    })
}
function renderonedigmons(req,res){
    const id=req.params.id;
    // console.log(id);
  const sql=`select * from dimons where id=$1`;
  client.query(sql,[id]).then(result=>{
      res.render('pages/details',{data:result.rows[0]})
  })
}

function editdimon(req,res){
    let name=req.body.name;
    let id=req.body.id;
    let img=req.body.img;
    let level=req.body.level;
    const sql ='UPDATE dimons SET name = $1, img = $2, level=$3  WHERE id =$4'
    const vlaues=[name,img,level,id];
    client.query(sql,vlaues).then(()=>{
        res.redirect(`/details/${id}`);
        
    })
}

function deletegimon(req,res){
    let id =req.body.id;
    let sql ='delete from dimons where id =$1'
    client.query(sql,[id]).then(()=>{
        res.redirect(`/mydimons`)
    })
}

function searchbyname(req,res){
    let name=req.body.search;
    let url=`https://digimon-api.vercel.app/api/digimon/name/${name}`;
    superagent.get(url).then(ser=>{
        console.log(ser.body[0]);
        res.render('index',{data:ser.body[0],flag:1})
    })
}
app.get('*',rendererror)
function rendererror(req,res){
    res.status(404).send('this page not found');
}

client.connect().then(()=>{
    console.log('database is connected'); 
    app.listen(PORT,()=>{console.log(`connected on ${PORT}`);})
})


