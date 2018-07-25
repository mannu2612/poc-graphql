var graphql = require('graphql');
var graphqlHTTP = require('express-graphql');
var express = require('express');

var data = require('./data.json'); 

var addressType = new graphql.GraphQLObjectType({
  name: 'Address',
  fields: {
    id: { type: graphql.GraphQLInt },
    city: { type: graphql.GraphQLString },
    country: { type: graphql.GraphQLString },
    state: { type: graphql.GraphQLString },
    postal_code: { type: graphql.GraphQLInt },
  }
});

var brokerType = new graphql.GraphQLObjectType({
  name: 'Broker',
  fields: {
    accent_color: { type: graphql.GraphQLString },
    designations: { type: graphql.GraphQLString },
    fulfillment_id: { type: graphql.GraphQLInt },
    name: { type: graphql.GraphQLString },
    logo: { type: graphql.GraphQLString },
  }
});
var advertiserType = new graphql.GraphQLObjectType({
  name: 'Advertiser',
  fields: {
    id: { type: graphql.GraphQLInt },
    email: { type: graphql.GraphQLString },
    address: { type: addressType },
    broker: { type: brokerType },
    name: { type: graphql.GraphQLString },
  }
});

var resultType = new graphql.GraphQLObjectType({
  name: 'Results',
  fields: {
    id: { type: graphql.GraphQLInt },
    advertiserTypes: { type: new graphql.GraphQLList(advertiserType) },
    list_price :{ type: graphql.GraphQLInt }
  }
});

var schema = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
      result: {
        type: resultType,
        args: {
          id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) }
        },
        resolve: function (_, args) {
          data.forEach((result) =>{
            if(result.id == args.id){
              return result;
            }
          })
        }
      },
      results: {
        type: new graphql.GraphQLList(resultType),
        args: {
          qtd: { type: graphql.GraphQLInt },
          street: { type: graphql.GraphQLString }
        },
        resolve: function (_, args) {
          if (args.qtd > 0)
            return data.filter(function(x) { return x.id <= args.qtd })
          else if (args.street)
            return data.filter(containsStreet.bind(this, args.street))
          return data
        }
      }
    }
  })
});

function containsStreet(street, user) {
  return user.adresses.filter(containsAdressWithStreet.bind(this, street)).length > 0;
}

function containsAdressWithStreet(street, adress) {
  return adress.street.indexOf(street) >= 0;
}

console.log('Server online!');
express()
  .use('/graphql', graphqlHTTP({ schema: schema, pretty: true, graphiql: true }))
  .listen(3000);
