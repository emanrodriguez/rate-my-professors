import {gql} from 'graphql-request';

export const autocompleteSchoolQuery = gql`
query AutocompleteSearchQuery(
  $query: String!
)
{
  autocomplete(query: $query) {
    schools {
      edges {
        node {
          id
          name
          city
          state
        }
      }
    }
  }
}`;

export const autocompleteTeacherQuery = gql`
query AutocompleteSearchQuery(
  $query: String!
)
{
  autocomplete(query: $query) {
    teachers {
      edges {
        node {
          id
          firstName
          lastName
          school {
            name
            id
          }
        }
      }
    }
  }
}`;

export const searchTeacherQuery = gql`
query NewSearchTeachersQuery($text: String!, $schoolID: ID!)
{
  newSearch {
    teachers(query: {text: $text, schoolID: $schoolID}) {
      edges {
        cursor
        node {
          id
          firstName
          lastName
          school {
            name
            id
          }
        }
      }
    }
  }
}
`;

export const getTeacherQuery = gql`
query TeacherRatingsPageQuery(
  $id: ID!
) {
  node(id: $id) {
    ... on Teacher {
      id
      firstName
      lastName
      school {
        name
        id
        city
        state
      }
      avgDifficulty
      avgRating
      department
      numRatings
      legacyId
      wouldTakeAgainPercent
    }
    id
  }
}
`;

export const RatingsEdgesQuery = gql`
  query RatingsEdgesQuery($count: Int!, $id: ID!, $courseFilter: String, $cursor: String) {
    node(id: $id) {
      ... on Teacher {
        firstName
        lastName
        ratings(first: $count, after: $cursor, courseFilter: $courseFilter) {
          edges {
            cursor
            node {
              class
              clarityRating
              difficultyRating
              comment
              flagStatus
              createdByUser
              teacherNote {
                id
              }
              id
              __typename
            }
          }
        }
      }
    }
  }
`;
