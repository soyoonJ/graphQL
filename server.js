import { ApolloServer, gql } from "apollo-server";

let tweets = [
  {
    id: "1",
    text: "first one",
    userId: "2",
  },
  {
    id: "2",
    text: "second one",
    userId: "1",
  },
  {
    id: "3",
    text: "third one",
    userId: "1",
  },
];

let users = [
  { id: "1", firstname: "soyoon", lastname: "j" },
  { id: "2", firstname: "hodoo", lastname: "jj" },
];

// 특정문자만 클릭 -> cmd + d
// json -> graphQL : https://transform.tools/json-to-graphql
// database 이미 있다면 hasura로 graphQL 쉽게 만들 수 있음 https://hasura.io/
const typeDefs = gql`
  type User {
    id: ID!
    firstname: String!
    lastname: String!
    """
    Is the sum of firstname + lastname as a string
    """
    fullname: String!
  }
  """
  Tweet object represents a resource for a Tweet
  """
  type Tweet {
    id: ID
    text: String
    author: User
  }
  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    mpa_rating: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
    state: String!
    torrents: String!
    date_uploaded: String!
    date_uploaded_unix: String!
  }
  type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID): Tweet
    movie(id: String!): Movie
  }
  type Mutation {
    postTweet(text: String, userId: ID): Tweet
    deleteTweet(id: ID!): Boolean
  }
`;
// Subscription type도 있음

const resolvers = {
  Query: {
    allTweets() {
      return tweets;
    },
    tweet(root, { id }) {
      return tweets.find((tweet) => tweet.id === id);
    },
    allUsers() {
      return users;
    },
    allMovies() {
      return fetch("https://yts.mx/api/v2/list_movies.json").then((response) =>
        response.json().then((json) => json.data.movies)
      );
    },
    movie(_, { id }) {
      return fetch(
        `https://yts.mx/api/v2/movie_details.json?movie_id=${id}`
      ).then((response) => response.json().then((json) => json.data.movie));
    },
  },
  Mutation: {
    postTweet(_, { text, userId }) {
      const newTweet = {
        id: tweets.length + 1,
        text,
      };
      tweets.push(newTweet);

      return newTweet;
    },
    deleteTweet(_, { id }) {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    fullname({ firstname, lastname }) {
      return `${firstname} ${lastname}`;
    },
  },
  Tweet: {
    author({ userId }) {
      return users.find((user) => user.id === userId);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
