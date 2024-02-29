/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */


export const COURSES_COMMAND = {
  name: 'getcourse',
  description: 'returns the courses available',
  options: [ {
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