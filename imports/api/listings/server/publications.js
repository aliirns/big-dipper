import { Listings } from '../listings.js';

publishComposite('Listings.list', function(limit = 30){
    return {
        find(){
            return Listings.find({}, { sort: { ID: 1 } });
        }
    }
});
