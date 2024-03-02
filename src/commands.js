/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */
export const DUMP_COMMAND = {
  name: 'dump',
  description: 'show watchlist',
  
}
export const WATCH_COMMAND = {
  name: 'watch',
  description: 'add course register to watchlist',
  options: [ 
    {
      name: "term",
      description: "the term to search",
      type: 3,
      required: true,
      choices: [
        {
          name: "Summer 2024",
          value: "202405"
        },
        
        {
          name: "Spring 2024",
          value: "202401"
        }
      ]
    },
    {
    name: "subject",
    description: "subject",
    type: 3,
    required: true
    
    
  },
  {
    name: "coursenum",
    description: "coursenum",
    type: 3,
    required: true
    
    
  },
  {
    name: "crn",
    description: "crn id",
    type: 3,
    required: true,
}
 
],
}
export const COURSES_COMMAND = {
  name: 'getcourse',
  description: 'returns the courses available',
  options: [ 
    {
      name: "term",
      description: "the term to search",
      type: 3,
      required: true,
      choices: [
        {
          name: "Summer 2024",
          value: "202405"
        },
        
        {
          name: "Spring 2024",
          value: "202401"
        }
      ]
    },
    {
    name: "subject",
    description: "subject",
    type: 3,
    required: true
    
    
  },
  {
    name: "coursenum",
    description: "coursenum",
    type: 3,
    required: true
    
    
  },
 
],
};