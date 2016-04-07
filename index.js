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
          id: { type: graphql.GraphQLString }
        },
        resolve: function (_, args) {
            return data[args.id];
        }
      }
    }
  })
});

console.log('Server online!');
express()
  .use('/graphql', graphqlHTTP({ schema: schema, pretty: true }))
  .listen(3000);
