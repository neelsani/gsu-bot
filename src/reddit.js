
/**
 * Reach out to the reddit API, and get the first page of results from
 * r/aww. Filter out posts without readily available images or videos,
 // eslint-disable-next-line prettier/prettier
 * and return a random result.
 * @returns The url of an image or video which is cute.
 */

import { createProfessorField } from "./messages";


async function extractAndTransformCookies(cookieHeader) {
  // Split the cookie header string by ', ' to get individual cookies
  const cookiesArray = cookieHeader.split(', ');

  // Initialize an array to store transformed cookies
  const transformedCookies = [];

  // Iterate over each cookie
  for (const cookie of cookiesArray) {
      // Split each cookie into key-value pair
      const [keyValue, ...attributes] = cookie.split('; ');

      // Split the key-value pair into key and value
      const [key, value] = keyValue.split('=');

      // Construct the transformed cookie string
      var transformedCookie = `${key}=${value}`;

      // Add additional attributes to the transformed cookie, if any
      for (const attribute of attributes) {
          transformedCookie += `; ${attribute}`;
      }

      // Push the transformed cookie to the array
      transformedCookies.push(transformedCookie);
  }

  // Join the transformed cookies array into a single string
  const transformedCookieString = transformedCookies.join('; ');

  return transformedCookieString;
}
export async function getCourses(subject, coursenum, term) {
  
	const baseUrl = "https://registration.gosolar.gsu.edu/StudentRegistrationSsb/ssb";
	
	const termSearchUrl = `${baseUrl}/term/search`;

	// Initialize cookies
   
	const urlencoded = new URLSearchParams();
	urlencoded.append("term",term);

	// Search for term
	const termSearchResponse = await fetch(termSearchUrl, {
		method: "POST",
		headers: {
			"User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
			"Content-Type": "application/x-www-form-urlencoded",

		},
		body: urlencoded,
		redirect: "follow"
		
	});

	if (!termSearchResponse.ok) {
		return "not found"
	}

	// Update cookies
	const termSearchCookieHeader = termSearchResponse.headers.get('Set-Cookie');
	
	await extractAndTransformCookies(termSearchCookieHeader)

	// Fetch courses
	const coursesUrl = `${baseUrl}/searchResults/searchResults?txt_level=UA&pageMaxSize=100&txt_subject=${subject}&txt_courseNumber=${coursenum}&txt_attribute=LONL&txt_term=${term}&max=100&sortColumn=subjectDescription&sortDirection=asc`;
	//return coursesUrl
  const coursesResponse = await fetch(coursesUrl, {
		headers: {
			'Cookie': await extractAndTransformCookies(termSearchCookieHeader),
		}
	});
  

	if (!coursesResponse.ok) {
		return "not found"
	}

	// Persist cookies for future requests
	
	const coursesData = await coursesResponse.json();
	/*
  const courses = coursesData.data.map(x => {
    const avail = `${x.seatsAvailable}/${x.maximumEnrollment}`;
    const ch = x.creditHourLow;
    const crn = x.courseReferenceNumber;
    const prof = x.faculty.map(w => w.displayName).join(', ');
    return `CRN: ${crn}   Professor: ${prof}   Seats: ${avail}   Credit Hours: ${ch}`;
  }).join('\n');
*/
  let numResults = 0
  const embed = {
	content: "",
	tts: false,
	embeds: [
	  {
		id: 774121890,
		
		description: `Below is a list of professors teaching ${subject} ${coursenum} for the ${term} term`,
		color: 54783,
		fields: await Promise.all(coursesData.data.map(async professor => { numResults++
			return await createProfessorField(professor.faculty.map(w => w.displayName).join(', '), professor.courseReferenceNumber, professor.seatsAvailable, professor.maximumEnrollment, professor.meetingsFaculty[0].meetingTime.startDate,professor.meetingsFaculty[0].meetingTime.endDate)}
			)),
		title: `${subject} ${coursenum} Professors - ${numResults} results`,
	  }
	],
	components: [],
	actions: {}
  }

  
	return embed
}


export async function getCrnSeats(subject, coursenum, term, crn) {
	const baseUrl = "https://registration.gosolar.gsu.edu/StudentRegistrationSsb/ssb";
	
	const termSearchUrl = `${baseUrl}/term/search`;

	// Initialize cookies
   
	const urlencoded = new URLSearchParams();
	urlencoded.append("term",term);

	// Search for term
	const termSearchResponse = await fetch(termSearchUrl, {
		method: "POST",
		headers: {
			"User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
			"Content-Type": "application/x-www-form-urlencoded",

		},
		body: urlencoded,
		redirect: "follow"
		
	});

	if (!termSearchResponse.ok) {
		return "not found"
	}

	// Update cookies
	const termSearchCookieHeader = termSearchResponse.headers.get('Set-Cookie');
	
	await extractAndTransformCookies(termSearchCookieHeader)

	// Fetch courses
	const coursesUrl = `${baseUrl}/searchResults/searchResults?txt_level=UA&pageMaxSize=100&txt_subject=${subject}&txt_courseNumber=${coursenum}&txt_attribute=LONL&txt_term=${term}&max=100&sortColumn=subjectDescription&sortDirection=asc`;
	//return coursesUrl
  const coursesResponse = await fetch(coursesUrl, {
		headers: {
			'Cookie': await extractAndTransformCookies(termSearchCookieHeader),
		}
	});
  

	if (!coursesResponse.ok) {
		return "not found"
	}

	// Persist cookies for future requests
	
	const coursesData = await coursesResponse.json();
	/*
  const courses = coursesData.data.map(x => {
    const avail = `${x.seatsAvailable}/${x.maximumEnrollment}`;
    const ch = x.creditHourLow;
    const crn = x.courseReferenceNumber;
    const prof = x.faculty.map(w => w.displayName).join(', ');
    return `CRN: ${crn}   Professor: ${prof}   Seats: ${avail}   Credit Hours: ${ch}`;
  }).join('\n');
*/
const professorCourse = coursesData.data.find(professor => professor.courseReferenceNumber === crn);

// Check if the course with the CRN exists
return professorCourse
  
	
}





