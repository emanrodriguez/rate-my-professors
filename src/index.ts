import {GraphQLClient} from 'graphql-request';
import fetch from 'isomorphic-fetch';
import {autocompleteSchoolQuery, searchTeacherQuery, getTeacherQuery, RatingsEdgesQuery} from './queries';
import {AUTH_TOKEN} from './constants';

const client = new GraphQLClient('https://www.ratemyprofessors.com/graphql', {
  headers: {
    authorization: `Basic ${AUTH_TOKEN}`
  },
  fetch
});

export interface ISchoolFromSearch {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface ITeacherFromSearch {
  id: string;
  firstName: string;
  lastName: string;
  school: {
    id: string;
    name: string;
  };
}

export interface ITeacherPage {
  id: string;
  firstName: string;
  lastName: string;
  avgDifficulty: number;
  avgRating: number;
  numRatings: number;
  department: string;
  school: ISchoolFromSearch;
  legacyId: number;
}


export class ClassRatingDetails {
  constructor(
    public professor_name: string = '',
    public professor_id: string = '',
    public class_name: string = '',
    public total_reviews: number = 0,
    public avg_clarity: number = 0,
    public avg_difficulty: number = 0
  ) {}
}


const searchSchool = async (query: string): Promise<ISchoolFromSearch[]> => {
  const response = await client.request(autocompleteSchoolQuery, {query});

  return response.autocomplete.schools.edges.map((edge: { node: ISchoolFromSearch }) => edge.node);
};

const searchTeacher = async (name: string, schoolID: string): Promise<ITeacherFromSearch[]> => {
  const response = await client.request(searchTeacherQuery, {
    text: name,
    schoolID
  });

  if (response.newSearch.teachers === null) {
    return [];
  }

  return response.newSearch.teachers.edges.map((edge: { node: ITeacherFromSearch }) => edge.node);
};

const getTeacher = async (id: string): Promise<ITeacherPage> => {
  const response = await client.request(getTeacherQuery, {id,});

  return response.node;
};

const getClassRatingbyTeacher = async (id: string, className: string): Promise<ClassRatingDetails> => {
  const ClassRating = new ClassRatingDetails('', id, className);
  try {
    const response = await client.request(RatingsEdgesQuery, { id, count: 50, courseFilter: className });
    const ratingsEdges = response.node.ratings.edges;
    ClassRating.professor_name = `${response.node.firstName} ${response.node.lastName}`
    ClassRating.total_reviews = ratingsEdges.length;

    const totalClarityRating = ratingsEdges.reduce((acc: number, edge: any) => acc + edge.node.clarityRating, 0);
    const totalDifficultyRating = ratingsEdges.reduce((acc: number, edge: any) => acc + edge.node.difficultyRating, 0);

    ClassRating.avg_clarity = totalClarityRating / ClassRating.total_reviews;
    ClassRating.avg_difficulty = totalDifficultyRating / ClassRating.total_reviews;
  } catch (error) {
    console.error("An error occurred while fetching data: ", error);
  }
  return ClassRating;
};

const getClassRatingsByMultipleTeachers = async (teacherClassPairs: {id: string, className: string}[]): Promise<ClassRatingDetails[]> => {
  const classRatingDetailsList: ClassRatingDetails[] = [];
  for (const pair of teacherClassPairs) {
    const details = await getClassRatingbyTeacher(pair.id, pair.className);
    classRatingDetailsList.push(details);
  }
  return classRatingDetailsList;
};


export default {searchSchool, searchTeacher, getTeacher, getClassRatingbyTeacher};