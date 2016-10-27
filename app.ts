/**
 * Created by SohanB on 25/10/2016.
 */

import * as express from "express";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import {CredentailsImpl} from "./implementation/CredentailsImpl";

let app = express();
const collectioName = "credentials";
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));


app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/signin', function (req, res) {

    res.status(200).send('Welcome!');
});

app.post('/signIn', function (req, res) {

    var usrnm=req.body.username;
    var passwd=req.body.password;
    let credImpl = new CredentailsImpl();
   credImpl.signin(collectioName,usrnm,passwd).then((result:any)=> {
       console.log("result:"+result);
       let response=JSON.parse(result);
       if (response != null || response.isNull())
           res.send("Unable to Login...")
       console.log("got res " +response);
       res.send(response)
    });

 /*   credImpl.readObject(collectioName).then((result:any)=> {
        console.log("result:"+result);
        let response=JSON.parse(result);
        console.log("got res " +response)
        res.send("Ok")
    });
*/


});


let server = app.listen(3000, function () {

    console.log('Server listening on port 3000');
});