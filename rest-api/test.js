const { Fabric } = require('./fabric');

const { port, serverUrl, serverDomain } = require('./config');
const { app } = require('./app');
async function test(){
 const { error } =  await Fabric.registerUser("re", "re", "eci");

console.log(error)

}
test();