import { Mongo } from 'meteor/mongo';
import { Blockscon } from '../blocks/blocks.js';

export const Sales = new Mongo.Collection('sales');

Sales.helpers({
    block(){
        return Blockscon.findOne({height:this.height});
    }
})