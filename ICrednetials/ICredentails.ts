/**
 * Created by SohanB on 26/10/2016.
 */

export  interface  ICredentails {

     signin(collectionName :string,userName:string ,passwd:string):Promise<any>;
}