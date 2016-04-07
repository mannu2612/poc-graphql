var graphql = require('graphql');
var graphqlHTTP = require('express-graphql');
var express = require('express');

var data = require('./data.json');

var adressType = new graphql.GraphQLObjectType({
  name: 'Adress',
  fields: {
    id: { type: graphql.GraphQLInt },
    street: { type: graphql.GraphQLString },
    number: { type: graphql.GraphQLInt }
  }
});

var userType = new graphql.GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: graphql.GraphQLInt },
    name: { type: graphql.GraphQLString },
    lastName: { type: graphql.GraphQLString },
    adresses: { type: new graphql.GraphQLList(adressType) }
  })
});

var schema = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: userType,
        args: {
          id: { type: graphql.GraphQLInt }
        },
        resolve: function (_, args) {
          if(args.id > 0 || args.id < data.length)
            return data[args.id - 1];
        }
      }
    }
  })
});

var test;

function containsStreet(street, user) {
  return user.adresses.filter(containsAdressWithStreet.bind(this, street)).length > 0;
}

function containsAdressWithStreet(street, adress) {
  return adress.street.indexOf(street) >= 0;
}

var schemaContains = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType({
    name: 'Contains',
    fields: {
      user: {
        type: new graphql.GraphQLList(userType),
        args: {
          street: { type: graphql.GraphQLString }
        },
        resolve: function (_, args) {
          return data.filter(containsStreet.bind(this, args.street));
        }
      }
    }
  })
});

console.log('Server online!');
express()
  .use('/graphql', graphqlHTTP({ schema: schema, pretty: true }))
  .listen(3000);

express()
  .use('/graphql', graphqlHTTP({ schema: schemaContains, pretty: true }))
  .listen(3001);
