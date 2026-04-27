const{createServer}=require('http'),{parse}=require('url'),next=require('next');
const app=next({dev:false,dir:'/home/z/my-project',hostname:'0.0.0.0',port:3000});
const h=app.getRequestHandler();
app.prepare().then(()=>{createServer((r,s)=>{h(r,s,parse(r.url,true))}).listen(3000,'0.0.0.0',()=>console.log('READY'))}).catch(e=>{console.error(e);process.exit(1)});
setInterval(()=>{try{require('http').get('http://127.0.0.1:3000/',()=>{})}catch(e){}},10000);