export async function sendMessage(subject, coursenum, term, crn, env) {
	const DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK_URL;
  const message = {
    content: `${subject} ${coursenum} ${term} ${crn} `
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      console.error('Failed to send message to Discord:', response.statusText);
    } else {
      console.log('Message sent to Discord successfully.');
    }
  } catch (error) {
    console.error('Error sending message to Discord:', error);
  }
}

export async function sendStr(dastr, env) {
	const DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK_URL;
  const message = {
    content: dastr
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      console.error('Failed to send message to Discord:', response.statusText);
    } else {
      console.log('Message sent to Discord successfully.');
    }
  } catch (error) {
    console.error('Error sending message to Discord:', error);
  }
}
/*
export async function rateMyProf(name) {
    let modName = name;
    if (name.slice(-1) === '.') {
        modName = name.slice(0, -2);
    }
	console.log(modName)
    let maxNumRatings = -1;
    let maxData = null;

    for (const x of GSU) {
        const result = await ratings.searchTeacher(modName, x);
        for (const w of result) {
            const teacher = await ratings.getTeacher(w.id);
            if (teacher.numRatings > maxNumRatings) {
                maxNumRatings = teacher.numRatings;
                maxData = [teacher.numRatings, teacher.avgDifficulty, teacher.avgRating, teacher.wouldTakeAgainPercent];
            }
        }
    }
	
    
		return maxData;
	
	
}
*/
export const rateMyProf =async (name) =>  {
	let modName = name;
    if (name.slice(-1) === '.') {
        modName = name.slice(0, -2);
    }
	let maxNumRatings = 0;
    let maxData = null;
	const postData = {
		query: "query TeacherSearchResultsPageQuery(\n  $query: TeacherSearchQuery!\n  $schoolID: ID\n  $includeSchoolFilter: Boolean!\n) {\n  search: newSearch {\n    ...TeacherSearchPagination_search_1ZLmLD\n  }\n  school: node(id: $schoolID) @include(if: $includeSchoolFilter) {\n    __typename\n    ... on School {\n      name\n    }\n    id\n  }\n}\n\nfragment TeacherSearchPagination_search_1ZLmLD on newSearch {\n  teachers(query: $query, first: 8, after: \"\") {\n    didFallback\n    edges {\n      cursor\n      node {\n        ...TeacherCard_teacher\n        id\n        __typename\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    resultCount\n    filters {\n      field\n      options {\n        value\n        id\n      }\n    }\n  }\n}\n\nfragment TeacherCard_teacher on Teacher {\n  id\n  legacyId\n  avgRating\n  numRatings\n  ...CardFeedback_teacher\n  ...CardSchool_teacher\n  ...CardName_teacher\n  ...TeacherBookmark_teacher\n}\n\nfragment CardFeedback_teacher on Teacher {\n  wouldTakeAgainPercent\n  avgDifficulty\n}\n\nfragment CardSchool_teacher on Teacher {\n  department\n  school {\n    name\n    id\n  }\n}\n\nfragment CardName_teacher on Teacher {\n  firstName\n  lastName\n}\n\nfragment TeacherBookmark_teacher on Teacher {\n  id\n  isSaved\n}\n",
		variables: {
		  query: {
			text: modName,
			schoolID: "",
			fallback: true,
			departmentID: null
		  },
		  schoolID: "",
		  includeSchoolFilter: false
		}
	  }
	  const termSearchResponse = await fetch("https://www.ratemyprofessors.com/graphql", {
		method: "POST",
		headers: {
			"User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
			"Content-Type": "application/json",
      "Authorization": "Basic dGVzdDp0ZXN0"

		},
		body: JSON.stringify(postData),
		redirect: "follow"
		
	});
  const a = await termSearchResponse.json()
  if (a) {
  a.data.search.teachers.edges.map(x => {
    if (x.node.school.name.includes("Georgia State University")) {
    if (x.node.numRatings>maxNumRatings) {
		maxNumRatings = x.node.numRatings;
		maxData = [x.node.numRatings, x.node.avgDifficulty, x.node.avgRating, x.node.wouldTakeAgainPercent]
	}
}
  })}
  return maxData
}