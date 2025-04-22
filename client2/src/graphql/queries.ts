import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    userProfile {
      id
      firstName
      lastName
      location
      zipCode
      birthYear
      financialProfile {
        familyIncome
        householdSize
        inState
      }
    }
  }
`;

export const GET_FAVORITE_COLLEGES = gql`
  query GetFavoriteColleges {
    favoriteColleges {
      id
      name
      type
      location
      tuition
      acceptanceRate
    }
  }
`;

export const GET_FAVORITE_CAREERS = gql`
  query GetFavoriteCareers {
    favoriteCareers {
      id
      title
      description
      medianSalary
      industry
    }
  }
`; 