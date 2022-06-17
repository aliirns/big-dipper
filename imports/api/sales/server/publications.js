import { Sales } from '../sales.js';

publishComposite('Sales.list', function(limit = 30){
    return {
        find(){
            return Sales.find({}, { sort: { ID: 1 } });
        }
    }
});
