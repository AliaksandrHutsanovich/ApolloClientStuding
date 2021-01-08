import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'

/**
 * Create a new apollo client and export as default
 */

//create a link (something like special network interface to access graphQL server)
const link = new HttpLink({ uri: 'http://localhost:4000/' });
const cache = new InMemoryCache();

const client = new ApolloClient({
  link,
  cache,
});

export default client;
