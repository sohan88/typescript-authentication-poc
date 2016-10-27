import {ICredentails} from "../ICrednetials/ICredentails";
import * as mongodb from "mongodb";

import {error} from "util";
/**
 * Created by SohanB on 26/10/2016.
 */


var es6promise=require('es6-promise');
let Promise=es6promise.Promise;
var mongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;

export class  CredentailsImpl implements  ICredentails{
    private connectionString:string;
    private db:mongodb.Db;
    private static forcedClose:boolean;



    constructor(serverName?:string,port?:number,databaseName?:string){
        console.log("constructor called ")
        serverName = serverName || "localhost";
        port=port || 27017;
        databaseName=databaseName || "cred";
        CredentailsImpl.forcedClose=false;
        this.connectionString="mongodb://" + serverName + ":" + port + "/" + databaseName;
    }


    public signin(collectionName :string,userName:string ,passwd:string):Promise<any>{

        return new Promise((resolve,reject)=>{

            let pipeline=[
              { $unwind : "$credentials" },
                { $match : {
                    "credentials.username": userName,
                    "credentials.password": passwd
                }},
                {
                    "$group": {
                        "_id": {
                            "_id": "$_id",
                            "username": "$credentials.username"
                        }
                    }
                }, {
                    "$group": {
                        "_id": "$_id._id",
                        //  "userLoc" : "$_id.userLoc",

                        "credentials": {
                            "$push": {
                                "_id": "$_id._id",
                                "username": "$_id.username"
                            }
                        }
                    }
                }

            ]
            let cursor:mongodb.AggregationCursor=null;
            this.getCollection(collectionName).then((collection:mongodb.Collection)=>{
                cursor=collection.aggregate(pipeline);
               // console.log("cursor result : " ,JSON.stringify(cursor.toArray()));
                return cursor.toArray();

            }).then((result:Array<any>)=> {
                console.log("result : " +result);
                return resolve(JSON.stringify(result));
            }).catch((error:any)=>{
               return reject("Cannot login.. " +error)
            });
            console.log("excute before..")
        });
    }

    public getCollection(collectionName: string):Promise<mongodb.Collection> {
        return new Promise((resolve, reject) => {
            this.getDb().then((db:mongodb.Db) => {
                console.log("collection reovled ======>>")

                return resolve(db.collection(collectionName));
            }).catch((error:any)=> {
                let context:any = {
                    collectionName: collectionName,
                    error: error
                };
                return reject("Error unable to get collection" + collectionName + "," + error);

            });
        });
    }



    /*get MongoDatabaseImpl*/
    public getDb():Promise<mongodb.Db> {
        console.log("before connectionString =====>> " +this.connectionString);
        return new Promise((resolve, reject)=> {
            if (CredentailsImpl.forcedClose) {
                let context:any = {
                    connectionString: this.connectionString
                };
                return reject("Error unable to get DB" + context);
            }
            else if (this.db && typeof this.db !== 'undefined') {

                return resolve(this.db);
            }
            else {
                console.log("connectionString =====>> " +this.connectionString);
                mongoClient.connect(this.connectionString)
                    .then((db:mongodb.Db) => {
                        this.db = db;
                        this.db.on("close", this.onClose);
                        return resolve(this.db);

                    }).catch((error:any) => {
                    let context:any = {
                        connectionString: this.connectionString,
                        error: error
                    };
                    return reject("Db error" + context.error + "connec tstr" + context.connectionString);
                });
            }
        });
    }

    /*handle close event when mongo is closed*/
    private onClose():void {
        console.log("closing DB conn....");
        CredentailsImpl.forcedClose = true;
    }
}