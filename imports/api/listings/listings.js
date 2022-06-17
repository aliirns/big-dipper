import { Mongo } from 'meteor/mongo';
import { Blockscon } from '../blocks/blocks.js';

export const Listings = new Mongo.Collection('listings');

Listings.helpers({
    block(){
        return Blockscon.findOne({height:this.height});
    }
})